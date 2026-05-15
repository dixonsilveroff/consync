const crypto = require('crypto');

const secret = "sandbox_sk_a0afdc08bc89b0d01b84ff8eb590363e3ee9715d09f2";
const target = "c60bd9f1a6462add2a8ea8621245f690221d3dbbd573242c5297547ea12e9379349c44034f81a88cd6d97dec5ba983de673a401de50d1d20c5837153603d9345";

const payloadStr = '{"session_id":null,"transaction_status":"SUCCESS","merchant_reference":"SB1YS7E5J1_DVA_jh737jtcdhtxgk2sf0ktyy3ks186rhwz_1778872161766","merchant_amount":"94000000.00","amount_received":"94000000.00","transaction_reference":"REFJT7FNJD761778872197795","email":"dixonsilverofficial@gmail.com","merchant_id":"SB1YS7E5J1","sub_merchant_id":null,"transaction_type":"dynamic_virtual_account","date":"2026-05-15T19:09:58.115Z","sender_name":"Consync Digital"}';

function check(str) {
  const hmac = crypto.createHmac("sha512", secret).update(str).digest("hex").toLowerCase();
  if (hmac === target) {
      console.log("MATCH FOUND!", str);
      process.exit(0);
  }
}

// 1. Raw string exactly as given
check(payloadStr);

// 2. Just the body values concatenated?
const payloadObj = JSON.parse(payloadStr);
const vals = Object.values(payloadObj).map(v => v === null ? "" : v).join("");
check(vals);

console.log("No match found for basic payload string tests");
