# JEMBEE PLAY — ChatGPT MCP Integration (Read-only)

यह overlay Admin Panel में **Settings → ChatGPT Integration** जोड़ता है और JEMBEE PLAY के लिए public HTTPS MCP endpoint तथा OAuth 2.1 authorization-code + PKCE flow बनाता है। यह सामान्य website URL को chat में paste करने पर अपने-आप Connect prompt नहीं दिखाता। ChatGPT Web में custom MCP server/app जोड़ना आवश्यक है; उसके बाद OAuth linking flow आता है।

## इस version में क्या उपलब्ध है

- Admin/Super Admin के लिए master ON/OFF switch।
- MCP endpoint copy करने का button और verified ChatGPT OAuth consent page।
- ChatGPT Client ID Metadata Document (CIMD) validation; केवल `https://chatgpt.com` metadata host और ChatGPT callback URLs स्वीकार किए जाते हैं।
- OAuth authorization-code, PKCE S256, exact resource/audience binding, ChatGPT client metadata verification, issuer-bound callback (`iss`), `offline_access`, token refresh और revoke endpoints।
- Firebase Admin ID token से role verification; केवल `users.role` `admin` या `super_admin` अनुमति पा सकते हैं।
- Opaque access/refresh tokens Firestore में SHA-256 hash के रूप में store होते हैं; raw token केवल OAuth response में जाता है। Access token 1 घंटे और refresh token 30 दिन के लिए है।
- Admin switch OFF/ON बदलने पर token epoch बढ़ता है; पहले जारी tokens invalid हो जाते हैं। हर MCP tool invocation पर admin role दोबारा जाँचा जाता है।

## Exposed tools — केवल Read-only

1. `jembee_list_approved_videos`: हाल के approved, active, moderation-safe **FREE** videos का सीमित public metadata।
2. `jembee_get_approved_video`: एक approved, active, moderation-safe **FREE** video का public metadata।
3. `jembee_get_my_upload_status`: केवल उस connected Admin के अपने upload/moderation status।

Paid videos, pending/unsafe/inactive videos, Google Drive file IDs, resumable upload URLs, Firebase credentials, passwords, payout, settlements, moderation approval, delete और upload actions expose नहीं होते। Video caption और metadata को untrusted user content माना जाता है।

## लागू करने का तरीका

1. पहले current project का verified backup रखें और ZIP को अलग temporary folder में extract करें।
2. ZIP के `JEMBEE_PLAY/` folder के contents को project root में merge/copy करें; unrelated project files delete न करें।
3. `package.json` में केवल `test:chatgpt-mcp` script जोड़ा गया है; dependencies नहीं बदली गईं। `package-lock.json` regenerate करने की जरूरत नहीं है।
4. Vercel में `MCP_SERVER_BASE_URL` नाम का environment variable set करें। Value canonical site **origin only** हो, बिना path/trailing route के, जैसे `https://jembee-kart.vercel.app`। Production और Preview के लिए हर environment का अपना स्थिर canonical HTTPS origin दें। फिर Preview redeploy करें।
5. Admin Panel में **ChatGPT Integration** खोलें और switch ON करें। बिना valid `MCP_SERVER_BASE_URL` के server enable नहीं होगा।
6. Admin page से MCP endpoint copy करें। Endpoint का रूप `https://your-host.example/api/mcp` होगा।
7. ChatGPT **Web** में Settings/Plugins/Apps area से **Add custom MCP server** चुनें, MCP endpoint दें, OAuth linking पूरा करें, JEMBEE PLAY Admin account से login करें और Read-only consent approve करें। ChatGPT UI का नाम/स्थान account rollout के अनुसार अलग हो सकता है।
8. Preview पर MCP Inspector और ChatGPT connection test करें। Tests के साथ वास्तविक OAuth callback, refresh और tool calls भी verify करें; इसके बाद ही Production में promote करें।

## Environment

```env
MCP_SERVER_BASE_URL=https://jembee-kart.vercel.app
```

यह public base URL है, secret नहीं। इसे actual Vercel deployment domain के अनुसार configure करें। किसी Firebase service-account key, Google Drive refresh token या अन्य secret को इस variable में न डालें।

## Endpoints

- MCP: `/api/mcp`
- Protected-resource metadata: `/.well-known/oauth-protected-resource`
- Authorization-server metadata: `/.well-known/oauth-authorization-server`
- Authorization: `/oauth/authorize`
- Token: `/oauth/token`
- Revocation: `/oauth/revoke`
- Consent API: `/api/mcp/oauth/consent`
- Admin settings API: `/api/admin/mcp/settings`

## Test

```bash
npm run test:chatgpt-mcp
NODE_OPTIONS="--max-old-space-size=4096" ./node_modules/.bin/tsc --noEmit --incremental false --pretty false
npm run lint
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

The node test checks route/security contracts; it is not a substitute for a live ChatGPT OAuth handshake. Before production, use MCP Inspector and an eligible ChatGPT account to confirm discovery, stable callback, token exchange, refresh, revoke, and all three tool calls.

## ChatGPT availability note

Custom MCP app availability depends on the ChatGPT account plan, workspace settings, and the current feature rollout. The connection code on JEMBEE PLAY can be deployed even if an account does not display “Add custom MCP server”. The current OpenAI docs describe adding an HTTPS MCP endpoint through ChatGPT’s custom app/plugin interface and the OAuth/CIMD/PKCE flow. Check the account's current Settings/Plugins/Apps UI before assuming the option is enabled.

## Official references

- OpenAI Authentication / MCP OAuth: https://developers.openai.com/plugins/build/auth
- OpenAI custom MCP server setup: https://developers.openai.com/api/docs/guides/custom-mcp-server
- ChatGPT custom MCP connection help: https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt
