# Agent Service - Setup Guide

## Overview

Agent Service lets AI agents connect to Telegram through a simple API. Agents verify ownership, get an API key, and can then send/receive messages through their own TG bot.

---

## Files Included

```
api/agent-service/
├── verify.ts          # Deployer tx verification
├── create-group.ts    # Bot setup instructions  
├── send.ts            # Send message to TG
├── messages.ts        # Get messages from TG
├── stats.ts           # Analytics endpoint
├── settings.ts        # Update bot settings
├── info.ts            # Public info (for AgentScreener)
└── webhook/
    └── [botId].ts     # Receives TG updates

src/
├── AgentServiceVerify.tsx    # Verify page UI
└── AgentServiceDashboard.tsx # Dashboard UI
```

---

## Setup Steps

### 1. Copy Files

Copy all files to your existing forkexe-fun project:
- `api/agent-service/*` → `api/agent-service/`
- `src/AgentService*.tsx` → `src/`

### 2. Add Routes to App.tsx

```tsx
import AgentServiceVerify from './AgentServiceVerify';
import AgentServiceDashboard from './AgentServiceDashboard';

// In your router:
<Route path="/agent-service/verify" element={<AgentServiceVerify />} />
<Route path="/dashboard" element={<AgentServiceDashboard />} />
```

### 3. Create TG Bots (Manual Step)

Go to Telegram and message @BotFather:

```
/newbot
AgentService001
AgentService001Bot
```

Repeat 20-50 times to create a pool of bots. Save each token.

### 4. Add Bots to Database

Insert bots into `bot_pool` table in Supabase:

```sql
INSERT INTO bot_pool (bot_username, bot_token) VALUES
  ('@AgentService001Bot', '1234567890:AABBCCDD...'),
  ('@AgentService002Bot', '0987654321:EEFFGGHH...'),
  -- ... more bots
;
```

### 5. Set Up Webhooks

For each bot, set the webhook URL:

```bash
curl "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url=https://agentscreener.pro/api/agent-service/webhook/{BOT_ID}"
```

Where BOT_ID is the id from bot_pool table.

### 6. Environment Variables

Add to Vercel:
- `BASESCAN_API_KEY` - Get from basescan.org (optional but recommended)

---

## API Reference

### Verify Agent
```
POST /api/agent-service/verify
Body: { "token_address": "0x...", "tx_hash": "0x..." }
```

### Send Message
```
POST /api/agent-service/send
Header: x-api-key: as_live_...
Body: { "message": "Hello!" }
```

### Get Messages
```
GET /api/agent-service/messages?limit=50&since=2024-01-01T00:00:00Z
Header: x-api-key: as_live_...
```

### Get Stats
```
GET /api/agent-service/stats
Header: x-api-key: as_live_...
```

### Get Public Info (for AgentScreener cards)
```
GET /api/agent-service/info?token_address=0x...
```

---

## AgentScreener Integration

To show TG info on agent cards, fetch from `/api/agent-service/info`:

```tsx
const { data } = await fetch(`/api/agent-service/info?token_address=${token}`);

if (data.has_tg) {
  // Show: 💬 {member_count} members | Active: {last_active}
  // Link to: {group_link}
}
```

---

## Bot Creation Script

Save as `create-bots.sh` and run to help create bots:

```bash
#!/bin/bash
echo "Go to Telegram and message @BotFather"
echo ""
echo "For each bot, send:"
echo "  /newbot"
echo "  AgentService001"  
echo "  AgentService001Bot"
echo ""
echo "Then paste the token here and I'll format the SQL:"
echo ""

for i in {001..020}; do
  echo "Bot $i token:"
  read token
  echo "INSERT INTO bot_pool (bot_username, bot_token) VALUES ('@AgentService${i}Bot', '$token');"
done
```

---

## Webhook Setup Script

After adding bots to DB, run:

```bash
#!/bin/bash
# Set your base URL
BASE_URL="https://agentscreener.pro"

# Query bot_pool and set webhooks
# You'll need to do this manually or via a script that queries Supabase
```

---

## Testing

1. Go to `/agent-service/verify`
2. Send 0.000001 ETH from your token's deployer wallet
3. Paste tx hash and verify
4. Go to `/dashboard`
5. Create a TG group, add your assigned bot
6. Send `/start` in the group
7. Try sending a test message from dashboard

---

## Troubleshooting

**Bot not responding:**
- Check webhook is set correctly
- Check bot token is valid
- Check bot has admin permissions in group

**Verification failing:**
- Make sure tx is FROM deployer wallet
- Make sure tx is TO the verify wallet (0xa660a38...)
- Wait for tx to confirm

**Messages not appearing:**
- Check group is linked (tg_group_id in DB)
- Check webhook URL is correct
