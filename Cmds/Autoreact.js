const { keith } = require('../commandHandler');
const axios = require('axios');
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================

keith({
  pattern: "poem",
  aliases: ["randompoem", "eduversefull"],
  description: "📖 Get the full educational poem",
  category: "education",
  filename: __filename
}, async (from, client, conText) => {
  const { reply } = conText;

  try {
    const res = await axios.get("https://apiskeith.vercel.app/education/randompoem");
    const data = res.data;

    if (!data.status || !data.result || !data.result.fullText) {
      return reply("❌ Failed to fetch the full poem.");
    }

    const { title, author, fullText } = data.result;
    reply(`📚 *${title}*\n✍️ ${author}\n\n${fullText}`);
  } catch (err) {
    console.error("fullpoem error:", err);
    reply("❌ Error fetching full poem: " + err.message);
  }
});
//=========================================
keith({
  pattern: "dictionary",
  aliases: ["define", "meaning"],
  description: "Look up word definitions and phonetics",
  category: "Education",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("📚 Type a word to define.\n\nExample: dictionary cat");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/education/dictionary?q=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !data.result?.meanings) {
      return reply("❌ No definition found.");
    }

    const { word, phonetics, meanings, sourceUrls } = data.result;

    const phoneticText = phonetics.map(p => p.text).filter(Boolean).join(", ");
    const audio = phonetics.find(p => p.audio)?.audio;

    const defs = meanings.map(m => {
      const defs = m.definitions.map((d, i) => `  ${i + 1}. ${d.definition}`).join("\n");
      return `📌 *${m.partOfSpeech}*\n${defs}`;
    }).join("\n\n");

    const caption = `📚 *${word}*\n🔊 Phonetics: ${phoneticText || "—"}\n\n${defs}\n\n🔗 Source: ${sourceUrls[0]}`;

    if (audio) {
      await client.sendMessage(from, {
        audio: { url: audio },
        mimetype: 'audio/mp4',
        ptt: false
      }, { quoted: mek });
    }

    await client.sendMessage(from, { text: caption }, { quoted: mek });
  } catch (err) {
    console.error("dictionary error:", err);
    reply("❌ Error fetching definition: " + err.message);
  }
});
