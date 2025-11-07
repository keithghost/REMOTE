
const { keith } = require('../commandHandler');
const axios = require('axios');

keith({
  pattern: "quoteaudio",
  aliases: ["audioquote", "inspireaudio"],
  description: "Play a surreal quote audio with caption",
  category: "fun",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, mek } = conText;

  try {
    const res = await axios.get("https://apiskeith.vercel.app/quote/audio");
    const data = res.data;

    if (!data.status || !data.result?.mp3 || !Array.isArray(data.result.data)) {
      return reply("❌ Failed to fetch quote audio.");
    }

    const quotes = data.result.data
      .filter(item => item.type === "quote" && item.text)
      .map((item, i) => `🧠 ${i + 1}. ${item.text}`)
      .join("\n");

    const caption = `${quotes}`;

    await client.sendMessage(from, {
      audio: { url: data.result.mp3 },
      mimetype: 'audio/mpeg',
      caption
    }, { quoted: mek });
  } catch (err) {
    console.error("quowteaudio error:", err);
    reply("❌ Error fetching quote audio: " + err.message);
  }
});
