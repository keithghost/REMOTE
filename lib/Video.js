const axios = require('axios');
const yts = require("yt-search");

module.exports = {
    config: {
        name: "video",
        author: "keithkeizzah",
        description: "Search and download video from YouTube",
        category: "download",
        usage: "playvideo <video name>",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId, args }) {
        const query = args.join(' ');
        if (!query) {
            bot.sendMessage(chatId, "🎥 Please provide a video name to search.");
            return;
        }

        try {
            // Step 1: Search for the video
            bot.sendMessage(chatId, `🔍 Searching for "${query}"...`);
            
            const searchResults = await yts(query);
            if (!searchResults.videos || searchResults.videos.length === 0) {
                throw new Error("No results found for this video.");
            }

            // Get the first result
            const video = searchResults.videos[0];
            const { title, url, thumbnail, duration, views, ago } = video;

            // Send video info to user
            await bot.sendPhoto(chatId, thumbnail, {
                caption: `🎥 Title: ${title}\n⏱ Duration: ${duration}\n👀 Views: ${views}\n📅 Uploaded: ${ago}\n\n⬇️ Downloading video (720p)...`
            });

            // Step 2: Generate download link using your API
            const apiUrl = `https://apis-keith.vercel.app/download/dlmp4?url=${encodeURIComponent(url)}`;
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (!data.status || !data.result?.data?.downloadUrl) {
                throw new Error("Failed to generate download link.");
            }

            const videoData = data.result.data;
            const downloadUrl = videoData.downloadUrl;

            // Step 3: Send the video file
            await bot.sendVideo(chatId, downloadUrl, {
                caption: `🎥 ${videoData.title}\n📦 Format: ${videoData.format}\n🎚 Quality: ${videoData.quality}`
            });

        } catch (error) {
            console.error('Error in playvideo command:', error);
            bot.sendMessage(chatId, `⚠️ Error: ${error.message || "Failed to download the video"}`);
        }
    }
};
