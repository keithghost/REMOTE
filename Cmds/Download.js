const { keith } = require('../commandHandler');
const ytSearch = require('yt-search');
const axios = require('axios');
//========================================================================================================================

//========================================================================================================================

//========================================================================================================================

//========================================================================================================================


keith({
    pattern: "twitter",
    alias: ["tw", "twdl"],
    desc: "Download Twitter videos",
    category: "Download",
    react: "🐦",
    filename: __filename
}, async ({ client, m, text, reply }) => {
    if (!text) return reply("🐦 Please provide a Twitter URL\nExample: *twitter https://twitter.com/futurism/status/882987478541533189*");

    try {
        // Validate URL
        if (!text.match(/twitter\.com\/\w+\/status\/\d+|x\.com\/\w+\/status\/\d+/i)) {
            return reply("❌ Invalid Twitter URL. Please provide a valid tweet status link.");
        }

        const apiUrl = `https://apis-keith.vercel.app/download/twitter?url=${encodeURIComponent(text)}`;

        // Show loading message
        const processingMsg = await reply("⏳ Processing Twitter link...");

        // Fetch Twitter video info
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' },
            timeout: 30000 // 30 seconds timeout
        });

        if (!data?.status || !data.result?.video_sd) {
            await client.sendMessage(m.chat, { 
                delete: processingMsg.key 
            });
            return reply("❌ Failed to get video. The tweet may not contain video or may be private.");
        }

        const tweet = data.result;

        // Delete processing message
        await client.sendMessage(m.chat, { 
            delete: processingMsg.key 
        });

        // Try HD first, fallback to SD
        const videoUrl = tweet.video_hd || tweet.video_sd;

        // Send video message
        await client.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: tweet.desc ? `*Twitter Video*\n\n${tweet.desc}` : 'Twitter Video',
            thumbnail: tweet.thumb ? { url: tweet.thumb } : undefined,
            contextInfo: {
                externalAdReply: {
                    title: "Twitter Video Download",
                    body: tweet.desc ? tweet.desc.slice(0, 60) : 'Downloaded via Keith API',
                    thumbnailUrl: tweet.thumb,
                    mediaType: 2,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

        // Optional: Send audio separately if available
        if (tweet.audio) {
            await client.sendMessage(m.chat, {
                audio: { url: tweet.audio },
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                    externalAdReply: {
                        title: "Twitter Audio",
                        body: "Extracted from video",
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Twitter Command Error:', error);
        reply(`⚠️ Error: ${error.response?.status === 404 ? 'Tweet not found' : 
              error.message.includes('timeout') ? 'Request timed out' : 
              'Failed to process your request'}`);
    }
});
//========================================================================================================================


keith({
    pattern: "rednote",
    alias: ["xiaohongshu", "xhs"],
    desc: "Download Xiaohongshu (Rednote) content",
    category: "Download",
    react: "📕",
    filename: __filename
}, async ({ client, m, text, reply }) => {
    if (!text) return reply("📕 Please provide a Xiaohongshu URL\nExample: *rednote https://xhslink.com/a/OAzIdalFCoYcb*");

    try {
        // Validate URL
        if (!text.match(/xhslink\.com|xiaohongshu\.com/)) {
            return reply("❌ Invalid Xiaohongshu URL. Please provide a valid xhslink.com or xiaohongshu.com link.");
        }

        const apiUrl = `https://apis-keith.vercel.app/download/rednote?url=${encodeURIComponent(text)}`;

        // Fetch Rednote content info
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (!data?.status || !data.result?.media) {
            return reply("❌ Failed to download content. The link may be invalid or private.");
        }

        const content = data.result;
        const isVideo = content.metadata.isVideo;
        const mediaUrls = isVideo ? [content.media.video] : content.media.images;

        if (!mediaUrls || mediaUrls.length === 0 || mediaUrls[0] === null) {
            return reply("❌ No media found in this post.");
        }

        // Send all media (handle multiple images)
        for (const mediaUrl of mediaUrls) {
            if (!mediaUrl) continue;

            await client.sendMessage(m.chat, {
                [isVideo ? 'video' : 'image']: { url: mediaUrl },
                caption: content.metadata.title 
                    ? `*${content.metadata.title}*\n\n${content.metadata.description || ''}\n\n📕 Original URL: ${content.metadata.url}`
                    : `📕 Xiaohongshu Content\n\nOriginal URL: ${content.metadata.url}`,
                contextInfo: {
                    externalAdReply: {
                        title: content.metadata.title ? content.metadata.title.slice(0, 30) : 'Xiaohongshu Content',
                        body: content.metadata.description ? content.metadata.description.slice(0, 60) : 'Downloaded via Keith API',
                        mediaType: isVideo ? 2 : 1,
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });
        }

    } catch (error) {
        console.error('Rednote Command Error:', error);
        reply(`⚠️ Error: ${error.message.includes('ECONNRESET') ? 'Connection reset - try again' : error.message}`);
    }
});
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

        const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl2?url=${encodeURIComponent(text)}`;

        // Show loading message
        const processingMsg = await reply("⏳ Processing TikTok link...");

        // Fetch TikTok video info
        const { data } = await axios.get(apiUrl, {
            headers: { 'Accept': 'application/json' }
        });

        if (!data?.status || !data.result?.video) {
            await client.sendMessage(m.chat, { 
                delete: processingMsg.key 
            });
            return reply("❌ Failed to download video. The link may be invalid or private.");
        }

        const video = data.result;

        // Delete processing message
        await client.sendMessage(m.chat, { 
            delete: processingMsg.key 
        });

        // Send video message
        await client.sendMessage(m.chat, {
            video: { url: video.video },
            caption: `*@${video.author}*\n\n${video.description || ''}`,
            thumbnail: video.thumbnail ? { url: video.thumbnail } : undefined,
            contextInfo: {
                externalAdReply: {
                    title: `@${video.author}`,
                    body: video.description ? video.description.slice(0, 60) : 'TikTok Video',
                    thumbnailUrl: video.thumbnail,
                    mediaType: 2,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('TikTok Command Error:', error);
        reply(`⚠️ Error: ${error.message.includes('ECONNRESET') ? 'Connection reset - try again' : 
              error.response?.status === 404 ? 'Video not found' : 
              'Failed to process your request'}`);
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
            timeout: 60000 // 15 seconds timeout
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
