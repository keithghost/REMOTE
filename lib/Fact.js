const axios = require('axios');

module.exports = {
    config: {
        name: "fact",
        author: "keithkeizzah",
        description: "Get a random interesting fact",
        category: "fun",
        usage: "fact",
        usePrefix: true
    },

    onStart: async function({ bot, msg }) {
        try {
            const chatId = msg.chat.id;
            
            // Send "Fetching fact..." message
            const loadingMessage = await bot.sendMessage(chatId, "🔍 Fetching an interesting fact...");
            
            // Get fact from API
            const response = await axios.get('https://nekos.life/api/v2/fact');
            const fact = response.data.fact;
            
            // Edit the loading message with the fact
            await bot.editMessageText(`📚 Did you know?\n\n${fact}`, {
                chat_id: chatId,
                message_id: loadingMessage.message_id
            });

        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, "Oops! Failed to fetch a fact. Please try again later.");
        }
    }
};