const { keith } = require('../commandHandler');

keith({
  pattern: "channelcreate",
  aliases: ["createchannel", "newchannel"],
  category: "channel",
  description: "Create a new WhatsApp channel"
}, async (from, client, conText) => {
  const { q, reply } = conText;

  if (!q) {
    return reply("❌ Please provide a name for the channel.\nExample: channelcreate MyAwesomeChannel");
  }

  try {
    await client.newsletterCreate(q.trim());
    await reply("✅ Channel created successfully");
  } catch (err) {
    console.error("Channel create error:", err);
  }
});
