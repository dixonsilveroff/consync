import { NextRequest, NextResponse } from "next/server";
import { createHmac, createHash } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

function verifyPaymentWebhook(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex").toUpperCase();
  return expected === header.toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function verifyDvaWebhook(payload: any, header: string | null) {
  if (!header) return false;
  const str = [
    payload.transaction_ref ?? payload.txn_ref,
    payload.virtual_account_number,
    payload.currency,
    payload.principal_amount,
    payload.settled_amount,
    payload.customer_id,
  ].join("|");
  const expected = createHash("sha512").update(str).digest("hex");
  return expected.toLowerCase() === header.toLowerCase();
}

export async function POST(req: NextRequest) {
  const secret = process.env.SQUAD_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Missing SQUAD_SECRET_KEY" }, { status: 500 });
  }

  const body = await req.text();
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (e) {
    console.error("Failed to parse webhook JSON:", e);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const paymentSig = req.headers.get("x-squad-signature");
  const dvaSig = req.headers.get("x-squad-encrypted-body");

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_CONVEX_URL" }, { status: 500 });
  }
  const convex = new ConvexHttpClient(convexUrl);

  if (dvaSig) {
    // DVA webhook processing
    if (!verifyDvaWebhook(payload, dvaSig)) {
      return NextResponse.json({ error: "Invalid DVA signature" }, { status: 401 });
    }

    switch (payload.event) {
      case "VIRTUAL_ACCOUNT_TRANSFER":
        // Process successful DVA funding
        await convex.mutation(api.webhooks.handleSquadWebhook, {
          event: "DVA_FUNDING_SUCCESS",
          transactionRef: payload.transaction_ref ?? payload.txn_ref,
          gatewayRef: payload.virtual_account_number, // Using VA as gateway ref for tracing
          amountKobo: (payload.principal_amount || 0) * 100, // Convert from Naira to Kobo
          status: "SUCCESS",
        });
        break;
      case "VIRTUAL_ACCOUNT_TRANSFER_MISMATCH":
      case "VIRTUAL_ACCOUNT_TRANSFER_EXPIRED":
        // Squad handles refunds, just log or update status to failed
        await convex.mutation(api.webhooks.handleSquadWebhook, {
          event: "DVA_FUNDING_FAILED",
          transactionRef: payload.transaction_ref ?? payload.txn_ref,
          gatewayRef: payload.virtual_account_number,
          amountKobo: (payload.principal_amount || 0) * 100,
          status: "FAILED",
        });
        break;
    }
  } else if (paymentSig) {
    // Standard Payment Gateway webhook processing
    if (!verifyPaymentWebhook(body, paymentSig, secret)) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 401 });
    }

    const event = payload.Event || "";
    const bodyData = payload.Body || {};
    const transactionRef = bodyData.transaction_ref || payload.TransactionRef;

    if (!transactionRef || typeof bodyData.amount !== "number") {
      return NextResponse.json({ error: "Missing transaction data" }, { status: 400 });
    }

    await convex.mutation(api.webhooks.handleSquadWebhook, {
      event,
      transactionRef,
      gatewayRef: bodyData.gateway_ref,
      amountKobo: bodyData.amount,
      status: bodyData.transaction_status || "",
    });
  } else {
    return NextResponse.json({ error: "No valid signature header found" }, { status: 400 });
  }

  // Always return 200 to acknowledge receipt to Squad
  return NextResponse.json({ status: "ok" });
}
