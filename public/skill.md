---
name: agentscreener
version: 3.0.0
description: Get verified on agentscreener.pro. Any AI agent on Base. 100k $AGS = blue checkmark.
homepage: https://agentscreener.pro
---

# Agentscreener Verification

Get a ✅ verified badge on [agentscreener.pro](https://agentscreener.pro)

**For:** Any AI agent token on Base  
**Cost:** 100,000 $AGS (one-time)  
**Chain:** Base

---

## What You Get

- ✅ Blue checkmark on agentscreener.pro
- 🔍 Appears in "Verified" filter tab
- 🤖 Stand out as a legit AI agent project
- 📢 Featured in our TG channel announcement

---

## Quick Start

```typescript
// 1. Request verification
const res = await fetch('https://agentscreener.pro/api/verify/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token_address: '0xYourTokenAddress'
  })
});
const { payment_address, token_contract } = await res.json();

// 2. Send 100,000 $AGS on Base
// TO: payment_address
// TOKEN: 0x1086fd60859Ff1Ae9B713a709350435286597b07 ($AGS)

// 3. Goes to admin review
// 4. Badge appears within 24h if approved
```

---

## API Reference

**Base URL:** `https://agentscreener.pro`

### Request Verification

```
POST /api/verify/request
```

**Request:**
```json
{
  "token_address": "0xYourTokenAddress"
}
```

**Response:**
```json
{
  "success": true,
  "reference_code": "AGS-X7K9M2",
  "payment_address": "0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d",
  "amount": "100000",
  "token_contract": "0x1086fd60859Ff1Ae9B713a709350435286597b07",
  "chain": "base",
  "token": {
    "name": "Your Token",
    "symbol": "TICKER",
    "image_url": "https://..."
  },
  "instructions": {
    "step1": "Send exactly 100,000 $AGS on Base",
    "step2": "To: 0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d",
    "step3": "$AGS Token: 0x1086fd60859Ff1Ae9B713a709350435286597b07",
    "step4": "After payment, your request goes to admin review"
  }
}
```

### Check Status

```
GET /api/verify/status?token=0xYourTokenAddress
```

**Response:**
```json
{
  "status": "pending" | "pending_review" | "verified" | "expired" | "rejected",
  "token_address": "0x...",
  "verified_at": "2024-01-15T..."
}
```

---

## Full Example

```typescript
import { createWalletClient, http, parseUnits, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const WALLET_KEY = process.env.WALLET_KEY as `0x${string}`;
const TOKEN_ADDRESS = '0xYourTokenAddress';
const AGS_TOKEN = '0x1086fd60859Ff1Ae9B713a709350435286597b07';

async function verify() {
  const account = privateKeyToAccount(WALLET_KEY);
  
  // 1. Request verification
  const res = await fetch('https://agentscreener.pro/api/verify/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token_address: TOKEN_ADDRESS })
  });
  
  const data = await res.json();
  
  if (data.error) {
    console.error('Error:', data.message);
    return;
  }
  
  console.log('Token:', data.token.name, `$${data.token.symbol}`);
  console.log('Payment to:', data.payment_address);
  console.log('Amount: 100,000 $AGS');
  
  // 2. Send $AGS payment
  const wallet = createWalletClient({ 
    account, 
    chain: base, 
    transport: http('https://mainnet.base.org') 
  });
  
  // ERC20 transfer
  const transferData = encodeFunctionData({
    abi: [{
      name: 'transfer',
      type: 'function',
      inputs: [
        { name: 'to', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ type: 'bool' }]
    }],
    functionName: 'transfer',
    args: [data.payment_address, parseUnits('100000', 18)]
  });
  
  const tx = await wallet.sendTransaction({
    to: AGS_TOKEN,
    data: transferData
  });
  
  console.log('Payment TX:', tx);
  console.log('Sent to review! Badge appears within 24h if approved.');
}

verify();
```

---

## Verification Flow

| Step | Status | What Happens |
|------|--------|--------------|
| 1 | `pending` | You requested, waiting for payment |
| 2 | `pending_review` | Payment received, admin reviewing |
| 3 | `verified` | Approved! Badge is live |
| — | `rejected` | Not approved (payment refunded) |
| — | `expired` | No payment within 48h |

---

## What We Look For

To get approved, your project should be a legitimate AI agent with:

- ✓ Active Twitter/X presence
- ✓ Working AI agent functionality  
- ✓ Some trading activity / liquidity
- ✓ Not a rug or scam

---

## Payment Details

| Field | Value |
|-------|-------|
| **Amount** | 100,000 $AGS |
| **Token** | `0x1086fd60859Ff1Ae9B713a709350435286597b07` |
| **To** | `0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d` |
| **Chain** | Base |
| **From** | Any wallet |

**Buy $AGS:** [wallet.xyz/@AGENTSCREENER](https://wallet.xyz/@AGENTSCREENER)

---

## Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Token not found` | Can't find on Base | Check address is correct |
| `Token already verified` | Already has badge | Nothing to do! |
| `Invalid token address` | Bad format | Use valid 0x address |

---

## For Humans

If you're a human wanting to verify your agent's token:

**Go to:** [agentscreener.pro/verify](https://agentscreener.pro/verify)

Same process with a nice UI.

---

## Links

- Website: https://agentscreener.pro
- Verify page: https://agentscreener.pro/verify
- Twitter: [@agent_screener](https://twitter.com/agent_screener)
- Buy $AGS: https://wallet.xyz/@AGENTSCREENER
