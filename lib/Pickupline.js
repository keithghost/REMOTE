const axios = require('axios');

module.exports = {
    config: {
        name: "pickupline",
        author: "keithkeizzah",
        description: "Get a random pickup line",
        category: "fun",
        usage: "pickup",
        usePrefix: true
    },

    onStart: async function({ bot, msg }) {
        try {
            const chatId = msg.chat.id;
            
            // Send loading message
            const loadingMessage = await bot.sendMessage(chatId, "💘 Finding you the perfect pickup line...");
            
            // Get pickup line from API
            const response = await axios.get('https://api.popcat.xyz/pickuplines');
            const { pickupline, contributor } = response.data;
            
            // Create message with inline button
            const replyMarkup = {
                inline_keyboard: [
                    [{
                        text: "✨ Contributor",
                        url: contributor
                    }]
                ]
            };

            // Edit loading message with result
            await bot.editMessageText(`💖 *Pickup Line:*\n\n"${pickupline}"`, {
                chat_id: chatId,
                message_id: loadingMessage.message_id,
                parse_mode: 'Markdown',
                reply_markup: replyMarkup
            });

        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, "❌ Failed to fetch a pickup line. Try again later!");
        }
    }
};
