module.exports = {
    config: {
        name: "ping",
        author: "keithkeizzah",
        description: "Check bot's response time",
        category: "System",
        usage: "ping",
        usePrefix: true
    },

    onStart: async function({ bot, chatId }) {
        try {
            const startTime = Date.now();
            
            // Send a simple message to measure response time
            const sentMessage = await bot.sendMessage(chatId, "🏓 Pong!");
            
            // Calculate ping after message is sent
            const endTime = Date.now();
            const pingTime = endTime - startTime;

            // Edit the original message with the ping time
            await bot.editMessageText(`🏓 Pong!\n⚡ Ping: ${pingTime}ms`, {
                chat_id: chatId,
                message_id: sentMessage.message_id
            });

        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, 'An error occurred while checking ping.' + error);
        }
    }
};
