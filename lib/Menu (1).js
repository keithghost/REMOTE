const fs = require('fs');
const path = require('path');

// Quotes array
const quotes = [
    "Dream big, work hard.",
    "Stay humble, hustle hard.",
    "Believe in yourself.",
    "Success is earned, not given.",
    // ... (keep all your existing quotes)
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
        role: 0x0,
        cooldown: 0x0,
        usePrefix: true
    },

    onStart: async function ({ msg, bot, match, event }) {
        try {
            const commandDir = path.join(__dirname, '.');
            const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith(".js"));
            
            // Process commands data
            const categories = {};
            const commandDetails = {};
            const categoryCommands = {};

            for (const file of commandFiles) {
                const command = require(path.join(commandDir, file));
                const category = command.config.category || "uncategorized";
                
                if (!categories[category]) {
                    categories[category] = [];
                    categoryCommands[category] = [];
                }
                categories[category].push(command.config.name);
                commandDetails[command.config.name] = command.config;
                categoryCommands[category].push(command.config.name);
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
» Role: ${commandConfig.role}
» Author: ${commandConfig.author || "Unknown"}
» Cooldown: ${commandConfig.cooldown}
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
                const categoryBlock = `
╭─────**「 ${category} 」─┈⊷**
││◦➛ ${categoryCommands[category].join("\n││◦➛ ")}
╰─────────────────────⏣
                `.trim() + '\n\n';

                if (menuMessage.length + categoryBlock.length > 4096) {
                    await bot.sendMessage(msg.chat.id, menuMessage, { parse_mode: "Markdown" });
                    menuMessage = categoryBlock;
                } else {
                    menuMessage += categoryBlock;
                }

                // Add buttons to last category
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
            await bot.sendMessage(msg.chat.id, "❌ An error occurred while generating the menu.");
        }
    }
};
