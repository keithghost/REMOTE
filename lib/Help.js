const axios = require('axios');

const menuButtons = [
    [
        { text: '📢 WhatsApp Channel', url: 'https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47' },
        { text: '👑 Owner', url: 'https://t.me/keithkeizzah' }
    ],
    [
        { text: '💬 Telegram Group', url: 'https://t.me/keithmd' }
    ]
];

const GITHUB_API_URL = 'https://api.github.com/repos/keithghost/REMOTE/contents/lib';

module.exports = {
    config: {
        name: "help",
        description: "Show available commands",
        usage: ".menu [command_name]",
        author: "keithkeizzah",
        category: "System",
        role: 0x0,
        cooldown: 0x0,
        usePrefix: true
    },

    onStart: async function ({ msg, bot, match, event }) {
        try {
            // Fetch command files from GitHub
            const response = await axios.get(GITHUB_API_URL);
            const commandFiles = response.data
                .filter(file => file.name.endsWith(".js"))
                .map(file => file.name);

            // Organize commands by category
            const categories = {};
            const commandDetails = {};

            // Load each command from GitHub
            for (const file of commandFiles) {
                try {
                    const fileResponse = await axios.get(`https://raw.githubusercontent.com/keithghost/REMOTE/main/lib/${file}`);
                    const commandCode = fileResponse.data;
                    const command = eval(`(${commandCode})`);
                    
                    if (command && command.config) {
                        const category = command.config.category || "Uncategorized";
                        const commandName = command.config.name;
                        
                        if (!categories[category]) {
                            categories[category] = [];
                        }
                        
                        categories[category].push(commandName);
                        commandDetails[commandName] = command.config;
                    }
                } catch (error) {
                    console.error(`Error loading command ${file}:`, error);
                }
            }

            // Handle specific command request
            if (match && match[1] && match[1].trim()) {
                const commandName = match[1].trim().toLowerCase();
                const commandConfig = Object.values(commandDetails)
                    .find(cmd => cmd.name.toLowerCase() === commandName);

                if (commandConfig) {
                    const commandInfo = `
─── NAME ────⭓
» ${commandConfig.name}

─── INFO ────⭓
» Description: ${commandConfig.description || "No description available"}
» Category: ${commandConfig.category || "Uncategorized"}
» Role: ${commandConfig.role || 0}
» Author: ${commandConfig.author || "Unknown"}
» Cooldown: ${commandConfig.cooldown || 0}
» Use Prefix: ${commandConfig.usePrefix}

─── USAGE ────⭓
» ${commandConfig.usage || '/' + commandConfig.name}

───────⭔`;
                    await bot.sendMessage(msg.chat.id, commandInfo);
                    return;
                }
                await bot.sendMessage(msg.chat.id, `Command '${commandName}' not found.`);
                return;
            }

            // Main menu display
            const totalCommands = commandFiles.length;
            await bot.sendMessage(msg.chat.id, `
╭━━**⟮ 𝐊𝐄𝐈𝐓𝐇 𝐓 𝐁𝐎𝐓 ⟯━━━━┈⊷**
┃✵╭──────────────
┃✵│ Owner: keithkeizzah
┃✵│ Commands: ${totalCommands}
┃✵│ Version: 1.0.0
┃✵╰─────────────
╰━━━━━━━━━━━━━━━━┈⊷
            `.trim(), { parse_mode: "Markdown" });

            // Send command categories
            let menuMessage = `📚 *Available Commands:*\n\n`;
            const sortedCategories = Object.keys(categories).sort();

            for (const category of sortedCategories) {
                const commands = categories[category];
                const categoryBlock = `
╭─────**「 ${category} 」─┈⊷**
││◦➛ ${commands.join("\n││◦➛ ")}
╰─────────────────────⏣
                `.trim() + '\n\n';

                if (menuMessage.length + categoryBlock.length > 4096) {
                    await bot.sendMessage(msg.chat.id, menuMessage, { parse_mode: "Markdown" });
                    menuMessage = categoryBlock;
                } else {
                    menuMessage += categoryBlock;
                }
            }

            // Send the final message with buttons
            if (menuMessage.length > 0) {
                await bot.sendMessage(msg.chat.id, menuMessage, {
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: menuButtons }
                });
            }

        } catch (error) {
            console.error("Error in menu command:", error);
            await bot.sendMessage(msg.chat.id, "❌ An error occurred while generating the menu.");
        }
    }
};
