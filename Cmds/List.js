const { keith } = require('../commandHandler');
const { DateTime } = require('luxon');

keith({
    pattern: "list",
    alias: ["allcommands", "cmdlist"],
    desc: "List all commands alphabetically with descriptions",
    category: "Utility",
    react: "📋",
    filename: __filename
}, async ({ client, m, prefix }) => {
    try {
        // Helper functions
        const getCurrentTime = () => DateTime.now().toLocaleString(DateTime.TIME_SIMPLE);
        const getCurrentDate = () => DateTime.now().toLocaleString(DateTime.DATE_FULL);

        // Get and sort commands alphabetically
        const allCommands = require('../commandHandler').commands
            .filter(cmd => !cmd.dontAddCommandList)
            .sort((a, b) => a.pattern.localeCompare(b.pattern));

        // Format command list
        let commandList = "";
        allCommands.forEach((cmd, index) => {
            const aliases = cmd.alias ? ` (${cmd.alias.join(', ')})` : '';
            commandList += `${index + 1}. *${prefix}${cmd.pattern}*${aliases}\n   └ ${cmd.desc || 'No description'}\n\n`;
        });

        // Create the message
        const message = `📜 *${client.user.name} Command List* 📜\n\n` +
                       `📅 Date: ${getCurrentDate()}\n` +
                       `⏰ Time: ${getCurrentTime()}\n` +
                       `🔢 Total Commands: ${allCommands.length}\n\n` +
                       `${commandList}\n` +
                       `ℹ️ Use *${prefix}help <command>* for more details`;

        // Send the message
        await client.sendMessage(m.chat, {
            text: message,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `${client.user.name} Command List`,
                    body: `All ${allCommands.length} commands available`,
                    mediaType: 1,
                    thumbnail: null
                }
            }
        });

    } catch (error) {
        console.error("Command list error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ Failed to generate command list: ${error.message}`
        });
    }
});
