const axios = require('axios');
const yts = require("yt-search");

module.exports = {
    config: {
        name: "play",
        author: "keithkeizzah",
        description: "Search and download music",
        category: "download",
        usage: "play <song name>",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId, args }) {
        const query = args.join(' ');
        if (!query) {
            bot.sendMessage(chatId, "🎵 Please provide a song name to search.");
            return;
        }

        try {
            // Step 1: Search for the song using yts
            bot.sendMessage(chatId, `🔍 Searching for "${query}"...`);
            
            const searchResults = await yts(query);
            if (!searchResults.videos || searchResults.videos.length === 0) {
                throw new Error("No results found for this song.");
            }

            // Get the first result
            const video = searchResults.videos[0];
            const { title, url, thumbnail, duration, views, ago } = video;

            // Send song info to user
            await bot.sendPhoto(chatId, thumbnail, {
                caption: `🎧 Title: ${title}\n⏱ Duration: ${duration}\n👀 Views: ${views}\n📅 Uploaded: ${ago}\n\n⬇️ Downloading audio...`
            });

            // Step 2: Download the audio using the new API
            const downloadUrl = `https://apis-keith.vercel.app/download/audio?url=${encodeURIComponent(url)}`;
            const downloadResponse = await axios.get(downloadUrl);
            
            if (!downloadResponse.data.status || !downloadResponse.data.result) {
                throw new Error("Failed to generate download link.");
            }

            // Send the audio file to user
            await bot.sendAudio(chatId, downloadResponse.data.result, {
                caption: `🎵 ${title}`
            });

        } catch (error) {
            console.error('Error in play command:', error);
            bot.sendMessage(chatId, `⚠️ Error: ${error.message || "Failed to process your request"}`);
        }
    }
};
