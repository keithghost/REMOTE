//========================================================================================================================
//========================================================================================================================
const fs = require('fs');
const zlib = require('zlib');
const { session } = require("./settings");
const chalk = require('chalk');
const path = require('path');
const { DateTime } = require("luxon");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const { useMultiFileAuthState, makeInMemoryStore, DisconnectReason } = require("@whiskeysockets/baileys");
const FileType = require("file-type");
const { exec } = require("child_process");
const express = require("express");
const util = require("util");
const speed = require("performance-now");
const { smsg } = require('./lib/smsg');
const fetchLogoUrl = require('./lib/ephoto');
const {
    smsgsmsg, formatp, tanggal, formatDate, getTime, sleep, clockString,
    fetchJson, getBuffer, jsonformat, antispam, generateProfilePicture, parseMention,
    getRandom, fetchBuffer,
} = require("./lib/botFunctions.js");

const { TelegraPh, UploadFileUgu } = require("./lib/toUrl");
const uploadtoimgur = require("./lib/Imgur");

const { sendReply, sendMediaMessage } = require("./lib/context");
const daddy = "254748387615@s.whatsapp.net";
const { downloadYouTube, downloadSoundCloud, downloadSpotify, searchYouTube, searchSoundCloud, searchSpotify } = require("./lib/dl");
const ytmp3 = require("./lib/ytmp3");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./lib/exif");
//========================================================================================================================
// Custom chalk colors
//========================================================================================================================
const keithPurple = chalk.hex('#A020F0');
const keithBlue = chalk.hex('#1DA1F2');
const keithPink = chalk.hex('#FF69B4');
const keithGreen = chalk.hex('#2ECC71');
const keithOrange = chalk.hex('#FFA500');
const keithGold = chalk.hex('#FFD700');
const keithRed = chalk.hex('#E74C3C');
const keithYellow = chalk.hex('#F1C40F');
//========================================================================================================================
// Unicode symbols
//========================================================================================================================
const BOT_SYMBOL = '✦';
const MESSAGE_SYMBOL = '✉';
const USER_SYMBOL = '👤';
const GROUP_SYMBOL = '👥';
const TYPE_SYMBOL = '📋';
const CONTENT_SYMBOL = '📝';
const ERROR_SYMBOL = '⚠️';
const SUCCESS_SYMBOL = '✅';
const WARNING_SYMBOL = '⚠️';
//========================================================================================================================
// Create logs directory if it doesn't exist
//========================================================================================================================
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}
//========================================================================================================================
// Enhanced logger clas
//========================================================================================================================
class KeithLogger {
    static logMessage(m) {
        const verifGroupe = m.isGroup;
        const nomGroupe = m.isGroup ? m.chat : '';
        const nomAuteurMessage = m.pushName || 'Unknown';
        const auteurMessage = m.sender;
        const mtype = m.mtype;
        const texte = m.text || '';

        console.log(keithPurple.bold(`\t ${BOT_SYMBOL} ${BOT_SYMBOL} ${BOT_SYMBOL} { K E I T H - M D } ${BOT_SYMBOL} ${BOT_SYMBOL} ${BOT_SYMBOL}`));
        console.log(keithGold.bold("╔════════════════════════════╗"));
        console.log(keithGold.bold(`║ ${MESSAGE_SYMBOL}   N E W   M E S S A G E   ${MESSAGE_SYMBOL} ║`));
        console.log(keithGold.bold("╚════════════════════════════╝"));
        
        if (verifGroupe) {
            console.log(keithGreen(`${GROUP_SYMBOL} Message from: `) + keithBlue.bold(nomGroupe));
        }
        
        console.log(keithGreen(`${USER_SYMBOL} Sender: `) + 
            keithPink.bold(`[${nomAuteurMessage}] `) + 
            keithOrange(`(${auteurMessage.split("@s.whatsapp.net")[0]})`));
        
        console.log(keithGreen(`${TYPE_SYMBOL} Type: `) + keithBlue.bold(mtype));
        
        console.log(keithGold.bold("┌────────────────────────────┐"));
        console.log(keithGreen(`${CONTENT_SYMBOL} Content:`));
        console.log(keithGold.bold("├────────────────────────────┤"));
        console.log(chalk.whiteBright(texte));
        console.log(keithGold.bold("└────────────────────────────┘"));
        
        // Log to daily file
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `messages_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] ${verifGroupe ? `Group: ${nomGroupe} | ` : ''}Sender: ${nomAuteurMessage} (${auteurMessage.split("@s.whatsapp.net")[0]}) | Type: ${mtype} | Content: ${texte}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static error(message, error) {
        console.log(keithRed.bold(`${ERROR_SYMBOL} [ERROR] ${message}`));
        if (error) {
            console.log(keithRed(error.stack || error.message));
        }
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `errors_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [ERROR] ${message}\n${error ? (error.stack || error.message) : ''}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static success(message) {
        console.log(keithGreen.bold(`${SUCCESS_SYMBOL} [SUCCESS] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `success_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [SUCCESS] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static warning(message) {
        console.log(keithYellow.bold(`${WARNING_SYMBOL} [WARNING] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `warnings_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [WARNING] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    static info(message) {
        console.log(keithBlue.bold(`[INFO] ${message}`));
        
        const today = new Date().toISOString().split('T')[0];
        const logFile = path.join(logsDir, `info_${today}.log`);
        const logEntry = `[${new Date().toISOString()}] [INFO] ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }
}
//========================================================================================================================
// Authentication function
//========================================================================================================================
async function authenticationn() {
    try {
        const credsPath = "./session/creds.json";

        if (!fs.existsSync(credsPath)) {
            KeithLogger.info("Connecting to WhatsApp...");

            const [header, b64data] = session.split(';;;');

            if (header === "KEITH" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(credsPath, decompressedData, "utf8");
                KeithLogger.success("Session credentials created successfully");
            } else {
                throw new Error("Invalid session format");
            }
        } else if (session !== "zokk") {
            KeithLogger.info("Updating existing session...");

            const [header, b64data] = session.split(';;;');

            if (header === "KEITH" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(credsPath, decompressedData, "utf8");
                KeithLogger.success("Session credentials updated successfully");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (error) {
        KeithLogger.error("Session authentication failed", error);
        return;
    }
}
//========================================================================================================================
// Command handler setup
//========================================================================================================================
const { keith, commands } = require('./commandHandler');
const { dev, botname, author, mode, url } = require('./settings');
//========================================================================================================================
// Load all commands from the Commands directory
//========================================================================================================================
//prefix integration 
//========================================================================================================================
const { getPrefix } = require('./database/prefix');

let prefix; 

(async () => {
    prefix = await getPrefix(); 
   
})();

// Note: Any code using `prefix` needs to wait for the async assignment
//========================================================================================================================
function loadAllCommands() {
    const cmdsDir = path.join(__dirname, 'Cmds');
    
    function loadCommandsFromDirectory(directory) {
        const items = fs.readdirSync(directory);
        
        items.forEach(item => {
            const fullPath = path.join(directory, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                loadCommandsFromDirectory(fullPath);
            } else if (item.endsWith('.js')) {
                try {
                    require(fullPath);
                    KeithLogger.info(`Loaded command from: ${fullPath}`);
                } catch (error) {
                    KeithLogger.error(`Failed to load command from ${fullPath}`, error);
                }
            }
        });
    }
    
    loadCommandsFromDirectory(cmdsDir);
    
    KeithLogger.success(`Successfully loaded ${commands.length} commands`);
}
//========================================================================================================================
//========================================================================================================================
const { initAntiCallDB } = require('./database/anticall');
const { initAutoBioDB } = require('./database/autobio');
const { initAutoDownloadStatusDB } = require('./database/autodownloadstatus');
const { initAntiLinkDB } = require('./database/antilink');
const { initAutoLikeStatusDB } = require('./database/autolikestatus');
const { initAntiBadDB } = require('./database/antibad');
const { initAutoViewDB } = require('./database/autoview');
const { initPresenceDB } = require('./database/presence');
const { initAutoReadDB } = require('./database/autoread');
const { initAntiDeleteDB } = require('./database/antidelete');
const { initModeDB } = require('./database/mode');
const { initPrefixDB } = require('./database/prefix');

//========================================================================================================================
//========================================================================================================================
initAutoReadDB().catch(console.error);
initAutoViewDB().catch(console.error);
initAntiLinkDB().catch(console.error);
initAntiDeleteDB().catch(console.error);
initModeDB().catch(console.error);
initPrefixDB().catch(console.error);
initAutoLikeStatusDB().catch(console.error);
initPresenceDB().catch(console.error);
initAntiBadDB().catch(console.error);
initAutoBioDB().catch(console.error);
initAntiCallDB().catch(console.error);
//========================================================================================================================
//========================================================================================================================
// Main bot function
async function startKeith() {
    await authenticationn();
    loadAllCommands();

    const { state, saveCreds } = await useMultiFileAuthState("session");
   // const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
    
    const { default: KeithConnect, downloadContentFromMessage, jidDecode } = require("@whiskeysockets/baileys");
    const client = KeithConnect({
        logger: pino({ level: "silent" }),
        printQRInTerminal: true,
        version: [2, 3000, 1023223821],
        browser: ["KEITH-MD", "Safari", "3.0"],
        fireInitQueries: false,
        shouldSyncHistoryMessage: true,
        downloadHistory: true,
        syncFullHistory: true,
        generateHighQualityLinkPreview: true,
        markOnlineOnConnect: true,
        keepAliveIntervalMs: 30000,
        auth: state,
        getMessage: async (key) => {
           /* if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return { conversation: "HERE" };
        },
    });

    store.bind(client.ev);*/
    //========================================================================================================================
   //========================================================================================================================
     // Auto-bio handler
let bioInterval;
async function setupAutoBio(client) {
    const { getAutoBioSettings } = require('./database/autobio');
    const settings = await getAutoBioSettings();
    
    if (bioInterval) clearInterval(bioInterval);
    
    if (settings.status) {
        bioInterval = setInterval(async () => {
            try {
                await client.updateProfileStatus(settings.message);
                //console.log('Auto-bio updated:', settings.message);
            } catch (error) {
                console.error('Error updating bio:', error);
            }
        }, settings.interval * 1000);
    }
}

// Initialize auto-bio on startup
setupAutoBio(client).catch(console.error);

// Listen for changes in auto-bio settings
const { AutoBioDB } = require('./database/autobio');
AutoBioDB.afterUpdate(async (instance) => {
    await setupAutoBio(client);
});

 //========================================================================================================================
  //========================================================================================================================  
    // Also call whenever settings change
    
    // Add this near your other event handlers
let lastTextTime = 0;
const messageDelay = 5000;

client.ev.on('call', async (callData) => {
    try {
        const { getAntiCallSettings } = require('./database/anticall');
        const settings = await getAntiCallSettings();
        
        if (settings.status) {
            const callId = callData[0].id;
            const callerId = callData[0].from;

            if (settings.action === 'block') {
                await client.updateBlockStatus(callerId, 'block');
            } else {
                await client.rejectCall(callId, callerId);
            }

            const currentTime = Date.now();
            if (currentTime - lastTextTime >= messageDelay) {
                await client.sendMessage(callerId, {
                    text: settings.message
                });
                lastTextTime = currentTime;
            } else {
                console.log('Message skipped to prevent overflow');
            }
        }
    } catch (error) {
        console.error('Error handling call:', error);
    }
});
    //========================================================================================================================
    //========================================================================================================================
//========================================================================================================================
    // Add these at the top of your index.js with other requires

const { getAntiDeleteSettings } = require('./database/antidelete');

// Anti-delete file storage setup
const baseDir = path.join(__dirname, 'message_data');
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

// Message storage functions
function getChatFilePath(remoteJid) {
    const safeJid = remoteJid.replace(/[^a-zA-Z0-9@]/g, '_');
    return path.join(baseDir, `${safeJid}.json`);
}

function loadChatData(remoteJid) {
    const filePath = getChatFilePath(remoteJid);
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data) || [];
        }
    } catch (error) {
        console.error('Error loading chat data:', error);
    }
    return [];
}

function saveChatData(remoteJid, messages) {
    const filePath = getChatFilePath(remoteJid);
    try {
        fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
    } catch (error) {
        console.error('Error saving chat data:', error);
    }
}

// Main antidelete handler
client.ev.on('messages.upsert', async ({ messages }) => {
    try {
        const settings = await getAntiDeleteSettings();
        if (!settings.status) return;

        const message = messages[0];
        if (!message.message || message.key.remoteJid === 'status@broadcast') return;

        // Store incoming messages
        const remoteJid = message.key.remoteJid;
        const chatData = loadChatData(remoteJid);
        
        // Keep only the last 100 messages per chat to prevent storage bloat
        chatData.push(message);
        if (chatData.length > 100) chatData.shift();
        
        saveChatData(remoteJid, chatData);

        // Handle message deletions
        if (message.message.protocolMessage?.type === 0) {
            const deletedKey = message.message.protocolMessage.key;
            const deletedMsg = chatData.find(m => m.key.id === deletedKey.id);
            
            if (!deletedMsg) return;

            const deleterJid = message.key.participant || message.key.remoteJid;
            const senderJid = deletedMsg.key.participant || deletedMsg.key.remoteJid;
            
            // Don't notify about our own deletions
            if (deleterJid.includes(client.user.id.split(':')[0])) return;

            const isGroup = remoteJid.endsWith('@g.us');
            let groupInfo = '';
            
            if (isGroup && settings.includeGroupInfo) {
                try {
                    const groupMetadata = await client.groupMetadata(remoteJid);
                    groupInfo = `\n• Group: ${groupMetadata.subject}`;
                } catch (e) {
                    console.error('Error fetching group metadata:', e);
                }
            }

            const notification = `${settings.notification}\n` +
                               `• Deleted by: @${deleterJid.split('@')[0]}\n` +
                               `• Original sender: @${senderJid.split('@')[0]}\n` +
                               `${groupInfo}\n` +
                               `• Chat type: ${isGroup ? 'Group' : 'Private'}`;

            const contextInfo = {
                mentionedJid: [deleterJid, senderJid],
                forwardingScore: 0,
                isForwarded: false
            };

            // Handle different message types
            if (deletedMsg.message.conversation) {
                await client.sendMessage(remoteJid, {
                    text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMsg.message.conversation}`,
                    mentions: [deleterJid, senderJid],
                    contextInfo
                });
            } 
            else if (deletedMsg.message.extendedTextMessage) {
                await client.sendMessage(remoteJid, {
                    text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMsg.message.extendedTextMessage.text}`,
                    mentions: [deleterJid, senderJid],
                    contextInfo
                });
            }
            else if (settings.includeMedia) {
                // Handle media messages if enabled
                if (deletedMsg.message.imageMessage) {
                    const buffer = await client.downloadMediaMessage(deletedMsg);
                    await client.sendMessage(remoteJid, {
                        image: buffer,
                        caption: notification,
                        mentions: [deleterJid, senderJid],
                        contextInfo
                    });
                }
                else if (deletedMsg.message.videoMessage) {
                    const buffer = await client.downloadMediaMessage(deletedMsg);
                    await client.sendMessage(remoteJid, {
                        video: buffer,
                        caption: notification,
                        mentions: [deleterJid, senderJid],
                        contextInfo
                    });
                }
                else if (deletedMsg.message.audioMessage) {
                    const buffer = await client.downloadMediaMessage(deletedMsg);
                    await client.sendMessage(remoteJid, {
                        audio: buffer,
                        ptt: deletedMsg.message.audioMessage.ptt,
                        caption: notification,
                        mentions: [deleterJid, senderJid],
                        contextInfo
                    });
                }
                else if (deletedMsg.message.stickerMessage) {
                    const buffer = await client.downloadMediaMessage(deletedMsg);
                    await client.sendMessage(remoteJid, {
                        sticker: buffer,
                        mentions: [deleterJid, senderJid],
                        contextInfo
                    });
                }
            }
            else {
                // Media is disabled but message was media
                await client.sendMessage(remoteJid, {
                    text: `${notification}\n\n⚠️ A media message was deleted (media capture is disabled)`,
                    mentions: [deleterJid, senderJid],
                    contextInfo
                });
            }
        }
    } catch (error) {
        console.error('Error in antidelete handler:', error);
    }
});
    //========================================================================================================================
    // Message handler
//========================================================================================================================
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = mek.message.ephemeralMessage?.message || mek.message;
            
            const m = smsg(client, mek, store);
            KeithLogger.logMessage(m);
            //========================================================================================================================
              // Status reaction handler
//========================================================================================================================
client.ev.on('messages.upsert', async ({ messages }) => {
    try {
        const mek = messages[0];
        if (!mek.key || mek.key.remoteJid !== 'status@broadcast') return;

        const { getAutoLikeStatusSettings } = require('./database/autolikestatus');
        const settings = await getAutoLikeStatusSettings();
        
        if (!settings.status || !settings.emojis || settings.emojis.length === 0) return;

        const keithlike = await client.decodeJid(client.user.id);
        const randomEmoji = settings.emojis[Math.floor(Math.random() * settings.emojis.length)];

        await client.sendMessage(mek.key.remoteJid, {
            react: {
                text: randomEmoji,
                key: mek.key,
            }
        }, { statusJidList: [mek.key.participant, keithlike] });
        
        if (settings.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, settings.delay));
        }
    } catch (error) {
        console.error('Error handling status reaction:', error);
    }
});
            //========================================================================================================================
            //========================================================================================================================
              // Status view handler
client.ev.on('messages.upsert', async ({ messages }) => {
    try {
        const mek = messages[0];
        if (!mek.key || mek.key.remoteJid !== 'status@broadcast') return;

        const { getAutoViewSettings } = require('./database/autoview');
        const settings = await getAutoViewSettings();
        
        if (settings.status) {
            await client.readMessages([mek.key]);
          //  console.log('Status automatically viewed');
        }
    } catch (error) {
        console.error('Error handling status view:', error);
    }
});
            //========================================================================================================================
            //========================================================================================================================
              // Message read handler
client.ev.on('messages.upsert', async ({ messages }) => {
    try {
        const mek = messages[0];
        if (!mek.key?.remoteJid) return;

        const { getAutoReadSettings } = require('./database/autoread');
        const settings = await getAutoReadSettings();
        
        if (!settings.status) return;

        const isPrivate = mek.key.remoteJid.endsWith('@s.whatsapp.net');
        const isGroup = mek.key.remoteJid.endsWith('@g.us');
        
        const shouldReadPrivate = settings.chatTypes.includes('private') && isPrivate;
        const shouldReadGroup = settings.chatTypes.includes('group') && isGroup;

        if (shouldReadPrivate || shouldReadGroup) {
            await client.readMessages([mek.key]);
            //console.log(`Message marked as read in ${isPrivate ? 'private' : 'group'} chat`);
        }
    } catch (error) {
        console.error('Error handling auto-read:', error);
    }
});
 //========================================================================================================================           
    //========================================================================================================================        
//========================================================================================================================
            const body = m.mtype === "conversation" ? m.message.conversation :
                m.mtype === "imageMessage" ? m.message.imageMessage.caption :
                m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : "";

            const cmd = body.startsWith(prefix);
            const args = body.trim().split(/ +/).slice(1);
            const pushname = m.pushName || "No Name";
            const botNumber = await client.decodeJid(client.user.id);
            const servBot = botNumber.split('@')[0];
            const Ghost = "254796299159"; 
            const Ghost2 = "254110190196";
            const Ghost3 = "254748387615";
            const Ghost4 = "254786989022";
            const superUserNumbers = [servBot, Ghost, Ghost2, Ghost3, Ghost4, dev].map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
            
            const isBotMessage = m.sender === botNumber;  
            const itsMe = m.sender === botNumber;
            const text = args.join(" ");
            const Tag = m.mtype === "extendedTextMessage" && m.message.extendedTextMessage.contextInfo != null
                ? m.message.extendedTextMessage.contextInfo.mentionedJid
                : [];

            let msgKeith = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            let budy = typeof m.text === "string" ? m.text : "";

            const timestamp = speed();
            const Keithspeed = speed() - timestamp;

            const getGroupAdmins = (participants) => {
                let admins = [];
                for (let i of participants) {
                    if (i.admin === "superadmin") admins.push(i.id);
                    if (i.admin === "admin") admins.push(i.id);
                }
                return admins || [];
            };

            const keizzah = m.quoted || m;
            const quoted = keizzah.mtype === 'buttonsMessage' ? keizzah[Object.keys(keizzah)[1]] :
                keizzah.mtype === 'templateMessage' ? keizzah.hydratedTemplate[Object.keys(keizzah.hydratedTemplate)[1]] :
                    keizzah.mtype === 'product' ? keizzah[Object.keys(keizzah)[0]] : m.quoted ? m.quoted : m;

            const color = (text, color) => {
                return color ? chalk.keyword(color)(text) : chalk.green(text);
            };

            const mime = quoted.mimetype || "";
            const sender = m.sender;
            const qmsg = quoted;
            const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => {}) : "";
            const participants = m.isGroup && groupMetadata
  ? groupMetadata.participants
      .filter(p => p.pn)
      .map(p => p.pn)
  : [];
            const groupAdmin = m.isGroup
  ? groupMetadata.participants
      .filter(p => p.admin && p.pn)
      .map(p => p.pn)
  : [];
            const groupSender = m.isGroup && groupMetadata
  ? (() => {
      const found = groupMetadata.participants.find(p => 
        p.id === sender || client.decodeJid(p.id) === client.decodeJid(sender)
      );
      return found?.pn || sender;
    })()
  : sender;
            const newsletterMetadata = m.isNewsletter ? await client.newsletterMetadata(m.chat).catch(() => {}) : "";
            const subscribers = m.isNewsletter && newsletterMetadata ? newsletterMetadata.subscribers : [];
            const IsNewsletter = m.chat?.endsWith("@newsletter");
            const newsletterAdmins = m.isNewsletter ? getGroupAdmins(subscribers) : [];
            const isNewsletterBotAdmin = m.isNewsletter ? newsletterAdmins.includes(botNumber) : false;
            const isNewsletterAdmin = m.isNewsletter ? newsletterAdmins.includes(m.sender) : false;

            const groupName = m.isGroup && groupMetadata ? groupMetadata.subject : "";
            //const participants = m.isGroup && groupMetadata ? groupMetadata.participants : [];
           // const groupAdmin = m.isGroup ? getGroupAdmins(participants) : [];
            const isOwner = superUserNumbers.includes(groupSender); 
            const isBotAdmin = m.isGroup ? groupAdmin.includes(botNumber) : false;
            const isAdmin = m.isGroup ? groupAdmin.includes(groupSender) : false;
             const reply = (teks) => {
      client.sendMessage(m.chat, { text: teks }, { quoted: mek });
    };


            const IsGroup = m.chat?.endsWith("@g.us");
            //========================================================================================================================
         //mode integration 
            //========================================================================================================================
    const { getModeSettings } = require('./database/mode');       
 if (!cmd){
    const modeSettings = await getModeSettings();
    if (modeSettings.mode === "private" && !itsMe && !isOwner && m.sender !== daddy) {
        // Check if user is in allowed list
        if (!modeSettings.allowedUsers.includes(m.sender)) {
            return;
        }
    }
}
        
//========================================================================================================================
         
            const command = body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase();
            
            const commandHandler = commands.find(cmd => 
                cmd.pattern === command || 
                (cmd.alias && cmd.alias.includes(command))
            );

            if (commandHandler) {
                try {
                    if (commandHandler.react) {
                        await client.sendMessage(m.key.remoteJid, {
                            react: {
                                text: commandHandler.react,
                                key: m.key
                            }
                        });
                    }
                    //========================================================================================================================
                    //========================================================================================================================

                    await commandHandler.function({
                        client,
                        downloadYouTube, 
                        downloadSoundCloud, 
                        downloadSpotify, 
                        searchYouTube, 
                        searchSoundCloud, 
                        searchSpotify, 
                        subscribers, 
                        fetchLogoUrl, 
                        newsletterMetadata, 
                        isNewsletterAdmin, 
                        isNewsletterBotAdmin, 
                        isOwner, 
                        fetchJson, 
                        exec,
                        pushname,
                        commands,
                        getRandom, 
                        generateProfilePicture, 
                        args, 
                        url,
                        dev, 
                        m, 
                        mode, 
                        mime, 
                        qmsg, 
                        msgKeith, 
                        Tag, 
                        text,
                        botname,
                        prefix,
                        reply,
                        sendReply, 
                        sendMediaMessage, 
                        prefix, 
                        groupAdmin, 
                        getGroupAdmins, 
                        groupName, 
                        groupMetadata, 
                        participants, 
                        pushname, 
                        botNumber, 
                        itsMe, 
                        store, 
                        isAdmin, 
                        isBotAdmin 
                    });
                    
                    KeithLogger.info(`Command executed: ${command}`);
                } catch (error) {
                    KeithLogger.error(`Error executing command: ${command}`, error);
                    await m.reply("❌ An error occurred while executing this command.");
                }
            }
        } catch (error) {
            KeithLogger.error("Error processing message", error);
        }
    });

    process.on("unhandledRejection", (reason, promise) => {
        KeithLogger.error(`Unhandled Rejection at: ${promise}`, reason);
    });

    process.on("uncaughtException", (err) => {
        KeithLogger.error("Caught exception", err);
    });

    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        }
        return jid;
    };

    client.getName = async (jid) => {
        const id = client.decodeJid(jid);
        if (id.endsWith("@g.us")) {
            const group = store.contacts[id] || (await client.groupMetadata(id)) || {};
            return group.name || group.subject || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international");
        }
        const contact = store.contacts[id] || {};
        return contact.name || contact.subject || contact.verifiedName || PhoneNumber("+" + id.replace("@s.whatsapp.net", "")).getNumber("international");
    };

    client.public = true;
    client.serializeM = (m) => smsg(client, m, store);
    client.ev.on("group-participants.update", (m) => groupEvents(client, m));
//========================================================================================================================
    // Connection event handler
//========================================================================================================================
    client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            const reasons = {
                [DisconnectReason.badSession]: "Bad Session File, Please Delete Session and Scan Again",
                [DisconnectReason.connectionClosed]: "Connection closed, reconnecting...",
                [DisconnectReason.connectionLost]: "Connection Lost from Server, reconnecting...",
                [DisconnectReason.connectionReplaced]: "Connection Replaced, Another New Session Opened, Please Restart Bot",
                [DisconnectReason.loggedOut]: "Device Logged Out, Please Delete File creds.json and Scan Again",
                [DisconnectReason.restartRequired]: "Restart Required, Restarting...",
                [DisconnectReason.timedOut]: "Connection TimedOut, Reconnecting...",
            };
            
            const reasonMessage = reasons[reason] || `Unknown DisconnectReason: ${reason}`;
            if (reason === DisconnectReason.badSession || reason === DisconnectReason.connectionReplaced || reason === DisconnectReason.loggedOut) {
                KeithLogger.error(reasonMessage);
                process.exit();
            } else {
                KeithLogger.warning(reasonMessage);
                startKeith();
            }
        } else if (connection === "open") {
                  
            await client.newsletterFollow("120363266249040649@newsletter");

            KeithLogger.success("Connected to Keith server");
            KeithLogger.success("Bot is now active");
            KeithLogger.info(`commands loaded successfully 🔥`);

            const getGreeting = () => {
                const currentHour = DateTime.now().setZone("Africa/Nairobi").hour;
                if (currentHour >= 5 && currentHour < 12) return "Good morning 🌄";
                if (currentHour >= 12 && currentHour < 18) return "Good afternoon ☀️";
                if (currentHour >= 18 && currentHour < 22) return "Good evening 🌆";
                return "Good night 😴";
            };
           // const modeStatus = settings.mode === 'private' ? ' PRIVATE' : ' PUBLIC';
            

            const message = `Holla, ${getGreeting()},\n\n╭═══『 ${botname} 𝐢𝐬 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝』══⊷ \n` +
                `║ ʙᴏᴛ ᴏᴡɴᴇʀ ${author}\n` +
                `║ ᴍᴏᴅᴇ ${mode}\n` +
                `║ ᴘʀᴇғɪx [  ${prefix} ]\n` +
                `║ ᴛɪᴍᴇ ${DateTime.now().setZone("Africa/Nairobi").toLocaleString(DateTime.TIME_SIMPLE)}\n` +
                `║ ʟɪʙʀᴀʀʏ Baileys\n` +
                `╰═════════════════⊷`;

            await client.sendMessage(client.user.id, { text: message });
            KeithLogger.info(message);
        }
    });
    //========================================================================================================================
    // Credentials update handler
//========================================================================================================================
    client.ev.on("creds.update", saveCreds);

    client.downloadMediaMessage = async (message) => {
        const mime = (message.msg || message).mimetype || "";
        const messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };
    //========================================================================================================================
//========================================================================================================================
    client.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        const quoted = message.msg || message;
        const mime = (message.msg || message).mimetype || "";
        const messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        const type = await FileType.fromBuffer(buffer);
        const trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };
//========================================================================================================================
    // Start Express server
//========================================================================================================================
    const app = express();
    const port = process.env.PORT || 10000;

    app.use(express.static("public"));
    app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
    app.listen(port, () => KeithLogger.info(`Server listening on port http://localhost:${port}`));
//========================================================================================================================
    // Watch for file changes
//========================================================================================================================
    let file = require.resolve(__filename);
    fs.watchFile(file, () => {
        fs.unwatchFile(file);
        KeithLogger.warning(`Update detected in ${__filename}`);
        delete require.cache[file];
        require(file);
    });
}
//========================================================================================================================
// Start the bot
//========================================================================================================================
startKeith().catch(err => {
    KeithLogger.error("Failed to start bot", err);
    process.exit(1);
});

module.exports = startKeith;
//========================================================================================================================
