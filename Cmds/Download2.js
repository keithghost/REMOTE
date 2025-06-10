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
        const { client, m, text, sendReply, sendMediaMessage } = context;

        // Validate input
        if (!text) {
            return await sendReply(
                client, 
                m, 
                '🎵 Please provide a TikTok link\nExample: *tiktok https://vm.tiktok.com/...*'
            );
        }

        if (!text.match(/tiktok\.com|vt\.tiktok\.com/)) {
            return await sendReply(client, m, '❌ Invalid TikTok link');
        }

        // API endpoint
        const apiUrl = `https://bk9.fun/download/tiktok?url=${encodeURIComponent(text)}`;

        // Fetch data from API with timeout
        const response = await axios.get(apiUrl, { timeout: 10000 });
        const { data } = response;

        if (!data?.status || !data?.BK9) {
            throw new Error('Invalid response from API');
        }

        const videoData = data.BK9;
        
        if (!videoData?.videoUrl) {
            throw new Error('No video URL found in response');
        }

        // Build detailed caption
        const caption = `
╭═════════════════⊷
║ *TikTok Downloader*
║ *Description:* ${videoData.desc || 'No description'}
║ *Author:* ${videoData.nickname || 'Unknown'}
║ *Music:* ${videoData.music_info?.title || 'No music info'}
║ *Likes:* ${videoData.likes_count?.toLocaleString() || '0'}
║ *Comments:* ${videoData.comment_count?.toLocaleString() || '0'}
╰═════════════════⊷`.trim();

        // Send video
        await sendMediaMessage(client, m, {
            video: { url: videoData.videoUrl },
            caption: caption,
            gifPlayback: false
        });

    } catch (error) {
        console.error('TikTok Download Error:', error);
        await sendReply(
            client, 
            m, 
            `❌ Failed to download TikTok: ${error.message}\nPlease try again later or use a different link.`
        );
    }
});
