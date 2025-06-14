const { keith } = require('../commandHandler');
const axios = require('axios');
const yts = require("yt-search");

const API_BASE = "https://apis-keith.vercel.app";
const YT_API_BASE = "https://ytdlp.giftedtech.web.id/api/audio.php";

// List of fallback APIs for YouTube audio
const YT_AUDIO_APIS = [
    "https://api.giftedtech.web.id/api/download/ytmp3?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/yta?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/dlmp3?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/mp3?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/ytaudio?apikey=free&url=",
    "https://api.giftedtech.web.id/api/download/ytmusic?apikey=free&url="
];

keith({
    pattern: "play",
    alias: ["audio", "song"],
    desc: "Download high quality audio (YouTube → Spotify → SoundCloud)",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) return sendReply(client, m, "Please provide a song name or URL to download");

        let songData;
        let source;

        // Try YouTube first
        try {
            songData = await handleYouTube(text);
            if (songData) source = "YouTube";
        } catch (youtubeError) {
            console.error("YouTube failed:", youtubeError);
        }

        // If YouTube fails, try Spotify
        if (!songData) {
            try {
                songData = await handleSpotify(text);
                if (songData) source = "Spotify";
            } catch (spotifyError) {
                console.error("Spotify failed:", spotifyError);
            }
        }

        // If both fail, try SoundCloud
        if (!songData) {
            try {
                songData = await handleSoundCloud(text);
                if (songData) source = "SoundCloud";
            } catch (soundcloudError) {
                console.error("SoundCloud failed:", soundcloudError);
            }
        }

        if (!songData) {
            return sendReply(client, m, "❌ No results found on any platform");
        }

        return await sendSongResponse(context, songData, source);
    } catch (error) {
        console.error("Global error:", error);
        return sendReply(context.client, context.m, `❌ An error occurred: ${error.message}`);
    }
});

async function handleYouTube(query) {
    try {
        const search = await yts(query);
        const video = search.all[0];
        if (!video) throw new Error("No YouTube results found");

        // Try all audio APIs in sequence
        for (const api of YT_AUDIO_APIS) {
            try {
                const apiUrl = api + encodeURIComponent(video.url);
                const apiResponse = await axios.get(apiUrl, { timeout: 10000 });
                
                if (apiResponse.data?.success || apiResponse.data?.status) {
                    const result = apiResponse.data.result || apiResponse.data;
                    if (result.download_url || result.url || result.stream_url) {
                        return {
                            title: result.title || video.title,
                            artist: video.author.name,
                            duration: video.timestamp,
                            thumbnail: result.thumbnail || video.thumbnail,
                            downloadUrl: result.download_url || result.url,
                            streamUrl: result.stream_url
                        };
                    }
                }
            } catch (apiError) {
                console.error(`API ${api} failed:`, apiError.message);
                continue;
            }
        }

        // If all APIs fail, return basic video info
        return {
            title: video.title,
            artist: video.author.name,
            duration: video.timestamp,
            thumbnail: video.thumbnail,
            url: video.url
        };
    } catch (error) {
        console.error("YouTube handler error:", error);
        throw error;
    }
}

async function handleSpotify(query) {
    try {
        // Check if it's a Spotify URL
        const isUrl = query.match(/spotify\.com|spotify:track:/);
        const endpoint = isUrl ? 
            `${API_BASE}/download/spotify?url=${encodeURIComponent(query)}` :
            `${API_BASE}/search/spotify?q=${encodeURIComponent(query)}`;

        const response = await axios.get(endpoint, { timeout: 10000 });
        
        if (isUrl) {
            if (response.data?.status && response.data?.result?.track) {
                return formatSpotifyData(response.data.result.track);
            }
        } else {
            if (response.data?.status && response.data?.result?.length > 0) {
                const track = response.data.result[0];
                const dlResponse = await axios.get(`${API_BASE}/download/spotify?url=${encodeURIComponent(track.url)}`, {
                    timeout: 10000
                });
                if (dlResponse.data?.status && dlResponse.data?.result?.track) {
                    return formatSpotifyData(dlResponse.data.result.track);
                }
            }
        }
        throw new Error("No valid Spotify results");
    } catch (error) {
        console.error("Spotify handler error:", error);
        throw error;
    }
}

function formatSpotifyData(track) {
    return {
        title: track.title,
        artist: track.artist,
        duration: track.duration,
        thumbnail: track.thumbnail,
        downloadUrl: track.downloadLink
    };
}

async function handleSoundCloud(query) {
    try {
        // Check if it's a SoundCloud URL
        const isUrl = query.match(/soundcloud\.com/);
        const endpoint = isUrl ? 
            `${API_BASE}/download/soundcloud?url=${encodeURIComponent(query)}` :
            `${API_BASE}/search/soundcloud?q=${encodeURIComponent(query)}`;

        const response = await axios.get(endpoint, { timeout: 10000 });
        
        if (isUrl) {
            if (response.data?.status && response.data?.result?.track) {
                return formatSoundCloudData(response.data.result.track);
            }
        } else {
            if (response.data?.status && response.data?.result?.result?.length > 0) {
                const track = response.data.result.result[0];
                const dlResponse = await axios.get(`${API_BASE}/download/soundcloud?url=${encodeURIComponent(track.url)}`, {
                    timeout: 10000
                });
                if (dlResponse.data?.status && dlResponse.data?.result?.track) {
                    return formatSoundCloudData(dlResponse.data.result.track);
                }
            }
        }
        throw new Error("No valid SoundCloud results");
    } catch (error) {
        console.error("SoundCloud handler error:", error);
        throw error;
    }
}

function formatSoundCloudData(track) {
    return {
        title: track.title,
        artist: track.artist,
        duration: track.audioInfo?.duration || "N/A",
        thumbnail: track.thumbnail,
        downloadUrl: track.downloadUrl
    };
}

async function sendSongResponse(context, songData, source) {
    const { client, m } = context;
    
    try {
        const caption = `╭═════════════════⊷
║  🎵 *${source} Music Downloader* 🎵
║━━━━━━━━━━━━━━━━━
║ *Title*: ${songData.title}
║ *Artist*: ${songData.artist}
║ *Duration*: ${songData.duration}
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗕𝗘𝗟𝗢𝗪 𝗡𝗨𝗠𝗕𝗘𝗥𝗦
║ 1. Audio (MP3)
║ 2. Document (MP3)
║ 3. Lyrics
╰═════════════════⊷`;

        const message = await client.sendMessage(m.chat, {
            image: { url: songData.thumbnail },
            caption: caption
        });

        const messageId = message.key.id;

        client.ev.on("messages.upsert", async (update) => {
            const messageContent = update.messages[0];
            if (!messageContent.message) return;

            const responseText = messageContent.message.conversation || 
                               messageContent.message.extendedTextMessage?.text;
            const chatId = messageContent.key.remoteJid;

            const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

            if (isReplyToMessage) {
                try {
                    await client.sendMessage(chatId, {
                        react: { text: '⬇️', key: messageContent.key }
                    });

                    if (responseText === '1') {
                        await client.sendMessage(chatId, {
                            audio: { url: songData.downloadUrl || songData.streamUrl || songData.url },
                            mimetype: "audio/mpeg"
                        }, { quoted: messageContent });
                    } else if (responseText === '2') {
                        await client.sendMessage(chatId, {
                            document: { url: songData.downloadUrl || songData.streamUrl || songData.url },
                            mimetype: "audio/mpeg",
                            fileName: `${songData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`
                        }, { quoted: messageContent });
                    } else if (responseText === '3') {
                        const lyrics = await getLyrics(`${songData.title} ${songData.artist}`);
                        await client.sendMessage(chatId, {
                            text: lyrics || "❌ Lyrics not found",
                            ...(songData.thumbnail && { image: { url: songData.thumbnail } })
                        }, { quoted: messageContent });
                    }
                } catch (error) {
                    console.error("Reply handling error:", error);
                    await client.sendMessage(chatId, {
                        text: "❌ Failed to process your request"
                    }, { quoted: messageContent });
                }
            }
        });
    } catch (error) {
        console.error("Response sending error:", error);
        throw error;
    }
}

async function getLyrics(query) {
    try {
        const response = await axios.get(`${API_BASE}/search/lyrics?query=${encodeURIComponent(query)}`, {
            timeout: 8000
        });
        if (response.data?.status && response.data?.result?.length > 0) {
            const lyrics = response.data.result[0].lyrics;
            return lyrics.length > 4000 ? lyrics.substring(0, 4000) + "..." : lyrics;
        }
        return null;
    } catch (error) {
        console.error("Lyrics error:", error);
        return null;
    }
}
