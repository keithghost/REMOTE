const axios = require('axios');

module.exports = {
    config: {
        name: "play",
        author: "keithkeizzah",
        description: "Search and download music",
        category: "music",
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
            // Step 1: Search for the song
            bot.sendMessage(chatId, `🔍 Searching for "${query}"...`);
            
            const searchUrl = `https://apis-keith.vercel.app/search/yts?query=${encodeURIComponent(query)}`;
            const searchResponse = await axios.get(searchUrl);
            const searchData = searchResponse.data;

            if (!searchData.status || !searchData.result || searchData.result.length === 0) {
                throw new Error("No results found for this song.");
            }

            // Get the first result
            const firstResult = searchData.result[0];
            const { title, url, thumbnail, duration, views, published } = firstResult;

            // Send song info to user
            await bot.sendPhoto(chatId, thumbnail, {
                caption: `🎧 Title: ${title}\n⏱ Duration: ${duration}\n👀 Views: ${views}\n📅 Published: ${published}\n\n⬇️ Downloading audio...`
            });

            // Step 2: Download the audio
            const downloadUrl = `https://apis-keith.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`;
            const downloadResponse = await axios.get(downloadUrl);
            const downloadData = downloadResponse.data;

            if (!downloadData.status || !downloadData.result.url) {
                throw new Error("Failed to generate download link.");
            }

            // Send the audio file to user
            await bot.sendAudio(chatId, downloadData.result.url, {
                caption: `🎵 ${title}\n📦 Filename: ${downloadData.result.filename}`
            });

        } catch (error) {
            console.error('Error in play command:', error);
            bot.sendMessage(chatId, `⚠️ Error: ${error.message || "Failed to process your request"}`);
        }
    }
};
