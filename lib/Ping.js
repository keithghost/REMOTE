const speed = require("performance-now");

module.exports = {
    config: {
        name: "ping",
        author: "keithkeizzah",
        description: "Check bot's ping and latency",
        category: "System",
        usage: "ping",
        usePrefix: true
    },

    onStart: async function({ bot, chatId }) {
        try {
            const start = speed();
            
            // Send a test message to measure round-trip time
            const sentMessage = await bot.sendMessage(chatId, "🏓 Pong!");
            const end = speed();
            
            // Calculate latency in milliseconds
            const latency = (end - start).toFixed(2);
            
            // Edit the original message with the ping result
            await bot.editMessage(`🏓 Pong!\n⏳ Latency: ${latency}ms`, {
                chat_id: chatId,
                message_id: sentMessage.message_id
            });
            
        } catch (error) {
            console.error('[PING ERROR]', error);
            bot.sendMessage(chatId, "❌ Failed to check ping. Please try again.");
        }
    }
};
