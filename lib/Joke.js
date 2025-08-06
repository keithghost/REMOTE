const axios = require('axios');

module.exports = {
    config: {
        name: "joke",
        author: "keithkeizzah",
        description: "Get a random joke (with optional filters)",
        category: "fun",
        usage: "joke [safe]",
        usePrefix: true
    },

    onStart: async function({ bot, msg, args }) {
        try {
            const chatId = msg.chat.id;
            const isSafeMode = args[0]?.toLowerCase() === 'safe';

            // Send loading message
            const loadingMessage = await bot.sendMessage(chatId, "🎭 Fetching a joke...");

            // Build API URL based on preferences
            let apiUrl = 'https://v2.jokeapi.dev/joke/Any?type=single';
            if (isSafeMode) {
                apiUrl += '&safe-mode';
            }

            // Get joke from API
            const response = await axios.get(apiUrl);
            const jokeData = response.data;

            if (jokeData.error) {
                throw new Error(jokeData.message);
            }

            // Format the response
            let jokeMessage = `😂 ${jokeData.joke}\n\n`;
            jokeMessage += `Category: ${jokeData.category}\n`;
            
            // Add warning if joke has sensitive content
            if (!jokeData.safe) {
                jokeMessage += `\n⚠️ Warning: This joke may contain sensitive content`;
                
                // List active flags
                const activeFlags = Object.entries(jokeData.flags)
                    .filter(([_, value]) => value)
                    .map(([flag]) => flag)
                    .join(', ');
                
                if (activeFlags) {
                    jokeMessage += ` (${activeFlags})`;
                }
            }

            // Add safe mode suggestion if applicable
            if (!jokeData.safe && !isSafeMode) {
                jokeMessage += `\n\nUse "/joke safe" for family-friendly jokes`;
            }

            // Edit the loading message with the joke
            await bot.editMessageText(jokeMessage, {
                chat_id: chatId,
                message_id: loadingMessage.message_id
            });

        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, "❌ Failed to fetch a joke. Please try again later.");
        }
    }
};