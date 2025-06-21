const YT_AUDIO_APIS = [
    "https://api.giftedtech.web.id/api/download/ytmp3?apikey=gifted&url=",
    "https://api.giftedtech.web.id/api/download/yta?apikey=gifted&url=",
    "https://api.giftedtech.web.id/api/download/dlmp3?apikey=gifted&url=",
    "https://api.giftedtech.web.id/api/download/mp3?apikey=gifted&url=",
    "https://api.giftedtech.web.id/api/download/ytaudio?apikey=gifted&url=",
    "https://api.giftedtech.web.id/api/download/ytmusic?apikey=gifted&url="
];

const { keith } = require('../commandHandler');
const yts = require("yt-search");

keith({
    pattern: "play",
    alias: ["audio", "song"],
    desc: "Download high quality audio from YouTube (320kbps)",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    const { client, m, text, fetchJson, botname, sendReply, sendMediaMessage } = context;

    try {
        if (!text) return sendReply(client, m, "🎵 Please provide a song name to download.");

        // Search YouTube for the song
        const search = await yts(text);
        if (!search.all.length) return sendReply(client, m, "❌ No results found for your query.");
        
        const video = search.all[0];
        const videoUrl = video.url;
        const apis = YT_AUDIO_APIS.map(api => api + encodeURIComponent(videoUrl));

        let success = false;
        
        for (const api of apis) {
            try {
                const { status, result } = await fetchJson(api);
                
                if (status !== 200 || !result?.download_url) continue;

                // Format duration (convert from "10:28" to seconds if needed)
                const duration = result.duration || video.duration || "N/A";
                
                // Send song info with beautiful formatting
                await sendMediaMessage(client, m, {
                    image: { url: result.thumbnail || video.thumbnail },
                    caption: `
🎧 *${result.title || video.title}*

👤 *Artist:* ${video.author?.name || "Unknown"}
⏱ *Duration:* ${duration}
🔊 *Quality:* ${result.quality || "320kbps"}
🔗 *YouTube URL:* ${videoUrl}

*Powered by ${botname}*`
                }, { quoted: m });

                // Send as audio with rich preview
                await client.sendMessage(
                    m.chat,
                    {
                        audio: { url: result.download_url },
                        mimetype: "audio/mpeg",
                        contextInfo: {
                            externalAdReply: {
                                title: result.title || video.title,
                                body: `By ${video.author?.name || "Unknown Artist"} | ${duration}`,
                                thumbnailUrl: result.thumbnail || video.thumbnail,
                                mediaType: 2,
                                mediaUrl: videoUrl,
                                sourceUrl: videoUrl
                            }
                        }
                    },
                    { quoted: m }
                );

                // Send as downloadable file
                await client.sendMessage(
                    m.chat,
                    {
                        document: { url: result.download_url },
                        mimetype: "audio/mpeg",
                        fileName: `${(result.title || video.title).replace(/[^\w\s]/gi, '')}.mp3`,
                    },
                    { quoted: m }
                );

                success = true;
                break;
                
            } catch (error) {
                console.error(`API ${api} failed:`, error.message);
                continue;
            }
        }

        if (!success) {
            return sendReply(client, m, "❌ All download servers are currently busy. Please try again later.");
        }

    } catch (error) {
        console.error("Error in playy command:", error);
        sendReply(client, m, `❌ Error: ${error.message}`);
    }
});
