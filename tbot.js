const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');
const gradient = require('gradient-string');
const { findCommand } = require('./commandHandler');

// ======================
// ENHANCED LOGGER SYSTEM
// ======================
const logThemes = {
    info: ['#4facfe', '#00f2fe'],
    success: ['#00b09b', '#96c93d'],
    warning: ['#f83600', '#f9d423'],
    error: ['#ff416c', '#ff4b2b'],
    event: ['#8a2be2', '#da70d6'],
    message: ['#00c6ff', '#0072ff'],
    banner: ['#ff00cc', '#3333ff']
};

const logger = {
    info: (message) => console.log(gradient(logThemes.info[0], logThemes.info[1])(`ℹ️ ${message}`)),
    success: (message) => console.log(gradient(logThemes.success[0], logThemes.success[1])(`✓ ${message}`)),
    warning: (message) => console.log(gradient(logThemes.warning[0], logThemes.warning[1])(`⚠️ ${message}`)),
    error: (message) => console.log(gradient(logThemes.error[0], logThemes.error[1])(`✗ ${message}`)),
    event: (message) => console.log(gradient(logThemes.event[0], logThemes.event[1])(`✨ ${message}`)),
    message: (message) => console.log(gradient(logThemes.message[0], logThemes.message[1])(`✉️ ${message}`)),
    banner: (message) => console.log(gradient(logThemes.banner[0], logThemes.banner[1])(message))
};

// ==============
// BOT INITIALIZATION
// ==============
const bot = new TelegramBot(config.token, { polling: true });
const chatGroupsFile = path.join(__dirname, 'chatGroups.json');
const messageCountFile = path.join(__dirname, 'messageCount.json');

// Initialize files
function initializeFiles() {
    [messageCountFile, chatGroupsFile].forEach(file => {
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, file.includes('Count') ? '{}' : '[]', 'utf8');
            logger.success(`Created ${path.basename(file)}`);
        }
    });
}

// ==============
// CORE VARIABLES
// ==============
let chatGroups = JSON.parse(fs.readFileSync(chatGroupsFile, 'utf8'));
let adminOnlyMode = false;
const cooldowns = new Map();
let gbanList = [];

// ==============
// BOT BANNER
// ==============
logger.banner(`
 /$$   /$$ /$$$$$$$$ /$$$$$$ /$$$$$$$$ /$$   /$$
| $$  /$$/| $$_____/|_  $$_/|__  $$__/| $$  | $$
| $$ /$$/ | $$        | $$     | $$   | $$  | $$
| $$$$$/  | $$$$$     | $$     | $$   | $$$$$$$$
| $$  $$  | $$__/     | $$     | $$   | $$__  $$
| $$\  $$ | $$        | $$     | $$   | $$  | $$
| $$ \  $$| $$$$$$$$ /$$$$$$   | $$   | $$  | $$
|__/  \__/|________/|______/   |__/   |__/  |__/
                                                
                                                
                                                                                                                                                                         
`);

// ==============
// COMMAND LOADER
// ==============
function loadCommands() {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'Scripts'))
        .filter(file => file.endsWith('.js'));

    commandFiles.forEach(file => {
        try {
            require(path.join(__dirname, 'Scripts', file));
            logger.success(`Loaded command: ${file}`);
        } catch (error) {
            logger.error(`Error loading ${file}: ${error.message}`);
        }
    });
}

// ==============
// UTILITY FUNCTIONS
// ==============
async function isUserAdmin(bot, chatId, userId) {
    try {
        const admins = await bot.getChatAdministrators(chatId);
        return admins.some(admin => admin.user.id === userId);
    } catch (error) {
        logger.error(`Admin check failed: ${error.message}`);
        return false;
    }
}

async function handleCommand(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text || '';
    
    // Check for prefix
    const prefix = text.startsWith(config.prefix) ? config.prefix : '';
    const commandText = prefix ? text.slice(prefix.length).trim() : text.trim();
    const commandName = commandText.split(' ')[0].toLowerCase();
    
    // Find command
    const command = findCommand(commandName);
    if (!command) return;
    
    try {
        // Security checks
        if (gbanList.includes(userId.toString())) {
            return bot.sendMessage(chatId, "🚫 You are globally banned from using this bot.");
        }

        if (adminOnlyMode && userId !== config.owner_id) {
            return bot.sendMessage(chatId, "🔒 Bot is in admin-only mode.");
        }

        // Permission verification
        const isAdmin = await isUserAdmin(bot, chatId, userId);
        const isBotAdmin = userId === config.owner_id;

        if (command.role === 2 && !isBotAdmin) {
            return bot.sendMessage(chatId, "⛔ Bot admin only command.");
        }

        if (command.role === 1 && !isAdmin && !isBotAdmin) {
            return bot.sendMessage(chatId, "🔐 Admin only command.");
        }

        // Cooldown handling
        const cooldownKey = `${command.pattern}-${userId}`;
        const now = Date.now();

        if (cooldowns.has(cooldownKey)) {
            const remaining = Math.ceil((cooldowns.get(cooldownKey) + (command.cooldown * 1000) - now) / 1000);
            if (remaining > 0) {
                return bot.sendMessage(chatId, `⏳ Please wait ${remaining}s before using this command again.`);
            }
        }

        cooldowns.set(cooldownKey, now);

        // Prepare arguments
        const args = commandText.split(' ').slice(1);
        const replyMsg = msg.reply_to_message;

        // Execute command
        await command.function({
            bot,
            chatId,
            args,
            userId,
            username: msg.from.username,
            firstName: msg.from.first_name,
            lastName: msg.from.last_name || '',
            messageReply: replyMsg,
            messageReply_username: replyMsg?.from?.username,
            messageReply_id: replyMsg?.from?.id,
            msg,
            prefix
        });

    } catch (error) {
        logger.error(`Command failed: ${command.pattern} - ${error.message}`);
        bot.sendMessage(chatId, '❌ Command execution failed.');
    }
}

// ==============
// SECURITY SYSTEMS
// ==============
async function fetchGbanList() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/samirxpikachuio/Gban/main/Gban.json');
        gbanList = response.data.map(user => user.ID);
        logger.success(`GBan list updated (${gbanList.length} users)`);
    } catch (error) {
        logger.error('GBan fetch failed:', error.message);
    }
}

// ==============
// EVENT LISTENERS
// ==============
bot.on('message', async (msg) => {
    const { chat, from, text } = msg;
    if (!from || !text) return;

    logger.message(`
    ┌─────────────────────────────────
    │ 📩 ${chat.type.toUpperCase()} Message
    ├─────────────────────────────────
    │ 🏷️ Chat: ${chat.id}
    │ 👤 User: ${from.id} (${from.username || from.first_name})
    │ 💬 Text: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}
    └─────────────────────────────────
    `);

    await handleCommand(bot, msg);

    try {
        const counts = JSON.parse(fs.readFileSync(messageCountFile));
        counts[chat.id] = counts[chat.id] || {};
        counts[chat.id][from.id] = (counts[chat.id][from.id] || 0) + 1;
        fs.writeFileSync(messageCountFile, JSON.stringify(counts));
    } catch (error) {
        logger.error('Message count failed:', error.message);
    }
});

// ==============
// INITIALIZATION
// ==============
initializeFiles();
loadCommands();
fetchGbanList();
cron.schedule('0 * * * *', fetchGbanList);

logger.success('Bot initialized successfully!');
logger.info(`Mode: ${process.env.NODE_ENV || 'development'}`);
logger.info('Made with ❤️ by keithkeizzah');

module.exports = bot;
