const crypto = require('crypto');

// Assuming they are still using sandbox keys in their deployed environment
const secret = "sandbox_sk_a0afdc08bc89b0d01b84ff8eb590363e3ee9715d09f2";
const target = "4d356164a3ffc9e69e01a23758f2966fa28bce4a35e6c7193a17809d19770493d9aa2aa5bd9f65052be6421c38c8a38e172ac392066e926f5378a80430ed924c";

const rawBodyString = '{"session_id":null,"transaction_status":"SUCCESS","merchant_reference":"SB1YS7E5J1_DVA_jn750r9c1ye0qeqddmbe3smvj986tmes_1778897482920","merchant_amount":"94500000.00","amount_received":"94500000.00","transaction_reference":"REFFZA7DPYC41778897518952","email":"victor@consync.app","merchant_id":"SB1YS7E5J1","sub_merchant_id":null,"transaction_type":"dynamic_virtual_account","date":"2026-05-16T02:11:59.312Z","sender_name":"Consync Digital"}';

function check(str) {
  const hmac = crypto.createHmac("sha512", secret).update(str).digest("hex").toLowerCase();
  const hash = crypto.createHash("sha512").update(str).digest("hex").toLowerCase();
  if (hmac === target) console.log("MATCH HMAC:", str);
  if (hash === target) console.log("MATCH SHA512:", str);
}

check(rawBodyString);
const payloadObj = JSON.parse(rawBodyString);
const vals = Object.values(payloadObj).map(v => v === null ? "" : v).join("");
check(vals);
console.log("Tests done.");
