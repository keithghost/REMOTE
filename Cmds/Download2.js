const { keith } = require('../commandHandler');
const axios = require('axios');
const yts = require("yt-search");

keith({
    pattern: "play3",
    alias: ["audio", "song"],
    desc: "Download high quality audio from YouTube, Spotify or SoundCloud",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply, sendMediaMessage } = context;
        
        if (!text) return sendReply(client, m, "Please provide a song name or link to download");

        // Try YouTube search first
        try {
            const search = await yts(text);
            const video = search.all[0];
            if (!video) throw new Error("No results found on YouTube");

            // Try YouTube download first
            let songData;
            try {
                songData = await handlePlaydl(video.url);
            } catch (youtubeError) {
                console.log("YouTube download failed, trying Spotify...");
                // Fallback to Spotify if YouTube fails
                try {
                    const spotifyData = await handleSpotify(text);
                    songData = {
                        downloadUrl: spotifyData.track.downloadLink,
                        title: spotifyData.track.title,
                        thumbnail: spotifyData.track.thumbnail,
                        duration: spotifyData.track.duration
                    };
                } catch (spotifyError) {
                    console.log("Spotify failed, trying SoundCloud...");
                    // Fallback to SoundCloud if Spotify fails
                    const soundcloudData = await handleSoundCloud(text);
                    songData = {
                        downloadUrl: soundcloudData.track.downloadUrl,
                        title: soundcloudData.track.title,
                        thumbnail: soundcloudData.track.thumbnail,
                        duration: soundcloudData.track.audioInfo.duration
                    };
                }
            }

            const caption = `  
╭═════════════════⊷
║  🎵 *Music Downloader* 🎵
║━━━━━━━━━━━━━━━━━
║ *Title*: ${songData.title || video.title}
║ *Duration*: ${songData.duration || video.timestamp}
║ *Source*: ${songData.source || "YouTube"}
║━━━━━━━━━━━━━━━━━
║ 1. Audio (MP3)
║ 2. Document (MP3)
║ 3. Lyrics
╰═════════════════⊷`;

            const thumbnailUrl = songData.thumbnail || video.thumbnail;

            // Send the image and caption with a reply
            const message = await client.sendMessage(m.chat, {
                image: { url: thumbnailUrl },
                caption: caption,
            });

            const messageId = message.key.id;

            // Event listener for reply messages
            client.ev.on("messages.upsert", async (update) => {
                const messageContent = update.messages[0];
                if (!messageContent.message) return;

                const responseText = messageContent.message.conversation || 
                    messageContent.message.extendedTextMessage?.text;
                const keith = messageContent.key.remoteJid;

                // Check if the response is a reply to our message
                const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

                if (isReplyToMessage) {
                    try {
                        // React to the message
                        await client.sendMessage(keith, {
                            react: { text: '⬇️', key: messageContent.key },
                        });

                        // Send the requested media based on the user's response
                        if (responseText === '1') {
                            await client.sendMessage(keith, {
                                audio: { url: songData.downloadUrl },
                                mimetype: "audio/mpeg",
                            }, { quoted: messageContent });
                        } else if (responseText === '2') {
                            await client.sendMessage(keith, {
                                document: { url: songData.downloadUrl },
                                mimetype: "audio/mpeg",
                                fileName: `${(songData.title || video.title).replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
                            }, { quoted: messageContent });
                        } else if (responseText === '3') {
                            const lyricsData = await handleLyrics(songData.title || video.title);
                            if (lyricsData && lyricsData.lyrics) {
                                await client.sendMessage(keith, {
                                    image: { url: lyricsData.thumbnail || thumbnailUrl },
                                    caption: `📜 *Lyrics for ${lyricsData.title} by ${lyricsData.artist}* 📜\n\n${lyricsData.lyrics}`,
                                }, { quoted: messageContent });
                            } else {
                                await client.sendMessage(keith, {
                                    text: "Sorry, couldn't find lyrics for this song.",
                                }, { quoted: messageContent });
                            }
                        }
                    } catch (error) {
                        console.error("Error handling user response:", error);
                        await client.sendMessage(keith, {
                            text: "An error occurred while processing your request.",
                        }, { quoted: messageContent });
                    }
                }
            });

        } catch (error) {
            console.error("Main error:", error);
            sendReply(client, m, `Error: ${error.message}`);
        }
    } catch (outerError) {
        console.error("Outer error:", outerError);
    }
});

// Helper functions with fallback mechanisms
async function handlePlaydl(url) {
    try {
        const response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(url)}`);
        if (response.data.status && response.data.result.downloadUrl) {
            return {
                ...response.data.result,
                source: "YouTube"
            };
        }
        throw new Error("Invalid response from YouTube download API");
    } catch (error) {
        console.error("YouTube download error:", error);
        throw error;
    }
}

async function handleSpotify(query) {
    try {
        const response = await axios.get(`https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(query)}`);
        if (response.data.status && response.data.result.track.downloadLink) {
            return response.data;
        }
        throw new Error("Invalid response from Spotify API");
    } catch (error) {
        console.error("Spotify error:", error);
        throw error;
    }
}

async function handleSoundCloud(query) {
    try {
        // First search SoundCloud
        const searchResponse = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`);
        
        if (!searchResponse.data.status || !searchResponse.data.result.result || searchResponse.data.result.result.length === 0) {
            throw new Error("No SoundCloud results found");
        }
        
        // Get the first valid track with URL
        const track = searchResponse.data.result.result.find(t => t.url);
        if (!track) throw new Error("No valid SoundCloud track found");
        
        // Now download the track
        const dlResponse = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(track.url)}`);
        
        if (dlResponse.data.status && dlResponse.data.result.track.downloadUrl) {
            return dlResponse.data;
        }
        throw new Error("Invalid response from SoundCloud download API");
    } catch (error) {
        console.error("SoundCloud error:", error);
        throw error;
    }
}

async function handleLyrics(query) {
    try {
        const response = await axios.get(`https://apis-keith.vercel.app/search/lyrics?query=${encodeURIComponent(query)}`);
        
        if (response.data.status && response.data.result && response.data.result.length > 0) {
            // Return the first lyrics result
            return response.data.result[0];
        }
        throw new Error("No lyrics found");
    } catch (error) {
        console.error("Lyrics error:", error);
        throw error;
    }
}
