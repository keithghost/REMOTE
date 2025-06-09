
const { keith } = require('../commandHandler');
const axios = require('axios');
const yts = require("yt-search");

keith({
    pattern: "play",
    alias: ["audio", "song"],
    desc: "Download high quality audio from YouTube, Spotify, or SoundCloud",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply, sendMediaMessage } = context;

        if (!text) return sendReply(client, m, "What song do you want to download?");

        // Search for the song
        const searchResults = await searchSong(text);
        if (!searchResults || !searchResults.video) {
            return sendReply(client, m, "No results found for your query.");
        }

        const { video, source } = searchResults;

        // Try to get download URL from primary source
        let songData;
        try {
            songData = await getDownloadUrl(video.url, source);
        } catch (primaryError) {
            console.error("Primary download failed, trying fallback:", primaryError);
            // If primary fails, try YouTube as fallback
            try {
                const ytSearch = await yts(text);
                const ytVideo = ytSearch.all[0];
                songData = await getDownloadUrl(ytVideo.url, 'youtube');
                video.title = ytVideo.title;
                video.timestamp = ytVideo.timestamp;
                video.author = { name: ytVideo.author.name };
                video.thumbnail = ytVideo.thumbnail;
            } catch (fallbackError) {
                console.error("Fallback download failed:", fallbackError);
                return sendReply(client, m, "Failed to download the song. Please try again later.");
            }
        }

        const caption = `  
╭═════════════════⊷
║  🎵 *Music Downloader* 🎵
║━━━━━━━━━━━━━━━━━
║ *Title*: ${video.title}
║ *Duration*: ${video.timestamp || 'N/A'}
║ *Artist*: ${video.author?.name || 'Unknown'}
║ *Source*: ${source.toUpperCase()}
║━━━━━━━━━━━━━━━━━
║ 1. Audio (MP3)
║ 2. Document (MP3)
║ 3. Lyrics
╰═════════════════⊷`;

        // Send the image and caption with a reply
        const message = await client.sendMessage(m.chat, {
            image: { url: video.thumbnail },
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
                            caption: `*${video.title}* - Downloaded by Keith-MD`,
                        }, { quoted: messageContent });
                    } else if (responseText === '2') {
                        await client.sendMessage(keith, {
                            document: { url: songData.downloadUrl },
                            mimetype: "audio/mpeg",
                            fileName: `${video.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
                        }, { quoted: messageContent });
                    } else if (responseText === '3') {
                        const lyricsData = await getLyrics(video.title);
                        if (lyricsData) {
                            await client.sendMessage(keith, {
                                image: { url: lyricsData.thumbnail || video.thumbnail },
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
        console.error("Global error handler:", error);
        sendReply(client, m, 'An error occurred: ' + error.message);
    }
});

// Helper functions

async function searchSong(query) {
    try {
        // First try Spotify
        const spotifyResponse = await axios.get(`https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(query)}`);
        if (spotifyResponse.data?.status && spotifyResponse.data?.result?.track) {
            const track = spotifyResponse.data.result.track;
            return {
                video: {
                    title: track.title,
                    url: track.url,
                    timestamp: track.duration,
                    author: { name: track.artist },
                    thumbnail: track.thumbnail
                },
                source: 'spotify'
            };
        }
    } catch (spotifyError) {
        console.log("Spotify search failed, trying SoundCloud");
    }

    try {
        // Try SoundCloud
        const soundcloudResponse = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`);
        if (soundcloudResponse.data?.status && soundcloudResponse.data?.result?.result?.length > 0) {
            const track = soundcloudResponse.data.result.result[0];
            return {
                video: {
                    title: track.title,
                    url: track.url,
                    timestamp: track.timestamp || 'N/A',
                    author: { name: track.artist },
                    thumbnail: track.thumb || 'https://i.ytimg.com/vi/60ItHLz5WEA/hq720.jpg'
                },
                source: 'soundcloud'
            };
        }
    } catch (soundcloudError) {
        console.log("SoundCloud search failed, trying YouTube");
    }

    // Fallback to YouTube
    const ytSearch = await yts(query);
    if (ytSearch.all.length > 0) {
        const video = ytSearch.all[0];
        return {
            video: video,
            source: 'youtube'
        };
    }

    return null;
}

async function getDownloadUrl(url, source) {
    try {
        if (source === 'spotify') {
            const response = await axios.get(`https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(url.split('/').pop())}`);
            if (response.data?.status && response.data?.result?.track?.downloadLink) {
                return {
                    downloadUrl: response.data.result.track.downloadLink,
                    title: response.data.result.track.title
                };
            }
        } else if (source === 'soundcloud') {
            const response = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(url)}`);
            if (response.data?.status && response.data?.result?.track?.downloadUrl) {
                return {
                    downloadUrl: response.data.result.track.downloadUrl,
                    title: response.data.result.track.title
                };
            }
        } else if (source === 'youtube') {
            const response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(url)}`);
            if (response.data?.status && response.data?.result?.downloadUrl) {
                return {
                    downloadUrl: response.data.result.downloadUrl,
                    title: response.data.result.title
                };
            }
        }
    } catch (error) {
        console.error(`Error getting download URL from ${source}:`, error);
        throw error;
    }

    throw new Error(`Failed to get download URL from ${source}`);
}

async function getLyrics(query) {
    try {
        const response = await axios.get(`https://apis-keith.vercel.app/search/lyrics?query=${encodeURIComponent(query)}`);
        if (response.data?.status && response.data?.result?.length > 0) {
            // Return the first lyrics result
            const firstResult = response.data.result[0];
            return {
                title: firstResult.song,
                artist: firstResult.artist,
                lyrics: firstResult.lyrics,
                thumbnail: firstResult.thumbnail
            };
        }
    } catch (error) {
        console.error("Error fetching lyrics:", error);
    }
    return null;
}
