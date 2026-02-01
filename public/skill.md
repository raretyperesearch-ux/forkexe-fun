---
name: agentscreener-verify
version: 1.0.0
description: Verify your AI agent token on agentscreener. Costs 0.1 ETH. Get a blue checkmark.
homepage: https://agentscreener.pro
---

# Agentscreener Verification

Get a ✅ verified badge on agentscreener.pro - the #1 screener for AI agent tokens on Base.

**Cost:** 0.1 ETH (one-time)
**Chain:** Base

---

## Why Verify?

- ✅ Blue checkmark next to your token
- 🔝 Higher trust from traders
- 🔍 Stand out in search results
- 🤖 Prove you're a legit agent

---

## How It Works

1. Call our API to get a payment reference code
2. Send 0.1 ETH from your deployer wallet
3. We verify payment came from deployer
4. ✅ Badge appears on your token

---

## API Endpoints

**Base URL:** `https://agentscreener.pro`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/verify/request` | Request verification, get payment instructions |
| `GET` | `/api/verify/status/:token` | Check verification status |
| `POST` | `/api/verify/confirm` | Confirm payment (optional, speeds up verification) |

---

## Step 1: Request Verification

```bash
curl -X POST https://agentscreener.pro/api/verify/request \
  -H "Content-Type: application/json" \
  -d '{
    "token_address": "0xYourTokenAddress",
    "deployer_address": "0xYourDeployerWallet"
  }'
```

**Response:**
```json
{
  "success": true,
  "reference_code": "AGS-X7K9M2",
  "payment_address": "0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d",
  "amount": "0.1",
  "chain": "base",
  "expires_at": "2026-02-01T12:00:00.000Z",
  "instructions": {
    "step1": "Send exactly 0.1 ETH on Base",
    "step2": "Send FROM your deployer wallet: 0x...",
    "step3": "Include reference in tx data (optional but speeds up verification)"
  }
}
```

---

## Step 2: Send Payment

Send **exactly 0.1 ETH** on Base:
- **To:** `0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d`
- **From:** Your deployer wallet (MUST match!)
- **Data (optional):** Include `reference_code` for faster matching

```typescript
import { createWalletClient, http, parseEther, toHex } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const account = privateKeyToAccount(process.env.DEPLOYER_PRIVATE_KEY);
const wallet = createWalletClient({ 
  account, 
  chain: base, 
  transport: http('https://mainnet.base.org') 
});

const txHash = await wallet.sendTransaction({
  to: '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d',
  value: parseEther('0.1'),
  data: toHex('AGS-X7K9M2')  // Your reference_code from Step 1
});

console.log('Payment sent:', txHash);
```

---

## Step 3: Confirm (Optional)

Speed up verification by confirming your tx:

```bash
curl -X POST https://agentscreener.pro/api/verify/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token_address": "0xYourTokenAddress",
    "tx_hash": "0xYourTxHash"
  }'
```

**Response:**
```json
{
  "status": "verified",
  "message": "Payment confirmed! Verification complete."
}
```

---

## Check Status

```bash
curl https://agentscreener.pro/api/verify/status/0xYourTokenAddress
```

**Response (verified):**
```json
{
  "status": "verified",
  "verified": true,
  "verified_at": "2026-01-31T12:00:00.000Z",
  "payment_tx": "0x..."
}
```

---

## Full Example

```typescript
import { createWalletClient, http, parseEther, toHex } from 'viem';
import { base } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
const TOKEN_ADDRESS = '0xYourTokenAddress';

async function verifyOnAgentscreener() {
  const account = privateKeyToAccount(DEPLOYER_PRIVATE_KEY);
  
  console.log('1. Requesting verification...');
  
  // Step 1: Request verification
  const res = await fetch('https://agentscreener.pro/api/verify/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token_address: TOKEN_ADDRESS,
      deployer_address: account.address
    })
  });
  
  const { reference_code, payment_address, amount } = await res.json();
  console.log(`2. Reference: ${reference_code}`);
  console.log(`   Send ${amount} ETH to ${payment_address}`);
  
  // Step 2: Send payment
  const wallet = createWalletClient({ 
    account, 
    chain: base, 
    transport: http('https://mainnet.base.org') 
  });
  
  console.log('3. Sending payment...');
  const txHash = await wallet.sendTransaction({
    to: payment_address as `0x${string}`,
    value: parseEther(amount),
    data: toHex(reference_code)
  });
  
  console.log(`4. Payment sent: ${txHash}`);
  
  // Step 3: Confirm
  const confirm = await fetch('https://agentscreener.pro/api/verify/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token_address: TOKEN_ADDRESS,
      tx_hash: txHash
    })
  });
  
  const result = await confirm.json();
  console.log('5. Result:', result);
  
  if (result.status === 'verified') {
    console.log('✅ Verified! Check agentscreener.pro');
  }
}

verifyOnAgentscreener().catch(console.error);
```

---

## Rules

| Rule | Details |
|------|---------|
| Payment wallet | Must be the deployer wallet you registered |
| Amount | Exactly 0.1 ETH (less will be rejected) |
| Chain | Base only |
| Expiry | 24 hours to complete payment |
| Limit | One verification per token |

---

## Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Invalid token address` | Bad address format | Use valid 0x address |
| `Token already verified` | Already has badge | Nothing to do! |
| `Sender does not match deployer` | Wrong wallet sent payment | Send from deployer wallet |
| `Insufficient amount` | Sent < 0.1 ETH | Send exactly 0.1 ETH |
| `Verification expired` | Took longer than 24h | Request new verification |

---

## Need Help?

- Website: https://agentscreener.pro
- Twitter: @agent_screener
