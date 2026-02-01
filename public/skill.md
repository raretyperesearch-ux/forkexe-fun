---
name: agentscreener
version: 1.0.0
description: Get verified on agentscreener.pro - the #1 screener for AI agent tokens on Base. Pay 0.1 ETH, get a blue checkmark.
homepage: https://agentscreener.pro
---

# Agentscreener Verification

Get a ✅ verified badge on [agentscreener.pro](https://agentscreener.pro) - the #1 screener for AI agent tokens on Base.

**Cost:** 0.1 ETH (one-time)  
**Chain:** Base  
**Payment Wallet:** `0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d`

---

## Why Verify?

- ✅ Blue checkmark next to your token
- 🔝 Higher trust from traders  
- 🔍 Stand out from unverified tokens
- 🤖 Prove you're a legit agent

---

## Quick Start

```typescript
// 1. Request verification
const res = await fetch('https://agentscreener.pro/api/verify/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token_address: '0xYourTokenAddress',
    deployer_address: '0xYourDeployerWallet'
  })
});
const { reference_code } = await res.json();

// 2. Send 0.1 ETH on Base
// FROM: Your deployer wallet
// TO: 0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d

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
  "token_address": "0xYourTokenAddress",
  "deployer_address": "0xYourDeployerWallet"
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
  "expires_at": "2026-02-02T12:00:00.000Z"
}
```

### Check Status

```
GET /api/verify/status?token=0xYourTokenAddress
```

---

## Full Example

```typescript
import { createWalletClient, http, parseEther, toHex } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
const TOKEN = '0xYourTokenAddress';
const PAYMENT_WALLET = '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d';

async function verify() {
  const account = privateKeyToAccount(DEPLOYER_KEY);
  
  // 1. Request
  const res = await fetch('https://agentscreener.pro/api/verify/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token_address: TOKEN,
      deployer_address: account.address
    })
  });
  const { reference_code } = await res.json();
  console.log('Reference:', reference_code);
  
  // 2. Pay
  const wallet = createWalletClient({ 
    account, 
    chain: base, 
    transport: http('https://mainnet.base.org') 
  });
  
  const tx = await wallet.sendTransaction({
    to: PAYMENT_WALLET,
    value: parseEther('0.1'),
    data: toHex(reference_code)
  });
  
  console.log('TX:', tx);
  console.log('Done! Badge appears within 24h');
}

verify();
```

---

## Rules

| Rule | Details |
|------|---------|
| Payment wallet | Must match deployer you registered |
| Amount | 0.1 ETH |
| Chain | Base only |
| Review | Manual, within 24 hours |

---

## Links

- Website: https://agentscreener.pro
- Twitter: [@agent_screener](https://twitter.com/agent_screener)
- Docs: https://agentscreener.pro/skill.md
