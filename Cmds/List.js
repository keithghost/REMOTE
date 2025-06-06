const { keith } = require('../commandHandler');

keith({
    pattern: "list",
    alias: ["listcommands", "cmds", "allcommands"],
    desc: "List all available commands alphabetically",
    category: "General",
    react: "📋",
    filename: __filename
}, async ({ client, m, prefix }) => {
    try {
        // Get all commands from commandHandler
        const commands = require('../commandHandler').commands
            .filter(cmd => !cmd.dontAddCommandList) // Exclude hidden commands
            .sort((a, b) => a.pattern.localeCompare(b.pattern)); // Sort alphabetically

        // Build the command list
        let commandListText = `╭───「 COMMAND LIST 」───┈⊷\n`;
        commandListText += `│ Total Commands: ${commands.length}\n`;
        commandListText += `│ Prefix: ${prefix}\n`;
        commandListText += `╰───────────────────────┈⊷\n\n`;

        // Add each command with its aliases and description
        commands.forEach((cmd, index) => {
            const aliases = cmd.alias 
                ? `(Alias: ${cmd.alias.join(', ')})` 
                : '';
            
            commandListText += `╭───「 ${index + 1}. ${cmd.pattern} 」───┈⊷\n`;
            commandListText += `│ Category: ${cmd.category || 'General'}\n`;
            if (aliases) commandListText += `│ ${aliases}\n`;
            commandListText += `│ Description: ${cmd.desc || 'No description'}\n`;
            commandListText += `╰───────────────────────┈⊷\n`;
        });

        commandListText += `\n*Note:* Use ${prefix}help <command> for more details`;

        // Send the command list
        await client.sendMessage(m.chat, {
            text: commandListText,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `${client.user.name} Command List`,
                    body: `All commands in alphabetical order`,
                    thumbnail: await client.profilePictureUrl(client.user.id, 'image')
                }
            }
        });

    } catch (error) {
        console.error("Command list error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ Error generating command list: ${error.message}`
        });
    }
});
