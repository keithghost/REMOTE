const axios = require('axios');

// Configuration
const REMOTE_COMMANDS_REPO = 'keithghost/REMOTE';
const REMOTE_COMMANDS_DIR = 'lib';

// Quotes array
const quotes = [
    "Dream big, work hard.",
    "Stay humble, hustle hard.",
    "Believe in yourself.",
    "Success is earned, not given.",
    // Add more quotes as needed
];

// Button configuration
const menuButtons = [
    [
        { text: '📢 WhatsApp Channel', url: 'https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47' },
        { text: '👑 Owner', url: 'https://t.me/keithkeizzah' }
    ],
    [
        { text: '💬 Telegram Group', url: 'https://t.me/keithmd' }
    ]
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

module.exports = {
    config: {
        name: "menu",
        description: "Show available commands",
        usage: ".menu [command_name]",
        author: "keithkeizzah",
        category: "System",
        role: 0,
        cooldown: 5,
        usePrefix: true
    },

    onStart: async function ({ bot, msg, match }) {
        try {
            // Get commands from remote source
            const apiUrl = `https://api.github.com/repos/${REMOTE_COMMANDS_REPO}/contents/${REMOTE_COMMANDS_DIR}`;
            const response = await axios.get(apiUrl);
            const commandFiles = response.data.filter(file => file.name.endsWith('.js'));

            // Process commands data
            const categories = {};
            const commandDetails = {};
            const categoryCommands = {};

            for (const file of commandFiles) {
                try {
                    const commandCode = (await axios.get(file.download_url)).data;
                    const commandModule = eval(`(function() { ${commandCode} \n return module.exports; })()`);
                    
                    if (commandModule && commandModule.config) {
                        const command = commandModule.config;
                        const category = command.category || "Uncategorized";
                        
                        if (!categories[category]) {
                            categories[category] = [];
                            categoryCommands[category] = [];
                        }
                        
                        categories[category].push(command.name);
                        commandDetails[command.name.toLowerCase()] = command;
                        categoryCommands[category].push(command.name);
                    }
                } catch (error) {
                    console.error(`Error processing ${file.name}:`, error.message);
                }
            }

            // Handle specific command request
            if (match && match[1] && match[1].trim()) {
                const commandName = match[1].trim().toLowerCase();
                const commandConfig = commandDetails[commandName];

                if (commandConfig) {
                    const commandInfo = `
─── NAME ────⭓
» ${commandConfig.name}

─── INFO ────⭓
» Description: ${commandConfig.description || "No description available"}
» Role: ${commandConfig.role || 0}
» Author: ${commandConfig.author || "Unknown"}
» Cooldown: ${commandConfig.cooldown || 0}
» Use Prefix: ${commandConfig.usePrefix !== undefined ? commandConfig.usePrefix : true}

─── USAGE ────⭓
» ${commandConfig.usage || (commandConfig.usePrefix ? config.prefix : '') + commandConfig.name}

───────⭔`;
                    await bot.sendMessage(msg.chat.id, commandInfo);
                    return;
                }
                await bot.sendMessage(msg.chat.id, `Command '${commandName}' not found.`);
                return;
            }

            // Main menu display
            const quote = getRandomQuote();

            // Send image with caption
            await bot.sendPhoto(msg.chat.id, 'https://files.catbox.moe/98qm8n.jpg', {
                caption: `
  📜 *"${quote}"*
╭━━**⟮ 𝐊𝐄𝐈𝐓𝐇 𝐓 𝐁𝐎𝐓 ⟯━━━━┈⊷**
┃✵╭──────────────
┃✵│ Owner: keithkeizzah
┃✵│ Commands: ${commandFiles.length}
┃✵│ Version: 1.0.0
┃✵╰─────────────
╰━━━━━━━━━━━━━━━━┈⊷
                `.trim(),
                parse_mode: "Markdown"
            });

            // Send command categories
            const categoryNames = Object.keys(categoryCommands);
            let menuMessage = `📚 *Available Commands:*\n\n`;

            for (let i = 0; i < categoryNames.length; i++) {
                const category = categoryNames[i];
                const commandsList = categoryCommands[category].map(cmd => `◦➛ ${cmd}`).join('\n');
                const categoryBlock = `
╭─────**「 ${category} 」─┈⊷**
│${commandsList}
╰─────────────────────⏣
                `.trim() + '\n\n';

                if (menuMessage.length + categoryBlock.length > 4096) {
                    await bot.sendMessage(msg.chat.id, menuMessage, { parse_mode: "Markdown" });
                    menuMessage = categoryBlock;
                } else {
                    menuMessage += categoryBlock;
                }

                // Add buttons to last message
                if (i === categoryNames.length - 1) {
                    await bot.sendMessage(msg.chat.id, menuMessage, {
                        parse_mode: "Markdown",
                        reply_markup: { inline_keyboard: menuButtons }
                    });
                    menuMessage = '';
                }
            }

            if (menuMessage.length > 0) {
                await bot.sendMessage(msg.chat.id, menuMessage, { parse_mode: "Markdown" });
            }

        } catch (error) {
            console.error("Error in menu command:", error);
            await bot.sendMessage(msg.chat.id, "❌ An error occurred while generating the menu. Please try again later.");
        }
    }
};
