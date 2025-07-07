const { keith } = require('../commandHandler');
const ytSearch = require('yt-search');
const axios = require('axios');
//========================================================================================================================

//========================================================================================================================

//========================================================================================================================

//========================================================================================================================

//========================================================================================================================

//========================================================================================================================


keith({
    pattern: "pinterest",
    alias: ["pin", "pindl"],
    desc: "Download Pinterest images",
    category: "Download",
    react: "📌",
    filename: __filename
}, async ({ client, m, text, reply }) => {
    if (!text) return reply("📌 Please provide a Pinterest URL\nExample: *pinterest https://pin.it/5XTxGNqwe*");

    try {
        // Validate URL
        if (!text.match(/pin\.it|pinterest\.(com|ru|fr|de|jp|it|es|pt|com\.mx)/)) {
            return reply("❌ Invalid Pinterest URL. Please provide a valid pin.it or pinterest.com link.");
        }

        const apiUrl = `https://apis-keith.vercel.app/download/pinterest?url=${encodeURIComponent(text)}`;

        // Fetch Pinterest image info
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (!data?.status || !data.result?.download?.url) {
            return reply("❌ Failed to download image. The link may be invalid or private.");
        }

        const pin = data.result;

        // Determine if it's an image or video
        const isVideo = pin.download.type === 'video';

        // Send the media
        await client.sendMessage(m.chat, {
            [isVideo ? 'video' : 'image']: { url: pin.download.url },
            caption: `📌 *Pinterest Download*\n\n🔗 Original URL: ${pin.url}`,
            thumbnail: pin.thumbnail ? { url: pin.thumbnail } : undefined,
            contextInfo: {
                externalAdReply: {
                    title: 'Pinterest Download',
                    body: 'Downloaded via Keith API',
                    thumbnailUrl: pin.thumbnail,
                    mediaType: isVideo ? 2 : 1,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Pinterest Command Error:', error);
        reply(`⚠️ Error: ${error.message.includes('ECONNRESET') ? 'Connection reset - try again' : error.message}`);
    }
});
//========================================================================================================================


keith({
    pattern: "tiktok",
    alias: ["tt", "ttdl"],
    desc: "Download TikTok videos without watermark",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async ({ client, m, text, reply }) => {
    if (!text) return reply("🎬 Please provide a TikTok URL\nExample: *tiktok https://vt.tiktok.com/ZSje1Vkup/*");

    try {
        // Validate URL
        if (!text.match(/tiktok\.com|vt\.tiktok\.com/)) {
            return reply("❌ Invalid TikTok URL. Please provide a valid link.");
        }

        const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl?url=${encodeURIComponent(text)}`;

        // Fetch TikTok video info
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (!data?.status || !data.result?.nowm) {
            return reply("❌ Failed to download video. The link may be invalid or private.");
        }

        const video = data.result;

        // Send video message
        await client.sendMessage(m.chat, {
            video: { url: video.nowm },
            caption: `*${video.title || 'TikTok Video'}*\n\n${video.caption || ''}\n\n⬇️ Downloaded via Keith API`,
            thumbnail: video.thumbnail ? { url: video.thumbnail } : undefined,
            contextInfo: {
                externalAdReply: {
                    title: video.title || 'TikTok Video',
                    body: video.caption ? video.caption.slice(0, 60) : 'Downloaded via Keith API',
                    thumbnailUrl: video.thumbnail,
                    mediaType: 2,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('TikTok Command Error:', error);
        reply(`⚠️ Error: ${error.message.includes('ECONNRESET') ? 'Connection reset - try again' : error.message}`);
    }
});
//========================================================================================================================

keith({
    pattern: "spotify",
    alias: ["spot", "sp"],
    desc: "Download songs from Spotify",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async ({ client, m, text, reply }) => {
    if (!text) return reply("🎶 Please provide a song name\nExample: *spotify Spectre Radiohead*");

    try {
        const apiUrl = `https://apis-keith.vercel.app/download/spotify?q=${encodeURIComponent(text)}`;

        // Fetch track info using Axios
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (!data?.status || !data.result?.track?.downloadLink) {
            return reply("❌ Failed to get download link. The track may not be available.");
        }

        const track = data.result.track;

        // Send audio message
        await client.sendMessage(m.chat, {
            audio: { url: track.downloadLink },
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: track.title.slice(0, 60),
                    body: `🎤 ${track.artist} | ⏱️ ${track.duration}`,
                    thumbnailUrl: track.thumbnail,
                    mediaType: 1,
                    mediaUrl: track.url,
                    sourceUrl: track.url,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

        // Send as document for better quality
        await client.sendMessage(m.chat, {
            document: { url: track.downloadLink },
            fileName: `${track.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
            mimetype: 'audio/mpeg',
            caption: `*${track.title}*\n\n🎤 Artist: ${track.artist}\n⏱️ Duration: ${track.duration}\n⭐ Popularity: ${track.popularity}`,
            contextInfo: {
                externalAdReply: {
                    title: `Downloaded: ${track.title.slice(0, 40)}`,
                    body: `Click to view on Spotify`,
                    thumbnailUrl: track.thumbnail,
                    mediaType: 1,
                    mediaUrl: track.url,
                    sourceUrl: track.url,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Spotify Command Error:', error);
        reply(`⚠️ Error: ${error.message}`);
    }
});
//========================================================================================================================

keith({
    pattern: "play",
    alias: ["song", "music", "track"],
    desc: "Download music from YouTube",
    category: "Download",
    react: "🎧",
    filename: __filename
}, async ({ client, m, text, reply }) => {
    if (!text) return reply("🎵 Please provide a song name\nExample: *play Blinding Lights The Weeknd*");

    try {
        // Search YouTube for the song
        const searchResults = await ytSearch(text);
        if (!searchResults.videos.length) {
            return reply("❌ No results found for your search query.");
        }

        const video = searchResults.videos[0];
        const apiUrl = `https://apis-keith.vercel.app/download/ytmp3?url=${video.url}`;

        // Fetch download link using Axios
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' },
            timeout: 15000 // 15 seconds timeout
        });

        if (!data?.status || !data.result?.download_url) {
            return reply("❌ Failed to get download link. The API might be down.");
        }

        // Send audio message
        await client.sendMessage(m.chat, {
            audio: { url: data.result.download_url },
            mimetype: 'audio/mpeg',
            ptt: false,
            contextInfo: {
                externalAdReply: {
                    title: video.title.slice(0, 60),
                    body: `🎶 ${video.author.name} | ⏱️ ${video.timestamp}`,
                    thumbnailUrl: video.thumbnail,
                    mediaType: 1,
                    mediaUrl: video.url,
                    sourceUrl: video.url,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

        // Send as document for better quality
        await client.sendMessage(m.chat, {
            document: { url: data.result.download_url },
            fileName: `${video.title}.mp3`.replace(/[^\w\s.-]/gi, ''),
            mimetype: 'audio/mpeg',
            contextInfo: {
                externalAdReply: {
                    title: `Downloaded: ${video.title.slice(0, 40)}`,
                    body: `Click to view on YouTube`,
                    thumbnailUrl: video.thumbnail,
                    mediaType: 1,
                    mediaUrl: video.url,
                    sourceUrl: video.url,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Play Command Error:', error);
        reply(`⚠️ Error: ${error.message.includes('timeout') ? 'Request timed out' : 'Failed to process your request'}`);
    }
});
//========================================================================================================================
keith({
    pattern: "video",
    alias: ["ytvideo", "playvideo"],
    desc: "Download video from YouTube",
    category: "Download",
    react: "🎬",
    filename: __filename
}, async ({ client, m, text, reply }) => {
    if (!text) return reply("🎥 Please provide a video name\nExample: *video Baby Shark*");

    try {
        // Search YouTube for the video
        const searchResults = await ytSearch(text);
        if (!searchResults.videos.length) {
            return reply("❌ No results found for your search query.");
        }

        const video = searchResults.videos[0];
        const apiUrl = `https://apis-keith.vercel.app/download/ytmp4?url=${video.url}`;

        // Fetch download link using Axios
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (!data?.status || !data.result?.download_url) {
            return reply("❌ Failed to get download link. The API might be down.");
        }

        // Send video message
        await client.sendMessage(m.chat, {
            video: { url: data.result.download_url },
            caption: `*${video.title}*\n\n⏱️ Duration: ${video.timestamp || 'N/A'}\n👤 Author: ${video.author.name}`,
            thumbnail: video.thumbnail,
            contextInfo: {
                externalAdReply: {
                    title: video.title.slice(0, 60),
                    body: `🎥 ${video.author.name}`,
                    thumbnailUrl: video.thumbnail,
                    mediaType: 2,
                    mediaUrl: video.url,
                    sourceUrl: video.url,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Video Command Error:', error);
        reply(`⚠️ Error: ${error.message}`);
    }
});
//========================================================================================================================
