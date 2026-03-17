const fs = require("fs");

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

  const messages = await res.json();

  return messages
    .filter((m) => !m.author?.bot)
    .filter((m) => m.content && m.content.trim());
}

function formatMessages(messages) {
  if (!messages.length) {
    return "No updates.";
  }

  // returns ONLY the raw latest message (no formatting at all)
  return messages[0].content.replace(/\n/g, " ");
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

  const updated = readme.replace(
    /<!-- RECENT_CHANGES_START -->[\s\S]*<!-- RECENT_CHANGES_END -->/,
    `${start}\n${newContent}\n${end}`
  );

  fs.writeFileSync(readmePath, updated);
  console.log("README updated successfully");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
