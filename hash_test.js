const crypto = require('crypto');

const secret = "sandbox_sk_a0afdc08bc89b0d01b84ff8eb590363e3ee9715d09f2";
const target = "c60bd9f1a6462add2a8ea8621245f690221d3dbbd573242c5297547ea12e9379349c44034f81a88cd6d97dec5ba983de673a401de50d1d20c5837153603d9345";

const payload = {
  "session_id":null,
  "transaction_status":"SUCCESS",
  "merchant_reference":"SB1YS7E5J1_DVA_jh737jtcdhtxgk2sf0ktyy3ks186rhwz_1778872161766",
  "merchant_amount":"94000000.00",
  "amount_received":"94000000.00",
  "transaction_reference":"REFJT7FNJD761778872197795",
  "email":"dixonsilverofficial@gmail.com",
  "merchant_id":"SB1YS7E5J1",
  "sub_merchant_id":null,
  "transaction_type":"dynamic_virtual_account",
  "date":"2026-05-15T19:09:58.115Z",
  "sender_name":"Consync Digital"
};

function check(str) {
  const hmac = crypto.createHmac("sha512", secret).update(str).digest("hex").toLowerCase();
  const hash = crypto.createHash("sha512").update(str).digest("hex").toLowerCase();
  if (hmac === target) console.log("MATCH HMAC:", str);
  if (hash === target) console.log("MATCH SHA512:", str);
}

// Check raw body string
const raw1 = JSON.stringify(payload);
const raw2 = JSON.stringify(payload).replace(/,/g, ', ').replace(/:/g, ': ');
check(raw1);
check(raw2);

// Try permutations of some fields
const fields = ["merchant_reference", "amount_received", "transaction_reference", "transaction_status", "email", "merchant_id", "transaction_type"];

const getPermutations = (arr) => {
  if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : [arr];
  return arr.reduce((acc, item, i) =>
    acc.concat(getPermutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(val => [item, ...val])),
  []);
};

// V2 docs said transaction_reference + amount_received?
check(payload.transaction_reference + payload.amount_received);
check(payload.amount_received + payload.transaction_reference);
check(payload.merchant_reference + payload.amount_received);
check(payload.transaction_reference + "|" + payload.amount_received);

// We know the exact string representation might be what they hashed.
// Let's just output success or fail for some basic combinations.
console.log("Done tests.");
