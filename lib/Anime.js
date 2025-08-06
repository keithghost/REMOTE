const axios = require('axios');

module.exports = {
    config: {
        name: "anime",
        author: "keithkeizzah",
        description: "Get random anime information",
        category: "search",
        usage: "Images",
        usePrefix: true,
        role: 0
    },

    onStart: async function ({ bot, chatId }) {
        try {
            const apiUrl = 'https://api.jikan.moe/v4/random/anime';
            const response = await axios.get(apiUrl);
            const anime = response.data.data;

            // Format the anime information
            const caption = `🎌 *${anime.title}* (${anime.title_japanese || 'No Japanese title'})

📺 *Type:* ${anime.type || 'Unknown'}
📊 *Status:* ${anime.status || 'Unknown'}
📅 *Aired:* ${anime.aired?.string || 'Unknown'}
⏱️ *Duration:* ${anime.duration || 'Unknown'}
⭐ *Rating:* ${anime.rating || 'Unknown'}
👥 *Members:* ${anime.members?.toLocaleString() || 'Unknown'}
💖 *Favorites:* ${anime.favorites?.toLocaleString() || 'Unknown'}

${anime.synopsis || 'No synopsis available'}`;

            // Get all available images
            const images = [];
            if (anime.images?.jpg?.large_image_url) images.push(anime.images.jpg.large_image_url);
            if (anime.images?.webp?.large_image_url) images.push(anime.images.webp.large_image_url);
            if (anime.trailer?.images?.maximum_image_url) images.push(anime.trailer.images.maximum_image_url);

            // Send the first image with caption
            if (images.length > 0) {
                await bot.sendPhoto(chatId, images[0], {
                    caption: caption,
                    parse_mode: 'Markdown'
                });

                // Send remaining images (up to 2 more)
                for (let i = 1; i < Math.min(3, images.length); i++) {
                    await bot.sendPhoto(chatId, images[i]);
                }
            } else {
                // If no images, just send the text
                await bot.sendMessage(chatId, caption, { parse_mode: 'Markdown' });
            }

            // Send MAL URL if available
            if (anime.url) {
                await bot.sendMessage(chatId, `🔗 More info: ${anime.url}`);
            }

        } catch (error) {
            console.error('Error fetching anime data:', error);
            await bot.sendMessage(chatId, "⚠️ An error occurred while fetching anime data. Please try again later.");
        }
    }
};