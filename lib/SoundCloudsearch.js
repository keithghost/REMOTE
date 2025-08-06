const axios = require('axios');

module.exports = {
    config: {
        name: "soundcloudsearch",
        author: "keithkeizzah",
        description: "Search SoundCloud tracks",
        category: "search",
        usage: "soundcloud <query>",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId, args }) {
        const query = args.join(' ');
        
        if (!query) {
            return bot.sendMessage(chatId, "🎵 Please provide a search query.\nExample: /soundcloud lelena");
        }

        try {
            // Show searching status
            await bot.sendMessage(chatId, `🔍 Searching SoundCloud for "${query}"...`);

            // Call the API
            const apiUrl = `https://apis-keith.vercel.app/search/soundcloud?q=${encodeURIComponent(query)}`;
            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result?.result || data.result.result.length === 0) {
                return bot.sendMessage(chatId, "❌ No results found on SoundCloud.");
            }

            // Filter and format results (show only results with thumbnails and duration)
            const validResults = data.result.result.filter(track => 
                track.thumb && track.timestamp && track.views
            ).slice(0, 5);

            if (validResults.length === 0) {
                return bot.sendMessage(chatId, "🎧 Found tracks but no playable results available.");
            }

            // Format results message
            let message = `🎧 SoundCloud Results for "${query}"\n\n`;
            validResults.forEach((track, index) => {
                message += `${index + 1}. ${track.title}\n`;
                message += `🎤 ${track.artist}\n`;
                message += `⏱️ ${track.timestamp} | 👂 ${track.views} plays\n`;
                message += `📅 Released: ${track.release || 'N/A'}\n`;
                message += `🔗 ${track.url}\n\n`;
            });

            // Send results
            await bot.sendMessage(chatId, message);

            // Send the first track's thumbnail as preview
            const firstTrack = validResults[0];
            await bot.sendPhoto(chatId, firstTrack.thumb, {
                caption: `Top Result: ${firstTrack.title} by ${firstTrack.artist}`
            });

        } catch (error) {
            console.error('[SoundCloud Error]:', error);
            await bot.sendMessage(chatId, "⚠️ An error occurred while searching SoundCloud.");
        }
    }
};