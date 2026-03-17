const fs = require("fs");

const fetchFn = global.fetch || require("node-fetch");
const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const API_BASE = process.env.DISCORD_API_BASE || "https://discord.com/api/v10";
const MESSAGE_LIMIT = 5;

if (!TOKEN || !CHANNEL_ID) {
  throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID");
}

async function fetchMessages() {
  const res = await fetchFn(
    `${API_BASE}/channels/${CHANNEL_ID}/messages?limit=${MESSAGE_LIMIT}`,
    {
      headers: {
        Authorization: `Bot ${TOKEN}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API error ${res.status}: ${text}`);
  }

  const messages = await res.json();
  if (!Array.isArray(messages)) {
    throw new Error("Discord API did not return a message array");
  }

  return messages;
}

function pickLatestMessage(messages) {
  return messages.find((message) => {
    const content = (message?.content || "").trim();
    return content.length > 0;
  });
}

function formatMessage(message) {
  if (!message) {
    return "No updates.";
  }

  const content = (message.content || "").trim();
  if (!content) {
    return "No updates.";
  }

  return content.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

async function main() {
  const readmePath = "README.md";
  const readme = fs.readFileSync(readmePath, "utf8");

  const start = "<!-- RECENT_CHANGES_START -->";
  const end = "<!-- RECENT_CHANGES_END -->";

  if (!readme.includes(start) || !readme.includes(end)) {
    throw new Error("README markers not found");
  }

  const messages = await fetchMessages();
  const latestMessage = pickLatestMessage(messages);
  const newContent = formatMessage(latestMessage);

  const updated = readme.replace(
    /<!-- RECENT_CHANGES_START -->[\s\S]*<!-- RECENT_CHANGES_END -->/,
    `${start}\n${newContent}\n${end}`
  );

  if (readme === updated) {
    console.log("No README changes detected.");
    return;
  }

  fs.writeFileSync(readmePath, updated);
  console.log("README updated successfully.");
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
