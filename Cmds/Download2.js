const { keith } = require('../commandHandler');
const axios = require('axios');

keith({
    pattern: "tiktok",
    alias: ["tt", "tiktokdl"],
    desc: "Download TikTok videos with audio",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, botname, sendReply, sendMediaMessage } = context;

        // Validate input
        if (!text) return await sendReply(client, m, '🎵 Please provide a TikTok link\nExample: *tiktok https://vm.tiktok.com/...*');
        if (!text.match(/tiktok\.com|vt\.tiktok\.com/)) return await sendReply(client, m, '❌ Invalid TikTok link');

        // API endpoint
        const apiUrl = `https://bk9.fun/download/tiktok?url=${encodeURIComponent(text)}`;

        // Fetch data from API
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.status || !data.BK9) {
            throw new Error('Invalid response from API');
        }

        const videoData = data.BK9;

        // Build detailed caption
        const caption = `⬇️ *TikTok Downloader* - ${botname}\n\n` +
                       `📌 *Description:* ${videoData.desc || 'No description'}\n` +
                       `👤 *Author:* ${videoData.nickname || 'Unknown'}\n` +
                       `🎶 *Music:* ${videoData.music_info?.title || 'No music info'}\n` +
                       `❤️ *Likes:* ${videoData.likes_count?.toLocaleString() || '0'}\n` +
                       `💬 *Comments:* ${videoData.comment_count?.toLocaleString() || '0'}\n\n` +
                       `_Powered by @${data.owner}_`;

        // Send video
        await sendMediaMessage(client, m, {
            video: { url: videoData.BK9 }, // The video URL is in the BK9 property
            caption: caption,
            gifPlayback: false
        });

    } catch (error) {
        console.error('TikTok Download Error:', error);
        await sendReply(client, m, `❌ Failed to download TikTok: ${error.message}\nPlease try again later or use a different link.`);
    }
});
