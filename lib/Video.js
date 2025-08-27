const axios = require('axios');

module.exports = {
    config: {
        name: "video",
        author: "keithkeizzah",
        description: "Search and download videos",
        category: "download",
        usage: "playvideo <video name>",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId, args }) {
        const query = args.join(' ');

        if (!query) {
            bot.sendMessage(chatId, "🎬 Please provide a video name to search.");
            return;
        }

        try {
            // Step 1: Search for the video
            bot.sendMessage(chatId, `🔍 Searching for "${query}"...`);
            
            const searchUrl = `https://apis-keith.vercel.app/search/yts?query=${encodeURIComponent(query)}`;
            const searchResponse = await axios.get(searchUrl);
            const searchData = searchResponse.data;

            if (!searchData.status || !searchData.result || searchData.result.length === 0) {
                throw new Error("No results found for this video.");
            }

            // Get the first result
            const firstResult = searchData.result[0];
            const { title, url, thumbnail, duration, views, published } = firstResult;

            // Send video info to user
            await bot.sendPhoto(chatId, thumbnail, {
                caption: `🎬 Title: ${title}\n⏱ Duration: ${duration}\n👀 Views: ${views}\n📅 Published: ${published}\n\n⬇️ Downloading video...`
            });

            // Step 2: Download the video (using ytmp4 endpoint instead of ytmp3)
            const downloadUrl = `https://apis-keith.vercel.app/download/ytmp4?url=${encodeURIComponent(url)}`;
            const downloadResponse = await axios.get(downloadUrl);
            const downloadData = downloadResponse.data;

            if (!downloadData.status || !downloadData.result.url) {
                throw new Error("Failed to generate video download link.");
            }

            // Send the video file to user
            await bot.sendVideo(chatId, downloadData.result.url, {
                caption: `🎬 ${title}\n📦 Filename: ${downloadData.result.filename}`
            });

        } catch (error) {
            console.error('Error in playvideo command:', error);
            bot.sendMessage(chatId, `⚠️ Error: ${error.message || "Failed to process your request"}`);
        }
    }
};
