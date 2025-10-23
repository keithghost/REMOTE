
const { keith } = require('../commandHandler');

keith({
    pattern: "clear",
    alias: ["clearchat"],
    desc: "Clear all messages in the chat",
    category: "Owner",
    react: "🗡️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, reply } = context;

        if (!m?.key?.id || !m?.messageTimestamp) {
            return await reply("Error: Invalid message reference for deletion");
        }

        await client.sendMessage({
            delete: true,
            lastMessages: [{
                key: m.key,
                messageTimestamp: m.messageTimestamp
            }]
        }, m.chat);

        await reply("The chat has been cleared of all messages");
    } catch (error) {
        console.error("Error in clear command:", error);
        await reply("Failed to clear the chat. Please try again later.");
    }
});
