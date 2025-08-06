const axios = require('axios');

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

// GitHub API configuration
const GITHUB_API_URL = 'https://api.github.com/repos/keithghost/REMOTE/contents/lib';

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
            // Fetch command files from GitHub
            const response = await axios.get(GITHUB_API_URL);
            const commandFiles = response.data
                .filter(file => file.name.endsWith(".js"))
                .map(file => file.name);

            // Process commands data
            const commandDetails = {};
            const categoryCommands = {};

            // Load each command from GitHub
            for (const file of commandFiles) {
                try {
                    const fileResponse = await axios.get(`https://raw.githubusercontent.com/keithghost/REMOTE/main/lib/${file}`);
                    const commandCode = fileResponse.data;
                    // Evaluate the command module (be cautious with this in production)
                    const command = eval(`(${commandCode})`);
                    
                    if (command && command.config) {
                        const category = command.config.category || "uncategorized";
                        
                        if (!categoryCommands[category]) {
                            categoryCommands[category] = [];
                        }
                        commandDetails[command.config.name] = command.config;
                        categoryCommands[category].push(command.config.name);
                    }
                } catch (error) {
                    console.error(`Error loading command ${file}:`, error);
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

            // Send image with caption first (without command count)
            await bot.sendPhoto(msg.chat.id, 'https://files.catbox.moe/98qm8n.jpg', {
                caption: `
# KEITH TECH  
**MD**

"${quote}"  
[ **KEITH T BOT** ]  

Owner: keithkeizzah  
Version: 1.0.0  
                `.trim(),
                parse_mode: "Markdown"
            });

            // Then send the command categories
            const categoryNames = Object.keys(categoryCommands);
            let menuMessage = `### Available Commands:\n\n`;

            for (const category of categoryNames) {
                const categoryBlock = `[ ${category} ] ---\n` + 
                    categoryCommands[category].map(cmd => `- ${cmd}`).join('\n') + 
                    '\n\n---\n\n';

                if (menuMessage.length + categoryBlock.length > 4096) {
                    await bot.sendMessage(msg.chat.id, menuMessage, { parse_mode: "Markdown" });
                    menuMessage = categoryBlock;
                } else {
                    menuMessage += categoryBlock;
                }
            }

            // Send the command count separately at the end
            menuMessage += `Commands: ${commandFiles.length}`;

            // Send the final message with buttons
            await bot.sendMessage(msg.chat.id, menuMessage, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: menuButtons }
            });

        } catch (error) {
            console.error("Error in menu command:", error);
            await bot.sendMessage(msg.chat.id, "❌ An error occurred while generating the menu.");
        }
    }
};
