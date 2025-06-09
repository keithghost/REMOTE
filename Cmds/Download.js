
const { keith } = require('../commandHandler');
const axios = require('axios');
const yts = require("yt-search");

keith({
    pattern: "play2",
    alias: ["audio", "song"],
    desc: "Download high quality audio songs from YouTube, Spotify, and SoundCloud",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply, sendMediaMessage } = context;

        if (!text) return sendReply(client, m, "Please provide a song name or artist to search for.");

        // Search for the song
        const songInfo = await searchSong(text);
        if (!songInfo) return sendReply(client, m, "No results found for your query.");

        // Try to get download URL from primary source
        let downloadData;
        try {
            if (songInfo.source === 'youtube') {
                downloadData = await handleYoutubeDownload(songInfo.url);
            } else if (songInfo.source === 'spotify') {
                downloadData = await handleSpotifyDownload(songInfo.url);
            } else if (songInfo.source === 'soundcloud') {
                downloadData = await handleSoundcloudDownload(songInfo.url);
            }
        } catch (e) {
            console.error('Primary download failed, trying fallback:', e);
            // Fallback to YouTube search if primary download fails
            const ytSearch = await yts(text);
            const ytVideo = ytSearch.all[0];
            if (ytVideo) {
                downloadData = await handleYoutubeDownload(ytVideo.url);
                songInfo.thumbnail = ytVideo.thumbnail;
                songInfo.title = ytVideo.title;
                songInfo.duration = ytVideo.timestamp;
                songInfo.artist = ytVideo.author.name;
                songInfo.source = 'youtube-fallback';
            }
        }

        if (!downloadData) return sendReply(client, m, "Failed to get download URL. Please try again later.");

        const caption = `  
╭═════════════════⊷
║  🎵 *Music Downloader* 🎵
║━━━━━━━━━━━━━━━━━
║ *Title*: ${songInfo.title}
║ *Duration*: ${songInfo.duration || 'N/A'}
║ *Artist*: ${songInfo.artist || 'Unknown'}
║ *Source*: ${songInfo.source.toUpperCase()}
║ *Quality*: ${downloadData.quality || '128kbps'}
║━━━━━━━━━━━━━━━━━
║ 1. Audio (MP3)
║ 2. Document (MP3)
║ 3. Lyrics
╰═════════════════⊷`;

        // Send the image and caption with a reply
        const message = await client.sendMessage(m.chat, {
            image: { url: songInfo.thumbnail },
            caption: caption,
        });

        const messageId = message.key.id;

        // Event listener for reply messages
        client.ev.on("messages.upsert", async (update) => {
            const messageContent = update.messages[0];
            if (!messageContent.message) return;

            const responseText = messageContent.message.conversation || messageContent.message.extendedTextMessage?.text;
            const keith = messageContent.key.remoteJid;

            // Check if the response is a reply to the message we sent
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
                            audio: { url: downloadData.downloadUrl },
                            mimetype: "audio/mpeg",
                            caption: `🎧 *${songInfo.title}* - ${songInfo.artist || ''}\n📥 Downloaded via ${botname}`
                        }, { quoted: messageContent });
                    } else if (responseText === '2') {
                        await client.sendMessage(keith, {
                            document: { url: downloadData.downloadUrl },
                            mimetype: "audio/mpeg",
                            fileName: `${songInfo.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
                            caption: `📁 *${songInfo.title}* - ${songInfo.artist || ''}\n📥 Downloaded via ${botname}`
                        }, { quoted: messageContent });
                    } else if (responseText === '3') {
                        const lyrics = await getLyrics(songInfo.title, songInfo.artist);
                        if (lyrics) {
                            await client.sendMessage(keith, {
                                image: { url: lyrics.thumbnail || songInfo.thumbnail },
                                caption: `📜 *Lyrics for ${lyrics.title}* - ${lyrics.artist}\n\n${lyrics.lyrics}\n\n🔎 Searched via ${botname}`
                            }, { quoted: messageContent });
                        } else {
                            await client.sendMessage(keith, {
                                text: "Sorry, couldn't find lyrics for this song."
                            }, { quoted: messageContent });
                        }
                    }
                } catch (error) {
                    console.error('Error handling reply:', error);
                    await client.sendMessage(keith, {
                        text: "An error occurred while processing your request. Please try again."
                    }, { quoted: messageContent });
                }
            }
        });
    } catch (error) {
        console.error('Global error:', error);
        sendReply(client, m, 'An error occurred: ' + error.message);
    }
});

// Search for song across multiple platforms
async function searchSong(query) {
    try {
        // Try Spotify first
        const spotifyRes = await axios.get(`https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(query)}`);
        if (spotifyRes.data?.status && spotifyRes.data?.result?.track) {
            const track = spotifyRes.data.result.track;
            return {
                title: track.title,
                artist: track.artist,
                duration: track.duration,
                thumbnail: track.thumbnail,
                url: track.url,
                source: 'spotify'
            };
        }
    } catch (e) {
        console.error('Spotify search failed:', e);
    }

    try {
        // Try SoundCloud next
        const soundcloudRes = await axios.get(`https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`);
        if (soundcloudRes.data?.status && soundcloudRes.data?.result?.result?.length > 0) {
            const track = soundcloudRes.data.result.result[0];
            return {
                title: track.title,
                artist: track.artist,
                thumbnail: track.thumb || '',
                url: track.url,
                source: 'soundcloud'
            };
        }
    } catch (e) {
        console.error('SoundCloud search failed:', e);
    }

    // Fallback to YouTube search
    const ytSearch = await yts(query);
    const video = ytSearch.all[0];
    if (video) {
        return {
            title: video.title,
            artist: video.author.name,
            duration: video.timestamp,
            thumbnail: video.thumbnail,
            url: video.url,
            source: 'youtube'
        };
    }

    return null;
}

// Handle YouTube downloads
async function handleYoutubeDownload(url) {
    try {
        const res = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(url)}`);
        if (res.data?.status && res.data?.result?.downloadUrl) {
            return {
                downloadUrl: res.data.result.downloadUrl,
                title: res.data.result.title,
                quality: res.data.result.quality || '128kbps'
            };
        }
        throw new Error('Invalid YouTube download response');
    } catch (e) {
        console.error('YouTube download failed:', e);
        throw e;
    }
}

// Handle Spotify downloads
async function handleSpotifyDownload(url) {
    try {
        const res = await axios.get(`https://apis-keith.vercel.app/download/spotify?url=${encodeURIComponent(url)}`);
        if (res.data?.status && res.data?.result?.track?.downloadLink) {
            return {
                downloadUrl: res.data.result.track.downloadLink,
                title: res.data.result.track.title,
                quality: '128kbps' // Assuming standard quality
            };
        }
        throw new Error('Invalid Spotify download response');
    } catch (e) {
        console.error('Spotify download failed:', e);
        throw e;
    }
}

// Handle SoundCloud downloads
async function handleSoundcloudDownload(url) {
    try {
        const res = await axios.get(`https://apis-keith.vercel.app/download/soundcloud?url=${encodeURIComponent(url)}`);
        if (res.data?.status && res.data?.result?.track?.downloadUrl) {
            return {
                downloadUrl: res.data.result.track.downloadUrl,
                title: res.data.result.track.title,
                quality: `${res.data.result.track.audioInfo?.bitrate || 128}kbps`
            };
        }
        throw new Error('Invalid SoundCloud download response');
    } catch (e) {
        console.error('SoundCloud download failed:', e);
        throw e;
    }
}

// Get lyrics for a song
async function getLyrics(title, artist = '') {
    try {
        const query = `${title} ${artist}`.trim();
        const res = await axios.get(`https://apis-keith.vercel.app/search/lyrics?query=${encodeURIComponent(query)}`);
        
        if (res.data?.status && res.data?.result?.length > 0) {
            // Return the first result (most relevant)
            return {
                title: res.data.result[0].song,
                artist: res.data.result[0].artist,
                lyrics: res.data.result[0].lyrics,
                thumbnail: res.data.result[0].thumbnail
            };
        }
        return null;
    } catch (e) {
        console.error('Lyrics search failed:', e);
        return null;
    }
}
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
