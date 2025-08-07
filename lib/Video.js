const axios = require('axios');
const yts = require("yt-search");

module.exports = {
    config: {
        name: "video",
        author: "keithkeizzah",
        description: "Search and download video from YouTube",
        category: "download",
        usage: "playvideo <song/video name>",
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
            bot.sendMessage(chatId, `🔍 Searching for "${query}"...`);
            
            // Search YouTube
            const searchResults = await yts(query);
            if (!searchResults.videos || searchResults.videos.length === 0) {
                throw new Error("No results found for this video.");
            }

            // Get the first result
            const video = searchResults.videos[0];
            const { title, url, thumbnail, duration, views, ago } = video;

            // Send video info to user
            await bot.sendPhoto(chatId, thumbnail, {
                caption: `🎥 Title: ${title}\n⏱ Duration: ${duration}\n👀 Views: ${views}\n📅 Uploaded: ${ago}\n\n⬇️ Downloading video (360p)...`
            });

            // Download video using ytmp4 API
            const downloadUrl = `https://api.ytmp4.fit/api/download?url=${encodeURIComponent(url)}&quality=360p`;
            
            // Send the video file to user
            await bot.sendVideo(chatId, downloadUrl, {
                caption: `🎥 ${title}`
            });

        } catch (error) {
            console.error('Error in playvideo command:', error);
            bot.sendMessage(chatId, `⚠️ Error: ${error.message || "Failed to download the video"}`);
        }
    }
};
