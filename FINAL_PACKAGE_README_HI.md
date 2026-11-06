# Jembee Shorts Final Integrated Source

यह एक consolidated source package है — केवल plan या mockup नहीं। पुराने JembeeKart source modules को preserve किया गया है और V6 category foundation जोड़ी गई है।

## Termux quick start
```bash
unzip Jembee_Shorts_Final_Integrated_Source.zip -d ~/
cd ~/jembee-shorts
cp .env.example .env.local   # केवल यदि .env.local पहले से नहीं है
npm ci
npm run build
```

`.env.local` में अपने निजी Firebase/Google credentials खुद रखें; इसे साझा न करें। Existing project की env values को overwrite न करें। Build के बाद errors का पूरा output सुरक्षित रखें।

पूरा status: `FINAL_INTEGRATION_STATUS_HI.md`
