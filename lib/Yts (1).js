const yts = require('yt-search');

module.exports = {

    config: {

        name: "yts",

        author: "keithkeizzah",

        description: "Search YouTube videos",

        category: "search",

        usage: "yts <search query>",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId, args }) {

        const query = args.join(' ');

        if (!query) {

            return bot.sendMessage(chatId, "🔍 Please provide a search query.\nExample: /yts baby shark");

        }

        try {

            // Send searching message

            await bot.sendMessage(chatId, `⏳ Searching YouTube for "${query}"...`);

            // Perform YouTube search

            const { videos } = await yts(query);

            

            if (!videos || videos.length === 0) {

                return bot.sendMessage(chatId, "❌ No results found for your search.");

            }

            // Get top 3 results

            const topResults = videos.slice(0, 10);

            

            // Format results

            let message = `📺 YouTube Search Results for "${query}"\n\n`;

            topResults.forEach((video, index) => {

                message += `${index + 1}. ${video.title}\n`;

                message += `⏱️ ${video.timestamp} | 👀 ${video.views}\n`;

                message += `🔗 ${video.url}\n\n`;

            });

            // Send results

            await bot.sendMessage(chatId, message);

            // Optionally send thumbnails

            await bot.sendPhoto(chatId, topResults[0].thumbnail, {

                caption: `Top Result: ${topResults[0].title}`

            });

        } catch (error) {

            console.error('[YTS Command Error]:', error);

            await bot.sendMessage(chatId, "⚠️ An error occurred while searching. Please try again.");

        }

    }

};