-- ===============================================
-- BOT POOL SETUP SQL
-- ===============================================
-- 
-- STEP 1: Create bots in Telegram
-- --------------------------------
-- Message @BotFather on Telegram and create bots:
-- 
--   /newbot
--   AgentService001
--   AgentService001Bot
-- 
-- Save each token. Repeat 20-50 times.
--
-- STEP 2: Insert into database
-- --------------------------------
-- Replace the tokens below with your real tokens:

INSERT INTO bot_pool (bot_username, bot_token) VALUES
  ('@AgentService001Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService002Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService003Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService004Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService005Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService006Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService007Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService008Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService009Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService010Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService011Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService012Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService013Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService014Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService015Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService016Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService017Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService018Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService019Bot', 'YOUR_TOKEN_HERE'),
  ('@AgentService020Bot', 'YOUR_TOKEN_HERE');

-- ===============================================
-- WEBHOOK SETUP
-- ===============================================
--
-- After inserting bots, run this query to get webhook setup commands:

SELECT 
  'curl "https://api.telegram.org/bot' || bot_token || '/setWebhook?url=https://agentscreener.pro/api/agent-service/webhook/' || id || '"' as webhook_command
FROM bot_pool;

-- Run each curl command to set up webhooks
