const { keith } = require('../commandHandler');
const ytSearch = require('yt-search');
const axios = require('axios');

keith({
  pattern: "play",
  alias: ["song", "music", "track"],
  desc: "Download music from YouTube",
  category: "Download",
  react: "🎧",
  filename: __filename
}, async ({ client, m, text, fetchJson, reply }) => {
  try {
    if (!text) return reply("🎵 Please provide a song title.\nExample: *play faded alan walker*");

    const search = await ytSearch(text);
    const first = search.videos[0];
    if (!first) return reply("🚫 No results found.");

    const ytUrl = first.url;
    const api = `https://apis-keith.vercel.app/download/ytmp3?url=${ytUrl}`;
    const { result } = await fetchJson(api);

    const audioResponse = await axios.get(result.download_url, {
      responseType: 'arraybuffer'
    });

    await client.sendMessage(m.chat, {
      audio: audioResponse.data,
      mimetype: "audio/mp3",
      fileName: `${first.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: first.title,
          body: first.timestamp,
          thumbnailUrl: first.thumbnail,
          mediaType: 1,
          sourceUrl: first.url,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });
    
  } catch (err) {
    console.error("❌ Error:", err);
    reply("Something went wrong while processing the song.");
  }
});
