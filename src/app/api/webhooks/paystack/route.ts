import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import crypto from "crypto";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("Missing PAYSTACK_SECRET_KEY environment variable");
      return NextResponse.json({ error: "Configuration error" }, { status: 500 });
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      console.error("Paystack Webhook Signature mismatch! (401)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    console.log(`[Paystack Webhook] Received event: ${event}`);

    // Map Paystack events to our Convex handler
    switch (event) {
      case "charge.success":
        await convex.mutation(api.webhooks.handlePaystackWebhook, {
          event: "charge.success",
          transactionRef: data.reference,
          amountKobo: data.amount,
          status: "success",
        });
        break;

      case "transfer.success":
      case "transfer.failed":
      case "transfer.reversed":
        await convex.mutation(api.webhooks.handlePaystackWebhook, {
          event: event,
          transactionRef: data.transfer_code, // For transfers we look up by transfer code
          amountKobo: data.amount,
          status: event.split(".")[1], // "success" or "failed" or "reversed"
        });
        break;

      default:
        console.log(`[Paystack Webhook] Unhandled event type: ${event}`);
    }

    // Always return 200 to acknowledge receipt to Paystack
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Paystack Webhook] Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
