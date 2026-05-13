import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";

export async function POST(req: NextRequest) {
  const secret = process.env.SQUAD_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Missing SQUAD_SECRET_KEY" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-squad-encrypted-body");

  const expected = createHmac("sha512", secret)
    .update(body)
    .digest("hex")
    .toUpperCase();

  if (!signature || signature.toUpperCase() !== expected) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body) as {
    Event?: string;
    TransactionRef?: string;
    Body?: {
      amount?: number;
      transaction_ref?: string;
      gateway_ref?: string;
      transaction_status?: string;
    };
  };

  const event = payload.Event || "";
  const bodyData = payload.Body || {};
  const transactionRef = bodyData.transaction_ref || payload.TransactionRef;

  if (!transactionRef || typeof bodyData.amount !== "number") {
    return NextResponse.json({ error: "Missing transaction data" }, { status: 400 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Missing NEXT_PUBLIC_CONVEX_URL" }, { status: 500 });
  }

  const convex = new ConvexHttpClient(convexUrl);

  await convex.mutation(api.webhooks.handleSquadWebhook, {
    event,
    transactionRef,
    gatewayRef: bodyData.gateway_ref,
    amountKobo: bodyData.amount,
    status: bodyData.transaction_status || "",
  });

  return NextResponse.json({ response_code: 200, response_description: "Success" });
}
