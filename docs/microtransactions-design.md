# Future microtransactions and PayPal design

## Status and boundaries

Owner requested this document for later planning. No real-money store, payment
credentials, checkout endpoints, purchase grants or live charges are implemented
by this proposal. PayPal is the owner's requested destination to investigate,
not a completed provider selection or approval to enable payments.

Prismatica and Null-Prismatica are the visible currency names. Existing
`fractalis`/`lycalis` save fields stay unchanged. Pack amounts, prices, supported
countries, age rules and release platforms require separate approval.
For illustration only, a pack could offer100 Null-Prismatica for USD4.99;
this is not approved pricing or an economy change.

## Where the money goes

With direct PayPal Checkout, customers pay the merchant associated with the
live PayPal application. Typically the payment reaches that merchant's PayPal
Business account, less applicable fees, and available funds can be withdrawn
to a linked bank account. Country-specific settlement, automatic transfers,
currency conversion, verification, reserves and holds can change the details.
Pending funds are not necessarily immediately withdrawable. Refunds and
chargebacks can reduce available funds.

Standard Stripe payouts normally go to the merchant's linked bank account,
not directly into a PayPal wallet. If the goal is receiving purchases through
PayPal, investigate direct PayPal Checkout rather than assuming Stripe can
forward its payouts into PayPal.

Do not use manual email transfers, Friends and Family payments or a PayPal.me
link as the game's automated fulfillment system. A supported commercial
checkout must identify the authenticated player and verified purchase.

## Provider options

- **PayPal Checkout:** candidate for the browser game's direct PayPal flow.
  Requires a verified Business account, supported merchant country and
  acceptance of this specific business model.
- **Stripe Checkout:** alternative hosted checkout for browser purchases,
  subject to business eligibility. Card details remain with the provider.
- **Game-focused merchant of record:** compare if international tax/VAT
  administration is important. Confirm eligibility, fees, payout methods,
  refunds and supported regions before selection.

A payment processor and a merchant of record are different arrangements.
With a processor the game business generally retains more responsibility for
taxes, consumer policies, support and disputes. Provider selection does not
remove the owner's legal obligations.

Mobile app stores and Steam have their own digital-goods billing requirements.
External checkout permissions depend on platform, region and program. A
browser integration is not automatically permitted inside an App Store,
Google Play or Steam release; review current rules and implement the applicable
platform purchase/receipt flow separately.

## Proposed PayPal setup

1. Create or upgrade a PayPal Business account, complete required identity and
   business verification, and link the merchant bank account.
2. Create sandbox merchant/buyer accounts and a sandbox developer application.
3. Obtain the public Client ID and private Secret. The Client ID may be used
   in the checkout UI; the Secret belongs only in server-side secret storage,
   never browser bundles, `VITE_*` variables, logs or source control.
4. Implement and validate checkout/fulfillment in Sandbox with pretend money.
5. Register and test verified payment/refund/dispute webhooks.
6. Only after owner approval and provider/compliance checks, create/use the
   live application associated with the intended merchant account and configure
   separate live credentials and webhook verification.

The live application's merchant identity determines the recipient. Players do
not need the owner's private email or bank details to buy a pack.

## Purchase and delivery flow

1. Require an authenticated online player. Offline guest saves cannot receive
   authoritative paid purchases.
2. Player chooses a server-owned product ID. The server determines pack amount,
   price in integer minor units and ISO money currency; never trust a client
   price, recipient, paid flag or reward quantity.
3. Server creates a pending purchase bound to that player and product snapshot,
   then creates the provider order/checkout session with retry protection.
4. Player approves payment through hosted checkout. Your game does not collect
   card numbers or PayPal passwords.
5. Server captures/queries the PayPal order and verifies completed capture,
   correct merchant, money amount/currency, expected order and bound account.
   Browser approval alone is not proof of payment.
6. A verified capture or verified webhook enters the same idempotent
   fulfillment path. Delayed/pending payments remain unfulfilled until confirmed.
7. In one serialized database transaction, record the unique provider capture
   and purchase fulfillment, validate currency overflow, credit the account,
   and update its revision. Commit all or nothing.
8. Client refreshes authoritative balances and shows the saved receipt using
   the existing game-native reward presentation, not a second claim operation.

Never grant currency just because a success/return URL was visited. Closing
checkout, reloading the return page, duplicate webhooks and server retries must
not lose or multiply a grant. A paid order that cannot yet be credited must
remain explicitly pending fulfillment for reconciliation/support or refund;
never return fake success or silently discard the payment.

## Last Light integration

Existing Supabase authentication, authoritative gameplay and revision/CAS
transactions provide a foundation; see the
[server operation contract](../supabase/functions/game-operation/README.md).
Proposed additions:

- Server-only pack catalog and authenticated checkout creation endpoint.
- Server capture endpoint and signature-verified provider webhook endpoint.
- Purchase ledger with player, product snapshot, price/currency, provider order
  and capture IDs, environment, fulfillment and refund/dispute status.
- Unique capture/fulfillment constraints and an atomic grant transaction.
- Purchase history, reconciliation and support tools with restricted access.
- Separate test/live secrets, redacted operational logs and failure alerts.

Serialize payment credits with normal account writes so concurrent summons,
battle rewards, checkpoints and purchases cannot overwrite one another.
Use the provider transaction ID for fulfillment deduplication; checkout and
webhook retries may arrive independently. Do not depend on a stale browser
revision to deliver a payment, and do not overwrite account/run snapshots.

The existing one-time offline save import accepts editable offline holdings.
Before monetization, decide how imported balances relate to paid/earned currency.
Provider receipts and paid-origin records must never be supplied or overwritten
by an offline save. Track paid and earned sources in the server ledger even if
the UI combines balances; a spending-attribution rule remains to be designed.

## Consumer, economy and compliance decisions

- Null-Prismatica buys randomized summons. Confirm the provider accepts this
  exact model and review applicable regional restrictions, age requirements,
  consumer rules and probability disclosures. Selling currency first does not
  automatically avoid rules covering paid randomized rewards.
- Obtain appropriate legal/tax guidance; this document is not legal advice.
- Define supported countries, business identity, tax/VAT handling and currency
  conversion before selling internationally.
- Show clear real-money prices, currency quantities and confirmation. Provide
  terms, privacy/refund policies and a reachable support contact.
- Decide handling of refunds/chargebacks after currency was spent, partial
  refunds, currency origin/spending order and disputed accounts. Do not silently
  revoke units or create negative balances without an approved policy.
- Consider spending caps, parental controls and account recovery. Avoid
  misleading offers, undisclosed recurring billing or pressured purchases.
- Define provider fees and expected net revenue before finalizing pack prices.

## Recommended first scope and validation

Proposal: a few fixed one-time currency packs for signed-in online players.
Defer subscriptions, timed bundles and complicated offers. No live deployment
until owner approves pricing, provider, policy and implementation scope.

Sandbox acceptance cases:

- Correct purchase credits the intended account exactly once.
- Forged approval/return URL, wrong merchant/amount/currency and unverified
  webhooks cannot credit currency.
- Cancellation, decline, pending payment and abandoned checkout do not grant.
- Duplicate/reordered webhooks and simultaneous capture/webhook delivery grant
  once; ambiguous retries reuse stable IDs.
- Disconnect after capture or database commit recovers the same purchase.
- Concurrent battle rewards, summons and credits preserve all saved outcomes.
- Overflow/database failures preserve account state and pending delivery;
  reconciliation or refund resolves the paid order explicitly.
- Refund/dispute flows follow the approved policy and cannot reverse twice.
- Sandbox/live records and secrets remain isolated; offline imports cannot forge
  paid balances or receipts.

## Official references

Consult current provider rules again before implementation; fees and platform
permissions change and are country-specific.

- [PayPal Checkout integration](https://developer.paypal.com/docs/checkout/standard/integrate/)
- [PayPal Orders API](https://developer.paypal.com/docs/api/orders/v2/)
- [PayPal webhook verification API](https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post)
- [PayPal Sandbox](https://developer.paypal.com/tools/sandbox/)
- [PayPal Acceptable Use Policy (US; select merchant region)](https://www.paypal.com/us/legalhub/acceptableuse-full)
- [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play payments policy](https://support.google.com/googleplay/android-developer/answer/9858738)
- [Steam microtransactions](https://partner.steamgames.com/doc/features/microtransactions)
