module.exports = {
    config: {
        name: "gid",
        author: "keithkeizzah",
        description: "Retrieve current group ID",
        category: "utility",
        usage: "gid",
        usePrefix: true,
        role: 0 // 0 means no admin privileges required
    },
    onStart: async function ({ bot, chatId }) {
        // Check if the command is used in a group
        if (chatId > 0) {
            return bot.sendMessage(chatId, "❌ This command only works in groups!");
        }

        // Send the group ID
        const groupInfo = `👥 Group ID: \`${chatId}\`\n\n`
                       + "⚠️ Note: Supergroups/channels start with -100";
        
        bot.sendMessage(chatId, groupInfo, { parse_mode: "Markdown" });
    }
};