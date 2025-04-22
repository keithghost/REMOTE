const { keith } = require('../keizzah/keith');
const axios = require("axios");
const yts = require("yt-search");
const { generateWAMessageFromContent, proto, generateWAMessageContent } = require('@whiskeysockets/baileys');
const fs = require('fs');
const conf = require(__dirname + '/../set');
const FormData = require('form-data');

keith({
  nomCom: "yts3",
  categorie: "Search",
  reaction: "✋"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  const query = arg.join(" ");

  if (!query) {
    return repondre("Please provide a search query.");
  }

  try {
    // Show searching reaction
    await zk.sendMessage(dest, { react: { text: "🔍", key: ms.key } });

    const results = await yts(query);
    const videos = results.videos.slice(0, 9);

    if (videos.length === 0) {
      await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
      return repondre("No results found.");
    }

    // Prepare carousel cards
    const push = [];
    const thumbnailPromises = videos.map(async (video) => {
      try {
        const imageResponse = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
        return Buffer.from(imageResponse.data, 'binary');
      } catch (e) {
        console.error("Error fetching thumbnail:", e);
        return null;
      }
    });

    const thumbnails = await Promise.all(thumbnailPromises);

    videos.forEach((video, index) => {
      push.push({
        title: video.title,
        description: `⏱️ ${video.timestamp} | 👀 ${video.views}`,
        thumbnail: thumbnails[index],
        buttons: [
          {
            buttonId: `.ytmp3 ${video.url}`,
            buttonText: { displayText: "🎧 Audio" },
            type: 1
          },
          {
            buttonId: `.ytmp4 ${video.url}`,
            buttonText: { displayText: "📹 Video" },
            type: 1
          }
        ]
      });
    });

    // Send carousel message
    const message = {
      text: `*${conf.BOT} YouTube Search Results*\n\n*Query:* ${query}`,
      footer: "Swipe to browse results | Tap buttons to get download commands",
      title: "",
      buttonText: "View Results",
      sections: [{
        title: "YouTube Search Results",
        rows: push.map((item, index) => ({
          title: `${index + 1}. ${item.title.substring(0, 60)}${item.title.length > 60 ? '...' : ''}`,
          rowId: `.ytmp3 ${videos[index].url}`,
          description: item.description,
        }))
      }]
    };

    // Send the message first
    await zk.sendMessage(dest, message, { quoted: ms });
    
    // Only then show success reaction
    await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });

  } catch (error) {
    console.error("Error during the search process:", error);
    await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
    repondre("Error during the search process: " + error.message);
  }
});

//const { default: baileys } = await import('@whiskeysockets/baileys');
//const { generateWAMessageContent, generateWAMessageFromContent, proto } = baileys;

keith({
  nomCom: "yts4",
  categorie: "Search",
  reaction: "✋"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  const query = arg.join(" ").trim();

  if (!query) return repondre("❗ Please provide a search query.");

  try {
    // Show searching emoji
    await zk.sendMessage(dest, { react: { text: "🔍", key: ms.key } });

    const results = await yts(query);
    const videos = results.videos.slice(0, 9);

    if (!videos.length) return repondre("❌ No results found.");

    const rows = videos.map((video, index) => ({
      title: `${index + 1}. ${video.title.length > 60 ? video.title.slice(0, 60) + "..." : video.title}`,
      rowId: `.ytmp3 ${video.url}`,
      description: `⏱️ ${video.timestamp} | 👀 ${video.views}`
    }));

    const listMessage = {
      text: `*${conf.BOT} YouTube Search Results*\n\n*Query:* ${query}`,
      footer: "Swipe through results | Tap to get audio",
      title: "YouTube Results",
      buttonText: "🎬 Show Results",
      sections: [{
        title: "Search Results",
        rows: rows
      }]
    };

    const messageContent = generateWAMessageContent({ listMessage });
    const message = generateWAMessageFromContent(dest, messageContent, { quoted: ms });

    await zk.relayMessage(dest, message.message, { messageId: message.key.id });

    // Show success emoji
    await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });

  } catch (err) {
    console.error("Search error:", err);
    await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
    repondre("⚠️ An error occurred during search: " + err.message);
  }
});
