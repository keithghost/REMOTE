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
    alias: ["song", "music", "ytmp3"],
    desc: "Download music from YouTube",
    category: "Download",
    react: "🎧",
    filename: __filename
}, async ({ client, m, text, reply }) => {

    // Check if a query is provided
    if (!text) {
        return reply("Please provide a video name or YouTube link.");
    }

    let videoUrl, videoInfo;
    const query = text;

    try {
        // Check if it's a YouTube URL
        if (query.match(/(youtube\.com|youtu\.be)/i)) {
            videoUrl = query;
            // Extract video ID for getting info
            const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
            videoInfo = await ytSearch({ videoId });
        } else {
            // Perform a YouTube search based on the query
            const searchResults = await ytSearch(query);

            // Check if any videos were found
            if (!searchResults || !searchResults.videos.length) {
                return reply('No video found for the specified query.');
            }

            videoInfo = searchResults.videos[0];
            videoUrl = videoInfo.url;
        }

        // Function to get download data from APIs
        const getDownloadData = async (url) => {
            try {
                const response = await axios.get(url, { timeout: 10000 });
                return response.data;
            } catch (error) {
                console.error('Error fetching data from API:', error.message);
                return { status: false };
            }
        };

        // List of APIs to try in order
        const apis = [
            `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/mp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(videoUrl)}`
        ];

        let downloadUrl;
        
        // Try each API in order until we get a successful response
        for (const api of apis) {
            const data = await getDownloadData(api);
            
            if (data && data.status) {
                // Extract download URL based on API response structure
                if (api.includes('dlmp3')) {
                    downloadUrl = data.result.url;
                } else if (api.includes('mp3')) {
                    downloadUrl = data.result.downloadUrl;
                } else if (api.includes('ytmp3')) {
                    downloadUrl = data.result.data.downloadUrl;
                } else if (api.includes('audio')) {
                    downloadUrl = data.result;
                }
                
                if (downloadUrl) break;
            }
        }

        // If no download URL was found
        if (!downloadUrl) {
            return reply('Failed to retrieve download URL from all sources. Please try again later.');
        }

        // Prepare the message payloads for both audio and document
        const messagePayloads = [
            // Audio message
            {
                audio: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                contextInfo: {
                    externalAdReply: {
                        title: videoInfo.title || 'Audio Download',
                        body: 'Powered by Keith API',
                        mediaType: 1,
                        sourceUrl: videoUrl,
                        thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
                        renderLargerThumbnail: false
                    }
                }
            },
            // Document message (mp3 file)
            {
                document: { url: downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp3` || 'audio.mp3',
                contextInfo: {
                    externalAdReply: {
                        title: videoInfo.title || 'Audio Download',
                        body: 'Document version - Powered by Keith API',
                        mediaType: 1,
                        sourceUrl: videoUrl,
                        thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
                        renderLargerThumbnail: false
                    }
                }
            }
        ];

        // Send both audio and document versions
        for (const payload of messagePayloads) {
            await client.sendMessage(m.chat, payload, { quoted: m });
        }

    } catch (error) {
        console.error('Error during download process:', error);
        return reply(`Download failed due to an error: ${error.message || error}`);
    }
});

//========================================================================================================================
keith({
    pattern: "video",
    alias: ["videodl", "ytmp4"],
    desc: "Download music from YouTube",
    category: "Download",
    react: "🎧",
    filename: __filename
}, async ({ client, m, text, reply }) => {

    // Check if a query is provided
    if (!text) {
        return reply("Please provide a video name or YouTube link.");
    }

    let videoUrl, videoInfo;
    const query = text;

    try {
        // Check if it's a YouTube URL
        if (query.match(/(youtube\.com|youtu\.be)/i)) {
            videoUrl = query;
            // Extract video ID for getting info
            const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1];
            videoInfo = await ytSearch({ videoId });
        } else {
            // Perform a YouTube search based on the query
            const searchResults = await ytSearch(query);

            // Check if any videos were found
            if (!searchResults || !searchResults.videos.length) {
                return reply('No video found for the specified query.');
            }

            videoInfo = searchResults.videos[0];
            videoUrl = videoInfo.url;
        }

        // Function to get download data from APIs
        const getDownloadData = async (url) => {
            try {
                const response = await axios.get(url, { timeout: 10000 });
                return response.data;
            } catch (error) {
                console.error('Error fetching data from API:', error.message);
                return { status: false };
            }
        };

        // List of APIs to try in order
        const apis = [
            `https://apis-keith.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/mp4?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/dlmp4?url=${encodeURIComponent(videoUrl)}`,
            `https://apis-keith.vercel.app/download/video?url=${encodeURIComponent(videoUrl)}`
        ];

        let downloadUrl;
        
        // Try each API in order until we get a successful response
        for (const api of apis) {
            const data = await getDownloadData(api);
            
            if (data && data.status) {
                // Extract download URL based on API response structure
                if (api.includes('dlmp4')) {
                    downloadUrl = data.result.url;
                } else if (api.includes('mp4')) {
                    downloadUrl = data.result.downloadUrl;
                } else if (api.includes('ytmp4')) {
                    downloadUrl = data.result.data.downloadUrl;
                } else if (api.includes('video')) {
                    downloadUrl = data.result;
                }
                
                if (downloadUrl) break;
            }
        }

        // If no download URL was found
        if (!downloadUrl) {
            return reply('Failed to retrieve download URL from all sources. Please try again later.');
        }

        // Prepare the message payloads for both audio and document
        const messagePayloads = [
            // Audio message
            {
                video: { url: downloadUrl },
                mimetype: 'video/mp4',
                contextInfo: {
                    externalAdReply: {
                        title: videoInfo.title || 'video Download',
                        body: 'Powered by Keith API',
                        mediaType: 1,
                        sourceUrl: videoUrl,
                        thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
                        renderLargerThumbnail: false
                    }
                }
            },
            // Document message (mp4 file)
            {
                document: { url: downloadUrl },
                mimetype: 'video/mp4',
                fileName: `${videoInfo.title.replace(/[^\w\s]/gi, '')}.mp4` || 'video.mp4',
                contextInfo: {
                    externalAdReply: {
                        title: videoInfo.title || 'Audio Download',
                        body: 'Document version - Powered by Keith API',
                        mediaType: 1,
                        sourceUrl: videoUrl,
                        thumbnailUrl: videoInfo.thumbnail || 'https://i.ytimg.com/vi/2WmBa1CviYE/hqdefault.jpg',
                        renderLargerThumbnail: false
                    }
                }
            }
        ];

        // Send both audio and document versions
        for (const payload of messagePayloads) {
            await client.sendMessage(m.chat, payload, { quoted: m });
        }

    } catch (error) {
        console.error('Error during download process:', error);
        return reply(`Download failed due to an error: ${error.message || error}`);
    }
});
//========================================================================================================================
