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

keith({
    pattern: "play",
    alias: ["audio", "song"],
    desc: "Download high quality audio from YouTube",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    const { client, m, text, fetchJson, botname, sendReply, sendMediaMessage } = context;

    try {
        if (!text) return sendReply(client, m, "Please provide a song name to download.");

        // Search YouTube for the song
        const search = await yts(text);
        if (!search.all.length) return sendReply(client, m, "No results found.");
        
        const video = search.all[0];
        const videoUrl = video.url;
        const apis = YT_AUDIO_APIS.map(api => api + encodeURIComponent(videoUrl));

        let success = false;
        
        for (const api of apis) {
            try {
                const response = await fetchJson(api);
                
                // Handle different API response formats
                const audioUrl = response.result?.url || 
                                response.url || 
                                response.link || 
                                response.result?.downloadUrl;
                
                if (!audioUrl) continue;

                // Send song info
                await sendMediaMessage(client, m, {
                    image: { url: video.thumbnail },
                    caption: `
╭═════════════════⊷
║ *Title*: *${video.title}*
║ *Artist*: *${video.author?.name || "Unknown"}*
║ *Duration*: ${video.timestamp || "N/A"}
║ *Views*: ${video.views || "N/A"}
║ *Url*: ${videoUrl}
╰═════════════════⊷
*Powered by ${botname}*`
                }, { quoted: m });

                // Send as audio
                await client.sendMessage(
                    m.chat,
                    {
                        audio: { url: audioUrl },
                        mimetype: "audio/mp4",
                        contextInfo: {
                            externalAdReply: {
                                title: video.title,
                                body: video.author?.name || "",
                                thumbnailUrl: video.thumbnail,
                                mediaType: 2,
                                mediaUrl: videoUrl
                            }
                        }
                    },
                    { quoted: m }
                );

                // Send as downloadable file
                await client.sendMessage(
                    m.chat,
                    {
                        document: { url: audioUrl },
                        mimetype: "audio/mp3",
                        fileName: `${video.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
                    },
                    { quoted: m }
                );

                success = true;
                break;
                
            } catch (error) {
                console.error(`API ${api} failed:`, error);
                continue;
            }
        }

        if (!success) {
            return sendReply(client, m, "Failed to download audio. All APIs are currently unavailable.");
        }

    } catch (error) {
        console.error("Error in playy command:", error);
        sendReply(client, m, `An error occurred: ${error.message}`);
    }
});
