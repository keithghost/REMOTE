const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');
const gradient = require('gradient-string');

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
const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;

// ==============
// BOT BANNER
// ==============
logger.banner(`
████████╗██████╗  █████╗ ███╗   ██╗███████╗██╗  ██╗
╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██║  ██║
   ██║   ██████╔╝███████║██╔██╗ ██║███████╗███████║
   ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║██╔══██║
   ██║   ██║  ██║██║  ██║██║ ╚████║███████║██║  ██║
   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
`);

// ==============
// COMMAND HANDLER
// ==============
const commands = [];

function loadCommands() {
    const cmdDir = path.join(__dirname, 'scripts', 'cmds');
    if (!fs.existsSync(cmdDir)) {
        logger.error('Commands directory not found!');
        return;
    }

    fs.readdirSync(cmdDir).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const command = require(path.join(cmdDir, file));
                command.config = {
                    role: 0,
                    cooldown: 0,
                    usePrefix: true,
                    ...command.config,
                    name: (command.config.name || path.basename(file, '.js')).toLowerCase()
                };
                commands.push(command);
                registerCommand(bot, command);
                logger.success(`Command loaded: ${command.config.name}`);
            } catch (error) {
                logger.error(`Error loading ${file}: ${error.message}`);
            }
        }
    });
}

function registerCommand(bot, command) {
    const prefixPattern = command.config.usePrefix ? 
        `^${config.prefix}${command.config.name}\\b(.*)$` : 
        `^${command.config.name}\\b(.*)$`;
    bot.onText(new RegExp(prefixPattern, 'i'), (msg, match) => {
        executeCommand(bot, command, msg, match);
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

async function executeCommand(bot, command, msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

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

        if (command.config.role === 2 && !isBotAdmin) {
            return bot.sendMessage(chatId, "⛔ Bot admin only command.");
        }

        if (command.config.role === 1 && !isAdmin && !isBotAdmin) {
            return bot.sendMessage(chatId, "🔐 Admin only command.");
        }

        // Cooldown handling
        const cooldownKey = `${command.config.name}-${userId}`;
        const now = Date.now();

        if (cooldowns.has(cooldownKey)) {
            const remaining = Math.ceil((cooldowns.get(cooldownKey) + (command.config.cooldown * 1000) - now) / 1000);
            if (remaining > 0) {
                return bot.sendMessage(chatId, `⏳ Please wait ${remaining}s before using this command again.`);
            }
        }

        cooldowns.set(cooldownKey, now);

        // Prepare arguments
        const args = match[1]?.trim().split(/\s+/) || [];
        const replyMsg = msg.reply_to_message;

        // Execute command
        command.onStart({ 
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
            match 
        });

    } catch (error) {
        logger.error(`Command failed: ${command.config.name} - ${error.message}`);
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

async function handleAntiLink(msg) {
    if (!config.antiLink?.enabled || !['group', 'supergroup'].includes(msg.chat.type)) return;

    const { chat, from, message_id, text } = msg;
    if (!linkRegex.test(text || '')) return;

    try {
        if (!(await isUserAdmin(bot, chat.id, from.id)) && from.id !== config.owner_id) {
            const warning = await bot.sendMessage(chat.id, "❗ Anti-link protection triggered", {
                reply_to_message_id: message_id
            });

            setTimeout(async () => {
                try {
                    await bot.deleteMessage(chat.id, message_id);
                    setTimeout(() => bot.deleteMessage(chat.id, warning.message_id), 5000);
                } catch {
                    bot.sendMessage(chat.id, `@${from.username || from.first_name}, links are not allowed here!`);
                }
            }, 2000);
        }
    } catch (error) {
        logger.error('Anti-link failed:', error.message);
    }
}

// ==============
// EVENT HANDLERS
// ==============
async function handleNewMemberWelcome(msg) {
    if (!config.greetNewMembers?.enabled) return;

    const { chat, new_chat_members } = msg;
    
    try {
        for (const member of new_chat_members) {
            const name = `${member.first_name} ${member.last_name || ''}`.trim();
            const username = member.username ? `@${member.username}` : name;
            const welcomeMsg = `
🌟 Welcome to ${chat.title}! 🌟
👋 Hello ${username}!
🕒 Joined: ${moment().format('MMMM Do YYYY, h:mm a')}
📜 Please read group rules.
            `;

            await bot.sendMessage(chat.id, welcomeMsg, { parse_mode: 'Markdown' });
            if (config.greetNewMembers.gifUrl) {
                await bot.sendAnimation(chat.id, config.greetNewMembers.gifUrl);
            }

            if (!chatGroups.includes(chat.id)) {
                chatGroups.push(chat.id);
                fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups));
                logger.event(`New group added: ${chat.id}`);
            }
        }
    } catch (error) {
        logger.error('Welcome failed:', error.message);
    }
}

// ==============
// EVENT LISTENERS
// ==============
bot.on('message', async (msg) => {
    const { chat, from, text } = msg;
    if (!from) return;

    logger.message(`
    ┌─────────────────────────────────
    │ 📩 ${chat.type.toUpperCase()} Message
    ├─────────────────────────────────
    │ 🏷️ Chat: ${chat.id}
    │ 👤 User: ${from.id} (${from.username || from.first_name})
    │ 💬 Text: ${(text || '').substring(0, 50)}${text?.length > 50 ? '...' : ''}
    └─────────────────────────────────
    `);

    await handleAntiLink(msg);

    try {
        const counts = JSON.parse(fs.readFileSync(messageCountFile));
        counts[chat.id] = counts[chat.id] || {};
        counts[chat.id][from.id] = (counts[chat.id][from.id] || 0) + 1;
        fs.writeFileSync(messageCountFile, JSON.stringify(counts));
    } catch (error) {
        logger.error('Message count failed:', error.message);
    }
});

bot.on('new_chat_members', handleNewMemberWelcome);
bot.on('left_chat_member', (msg) => {
    const { chat, left_chat_member } = msg;
    logger.event(`🚪 ${left_chat_member.first_name} left ${chat.title}`);
    
    chatGroups = chatGroups.filter(id => id !== chat.id);
    fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups));
});

bot.on('callback_query', async (query) => {
    const { message, from, data } = query;
    logger.event(`🔄 Callback from ${from.id}: ${data}`);
    
    try {
        const { command } = JSON.parse(data);
        const cmd = commands.find(c => c.config.name === command);
        if (cmd?.onReply) cmd.onReply(bot, message.chat.id, from.id, JSON.parse(data));
    } catch (error) {
        logger.error('Callback failed:', error.message);
    }
});

// ==============
// ERROR HANDLING
// ==============
bot.on('polling_error', (error) => logger.error('Polling error:', error.message));
bot.on('webhook_error', (error) => logger.error('Webhook error:', error.message));

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
