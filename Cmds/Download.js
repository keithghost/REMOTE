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

        const apiUrl = `https://apiskeith.vercel.app/download/twitter?url=${encodeURIComponent(text)}`;

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

        const apiUrl = `https://apiskeith.vercel.app/download/pinterest?url=${encodeURIComponent(text)}`;

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
    desc: "Download TikTok videos - Send only tiktok.com links",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async ({ client, m, text, reply }) => {
    if (!text) return reply("❌ *Example:*\n.tiktok https://www.tiktok.com/@user/video/123456789");
    
    // Strict validation - only accepts www.tiktok.com links
    if (!text.includes("tiktok.com/")) {
        return reply("⚠️ *Only tiktok.com links!*\nExample:\n.tiktok https://www.tiktok.com/@user/video/123456789");
    }

    try {
        const { data } = await axios.get(`https://api.bk9.dev/download/tiktok?url=${encodeURIComponent(text)}`);
        
        if (!data?.status || !data.BK9?.BK9) {
            return reply("❌ Invalid TikTok link or video is private");
        }

        await client.sendMessage(m.chat, {
            video: { 
                url: data.BK9.BK9,
                mimetype: 'video/mp4'
            }
        }, { quoted: m });

    } catch (error) {
        console.error('TikTok Error:', error);
        reply("❌ Failed to download. Send only public tiktok.com links!");
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
        const apiUrl = `https://apiskeith.vercel.app/download/spotify?q=${encodeURIComponent(text)}`;

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
//========================================================================================================================                        renderLargerThumbnail: false

keith({
    pattern: "play",
    alias: ["song", "music", "ytmp3"],
    desc: "Download music from YouTube",
    category: "Download",
    react: "🎧",
    filename: __filename
}, async ({ client, m, text, reply }) => {

    if (!text) return reply("Please provide a video name or YouTube link.");

    let videoUrl, videoInfo;
    const query = text;

    try {
        // Determine if input is a YouTube URL or search query
        if (query.match(/(youtube\.com|youtu\.be)/i)) {
            videoUrl = query;
            const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
            videoInfo = await ytSearch({ videoId });
        } else {
            const searchResults = await ytSearch(query);
            if (!searchResults || !searchResults.videos.length) return reply('No video found for the specified query.');
            videoInfo = searchResults.videos[0];
            videoUrl = videoInfo.url;
        }

        // Fetch download URL from the audio endpoint
        const apiUrl = `https://apiskeith.vercel.app/download/mp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl, { timeout: 100000 });
        const data = response.data;

        if (!data || !data.status || !data.result) {
            return reply('Failed to retrieve audio. Please try again later.');
        }

        const downloadUrl = data.result;
        const title = videoInfo.title || 'Audio Download';
        const thumbnail = videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg';

        const contextInfo = {
            externalAdReply: {
                title,
                body: 'Powered by Keith API',
                mediaType: 1,
                sourceUrl: videoUrl,
                thumbnailUrl: thumbnail,
                renderLargerThumbnail: false
            }
        };

        // Send audio message
        await client.sendMessage(m.chat, {
            audio: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            contextInfo
        }, { quoted: m });

        // Send document version
        await client.sendMessage(m.chat, {
            document: { url: downloadUrl },
            mimetype: 'audio/mpeg',
            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
            contextInfo: {
                ...contextInfo,
                externalAdReply: {
                    ...contextInfo.externalAdReply,
                    body: 'Document version - Powered by Keith API'
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Download error:', error);
        return reply(`Download failed: ${error.message || error}`);
    }
});

//========================================================================================================================

keith({
    pattern: "video",
    alias: ["ytv", "ytmp4", "dlmp4"],
    desc: "Download music from YouTube",
    category: "Download",
    react: "🎧",
    filename: __filename
}, async ({ client, m, text, reply }) => {

    if (!text) return reply("Please provide a video name or YouTube link.");

    let videoUrl, videoInfo;
    const query = text;

    try {
        // Determine if input is a YouTube URL or search query
        if (query.match(/(youtube\.com|youtu\.be)/i)) {
            videoUrl = query;
            const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
            videoInfo = await ytSearch({ videoId });
        } else {
            const searchResults = await ytSearch(query);
            if (!searchResults || !searchResults.videos.length) return reply('No video found for the specified query.');
            videoInfo = searchResults.videos[0];
            videoUrl = videoInfo.url;
        }

        // Fetch download URL from the audio endpoint
        const apiUrl = `https://apiskeith.vercel.app/download/mp4?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl, { timeout: 100000 });
        const data = response.data;

        if (!data || !data.status || !data.result) {
            return reply('Failed to retrieve audio. Please try again later.');
        }

        const downloadUrl = data.result;
        const title = videoInfo.title || 'Audio Download';
        const thumbnail = videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg';

        const contextInfo = {
            externalAdReply: {
                title,
                body: 'Powered by Keith API',
                mediaType: 1,
                sourceUrl: videoUrl,
                thumbnailUrl: thumbnail,
                renderLargerThumbnail: false
            }
        };

        // Send audio message
        await client.sendMessage(m.chat, {
            video: { url: downloadUrl },
            mimetype: 'video/mp4',
            contextInfo
        }, { quoted: m });

        // Send document version
        await client.sendMessage(m.chat, {
            document: { url: downloadUrl },
            mimetype: 'video/mp4',
            fileName: `${title.replace(/[^\w\s]/gi, '')}.mp3`,
            contextInfo: {
                ...contextInfo,
                externalAdReply: {
                    ...contextInfo.externalAdReply,
                    body: 'Document version - Powered by Keith API'
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error('Download error:', error);
        return reply(`Download failed: ${error.message || error}`);
    }
});
