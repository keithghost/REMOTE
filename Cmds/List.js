
const { keith } = require('../commandHandler');
const axios = require('axios');

keith({
  pattern: "walink",
  aliases: ["waurl", "whatsappurl"],
  description: "Generate WhatsApp short link with message | number",
  category: "Tools",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, q } = conText;


  if (!q || !q.includes("|")) {
    return reply("📌 Usage: .walink <message> | <number>\nExample: .walink Hey | 254748387615");
  }

  try {
    const [message, number] = q.split("|").map(s => s.trim());

    if (!message || !number) return reply("❌ Provide both message and number.");
    if (!/^\d+$/.test(number)) {
      return reply("❌ Number must be digits and start with a valid country code.");
    }

    const { data } = await axios.get(
      `https://apiskeith.vercel.app/tools/walink?q=${encodeURIComponent(message)}&number=${number}`
    );

    if (!data?.status || !data?.result?.shortUrl) {
      return reply("❌ Failed to generate WhatsApp link.");
    }

    
    await reply(data.result.shortUrl);
  } catch (err) {
    console.error("walink command error:", err);
    reply("❌ Error generating WhatsApp link. Try again.");
  }
});
