/**
 * Proxy for the Apps Script AI Editor.
 *
 * Deploy this as a standalone Apps Script project (see README).
 * Required Script Properties (Project Settings → Script Properties):
 *   ANTHROPIC_API_KEY  - your Claude API key
 *   SHARED_SECRET      - a password you invent; the website must send the same value
 */

const MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 8000;

const SYSTEM_PROMPT = [
  "You are an expert Google Apps Script developer.",
  "You will receive the current contents of one Apps Script file and an instruction.",
  "Return ONLY the complete updated file contents, with no commentary and no markdown fences.",
  "Keep all existing functions unless the instruction says to remove them.",
  "Do not change anything the instruction does not ask for.",
].join(" ");

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const props = PropertiesService.getScriptProperties();
    const expected = props.getProperty("SHARED_SECRET");
    const apiKey = props.getProperty("ANTHROPIC_API_KEY");

    if (!expected || !apiKey) {
      return json({ ok: false, error: "Proxy is missing SHARED_SECRET or ANTHROPIC_API_KEY." });
    }
    if (body.secret !== expected) {
      return json({ ok: false, error: "Wrong secret." });
    }

    const userMessage =
      "File name: " + body.file + "\n\n" +
      "Current file contents:\n<<<CODE\n" + body.code + "\nCODE>>>\n\n" +
      "Instruction: " + body.instruction;

    const response = UrlFetchApp.fetch("https://api.anthropic.com/v1/messages", {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      payload: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
      muteHttpExceptions: true,
    });

    const status = response.getResponseCode();
    const data = JSON.parse(response.getContentText());
    if (status !== 200) {
      return json({ ok: false, error: "Claude API error " + status + ": " + (data.error && data.error.message) });
    }

    let text = data.content.map(block => block.text || "").join("").trim();
    // Strip accidental code fences if the model adds them anyway.
    text = text.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "");

    return json({ ok: true, content: text });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
