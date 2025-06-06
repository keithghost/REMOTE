const { keith } = require('../commandHandler');
const { DateTime } = require('luxon');
const _ = require('lodash');

keith({
    pattern: "list",
    alias: ["allcommands", "cmdlist"],
    desc: "List all commands alphabetically with descriptions",
    category: "Utility",
    react: "📋",
    filename: __filename
}, async ({ client, m, prefix }) => {
    try {
        // Constants
        const TIME_ZONE = 'Africa/Nairobi';
        const COMMANDS_PER_PAGE = 10;
        
        // Helper functions
        const getCurrentTime = () => DateTime.now().setZone(TIME_ZONE).toLocaleString(DateTime.TIME_SIMPLE);
        const getCurrentDate = () => DateTime.now().setZone(TIME_ZONE).toLocaleString(DateTime.DATE_FULL);

        const formatCommandText = (cmd) => {
            const aliases = cmd.alias ? `(${cmd.alias.join(', ')})` : '';
            return `• *${prefix}${cmd.pattern}* ${aliases}\n  └ ${cmd.desc || 'No description'}`;
        };

        // Get and sort commands
        const allCommands = require('../commandHandler').commands
            .filter(cmd => !cmd.dontAddCommandList)
            .sort((a, b) => a.pattern.localeCompare(b.pattern));

        const totalCommands = allCommands.length;
        const totalPages = Math.ceil(totalCommands / COMMANDS_PER_PAGE);

        // Generate command list text
        let commandListText = '';
        allCommands.forEach((cmd, index) => {
            commandListText += `${formatCommandText(cmd)}\n\n`;
        });

        // Build final message
        const header = `📜 *${client.user.name} Command List* 📜\n\n`;
        const stats = `📅 Date: ${getCurrentDate()}\n⏰ Time: ${getCurrentTime()}\n🔢 Total Commands: ${totalCommands}\n\n`;
        const footer = `\nℹ️ Use *${prefix}help <command>* for more details`;

        const fullMessage = header + stats + commandListText + footer;

        // Send as document for better readability
        await client.sendMessage(m.chat, {
            document: { 
                url: 'https://example.com/document.pdf' // Replace with actual doc URL or buffer
            },
            fileName: `${client.user.name}_Commands_List.txt`,
            mimetype: 'text/plain',
            caption: `📋 *${client.user.name} Command List*\n\n` +
                    `Total ${totalCommands} commands available\n` +
                    `Generated on ${getCurrentDate()}`,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `${client.user.name} Command List`,
                    body: `All ${totalCommands} commands available`,
                    mediaType: 2,
                    thumbnail: await client.getProfilePicture(client.user.id),
                    mediaUrl: '',
                    sourceUrl: ''
                }
            }
        });

        // Also send as text message for quick reference
        const previewText = `📋 *Command List Preview (A-F):*\n\n` +
            allCommands.slice(0, 6).map(cmd => 
                `*${prefix}${cmd.pattern}* - ${cmd.desc?.split('\n')[0] || 'No description'}`
            ).join('\n') +
            `\n\nView the full list in the attached document`;

        await client.sendMessage(m.chat, { 
            text: previewText 
        });

    } catch (error) {
        console.error("Command list error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ Failed to generate command list: ${error.message}`
        });
    }
});
