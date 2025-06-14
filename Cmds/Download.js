const YT_AUDIO_APIS = [
    "https://api.giftedtech.web.id/api/download/ytmp3?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/yta?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/dlmp3?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/mp3?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/ytaudio?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/ytmusic?apikey=free&url="
];

const { keith } = require('../commandHandler');
const yts = require("yt-search");
const axios = require("axios");
keith({
    pattern: "playy",
    alias: ["audio", "song"],
    desc: "Download high quality audio (YouTube → Spotify → SoundCloud)",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    
  const { client, m, text, fetchJson, botname, sendReply, sendMediaMessage } = context;

  try {
    if (!text) return sendReply(client, m, "What song do you want to download?");

    let search = await yts(text);
    let link = search.all[0].url;

    // Combine all available APIs
    const apis = [
      `https://apis.davidcyriltech.my.id/youtube/mp3?url=${link}`,
      `https://api.ryzendesu.vip/api/downloader/ytmp3?url=${link}`,
      ...YT_AUDIO_APIS.map(api => api + link)
    ];

    for (const api of apis) {
      try {
        let data = await fetchJson(api);

        // Checking if the API response is successful
        if (data.status === 200 || data.success || data.result) {
          let videoUrl = data.result?.downloadUrl || data.url || data.result?.url || data.link;

          let songData = {
            title: data.result?.title || search.all[0].title,
            artist: data.result?.author || search.all[0].author?.name || "Unknown Artist",
            thumbnail: data.result?.image || search.all[0].thumbnail,
            videoUrl: link
          };

          await sendMediaMessage(client, m, {
            image: { url: songData.thumbnail },
            caption: `
     ╭═════════════════⊷
     ║ *Title*: *${songData.title}*
     ║ *Artist*: *${songData.artist}*
     ║ *Url*: *${songData.videoUrl}*
     ╰═════════════════⊷
      *Powered by ${botname}*`
          }, { quoted: m });

          await client.sendMessage(
            m.chat,
            {
              audio: { url: videoUrl },
              mimetype: "audio/mp4",
            },
            { quoted: m }
          );

          await client.sendMessage(
            m.chat,
            {
              document: { url: videoUrl },
              mimetype: "audio/mp3",
              fileName: `${songData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
            },
            { quoted: m }
          );

          return;
        }
      } catch (e) {
        // Continue to the next API if one fails
        continue;
      }
    }

    // If no APIs succeeded
    sendReply(client, m, "An error occurred. All APIs might be down or unable to process the request.");
  } catch (error) {
    sendReply(client, m, "Download failed\n" + error.message);
  }
});
