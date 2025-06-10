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
        const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl?url=${encodeURIComponent(text)}`;

        // Fetch data from API with timeout
        const response = await axios.get(apiUrl, { timeout: 15000 });
        const data = response.data;

        if (!data?.status || !data?.result) {
            throw new Error(data?.message || 'Invalid response from API');
        }

        const result = data.result;

        // Build caption with Unicode characters
        const caption = `🎵 *TikTok Downloader* - ${botname}\n\n` +
                       `📌 *Title:* ${result.title || 'No title'}\n` +
                       `📝 *Description:* ${result.caption || 'No description'}\n\n` +
                       `_⚡ Powered by ${botname}_`;

        // Send video (using nowm link - no watermark)
        await client.sendMessage(m.chat, {
            video: { url: result.nowm },
            caption: caption,
            gifPlayback: false
        }, { quoted: m });

        // Optionally send audio separately if available
        if (result.mp3) {
            await client.sendMessage(m.chat, {
                audio: { url: result.mp3 },
                mimetype: 'audio/mpeg'
            }, { quoted: m });
        }

    } catch (error) {
        console.error('TikTok Download Error:', error);
        await reply(`❌ Failed to download TikTok: ${error.message}`);
    }
});
