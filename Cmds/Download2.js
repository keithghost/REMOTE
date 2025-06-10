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
        const { client, m, text, botname, reply } = context;

        // Validate input
        if (!text) return await reply('🎵 Please provide a TikTok link\nExample: *tiktok https://vm.tiktok.com/...*');
        if (!text.match(/tiktok\.com|vt\.tiktok\.com/)) return await reply('❌ Invalid TikTok link');

        // API endpoint
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`;

        // Fetch data from API with timeout
        const response = await axios.get(apiUrl, { timeout: 15000 });
        const data = response.data;

        if (!data?.status || !data?.BK9) {
            throw new Error(data?.message || 'Invalid response from API');
        }

        const result = data.BK9;

        // Build caption with Unicode characters
        const caption = `🎵 *TikTok Downloader* - ${botname}\n\n` +
                       `📌 *Author:* ${result.nickname || 'Unknown'}\n` +
                       `📝 *Description:* ${result.desc || 'No description'}\n` +
                       `❤️ *Likes:* ${result.likes_count?.toLocaleString() || '0'}\n` +
                       `💬 *Comments:* ${result.comment_count?.toLocaleString() || '0'}\n` +
                       `🎶 *Music:* ${result.music_info?.title || 'No music info'}\n\n` +
                       `_⚡ Powered by ${botname}_`;

        // Send video
        await client.sendMessage(m.chat, {
            video: { url: result.BK9 },
            caption: caption,
            gifPlayback: false
        }, { quoted: m });

    } catch (error) {
        console.error('TikTok Download Error:', error);
        await reply(`❌ Failed to download TikTok: ${error.message}`);
    }
});
