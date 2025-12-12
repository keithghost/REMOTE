
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
  pattern: "bitly",
  description: "Shorten a URL using Bitly API",
  category: "Shortener",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, q, reply } = conText;

  if (!q) {
    return reply("📌 Provide a URL to shorten.\nExample: .bitly https://example.com");
  }

  try {
    // Call your API
    const apiUrl = `https://apiskeith.vercel.app/shortener/bitly?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl, { timeout: 10000 });

    if (!data?.status || !data?.result?.shortened) {
      return reply("❌ Failed to shorten URL.");
    }

    const shortUrl = data.result.shortened;

    
    await reply(`${shortUrl}`);

  } catch (err) {
    console.error("Bitly error:", err);
    await reply("❌ Error: " + err.message);
  }
});
//========================================================================================================================

keith({
  pattern: "tinube",
  aliases: ["tinu", "customurl"],
  category: "shortener",
  description: "Shorten a link using Tinube with a custom name"
},
async (from, client, conText) => {
  const { q, reply } = conText;

  // Expect input like: .tinube https://example.com custom123
  const parts = q?.trim().split(/\s+/);
  if (!parts || parts.length < 2) {
    return reply("❌ Provide both a URL and a custom name.\nExample: .tinube https://example.com custom123");
  }

  const url = parts[0];
  const name = parts[1];

  if (!url.startsWith("http")) {
    return reply("❌ Invalid URL. Must start with http/https.");
  }

  try {
    const apiUrl = `https://apiskeith.vercel.app/shortener/tinube?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}`;
    const response = await axios.get(apiUrl, { timeout: 100000 });

    const result = response.data?.result;
    if (!result) {
      return reply("❌ Failed to shorten the URL.");
    }

    reply(result);
  } catch (error) {
    console.error("Tinube error:", error);
    reply("❌ Error shortening URL.");
  }
});
//========================================================================================================================
//
keith({
  pattern: "tinyurl",
  aliases: ["shorturl", "shorten"],
  category: "shortener",
  description: "Shorten a link using TinyURL"
},
async (from, client, conText) => {
  const { q, reply } = conText;

  if (!q || !q.startsWith("http")) {
    return reply("❌ Provide a valid URL to shorten, e.g. .tinyurl https://example.com");
  }

  try {
    const apiUrl = `https://apiskeith.vercel.app/shortener/tinyurl?url=${encodeURIComponent(q)}`;
    const response = await axios.get(apiUrl, { timeout: 100000 });

    const result = response.data?.result;
    if (!result) {
      return reply("❌ Failed to shorten the URL.");
    }

    reply(result);
  } catch (error) {
    console.error("TinyURL error:", error);
    reply("❌ Error shortening URL.");
  }
});
