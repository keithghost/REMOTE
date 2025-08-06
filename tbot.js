const TelegramBot = require('node-telegram-bot-api');
const config = require('./set');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const gradient = require('gradient-string');
const moment = require('moment');

// File paths
const chatGroupsFile = path.join(__dirname, 'chatGroups.json');
const messageCountFile = path.join(__dirname, 'messageCount.json');

// Constants
const REMOTE_COMMANDS_REPO = 'keithghost/REMOTE';
const REMOTE_COMMANDS_DIR = 'lib';
const REMOTE_CACHE_DIR = path.join(__dirname, 'remote_commands_cache');

// Initialize files
function initializeFiles() {
    if (!fs.existsSync(messageCountFile)) {
        fs.writeFileSync(messageCountFile, JSON.stringify({}), 'utf8');
    }
    if (!fs.existsSync(chatGroupsFile)) {
        fs.writeFileSync(chatGroupsFile, JSON.stringify([]), 'utf8');
    }
    if (!fs.existsSync(REMOTE_CACHE_DIR)) {
        fs.mkdirSync(REMOTE_CACHE_DIR, { recursive: true });
    }
}

// Initialize bot
const bot = new TelegramBot(config.token, { polling: true });
let chatGroups = JSON.parse(fs.readFileSync(chatGroupsFile, 'utf8'));
let adminOnlyMode = false;
const cooldowns = new Map();
let gbanList = [];
const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;

// Logger setup
function createGradientLogger() {
    const colors = ['blue', 'cyan'];
    return (message) => {
        const colorIndex = Math.floor(Math.random() * colors.length);
        const color1 = colors[colorIndex];
        const color2 = colors[(colorIndex + 1) % colors.length];
        const gradientMessage = gradient(color1, color2)(message);
        console.log(gradientMessage);
    };
}

const logger = createGradientLogger();

// Bot banner
const botName = `                                                                                                         

@@@  @@@  @@@@@@@@  @@@  @@@@@@@  @@@  @@@             @@@@@@@             @@@@@@@    @@@@@@   @@@@@@@  
@@@  @@@  @@@@@@@@  @@@  @@@@@@@  @@@  @@@             @@@@@@@             @@@@@@@@  @@@@@@@@  @@@@@@@  
@@!  !@@  @@!       @@!    @@!    @@!  @@@               @@!               @@!  @@@  @@!  @@@    @@!    
!@!  @!!  !@!       !@!    !@!    !@!  @!@               !@!               !@   @!@  !@!  @!@    !@!    
@!@@!@!   @!!!:!    !!@    @!!    @!@!@!@!  @!@!@!@!@    @!!    @!@!@!@!@  @!@!@!@   @!@  !@!    @!!    
!!@!!!    !!!!!:    !!!    !!!    !!!@!!!!  !!!@!@!!!    !!!    !!!@!@!!!  !!!@!!!!  !@!  !!!    !!!    
!!: :!!   !!:       !!:    !!:    !!:  !!!               !!:               !!:  !!!  !!:  !!!    !!:    
:!:  !:!  :!:       :!:    :!:    :!:  !:!               :!:               :!:  !:!  :!:  !:!    :!:    
 ::  :::   :: ::::   ::     ::    ::   :::                ::                :: ::::  ::::: ::     ::    
 :   :::  : :: ::   :       :      :   : :                :                :: : ::    : :  :      :     

`;

// Load commands from GitHub
async function loadRemoteCommands() {
    try {
        logger('[REMOTE] Loading commands from GitHub...');
        
        const apiUrl = `https://api.github.com/repos/${REMOTE_COMMANDS_REPO}/contents/${REMOTE_COMMANDS_DIR}`;
        const response = await axios.get(apiUrl);
        
        const commandFiles = response.data.filter(file => 
            file.name.endsWith('.js') && file.type === 'file'
        );

        let loadedCount = 0;
        
        for (const file of commandFiles) {
            try {
                const cachePath = path.join(REMOTE_CACHE_DIR, file.name);
                let commandCode;
                
                if (fs.existsSync(cachePath)) {
                    const fileStats = fs.statSync(cachePath);
                    const oneHourAgo = Date.now() - 3600000;
                    
                    if (fileStats.mtimeMs < oneHourAgo) {
                        commandCode = (await axios.get(file.download_url)).data;
                        fs.writeFileSync(cachePath, commandCode);
                    } else {
                        commandCode = fs.readFileSync(cachePath, 'utf8');
                    }
                } else {
                    commandCode = (await axios.get(file.download_url)).data;
                    fs.writeFileSync(cachePath, commandCode);
                }
                
                const commandModule = eval(`(function() { ${commandCode} \n return module.exports; })()`);
                
                if (commandModule && commandModule.config && commandModule.onStart) {
                    const commandName = commandModule.config.name.toLowerCase();
                    commandModule.config.role = commandModule.config.role || 0;
                    commandModule.config.cooldown = commandModule.config.cooldown || 0;
                    
                    // Register the command
                    const prefixPattern = commandModule.config.usePrefix ? 
                        `^${config.prefix}${commandName}\\b(.*)$` : 
                        `^${commandName}\\b(.*)$`;
                    
                    bot.onText(new RegExp(prefixPattern, 'i'), (msg, match) => {
                        executeCommand(bot, commandModule, msg, match);
                    });
                    
                    bot.commands = bot.commands || {};
                    bot.commands[commandName] = commandModule;
                    logger(`[REMOTE] Loaded command: ${commandName}`);
                    loadedCount++;
                }
            } catch (error) {
                logger(`[REMOTE] Error loading ${file.name}:`, error.message);
            }
        }
        
        logger(`[REMOTE] Successfully loaded ${loadedCount}/${commandFiles.length} remote commands`);
        return loadedCount;
    } catch (error) {
        logger('[REMOTE] Failed to load remote commands:', error.message);
        return 0;
    }
}

// Admin check
async function isUserAdmin(bot, chatId, userId) {
    try {
        const chatAdministrators = await bot.getChatAdministrators(chatId);
        return chatAdministrators.some(admin => admin.user.id === userId);
    } catch (error) {
        return false;
    }
}

// Get group member count
async function getGroupMemberCount(bot, chatId) {
    try {
        const chat = await bot.getChat(chatId);
        return chat.members_count || 'N/A';
    } catch (error) {
        logger('Error getting member count:', error);
        return 'N/A';
    }
}

// Enhanced welcome message handler with profile photo
async function handleNewMemberWelcome(bot, msg) {
    if (!config.greetNewMembers || !config.greetNewMembers.enabled) return;
    const chatId = msg.chat.id;
    const newMembers = msg.new_chat_members;
    const gifUrl = config.greetNewMembers.gifUrl;
    const groupName = msg.chat.title;
    const joinTime = moment().format('MMMM Do YYYY, h:mm:ss a');
    
    try {
        const memberCount = await getGroupMemberCount(bot, chatId);
        
        for (const member of newMembers) {
            const fullName = `${member.first_name} ${member.last_name || ''}`.trim();
            const username = member.username ? `@${member.username}` : fullName;
            
            // Create welcome message
            const welcomeMessage = `
🌟 *Welcome to ${groupName}!* 🌟
👋 *Hello ${username}!* We're excited to have you here.
📝 *Group Info:*
- 🏷️ *Name:* ${groupName}
- 👥 *Total Members:* ${memberCount}
- 🕒 *You joined at:* ${joinTime}
📜 *Please read the group description for rules and guidelines.*
Enjoy your stay! 😊
            `;
            try {
                // Get user profile photos
                const photos = await bot.getUserProfilePhotos(member.id, { limit: 1 });
                
                if (photos.total_count > 0) {
                    // Get the largest available photo
                    const photo = photos.photos[0].pop();
                    const fileId = photo.file_id;
                    
                    // Send photo with welcome message as caption
                    await bot.sendPhoto(chatId, fileId, {
                        caption: welcomeMessage,
                        parse_mode: 'Markdown'
                    });
                } else {
                    // If no profile photo, send welcome message as text
                    await bot.sendMessage(chatId, welcomeMessage, {
                        parse_mode: 'Markdown'
                    });
                }
                
                // Send welcome GIF if configured
                if (gifUrl) {
                    try {
                        await bot.sendAnimation(chatId, gifUrl);
                    } catch (error) {
                        logger("Error sending welcome GIF:", error);
                    }
                }
            } catch (error) {
                logger('Error sending profile photo welcome:', error);
                // Fallback to simple welcome if there's an error
                await bot.sendMessage(chatId, `Welcome, ${fullName}!`);
                if (gifUrl) {
                    try {
                        await bot.sendAnimation(chatId, gifUrl);
                    } catch (gifError) {
                        logger("Error sending fallback GIF:", gifError);
                    }
                }
            }
        }
    } catch (error) {
        logger('Error in welcome handler:', error);
        // Fallback to simple welcome if there's an error
        newMembers.forEach(member => {
            const fullName = `${member.first_name} ${member.last_name || ''}`.trim();
            bot.sendMessage(chatId, `Welcome, ${fullName}!`);
        });
    }
    // Update chat groups list
    if (!chatGroups.includes(chatId)) {
        chatGroups.push(chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
}

// Command execution
async function executeCommand(bot, command, msg, match) {
    try {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const args = match[1].trim().split(/\s+/);
        const messageReply = msg.reply_to_message;
        if (gbanList.includes(userId.toString())) {
            return bot.sendMessage(chatId, "You are globally banned and cannot use commands.");
        }

        const isAdmin = await isUserAdmin(bot, chatId, userId);
        const isBotAdmin = userId.toString() === config.owner_id.toString();
        if (adminOnlyMode && !isBotAdmin) {
            return bot.sendMessage(chatId, "Sorry, only the bot admin can use commands right now.");
        }
        if (command.config.role === 2 && !isBotAdmin) {
            return bot.sendMessage(chatId, "Sorry, only the bot admin can use this command.");
        }
        if (command.config.role === 1 && !isBotAdmin && !isAdmin) {
            return bot.sendMessage(chatId, "This command is only available to groups admins");
        }

        // Cooldown check
        const cooldownKey = `${command.config.name}-${userId}`;
        const now = Date.now();
        if (cooldowns.has(cooldownKey)) {
            const lastUsed = cooldowns.get(cooldownKey);
            const cooldownAmount = command.config.cooldown * 1000;
            if (now < lastUsed + cooldownAmount) {
                const timeLeft = Math.ceil((lastUsed + cooldownAmount - now) / 1000);
                return bot.sendMessage(chatId, `Please wait ${timeLeft} more seconds before using the ${command.config.name} command again.`);
            }
        }
        cooldowns.set(cooldownKey, now);

        // Execute command
        command.onStart({ 
            bot, 
            chatId, 
            args, 
            userId, 
            username: msg.from.username, 
            firstName: msg.from.first_name, 
            lastName: msg.from.last_name || '', 
            messageReply,
            messageReply_username: messageReply ? messageReply.from.username : null,
            messageReply_id: messageReply ? messageReply.from.id : null,
            msg, 
            match 
        });
    } catch (error) {
        logger(`Error executing command ${command.config.name}: ${error}`);
        bot.sendMessage(msg.chat.id, 'An error occurred while executing the command.');
    }
}

// GBan list management
async function fetchGbanList() {
    try {
        const response = await axios.get('https://raw.githubusercontent.com/samirxpikachuio/Gban/main/Gban.json');
        gbanList = response.data.map(user => user.ID);
    } catch (error) {
        logger('Error fetching gban list:', error);
    }
}

// Anti-link function (only works in groups)
async function handleAntiLink(msg) {
    try {
        // Skip if not a group or supergroup
        if (msg.chat.type !== 'group' && msg.chat.type !== 'supergroup') {
            return;
        }
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const text = msg.text || msg.caption || '';
        
        if (linkRegex.test(text)) {
            const isAdmin = await isUserAdmin(bot, chatId, userId);
            
            if (!isAdmin && userId.toString() !== config.owner_id.toString()) {
                const warningMsg = await bot.sendMessage(chatId, "❗ Anti-link message detected ‼️", {
                    reply_to_message_id: msg.message_id
                });
                
                setTimeout(async () => {
                    try {
                        await bot.deleteMessage(chatId, msg.message_id);
                        
                        setTimeout(async () => {
                            try {
                                await bot.deleteMessage(chatId, warningMsg.message_id);
                            } catch (error) {
                                logger("Error deleting warning message:", error);
                            }
                        }, 5000);
                        
                    } catch (error) {
                        logger("Error deleting anti-link message:", error);
                        bot.sendMessage(chatId, `@${msg.from.username || msg.from.first_name}, links are not allowed here!`);
                    }
                }, 2000);
            }
        }
    } catch (error) {
        logger('Error in anti-link handler:', error);
    }
}

// Message handling
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    if (config.antiLink && config.antiLink.enabled) {
        await handleAntiLink(msg);
    }
    try {
        const data = fs.readFileSync(messageCountFile);
        const messageCount = JSON.parse(data);
        if (!messageCount[chatId]) messageCount[chatId] = {};
        if (!messageCount[chatId][userId]) messageCount[chatId][userId] = 0;
        messageCount[chatId][userId] += 1;
        fs.writeFileSync(messageCountFile, JSON.stringify(messageCount), 'utf8');
    } catch (error) {
        logger('[ERROR]', error);
    }
    if (!chatGroups.includes(chatId)) {
        chatGroups.push(chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

// New members handling
bot.on('new_chat_members', (msg) => {
    handleNewMemberWelcome(bot, msg);
});

// Left member handling
bot.on('left_chat_member', (msg) => {
    const chatId = msg.chat.id;
    if (chatGroups.includes(chatId)) {
        chatGroups = chatGroups.filter(id => id !== chatId);
        fs.writeFileSync(chatGroupsFile, JSON.stringify(chatGroups, null, 2));
    }
});

// Callback query handling
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = JSON.parse(callbackQuery.data);
    const commandName = data.command;
    const command = bot.commands ? bot.commands[commandName] : null;
    if (command && command.onReply) {
        command.onReply(bot, chatId, userId, data);
    }
});

// Error handling
bot.on('polling_error', (error) => {
    logger('Polling error:', error);
});

bot.on('polling_started', () => {
    logger('Bot polling started');
});

// Initialize everything
initializeFiles();
loadRemoteCommands();
fetchGbanList();

// Show bot info
logger(botName);
logger('[ Made by keithkeizzah ]');

module.exports = bot;
