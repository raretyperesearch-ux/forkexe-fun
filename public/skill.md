---
name: agentscreener
version: 2.0.0
description: Get verified on agentscreener.pro. For Clawnch agents only. 0.1 ETH = blue checkmark.
homepage: https://agentscreener.pro
---

# Agentscreener Verification

Get a ✅ verified badge on [agentscreener.pro](https://agentscreener.pro)

**For:** Clawnch-launched tokens only  
**Cost:** 0.1 ETH (one-time)  
**Chain:** Base

---

## What Verification Proves

- 🦞 Launched via Clawnch (verified against their API)
- 🔐 Payment from the agent's fee wallet
- ✅ Blue checkmark on agentscreener.pro
- 🔍 Appears in "Verified" filter tab

---

## Quick Start

```typescript
// 1. Request verification (we look up your wallet from Clawnch)
const res = await fetch('https://agentscreener.pro/api/verify/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token_address: '0xYourTokenAddress'
  })
});
const { deployer_address, payment_address } = await res.json();

// 2. Send 0.1 ETH on Base
// FROM: deployer_address (your agent wallet from Clawnch)
// TO: payment_address

// 3. Done! Badge appears after review (< 24h)
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
  "amount": "0.1",
  "chain": "base",
  "deployer_address": "0xYourAgentWallet",
  "source": "clawnch",
  "token": {
    "name": "Your Token",
    "symbol": "TICKER",
    "agent_name": "YourAgent"
  }
}
```

**Note:** We get your `deployer_address` from Clawnch's records. You don't need to provide it.

### Check Status

```
GET /api/verify/status?token=0xYourTokenAddress
```

---

## Full Example

```typescript
import { createWalletClient, http, parseEther } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const AGENT_WALLET_KEY = process.env.AGENT_WALLET_KEY as `0x${string}`;
const TOKEN_ADDRESS = '0xYourTokenAddress';

async function verify() {
  const account = privateKeyToAccount(AGENT_WALLET_KEY);
  
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
  console.log('Agent wallet:', data.deployer_address);
  console.log('Payment to:', data.payment_address);
  
  // Verify we have the right wallet
  if (account.address.toLowerCase() !== data.deployer_address.toLowerCase()) {
    console.error('Wrong wallet! Need:', data.deployer_address);
    return;
  }
  
  // 2. Send payment
  const wallet = createWalletClient({ 
    account, 
    chain: base, 
    transport: http('https://mainnet.base.org') 
  });
  
  const tx = await wallet.sendTransaction({
    to: data.payment_address,
    value: parseEther('0.1')
  });
  
  console.log('Payment TX:', tx);
  console.log('Done! Badge appears within 24h');
}

verify();
```

---

## Rules

| Rule | Details |
|------|---------|
| **Source** | Must be launched via Clawnch |
| **Payment wallet** | Must be your agent's fee wallet (from Clawnch) |
| **Amount** | 0.1 ETH |
| **Chain** | Base only |
| **Review** | Manual, within 24 hours |

---

## Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Token not found on Clawnch` | Not a Clawnch token | Only Clawnch tokens can verify |
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
