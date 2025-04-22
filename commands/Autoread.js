
const { keith } = require('../keizzah/keith');
const axios = require('axios');
const yts = require('yt-search');
const conf = require(__dirname + '/../set');
const { default: baileys } = await import('@whiskeysockets/baileys');
const { generateWAMessageContent, generateWAMessageFromContent, proto } = baileys;

keith({
  nomCom: "yts8",
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

keith({
  nomCom: "yts4",
  categorie: "Search",
  reaction: "✋"
}, async (dest, zk, { ms, repondre, arg }) => {
  try {
    // Validate input
    const query = arg.join(" ").trim();
    if (!query) return repondre("❗ Please provide a search query.");
    if (!ms?.key) return repondre("❗ Invalid message context");

    // Show searching indicator
    await zk.sendMessage(dest, { react: { text: "🔍", key: ms.key } });

    // Fetch YouTube results
    const { videos } = await yts(query);
    if (!videos?.length) return repondre("❌ No results found.");

    // Prepare list message
    const searchResults = {
      text: `*${conf.BOT} YouTube Search Results*\n\n*Query:* ${query}`,
      footer: "Swipe through results | Tap to get audio",
      title: "YouTube Results",
      buttonText: "🎬 Show Results",
      sections: [{
        title: "Search Results",
        rows: videos.slice(0, 9).map((video, index) => ({
          title: `${index + 1}. ${video.title.substring(0, 60)}${video.title.length > 60 ? '...' : ''}`,
          rowId: `.ytmp3 ${video.url}`,
          description: `⏱️ ${video.timestamp} | 👀 ${video.views}`
        }))
      }]
    };

    // Send results
    await zk.sendMessage(dest, searchResults, { quoted: ms });
    await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });

  } catch (error) {
    console.error("YouTube search error:", error);
    await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
    repondre("⚠️ Failed to perform search. Please try again later.");
  }
});
