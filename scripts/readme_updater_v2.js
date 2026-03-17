const fs = require("fs");
const fetch = global.fetch || require("node-fetch");

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

if (!TOKEN || !CHANNEL_ID) {
  throw new Error("Missing DISCORD_BOT_TOKEN or DISCORD_CHANNEL_ID");
}

async function fetchMessages() {
  const res = await fetch(
    `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=1`,
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
  
const messages = [{ content: "🔥 IF YOU SEE THIS, SCRIPT WORKS 🔥" }];

  console.log("📥 Raw Discord response:", messages);

  // DO NOT filter aggressively — just take latest
  return messages;
}

function formatMessages(messages) {
  if (!messages.length) {
    return "No updates.";
  }

  const content = messages[0]?.content;

  console.log("📝 Raw message content:", content);

  if (!content || !content.trim()) {
    return "No updates.";
  }

  // Single-line, raw text only
  return content.replace(/\n/g, " ");
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
  const newContent = formatMessages(messages);

  console.log("✅ Final content going into README:", newContent);

  const updated = readme.replace(
    /<!-- RECENT_CHANGES_START -->[\s\S]*<!-- RECENT_CHANGES_END -->/,
    `${start}\n${newContent}\n${end}`
  );

  if (readme === updated) {
    console.log("⚠️ No changes detected — README not updated");
    return;
  }

  fs.writeFileSync(readmePath, updated);
  console.log("🚀 README updated successfully");
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
