const axios = require('axios');

module.exports = {
    config: {
        name: "video",
        author: "keithkeizzah",
        description: "Download video from YouTube using URL or search query",
        category: "download",
        usage: "ytvideo <youtube-url or search query>",
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

        if (args.length === 0) {
            return await sendCleanMessage("🎬 Please provide a YouTube URL or search query.\nExample: /ytvideo https://youtu.be/VIDEO_ID\nOr: /ytvideo alan walker spectre");
        }

        const input = args.join(" ");
        let youtubeUrl = "";

        try {
            // Check if input is a YouTube URL
            if (input.includes('youtube.com') || input.includes('youtu.be')) {
                youtubeUrl = input;
            } else {
                // Treat as search query
                await sendCleanMessage("🔍 Searching for: " + input);

                const searchUrl = `https://apis-keith.vercel.app/search/yts?query=${encodeURIComponent(input)}`;
                const searchResponse = await axios.get(searchUrl);

                if (!searchResponse.data.status || !searchResponse.data.result || searchResponse.data.result.length === 0) {
                    return await sendCleanMessage("❌ No results found for your search.");
                }

                const firstResult = searchResponse.data.result[0];
                youtubeUrl = firstResult.url;

                await sendCleanMessage(`🎬 Selected: ${firstResult.title}\n⏳ Downloading video...`);
            }

            // Download video using new API
            const apiUrl = `https://apis-keith.vercel.app/download/ytv?url=${encodeURIComponent(youtubeUrl)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.success || !data.result) {
                return await sendCleanMessage("❌ Couldn't download video. The video may be private or unavailable.");
            }

            const videoUrl = data.result;
            const contentCaption = `🎬 Video from: ${youtubeUrl}`;

            // Send video
            try {
                const videoResponse = await axios.get(videoUrl, {
                    responseType: 'stream',
                    headers: {
                        'Content-Type': 'video/mp4'
                    }
                });

                await bot.sendVideo(chatId, videoResponse.data, {
                    caption: contentCaption
                });
            } catch (e) {
                console.error("Video stream error:", e);
                try {
                    await bot.sendDocument(chatId, videoUrl, {
                        caption: contentCaption
                    });
                } catch (e) {
                    console.error("Document fallback failed:", e);
                    await sendCleanMessage("❌ Failed to send the video. The file might be too large or inaccessible.");
                }
            }

        } catch (error) {
            console.error('YouTube video command error:', error);
            await sendCleanMessage("🚫 Couldn't process your request. Please try again.");
        }
    }
};
