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
        const apiUrl = `https://apis-keith.vercel.app/download/tiktokdl?url=${encodeURIComponent(text)}`;

        // Fetch data from API
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.status || !data.result) {
            throw new Error('Invalid response from API');
        }

        const result = data.result;

        // Build caption
        const caption = `🎵 *TikTok Downloader* - ${botname}\n\n` +
                       `📌 *Title:* ${result.title || 'No title'}\n` +
                       `📝 *Caption:* ${result.caption || 'No caption'}\n\n` +
                       `_Powered by ${botname}_`;

        // Send video (using nowm link - no watermark)
        await sendMediaMessage(client, m, {
            video: { url: result.nowm },
            caption: caption,
            gifPlayback: false
        });

        // Optionally send audio separately
        if (result.mp3) {
            await sendMediaMessage(client, m, {
                audio: { url: result.mp3 },
                mimetype: 'audio/mpeg'
            });
        }

    } catch (error) {
        console.error('TikTok Download Error:', error);
        await sendReply(client, m, `❌ Failed to download TikTok: ${error.message}`);
    }
});
