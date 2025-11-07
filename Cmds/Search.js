const axios = require('axios');
const { generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');
const { keith } = require('../commandHandler');
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
  pattern: "brave",
  aliases: ["bravesearch", "searchbrave"],
  description: "Search Brave results and preview links",
  category: "search",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("🔍 Type a keyword to search Brave.\n\nExample: brave Kenya");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/search/brave?q=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !Array.isArray(data.result?.results) || data.result.results.length === 0) {
      return reply("❌ No results found.");
    }

    const results = data.result.results.slice(0, 10); // max 10
    const list = results.map((r, i) => `${i + 1}. ${r.title} (${r.siteName})`).join("\n");
    const caption = `🦁 *Brave Search: ${q}*\n\n${list}\n\n📌 Reply with a number to preview the link.`;

    const sent = await client.sendMessage(from, { text: caption }, { quoted: mek });
    const messageId = sent.key.id;

    client.ev.on("messages.upsert", async (update) => {
      const msg = update.messages[0];
      if (!msg.message) return;

      const responseText = msg.message.conversation || msg.message.extendedTextMessage?.text;
      const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
      const chatId = msg.key.remoteJid;

      if (!isReply) return;

      const index = parseInt(responseText.trim()) - 1;
      const selected = results[index];

      if (!selected || !selected.title || !selected.url) {
        return client.sendMessage(chatId, {
          text: "❌ Invalid number. Reply with a valid result number.",
          quoted: msg
        });
      }

      const preview = `🔗 *${selected.title}*\n${selected.description || "No description"}\n\n🌐 ${selected.url}`;
      await client.sendMessage(chatId, { text: preview }, { quoted: msg });
    });
  } catch (err) {
    console.error("brave error:", err);
    reply("❌ Error fetching Brave results: " + err.message);
  }
});
//========================================================================================================================

keith({
  pattern: "wagroup",
  aliases: ["groupsearch", "whatsappgroup"],
  description: "Search and join WhatsApp groups by category",
  category: "search",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("🔍 Type a keyword to search WhatsApp groups.\n\nExample: wagroup football");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/search/whatsappgroup?q=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.success || !Array.isArray(data.results) || data.results.length === 0) {
      return reply("❌ No group categories found.");
    }

    const list = data.results.map((g, i) => `${i + 1}. ${g.title}`).join("\n");
    const caption = `📱 *Group Categories for:* _${q}_\n\n${list}\n\n📌 Reply with a number to view group links.`;

    const sent = await client.sendMessage(from, { text: caption }, { quoted: mek });
    const messageId = sent.key.id;

    client.ev.on("messages.upsert", async (update) => {
      const msg = update.messages[0];
      if (!msg.message) return;

      const responseText = msg.message.conversation || msg.message.extendedTextMessage?.text;
      const isReply = msg.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
      const chatId = msg.key.remoteJid;

      if (!isReply) return;

      const index = parseInt(responseText.trim()) - 1;
      const selected = data.results[index];

      if (!selected) {
        return client.sendMessage(chatId, {
          text: "❌ Invalid number. Reply with a valid group category number.",
          quoted: msg
        });
      }

      await client.sendMessage(chatId, { react: { text: "📥", key: msg.key } });

      try {
        const linkRes = await axios.get(`https://apiskeith.vercel.app/fetch/wagrouplink?url=${encodeURIComponent(selected.url)}`);
        const linkData = linkRes.data;

        if (!linkData.success || !linkData.result) {
          return client.sendMessage(chatId, {
            text: `❌ Couldn't fetch group links for ${selected.title}.`,
            quoted: msg
          });
        }

        const lines = linkData.result.split("\n").slice(0, 10); // max 10 links
        for (const line of lines) {
          const match = line.match(/Link - (https:\/\/chat\.whatsapp\.com\/invite\/\S+)/);
          if (!match) continue;

          const url = match[1];
          const title = line.split("–")[0].replace(/^\d+\)\s*/, "").trim();

          await client.sendMessage(chatId, {
            text: title,
            contextInfo: {
              externalAdReply: {
                title: title,
                body: "WhatsApp Group Invite",
                mediaType: 1,
                sourceUrl: url
              }
            }
          }, { quoted: msg });
        }
      } catch (err) {
        console.error("wagroup fetch error:", err);
        await client.sendMessage(chatId, {
          text: "❌ Error fetching group links: " + err.message,
          quoted: msg
        });
      }
    });
  } catch (err) {
    console.error("wagroup search error:", err);
    reply("❌ Error searching group categories: " + err.message);
  }
});
//========================================================================================================================


keith({
  pattern: "lyrics",
  aliases: ["lyric", "song"],
  description: "Search for song lyrics by title or phrase",
  category: "Search",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, mek } = conText;

  if (!q) return reply("🎵 Type a song title or lyric line.\n\nExample: lyrics what shall I render to Jehovah");

  try {
    const res = await axios.get(`https://apiskeith.vercel.app/search/lyrics2?query=${encodeURIComponent(q)}`);
    const data = res.data;

    if (!data.status || !data.result) {
      return reply("❌ No lyrics found.");
    }

    const caption = `🎶 ${data.result}`;

    await client.sendMessage(from, { text: caption }, { quoted: mek });
  } catch (err) {
    console.error("lyrics error:", err);
    reply("❌ Error fetching lyrics: " + err.message);
  }
});
//========================================================================================================================

keith({
  pattern: "yts",
  aliases: ["ytsearch", "ytfind"],
  category: "Search",
  description: "Search YouTube videos"
},
async (from, client, conText) => {
  const { q, mek } = conText;
  if (!q) return;

  try {
    const apiUrl = `https://apiskeith.vercel.app/search/yts?query=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl, { timeout: 100000 });
    const results = res.data?.result;

    if (!Array.isArray(results) || results.length === 0) return;

    const videos = results.slice(0, 8);
    const cards = await Promise.all(videos.map(async (vid, i) => ({
      header: {
        title: `🎬 ${vid.title}`,
        hasMediaAttachment: true,
        imageMessage: (await generateWAMessageContent({ image: { url: vid.thumbnail } }, {
          upload: client.waUploadToServer
        })).imageMessage
      },
      body: {
        text: `📺 Duration: ${vid.duration}\n👁️ Views: ${vid.views}${vid.published ? `\n📅 Published: ${vid.published}` : ""}`
      },
      footer: { text: "🔹 Scroll to explore more videos" },
      nativeFlowMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "▶️ Watch on YouTube",
              url: vid.url
            })
          },
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy Link",
              copy_code: vid.url
            })
          }
        ]
      }
    })));

    const message = generateWAMessageFromContent(from, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: {
            body: { text: `🔍 YouTube Results for: ${q}` },
            footer: { text: `📂 Found ${videos.length} videos` },
            carouselMessage: { cards }
          }
        }
      }
    }, { quoted: mek });

    await client.relayMessage(from, message.message, { messageId: message.key.id });

  } catch (err) {
    console.error("YTS command error:", err);
  }
});
//========================================================================================================================
keith({
  pattern: "image",
  aliases: ["img"],
  category: "Search",
  description: "Search and download images"
},
async (from, client, conText) => {
  const { q, mek } = conText;
  if (!q) return;

  try {
    const apiUrl = `https://apiskeith.vercel.app/search/images?query=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl, { timeout: 100000 });
    const results = res.data?.result;

    if (!Array.isArray(results) || results.length === 0) return;

    const images = results.slice(0, 8);
    const picked = [];

    for (const img of images) {
      try {
        const bufferRes = await axios.get(img.url, { responseType: "arraybuffer" });
        picked.push({ buffer: bufferRes.data, directLink: img.url });
      } catch {
        console.error("Image download failed:", img.url);
      }
    }

    if (picked.length === 0) return;

    const cards = await Promise.all(picked.map(async (item, i) => ({
      header: {
        title: `📸 Image ${i + 1}`,
        hasMediaAttachment: true,
        imageMessage: (await generateWAMessageContent({ image: item.buffer }, {
          upload: client.waUploadToServer
        })).imageMessage
      },
      body: { text: `🔍 Search: ${q}` },
      footer: { text: "🔹 Scroll to see more images" },
      nativeFlowMessage: {
        buttons: [
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "🌐 View Original",
              url: item.directLink
            })
          },
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 Copy Link",
              copy_code: item.directLink
            })
          }
        ]
      }
    })));

    const message = generateWAMessageFromContent(from, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: {
            body: { text: `🔍 Search Results for: ${q}` },
            footer: { text: `📂 Found ${picked.length} images` },
            carouselMessage: { cards }
          }
        }
      }
    }, { quoted: mek });

    await client.relayMessage(from, message.message, { messageId: message.key.id });

  } catch (err) {
    console.error("Image command error:", err);
  }
});
//========================================================================================================================
