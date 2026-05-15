import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

function verifyPaymentWebhook(rawBody: string, header: string | null, secret: string) {
  if (!header) return false;
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex").toUpperCase();
  return expected === header.toUpperCase();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function verifyDvaWebhook(payload: any, header: string | null, secret: string) {
  if (!header) return false;

  // V3 Webhook requires hashing 6 specific fields separated by a pipe (|)
  const txRef = payload.transaction_reference ?? payload.transaction_ref ?? payload.txn_ref ?? "";
  const vaNum = payload.virtual_account_number ?? "";
  const currency = payload.currency ?? "";
  const principalAmount = payload.principal_amount ?? "";
  const settledAmount = payload.settled_amount ?? "";
  const customerId = payload.customer_identifier ?? payload.customer_id ?? "";

  const str = `${txRef}|${vaNum}|${currency}|${principalAmount}|${settledAmount}|${customerId}`;

  // It MUST be HMAC-SHA512 using the secret key, not a plain hash
  const expected = createHmac("sha512", secret).update(str).digest("hex").toUpperCase();
  return expected === header.toUpperCase();
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

  // The documentation explicitly states the header is always x-squad-signature
  const signature = req.headers.get("x-squad-signature");
  if (!signature) {
    return NextResponse.json({ error: "No valid signature header found" }, { status: 400 });
  }

  // Since Sandbox might use V1 (entire body HMAC) or V3 (6-field HMAC), we try both
  const isRawBodyValid = verifyPaymentWebhook(body, signature, secret);
  const isDvaHashValid = verifyDvaWebhook(payload, signature, secret);

  if (!isRawBodyValid && !isDvaHashValid) {
    console.error("Squad Webhook Signature mismatch!", { signature, payload });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_CONVEX_URL" }, { status: 500 });
  }
  const convex = new ConvexHttpClient(convexUrl);

  const eventName = payload.event || payload.Event || "";
  const isDvaFlow = eventName.startsWith("VIRTUAL_ACCOUNT_TRANSFER") || !!payload.virtual_account_number;

  if (isDvaFlow) {
    // DVA webhook processing
    const txRef = payload.transaction_reference ?? payload.transaction_ref ?? payload.txn_ref;

    switch (eventName) {
      case "VIRTUAL_ACCOUNT_TRANSFER":
        // Process successful DVA funding
        await convex.mutation(api.webhooks.handleSquadWebhook, {
          event: "DVA_FUNDING_SUCCESS",
          transactionRef: txRef,
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
          transactionRef: txRef,
          gatewayRef: payload.virtual_account_number,
          amountKobo: (payload.principal_amount || 0) * 100,
          status: "FAILED",
        });
        break;
    }
  } else {
    // Standard Payment Gateway webhook processing
    const bodyData = payload.Body || payload;
    const transactionRef = bodyData.transaction_ref || payload.TransactionRef || payload.transaction_reference;

    if (!transactionRef || typeof bodyData.amount !== "number") {
      return NextResponse.json({ error: "Missing transaction data" }, { status: 400 });
    }

    await convex.mutation(api.webhooks.handleSquadWebhook, {
      event: eventName,
      transactionRef,
      gatewayRef: bodyData.gateway_ref,
      amountKobo: bodyData.amount,
      status: bodyData.transaction_status || "",
    });
  }

  // Always return 200 to acknowledge receipt to Squad
  return NextResponse.json({ status: "ok" });
}
