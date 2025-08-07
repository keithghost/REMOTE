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
            
            // Send initial ping message
            const sentMessage = await bot.sendMessage(chatId, "📡 Pinging...");
            
            // Calculate latency
            const endTime = Date.now();
            const latency = endTime - startTime;
            
            // Edit the message with results
            await bot.editMessage(`🏓 Pong!\n⏱️ Response Time: ${latency}ms`, {
                chat_id: chatId,
                message_id: sentMessage.message_id
            });
            
        } catch (error) {
            console.error('[PING ERROR]', error);
            bot.sendMessage(chatId, "❌ Failed to measure ping");
        }
    }
};
