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
