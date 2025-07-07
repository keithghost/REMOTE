const { keith } = require('../commandHandler');
const ytSearch = require('yt-search');
const axios = require('axios');



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
