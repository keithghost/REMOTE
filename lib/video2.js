const axios = require('axios');

module.exports = {
    config: {
        name: "video",
        author: "keithkeizzah",
        description: "Download videos from YouTube",
        category: "download",
        usage: "youtube <youtube-url>",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId, args }) {
        const sendCleanMessage = async (text) => {
            try {
                await bot.sendMessage(chatId, text);
            } catch (e) {
                console.error("Failed to send message:", e);
            }
        };

        const url = args[0];
        
        if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
            return await sendCleanMessage("🎬 Please provide a valid YouTube URL.\nExample: /youtube https://youtu.be/2WmBa1CviYE");
        }

        try {
            await sendCleanMessage("⏳ Downloading YouTube video...");
            
            // Fetch video info from API
            const apiUrl = `https://apis-keith.vercel.app/download/video?url=${encodeURIComponent(url)}`;
            const { data } = await axios.get(apiUrl);
            
            if (!data.status || !data.result) {
                return await sendCleanMessage("❌ Couldn't download this YouTube video. The video may be private or unavailable.");
            }

            const videoUrl = data.result;
            const contentCaption = "🎬 YouTube Video";

            // Send video
            try {
                const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
                await bot.sendVideo(chatId, videoResponse.data, {
                    caption: contentCaption
                });
            } catch (e) {
                console.error("Video error:", e);
                try {
                    // Fallback: send as document
                    await bot.sendDocument(chatId, videoUrl, {
                        caption: contentCaption
                    });
                } catch (e) {
                    console.error("Document fallback failed:", e);
                    await sendCleanMessage("❌ Failed to send the video. The file might be too large.");
                }
            }

        } catch (error) {
            console.error('YouTube command error:', error);
            await sendCleanMessage("🚫 Couldn't process this YouTube link. Please try another one.");
        }
    }
};
