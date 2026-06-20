# How-to: Code-sign desktop releases (macOS + Windows)

Plan for **Apple Developer ID + notarization** and **Windows Authenticode** on NotesMD Electron installers. Enable this **after unsigned v1** validates the release pipeline (tag → CI matrix → download server → `latest.json` → client connects to a self-hosted API).

The build and CI live in the private [notesmd-frontend](https://github.com/mcrolf/notesmd-frontend) repository. This document is the operator runbook; artifact hosting is unchanged — see [Host desktop download artifacts](how-to-desktop-download-hosting.md).

---

## When to enable signing

| Gate | Exit criteria |
|------|----------------|
| **Unsigned v1** | Tag `v1.0.0` (or later) produces three installers on the download server; `latest.json` and SHA256 checksums verify; website/README links work; desktop app registers against a self-hosted backend. |
| **Signed production** | Broad public distribution — users should not see Gatekeeper “damaged” prompts or SmartScreen “unknown publisher” warnings. |

Early testers can install unsigned builds via **right-click → Open** (macOS) or **More info → Run anyway** (Windows). Do not enable signing until accounts, certificates, and GitHub secrets are in place.

---

## Accounts and certificates

### macOS — Apple Developer Program

| Item | Detail |
|------|--------|
| **Account** | [Apple Developer Program](https://developer.apple.com/programs/) ($99 USD / year) |
| **Certificate type** | **Developer ID Application** (sign apps distributed outside the Mac App Store) |
| **Export format** | `.p12` from Keychain Access (includes private key); password-protect the export |
| **Notarization** | Required for Gatekeeper on macOS 10.15+; uses App Store Connect API key **or** Apple ID + app-specific password |
| **Team ID** | [Membership details](https://developer.apple.com/account#MembershipDetailsCard) — 10-character string |

**Create the certificate (summary):**

1. Apple Developer → **Certificates, Identifiers & Profiles** → **Certificates** → **+** → **Developer ID Application**.
2. Generate a CSR on your Mac (Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority).
3. Download the cert, install in Keychain, export as `.p12`.

**Notarization credentials (pick one):**

| Method | GitHub secrets | Notes |
|--------|----------------|-------|
| **Apple ID + app-specific password** | `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` | Simplest for CI; create app-specific password at [appleid.apple.com](https://appleid.apple.com) |
| **App Store Connect API key** | `APPLE_API_KEY`, `APPLE_API_KEY_ID`, `APPLE_API_ISSUER` | Preferred for automation; `.p8` key from App Store Connect → Users and Access → Keys |

electron-builder reads either set; the frontend repo workflow is wired for the Apple ID method by default.

### Windows — Authenticode

| Item | Detail |
|------|--------|
| **Certificate type** | **Standard Code Signing** (OV) or **Extended Validation (EV)** |
| **Provider** | DigiCert, Sectigo, SSL.com, etc. (EV often requires hardware token / cloud HSM) |
| **Export format** | `.pfx` (PKCS#12) with private key |
| **SmartScreen** | EV builds reputation faster; OV may show warnings until download volume establishes trust |

**CI note:** Store the `.pfx` as base64 in `WIN_CSC_LINK` (separate from the macOS `.p12` in `CSC_LINK`). Do not reuse the Apple certificate on Windows.

### Linux

AppImage runs without OS-level signing for most users. Optional **GPG detached signatures** beside `SHA256SUMS.txt` can be added later; not required for the first signed macOS/Windows release.

---

## GitHub configuration (notesmd-frontend)

### Repository secrets

Add under **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Platform | Value |
|--------|----------|--------|
| `CSC_LINK` | macOS | Base64-encoded `.p12`: `base64 -i DeveloperID.p12 \| pbcopy` |
| `CSC_KEY_PASSWORD` | macOS | Password used when exporting the `.p12` |
| `APPLE_ID` | macOS | Apple ID email used for notarization |
| `APPLE_APP_SPECIFIC_PASSWORD` | macOS | App-specific password (not your Apple ID password) |
| `APPLE_TEAM_ID` | macOS | 10-character Team ID |
| `WIN_CSC_LINK` | Windows | Base64-encoded `.pfx`: `base64 -i cert.pfx \| pbcopy` (PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('cert.pfx'))`) |
| `WIN_CSC_KEY_PASSWORD` | Windows | `.pfx` export password |

Existing deploy secrets (`DOWNLOADS_SSH_*`, `DOWNLOADS_BASE_URL`) are unchanged.

### Repository variable (signing toggle)

Add under **Settings → Secrets and variables → Actions → Variables**:

| Variable | Value | Purpose |
|----------|-------|---------|
| `ENABLE_DESKTOP_CODE_SIGNING` | `false` → `true` when ready | Flips CI from unsigned builds to signed + notarized output |

Leave `false` for unsigned v1. Set `true` only after all platform secrets above are stored and verified.

**Never commit** certificate files, `.p12`, `.pfx`, or `.p8` keys to git.

---

## electron-builder configuration

The frontend `package.json` `build` block includes macOS hardened runtime and entitlements paths. When `ENABLE_DESKTOP_CODE_SIGNING` is `true` and secrets are present, electron-builder will:

- **macOS:** Sign with Developer ID, apply entitlements, notarize, staple the ticket to the `.dmg`
- **Windows:** Authenticode-sign the NSIS installer (`.exe`)

Key `package.json` fields (already scaffolded in notesmd-frontend):

```json
"mac": {
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist",
  "notarize": true
}
```

Entitlements in `build/entitlements.mac.plist` allow JIT and outbound network (required for Electron + API calls). Adjust only if you add native modules or new capabilities.

---

## CI workflow behavior

`.github/workflows/release-desktop.yml` in notesmd-frontend:

1. **Unsigned (default):** `ENABLE_DESKTOP_CODE_SIGNING` unset or `false` → `CSC_IDENTITY_AUTO_DISCOVERY=false`, no signing secrets required.
2. **Signed:** Variable `true` → build step receives platform secrets; macOS job notarizes; Windows job signs the installer.

Deploy (rsync + `latest.json`) is identical — signed artifacts replace unsigned files under `v<semver>/`.

---

## Pre-flight checklist (before flipping the variable)

- [ ] Unsigned release completed end-to-end (build matrix, deploy, manifest, download page).
- [ ] Apple Developer ID Application `.p12` exported and base64’d into `CSC_LINK`.
- [ ] App-specific password created; `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` set.
- [ ] Windows `.pfx` base64’d into `WIN_CSC_LINK` with `WIN_CSC_KEY_PASSWORD`.
- [ ] Test signed build on each OS (see below) before tagging a public release.
- [ ] Set `ENABLE_DESKTOP_CODE_SIGNING` to `true`.
- [ ] Tag a patch release (e.g. `v1.0.1`) and confirm Gatekeeper / SmartScreen behavior on clean VMs.

---

## Local signed build (maintainers)

Useful to debug signing before CI. **Never** commit cert files; keep them outside the repo.

### macOS

```bash
export CSC_LINK="/path/to/DeveloperID.p12"
export CSC_KEY_PASSWORD="…"
export APPLE_ID="you@example.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
export APPLE_TEAM_ID="XXXXXXXXXX"

npm run electron:build
```

Verify:

```bash
spctl -a -vv -t install release/NotesMD-*.dmg
codesign -dv --verbose=4 release/mac-arm64/NotesMD.app 2>&1 | head -20
```

Expect `accepted` / `source=Notarized Developer ID`.

### Windows

On a Windows machine with the `.pfx`:

```powershell
$env:WIN_CSC_LINK = "C:\path\to\cert.pfx"
$env:WIN_CSC_KEY_PASSWORD = "…"
npm run electron:build
```

Verify (Developer Command Prompt or SDK):

```text
signtool verify /pa release\NotesMD-*-setup.exe
```

---

## User-facing differences

| Platform | Unsigned v1 | Signed + notarized |
|----------|-------------|---------------------|
| **macOS** | Gatekeeper block; user must right-click → Open | Opens normally after download |
| **Windows** | SmartScreen “Windows protected your PC” | Publisher name shown; fewer warnings over time |
| **Linux** | AppImage + `chmod +x` | Unchanged |

Document for support: link to this page from internal release notes when switching to signed builds.

---

## Rollback

If signing breaks CI:

1. Set `ENABLE_DESKTOP_CODE_SIGNING` back to `false`.
2. Re-run the release workflow (unsigned artifacts deploy as before).
3. Fix cert expiry, notarization errors, or entitlements locally, then re-enable.

Monitor Apple cert expiry (Developer ID certs are valid ~5 years). Renew and update `CSC_LINK` before the next release.

---

## Related

- [Host desktop download artifacts](how-to-desktop-download-hosting.md) — server layout and `latest.json`
- [DOWNLOADS.md](../DOWNLOADS.md) — public download links
- notesmd-frontend `README.md` — build commands and release workflow pointer
