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
//========================================================================================================================
//========================================================================================================================
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
