const axios = require('axios');

module.exports = {

    config: {

        name: "tiktoksearch",

        author: "keithkeizzah",

        description: "Search TikTok videos",

        category: "search",

        usage: "tiktoksearch <username/query>",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId, args }) {

        const query = args.join(' ');

        

        if (!query) {

            return bot.sendMessage(chatId, "🔍 Please provide a TikTok username or search query.\nExample: /tiktoksearch keizzah4189");

        }

        try {

            // Show searching status

            await bot.sendMessage(chatId, `⏳ Searching TikTok for "${query}"...`);

            // Call the API

            const apiUrl = `https://apis-keith.vercel.app/search/tiktoksearch?query=${encodeURIComponent(query)}`;

            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result || data.result.length === 0) {

                return bot.sendMessage(chatId, "❌ No TikTok videos found for your search.");

            }

            // Get top 5 results

            const topResults = data.result.slice(0, 15);

            // Format and send results

            let message = `📱 TikTok Search Results for "${query}"\n\n`;

            topResults.forEach((video, index) => {

                message += `${index + 1}. ${video.author}\n`;

                message += `🎬 ${video.title || 'No caption'}\n`;

                message += `👀 ${video.views} views | ❤️ ${video.likes} | 💬 ${video.comments}\n`;

                message += `⏱️ ${video.duration}s | 📅 ${new Date(video.created * 1000).toLocaleDateString()}\n`;

                message += `🔗 ${video.url}\n\n`;

            });

            await bot.sendMessage(chatId, message);

            // Send the first video as preview

            const firstVideo = topResults[0];

            await bot.sendVideo(chatId, firstVideo.videoUrls.noWatermark, {

                caption: `Top Result: ${firstVideo.author}\n${firstVideo.title || ''}`

            });

        } catch (error) {

            console.error('[TikTok Search Error]:', error);

            await bot.sendMessage(chatId, "⚠️ An error occurred while searching TikTok. Please try again later.");

        }

    }

};