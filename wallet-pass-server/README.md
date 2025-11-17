**Apple Wallet Web Pass Server**

- Generates Apple Wallet `.pkpass` files from a simple web page.
- Uses your Apple Wallet certificates (Pass Type ID + Apple WWDR G4).
- Works locally from files or on Railway using base64 env vars.

---

**Quick Start (Local)**

- Node 18+ required.
- Put your certs in `certs/` (or use envs):
  - `certs/pass-cert.pem` — Pass Type ID certificate in PEM.
  - `certs/pass-key.pem` — private key in PEM (set `PASS_KEY_PASSPHRASE` if encrypted).
  - `certs/wwdr.pem` — Apple WWDR G4 certificate (PEM).
- Copy `.env.example` to `.env` and set:
  - `PASS_TYPE_IDENTIFIER`, `TEAM_IDENTIFIER`, `ORG_NAME`, `PASS_DESCRIPTION`.
- Install and run:
  - `npm install`
  - `npm run start`
  - Open `http://localhost:3000` on an iPhone (same network) and add the pass.

Certificates note: If you were given `.cer`/`.p12` files, convert to PEMs:

- Certificate to PEM: `openssl x509 -in pass.cer -inform DER -out pass-cert.pem -outform PEM`
- Private key to PEM (from `.p12`): `openssl pkcs12 -in pass.p12 -nocerts -out pass-key.pem` (add a passphrase and put it in `PASS_KEY_PASSPHRASE`).
- WWDR to PEM: `openssl x509 -in Apple_WWDR_G4.cer -inform DER -out wwdr.pem -outform PEM`

---

**Railway Deployment**

- Push this repo to GitHub and create a Railway project from it.
- Set environment variables in Railway (recommended, do not commit certs):
  - `PASS_TYPE_IDENTIFIER`, `TEAM_IDENTIFIER`, `ORG_NAME`, `PASS_DESCRIPTION`.
  - `PASS_KEY_PASSPHRASE` if your key is encrypted.
  - `PASS_CERT_BASE64`, `PASS_KEY_BASE64`, `WWDR_CERT_BASE64` containing base64 of each PEM file.
    - To create: `base64 -w0 certs/pass-cert.pem` (on macOS: `base64 < certs/pass-cert.pem`)
    - Paste the output value into the corresponding Railway variable.
- Railway auto-detects Node. Start command is `npm start`.

---

**API**

- `GET /api/pass?name=Jane` → downloads a signed `.pkpass`.
- Response `Content-Type`: `application/vnd.apple.pkpass`.

You can extend `src/pass.js` to add fields, images, or transitions. Replace the placeholder icon/logo with your own by putting correctly sized PNGs (icon and logo, also `@2x`) into the temporary model in `buildInMemoryModel` or by switching to a static model folder with your assets.

---

**File Layout**

- `src/index.js` — Express server, routes, static hosting.
- `src/pass.js` — Certificate handling and pass creation.
- `public/index.html` — Simple UI to trigger pass creation.
- `.env.example` — All configuration/env vars.

---

**Troubleshooting**

- 400/500 on download: check cert paths or base64 envs are set correctly.
- Wallet says “Invalid pass”: ensure identifiers match the certificate’s Pass Type ID and Team ID, and that WWDR G4 is the current chain.
- If the private key has a passphrase, set `PASS_KEY_PASSPHRASE`.
- Icon/logo are tiny placeholders here. Replace with proper PNGs for production.

