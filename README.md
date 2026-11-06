# Apps Script AI Editor

Edit your Google Apps Script code by describing changes in plain English. The AI proposes the new code, you review it, and one click pushes it into your Apps Script project.

- `index.html`: the website (hosted on GitHub Pages)
- `Proxy.gs`: a small Apps Script that holds your Claude API key and calls Claude for you

## Two ways to use it

- **Manual mode (no API key, uses your Claude subscription):** click **Copy prompt**, paste it into a Claude chat, copy Claude's reply, paste it into **Proposed code**, then click **Push**. Only steps B and C below are needed.
- **Automatic mode (one click, needs API billing):** also do step A. Then **Ask AI** does the round trip for you.

## One-time setup

### A. (Optional, automatic mode only) Deploy the proxy

1. Go to script.google.com and click **New project**. Name it `AI Proxy`.
2. Delete the default code, then paste in the full contents of `Proxy.gs`.
3. Click **Project Settings** (gear icon) → **Script Properties** → **Add script property**. Add two:
   - `ANTHROPIC_API_KEY` = your Claude API key
   - `SHARED_SECRET` = any password you make up (write it down; you'll enter it on the website)
4. Click **Deploy** → **New deployment** → type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**, approve the permissions, and copy the **Web app URL**.

### B. Turn on the Apps Script API

Go to script.google.com/home/usersettings and switch **Google Apps Script API** to On.

### C. Turn on GitHub Pages

In this repo: **Settings → Pages → Source: Deploy from a branch → Branch: main, folder: / (root) → Save.**
After a minute your site is at `https://<your-github-username>.github.io/App-script-builder-with-AI/`.

## Using the editor

1. Open the site and fill in **Settings**:
   - **Script ID**: in your target Apps Script project, click **Project Settings** → **Script ID**.
   - **Proxy web app URL** and **Proxy shared secret** (automatic mode only): from step A.
   Click **Save settings**.
2. Click **Sign in with Google** and approve. Then click **Load project files**.
3. Choose the file to change and describe the change.
   - Manual: click **Copy prompt for Claude chat**, paste into Claude, and copy the reply.
   - Automatic: click **Ask AI**.
4. Paste Claude's reply into **Proposed code** (or let Ask AI fill it), review it, then click **Push to Apps Script**.

The push overwrites the file in your project, so check the proposal first. Undo history is still available in the Apps Script editor (**Version history**).

## Notes

- Your API key is only stored in the Apps Script proxy's Script Properties. It never goes into this repo or the website.
- Anyone who knows the proxy URL *and* the shared secret can use your API key. Keep the secret private, and change it in Script Properties if it leaks.
- The website needs an OAuth client ID (already set in `index.html`). Its authorized origin must be `https://<your-github-username>.github.io`.
