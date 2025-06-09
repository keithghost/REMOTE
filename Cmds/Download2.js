const { keith } = require('../commandHandler');
const axios = require('axios');
const yts = require("yt-search");

// API base URL
const API_BASE = "https://apis-keith.vercel.app";

keith({
    pattern: "play",
    alias: ["audio", "song"],
    desc: "Download high quality audio from YouTube, Spotify or SoundCloud",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply, sendMediaMessage } = context;

        if (!text) return sendReply(client, m, "Please provide a song name or URL to download");

        try {
            // First try Spotify
            const spotifyData = await handleSpotify(text);
            if (spotifyData) {
                return await sendSongResponse(context, spotifyData, "spotify");
            }

            // Then try SoundCloud
            const soundcloudData = await handleSoundCloud(text);
            if (soundcloudData) {
                return await sendSongResponse(context, soundcloudData, "soundcloud");
            }

            // Fallback to YouTube
            const youtubeData = await handleYouTube(text);
            if (youtubeData) {
                return await sendSongResponse(context, youtubeData, "youtube");
            }

            throw new Error("No results found on any platform");
        } catch (error) {
            console.error("Error in play command:", error);
            return sendReply(client, m, `❌ Failed to download: ${error.message}`);
        }
    } catch (error) {
        console.error("Global error in play command:", error);
        return sendReply(context.client, context.m, `❌ An unexpected error occurred: ${error.message}`);
    }
});

async function handleSpotify(query) {
    try {
        // Check if it's a Spotify URL
        if (query.match(/spotify\.com|spotify:track:/)) {
            const response = await axios.get(`${API_BASE}/download/spotify?url=${encodeURIComponent(query)}`);
            if (response.data?.status && response.data?.result?.track) {
                return {
                    title: response.data.result.track.title,
                    artist: response.data.result.track.artist,
                    duration: response.data.result.track.duration,
                    thumbnail: response.data.result.track.thumbnail,
                    downloadUrl: response.data.result.track.downloadLink,
                    source: "spotify"
                };
            }
        } else {
            // Search Spotify
            const searchResponse = await axios.get(`${API_BASE}/search/spotify?q=${encodeURIComponent(query)}`);
            if (searchResponse.data?.status && searchResponse.data?.result?.length > 0) {
                const track = searchResponse.data.result[0];
                const dlResponse = await axios.get(`${API_BASE}/download/spotify?url=${encodeURIComponent(track.url)}`);
                if (dlResponse.data?.status && dlResponse.data?.result?.track) {
                    return {
                        title: dlResponse.data.result.track.title,
                        artist: dlResponse.data.result.track.artist,
                        duration: dlResponse.data.result.track.duration,
                        thumbnail: dlResponse.data.result.track.thumbnail,
                        downloadUrl: dlResponse.data.result.track.downloadLink,
                        source: "spotify"
                    };
                }
            }
        }
    } catch (error) {
        console.error("Spotify handler error:", error);
        return null;
    }
    return null;
}

async function handleSoundCloud(query) {
    try {
        // Check if it's a SoundCloud URL
        if (query.match(/soundcloud\.com/)) {
            const response = await axios.get(`${API_BASE}/download/soundcloud?url=${encodeURIComponent(query)}`);
            if (response.data?.status && response.data?.result?.track) {
                return {
                    title: response.data.result.track.title,
                    artist: response.data.result.track.artist,
                    duration: response.data.result.track.audioInfo.duration,
                    thumbnail: response.data.result.track.thumbnail,
                    downloadUrl: response.data.result.track.downloadUrl,
                    source: "soundcloud"
                };
            }
        } else {
            // Search SoundCloud
            const searchResponse = await axios.get(`${API_BASE}/search/soundcloud?q=${encodeURIComponent(query)}`);
            if (searchResponse.data?.status && searchResponse.data?.result?.result?.length > 0) {
                const track = searchResponse.data.result.result[0];
                const dlResponse = await axios.get(`${API_BASE}/download/soundcloud?url=${encodeURIComponent(track.url)}`);
                if (dlResponse.data?.status && dlResponse.data?.result?.track) {
                    return {
                        title: dlResponse.data.result.track.title,
                        artist: dlResponse.data.result.track.artist,
                        duration: dlResponse.data.result.track.audioInfo.duration,
                        thumbnail: dlResponse.data.result.track.thumbnail,
                        downloadUrl: dlResponse.data.result.track.downloadUrl,
                        source: "soundcloud"
                    };
                }
            }
        }
    } catch (error) {
        console.error("SoundCloud handler error:", error);
        return null;
    }
    return null;
}

async function handleYouTube(query) {
    try {
        const search = await yts(query);
        const video = search.all[0];
        if (!video) return null;

        // Try API download first
        try {
            const apiResponse = await axios.get(`${API_BASE}/download/dlmp3?url=${encodeURIComponent(video.url)}`);
            if (apiResponse.data?.status && apiResponse.data?.result?.downloadUrl) {
                return {
                    title: video.title,
                    artist: video.author.name,
                    duration: video.timestamp,
                    thumbnail: video.thumbnail,
                    downloadUrl: apiResponse.data.result.downloadUrl,
                    source: "youtube"
                };
            }
        } catch (apiError) {
            console.error("YouTube API download failed, falling back to ytdl:", apiError);
        }

        // Fallback to ytdl-core or other methods if needed
        // (You would need to implement this part based on your available libraries)
        // For now, we'll just return the basic info
        return {
            title: video.title,
            artist: video.author.name,
            duration: video.timestamp,
            thumbnail: video.thumbnail,
            url: video.url,
            source: "youtube"
        };
    } catch (error) {
        console.error("YouTube handler error:", error);
        return null;
    }
}

async function sendSongResponse(context, songData, source) {
    const { client, m, sendReply } = context;
    
    try {
        let caption = `╭═════════════════⊷
║  🎵 *${source.toUpperCase()} Music Downloader* 🎵
║━━━━━━━━━━━━━━━━━
║ *Title*: ${songData.title}
║ *Artist*: ${songData.artist}
║ *Duration*: ${songData.duration}
║━━━━━━━━━━━━━━━━━
║ 1. Audio (MP3)
║ 2. Document (MP3)
║ 3. Lyrics
╰═════════════════⊷`;

        // Send the image and caption
        const message = await client.sendMessage(m.chat, {
            image: { url: songData.thumbnail },
            caption: caption,
        });

        const messageId = message.key.id;

        // Event listener for reply messages
        client.ev.on("messages.upsert", async (update) => {
            const messageContent = update.messages[0];
            if (!messageContent.message) return;

            const responseText = messageContent.message.conversation || 
                              messageContent.message.extendedTextMessage?.text;
            const chatId = messageContent.key.remoteJid;

            // Check if the response is a reply to our message
            const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

            if (isReplyToMessage) {
                try {
                    // React to the message
                    await client.sendMessage(chatId, {
                        react: { text: '⬇️', key: messageContent.key },
                    });

                    if (responseText === '1') {
                        await client.sendMessage(chatId, {
                            audio: { url: songData.downloadUrl },
                            mimetype: "audio/mpeg",
                            ptt: false,
                        }, { quoted: messageContent });
                    } else if (responseText === '2') {
                        await client.sendMessage(chatId, {
                            document: { url: songData.downloadUrl },
                            mimetype: "audio/mpeg",
                            fileName: `${songData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
                        }, { quoted: messageContent });
                    } else if (responseText === '3') {
                        const lyrics = await getLyrics(`${songData.title} ${songData.artist}`);
                        await client.sendMessage(chatId, {
                            image: { url: songData.thumbnail },
                            caption: `📜 *Lyrics for ${songData.title} by ${songData.artist}* 📜\n\n${lyrics || "Lyrics not found"}`,
                        }, { quoted: messageContent });
                    }
                } catch (error) {
                    console.error("Error handling reply:", error);
                    await client.sendMessage(chatId, {
                        text: "❌ Failed to process your request. Please try again.",
                    }, { quoted: messageContent });
                }
            }
        });
    } catch (error) {
        console.error("Error sending song response:", error);
        throw error;
    }
}

async function getLyrics(query) {
    try {
        const response = await axios.get(`${API_BASE}/search/lyrics?query=${encodeURIComponent(query)}`);
        if (response.data?.status && response.data?.result?.length > 0) {
            return response.data.result[0].lyrics;
        }
        return null;
    } catch (error) {
        console.error("Lyrics search error:", error);
        return null;
    }
}
