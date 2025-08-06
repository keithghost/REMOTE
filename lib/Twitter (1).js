const axios = require('axios');

module.exports = {

    config: {

        name: "twitter",

        author: "keithkeizzah",

        description: "Download videos from Twitter",

        category: "download",

        usage: "twitter <twitter-url>",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId, args }) {

        try {

            const url = args[0];

            

            if (!url || !url.includes('https://')) {

                return bot.sendMessage(chatId, "🐦 Please provide a valid Twitter URL.\nExample: /twitter https://twitter.com/futurism/status/882987478541533189");

            }

            bot.sendMessage(chatId, "⏳ Downloading Twitter video...");

            // Fetch video info from your API

            const apiUrl = `https://apis-keith.vercel.app/download/twitter?url=${encodeURIComponent(url)}`;

            const { data } = await axios.get(apiUrl);

            if (!data.status || !data.result) {

                return bot.sendMessage(chatId, "❌ Failed to download video. The tweet might not contain a video.");

            }

            const { desc, thumb, video_sd, video_hd } = data.result;

            // Send thumbnail with description

            await bot.sendPhoto(chatId, thumb, {

                caption: `🐦 Twitter Video\n\n${desc || 'No description available'}`

            });

            // Send HD video if available

            if (video_hd) {

                await bot.sendVideo(chatId, video_hd, {

                    caption: "🖥 HD Quality (720p)"

                });

            }

            // Send SD video

            if (video_sd) {

                await bot.sendVideo(chatId, video_sd, {

                    caption: "📱 SD Quality (480p)"

                });

            }

            // If no videos were sent (shouldn't happen if API returned status: true)

            if (!video_hd && !video_sd) {

                await bot.sendMessage(chatId, "❌ No video formats were available for download.");

            }

        } catch (error) {

            console.error('Error in twitter command:', error);

            bot.sendMessage(chatId, `⚠️ Error: ${error.message || "Failed to download Twitter video"}`);

        }

    }

};