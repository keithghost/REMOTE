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


keith({
  pattern: "fancy",
  aliases: ["fancytext", "ft"],
  category: "tools",
  description: "Generate fancy text styles and select by number"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let text;
  if (q) {
    text = q;
  } else if (quotedMsg) {
    text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) return reply("❌ Could not extract quoted text.");
  } else {
    return reply("📌 Provide text or reply to a message.");
  }

  try {
    // First API: get all styles
    const apiUrl = `https://apiskeith.vercel.app/fancytext/styles?q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl, { timeout: 60000 });

    if (!data || !Array.isArray(data.styles)) {
      return reply("❌ Failed to fetch fancy styles.");
    }

    // Build numbered list showing the actual fancy results
    let caption = `✨ Fancy styles for: *${data.input}*\n\n`;
    data.styles.forEach((style, i) => {
      caption += `${i + 1}. ${style.result || ""}\n`;
    });
    caption += `\n📌 Reply with the style number to get the fancy text.`;

    const sent = await client.sendMessage(from, { text: caption }, { quoted: mek });
    const messageId = sent.key.id;

    // Listen for reply with number
    client.ev.on("messages.upsert", async (update) => {
      const msg = update.messages[0];
      if (!msg.message) return;

      const responseText = msg.message.conversation || msg.message.extendedTextMessage?.text;
      const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
      const chatId = msg.key.remoteJid;

      if (!isReply) return;

      const num = parseInt(responseText.trim(), 10);
      if (isNaN(num) || num < 1 || num > data.styles.length) {
        return client.sendMessage(chatId, {
          text: `❌ Invalid style number. Reply with a number between 1 and ${data.styles.length}.`,
          quoted: msg
        });
      }

      try {
        // Second API: get specific style
        const styleUrl = `https://apiskeith.vercel.app/fancytext?q=${encodeURIComponent(text)}&style=${num}`;
        const res = await axios.get(styleUrl, { timeout: 60000 });
        const styled = res.data?.result;

        if (!styled) {
          return client.sendMessage(chatId, {
            text: "❌ Failed to generate fancy text.",
            quoted: msg
          });
        }

        await client.sendMessage(chatId, { text: styled }, { quoted: msg });
      } catch (err) {
        console.error("Fancy error:", err);
        await client.sendMessage(chatId, {
          text: `❌ Error generating fancy text: ${err.message}`,
          quoted: msg
        });
      }
    });

  } catch (error) {
    console.error("Fancy text error:", error);
    reply("⚠️ An error occurred while fetching fancy styles.");
  }
});
//========================================================================================================================


keith({
  pattern: "tts",
  aliases: ["say"],
  category: "tools",
  description: "Convert text or quoted message to PTT audio"
},
async (from, client, conText) => {
  const { q, mek, quotedMsg, reply } = conText;

  let text;
  if (q) {
    text = q;
  } else if (quotedMsg) {
  
    text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) {
      return reply("❌ Could not extract quoted text.");
    }
  } else {
    return reply("📌 Reply to a message with text or provide text directly.");
  }

  try {
    const apiUrl = `https://apiskeith.vercel.app/ai/text2speech?q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(apiUrl, { timeout: 60000 });
    const result = data?.result;

    if (!result || result.Error !== 0 || !result.URL) {
      return reply("❌ Failed to generate speech.");
    }

    await client.sendMessage(from, {
      audio: { url: result.URL },
      mimetype: "audio/mpeg",
      ptt: false
    }, { quoted: mek });

  } catch (error) {
    console.error("TTS error:", error);
    reply("⚠️ An error occurred while generating speech.");
  }
});
//========================================================================================================================
//
keith({
  pattern: "langcodes",
  aliases: ["langcode", "langs"],
  category: "tools",
  description: "List available language codes for translation"
},
async (from, client, conText) => {
  const { reply } = conText;

  try {
    const url = "https://raw.githubusercontent.com/Keithkeizzah/INFO/refs/heads/main/langcode.json";
    const { data } = await axios.get(url, { timeout: 100000 });

    const langs = Array.isArray(data?.languages) ? data.languages : [];
    if (langs.length === 0) {
      return reply("❌ No language codes found.");
    }

    // Build list: code → name
    const list = langs.map(l => `${l.code} → ${l.name}`).join("\n");

    reply(`🌐 Available Language Codes:\n\n${list}`);
  } catch (err) {
    console.error("Langcodes error:", err);
    reply("❌ Failed to fetch language codes.");
  }
});
//========================================================================================================================
keith({
  pattern: "translate",
  aliases: ["trt", "tl"],
  category: "tools",
  description: "Translate quoted text into target language"
},
async (from, client, conText) => {
  const { q, quotedMsg, reply } = conText;

  if (!quotedMsg) {
    return reply("📌 Reply to a message with `.translate <langcode>`");
  }

  if (!q || typeof q !== "string") {
    return reply("❌ Missing target language code. Example: `.translate en`");
  }

  try {
    // Extract text from quoted message
    const text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
    if (!text) {
      return reply("❌ Could not extract quoted text.");
    }

    // Call translate API
    const apiUrl = `https://apiskeith.vercel.app/translate?text=${encodeURIComponent(text)}&to=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl, { timeout: 100000 });

    const result = data?.result;
    if (!result?.translatedText) {
      return reply("❌ Translation failed.");
    }

    // Reply with translated text only
    reply(result.translatedText);
  } catch (err) {
    console.error("Translate error:", err);
    reply("❌ Error translating text.");
  }
});
