# JEMBEE PLAY ChatGPT MCP ZIP — apply guide

यह **source overlay ZIP** है, complete repository नहीं। ZIP में `JEMBEE_PLAY/` folder के भीतर केवल नई/बदली हुई files रखी गई हैं।

Project root पर जाने के बाद, उदाहरण (पहले backup और नई feature branch बना लें):

```bash
git switch -c feature/chatgpt-mcp-integration-2026-11-10
mkdir -p /tmp/jembee-chatgpt-mcp
unzip -q /storage/emulated/0/Download/JEMBEE_PLAY_ChatGPT_MCP_Integration_2026-11-10.zip -d /tmp/jembee-chatgpt-mcp
cp -a /tmp/jembee-chatgpt-mcp/JEMBEE_PLAY/. .
git status --short
```

पहले diff/backup verify करें। ZIP अपने-आप Git commit, push या deployment नहीं करती। Setup, environment और test निर्देश:

`docs/integrations/CHATGPT_MCP_INTEGRATION_HI.md`

इस version में ChatGPT access read-only है। इसमें कोई payment, payout, settlement, moderation approval, upload या delete command नहीं है।
