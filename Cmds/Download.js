const { keith } = require('../commandHandler');
const ytSearch = require('yt-search');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

keith({
  pattern: "play",
  alias: ["song", "music", "track"],
  desc: "Download & compress music from YouTube",
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

    const tempPath = path.join(__dirname, 'temp.mp3');
    const outputPath = path.join(__dirname, 'compressed.mp3');

    // Download original high-quality audio
    const response = await axios({ url: result.download_url, responseType: 'stream' });
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);
    await new Promise((res, rej) => writer.on('finish', res).on('error', rej));

    // Use ffmpeg to reduce audio quality to 64kbps
    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i "${tempPath}" -b:a 64k "${outputPath}"`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    await client.sendMessage(m.chat, {
      audio: fs.readFileSync(outputPath),
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

    // Cleanup
    fs.unlinkSync(tempPath);
    fs.unlinkSync(outputPath);
    
  } catch (err) {
    console.error("❌ Error:", err);
    reply("Something went wrong while processing the song.");
  }
});
