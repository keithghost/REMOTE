const fs = require('fs');
const zlib = require('zlib');
const { session } = require("./settings");
const chalk = require('chalk');
const path = require('path');

// Custom chalk colors
const keithPurple = chalk.hex('#A020F0');
const keithBlue = chalk.hex('#1DA1F2');
const keithPink = chalk.hex('#FF69B4');
const keithGreen = chalk.hex('#2ECC71');
const keithOrange = chalk.hex('#FFA500');
const keithGold = chalk.hex('#FFD700');
const keithRed = chalk.hex('#E74C3C');
const keithYellow = chalk.hex('#F1C40F');

// Unicode symbols
const BOT_SYMBOL = '✦';
const MESSAGE_SYMBOL = '✉';
const USER_SYMBOL = '👤';
const GROUP_SYMBOL = '👥';
const TYPE_SYMBOL = '📋';
const CONTENT_SYMBOL = '📝';
const ERROR_SYMBOL = '⚠️';
const SUCCESS_SYMBOL = '✅';
const WARNING_SYMBOL = '⚠️';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Enhanced logger class
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

authenticationn();

const {
    default: KeithConnect, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent,
    generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, useMultiFileAuthState,
    DisconnectReason, makeInMemoryStore, downloadContentFromMessage, jidDecode
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const { Boom } = require("@hapi/boom");
const FileType = require("file-type");
const { exec } = require("child_process");
const express = require("express");
const { DateTime } = require("luxon");
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

const { downloadYouTube, downloadSoundCloud, downloadSpotify, searchYouTube, searchSoundCloud, searchSpotify } = require("./lib/dl");
const ytmp3 = require("./lib/ytmp3");
const { commands, totalCommands } = require("./commandHandler");

const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./lib/exif");
const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
const daddy = "254748387615@s.whatsapp.net";

const {
    autoview, autostatusreply, autostatusmsg, permit, autoread, botname, chatbot, timezone, autobio, mode, anticallmsg, reactemoji, prefix, presence,
    mycode, author, antibad, autodownloadstatus, packname, url, voicechatbot2, gurl, herokuAppname, greet, greetmsg, herokuapikey, anticall, dev, antilink, gcpresence, antibot, antitag, antidelete, autolike, voicechatbot
} = require("./settings");

const groupEvents = require("./groupEvents.js");
const axios = require("axios");
const googleTTS = require('google-tts-api');

const app = express();
const port = process.env.PORT || 10000;
// Initialize database tables

const { initAntiCallDB } = require('./database/anticall');
// Initialize database tables

const { initAutoBioDB } = require('./database/autobio');
// Initialize database tables

const { initAutoDownloadStatusDB } = require('./database/autodownloadstatus');

const { initAntiLinkDB } = require('./database/antilink');
// Initialize database tables

const { initAutoLikeStatusDB } = require('./database/autolikestatus');
// Initialize database tables
const { initAntiBadDB } = require('./database/antibad');
const { initAutoViewDB } = require('./database/autoview');
const { initAntiDeleteDB } = require('./database/antidelete');
const { initPresenceDB } = require('./database/presence');
// Initialize database tables


const { initAutoReadDB } = require('./database/autoread');
initAutoReadDB().catch(console.error);
initAutoViewDB().catch(console.error);
initAntiLinkDB().catch(console.error);
initAntiDeleteDB().catch(console.error);
//cleanupOldMessages().catch(console.error);
initAutoLikeStatusDB().catch(console.error);
initPresenceDB().catch(console.error);
initAntiBadDB().catch(console.error);
//initGroupDB().catch(console.error);
initAutoDownloadStatusDB().catch(console.error);

initAutoBioDB().catch(console.error);

initAntiCallDB().catch(console.error);

function groupeAdmin(membreGroupe) {
    let admin = [];
    for (m of membreGroupe) {
        if (m.admin == null) continue;
        admin.push(m.id);
    }
    return admin;
}

async function startKeith() {
    const { saveCreds, state } = await useMultiFileAuthState("session");
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
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return { conversation: "HERE" };
        },
    });

    store.bind(client.ev);
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
                console.log('Auto-bio updated:', settings.message);
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

// Call this after client is initialized
// startAutoBio(client);

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

    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = mek.message.ephemeralMessage?.message || mek.message;
            
            // Log the message
            const m = smsg(client, mek, store);
            KeithLogger.logMessage(m);

            const idBot = client.decodeJid(client.user.id);
            /*if (mek.key && mek.key.remoteJid === 'status@broadcast' && autodownloadstatus === "true") {
                if (mek.message.extendedTextMessage) {
                    const stTxt = mek.message.extendedTextMessage.text;
                    await client.sendMessage(idBot, { text: stTxt }, { quoted: mek });
                } else if (mek.message.imageMessage) {
                    const stMsg = mek.message.imageMessage.caption;
                    const stImg = await client.downloadAndSaveMediaMessage(mek.message.imageMessage);
                    await client.sendMessage(idBot, { image: { url: stImg }, caption: stMsg }, { quoted: mek });
                } else if (mek.message.videoMessage) {
                    const stMsg = mek.message.videoMessage.caption;
                    const stVideo = await client.downloadAndSaveMediaMessage(mek.message.videoMessage);
                    await client.sendMessage(idBot, {
                        video: { url: stVideo }, caption: stMsg
                    }, { quoted: mek });
                }
            }*/
            // Status download handler
client.ev.on('messages.upsert', async ({ messages }) => {
    try {
        const mek = messages[0];
        if (!mek.key || mek.key.remoteJid !== 'status@broadcast') return;

        const { getAutoDownloadStatusSettings } = require('./database/autodownloadstatus');
        const settings = await getAutoDownloadStatusSettings();
        
        if (!settings.status || !settings.targetChat) return;

        const targetChat = settings.targetChat === 'me' ? m.sender : settings.targetChat;

        if (mek.message.extendedTextMessage) {
            const stTxt = mek.message.extendedTextMessage.text;
            await client.sendMessage(targetChat, { text: stTxt }, { quoted: mek });
        } 
        else if (mek.message.imageMessage) {
            const stMsg = mek.message.imageMessage.caption;
            const stImg = await client.downloadAndSaveMediaMessage(mek.message.imageMessage);
            await client.sendMessage(targetChat, 
                { image: { url: stImg }, caption: stMsg }, 
                { quoted: mek }
            );
        } 
        else if (mek.message.videoMessage) {
            const stMsg = mek.message.videoMessage.caption;
            const stVideo = await client.downloadAndSaveMediaMessage(mek.message.videoMessage);
            await client.sendMessage(targetChat, 
                { video: { url: stVideo }, caption: stMsg }, 
                { quoted: mek }
            );
        }
    } catch (error) {
        console.error('Error handling status download:', error);
    }
});
            // Status reaction handler
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
            // Presence update handler
client.ev.on('presence.update', async ({ id, presences }) => {
    try {
        const { getPresenceSettings } = require('./database/presence');
        const settings = await getPresenceSettings();
        
        const jid = id;
        let chatType;
        
        if (jid.endsWith('@s.whatsapp.net')) {
            chatType = 'private';
        } else if (jid.endsWith('@g.us')) {
            chatType = 'group';
        } else {
            return;
        }

        if (!settings.chatTypes.includes(chatType)) return;

        if (settings.typing) {
            await client.sendPresenceUpdate('composing', jid);
        } else if (settings.recording) {
            await client.sendPresenceUpdate('recording', jid);
        } else if (settings.online) {
            await client.sendPresenceUpdate('available', jid);
        } else {
            await client.sendPresenceUpdate('unavailable', jid);
        }
    } catch (error) {
        console.error('Presence update error:', error.message);
    }
});
            
            if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

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
            const isOwner = superUserNumbers.includes(m.sender); 
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
            const qmsg = quoted;
            const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat).catch(() => {}) : "";
            const newsletterMetadata = m.isNewsletter ? await client.newsletterMetadata(m.chat).catch(() => {}) : "";
            const subscribers = m.isNewsletter && newsletterMetadata ? newsletterMetadata.subscribers : [];
            const IsNewsletter = m.chat?.endsWith("@newsletter");
            const newsletterAdmins = m.isNewsletter ? getNewsletterAdmins(subscribers) : [];
            const isNewsletterBotAdmin = m.isNewsletter ? newsletterAdmins.includes(botNumber) : false;
            const isNewsletterAdmin = m.isNewsletter ? newsletterAdmins.includes(m.sender) : false;

            const groupName = m.isGroup && groupMetadata ? groupMetadata.subject : "";
            const participants = m.isGroup && groupMetadata ? groupMetadata.participants : [];
            const groupAdmin = m.isGroup ? getGroupAdmins(participants) : [];
            const isBotAdmin = m.isGroup ? groupAdmin.includes(botNumber) : false;
            const isAdmin = m.isGroup ? groupAdmin.includes(m.sender) : false;

            const IsGroup = m.chat?.endsWith("@g.us");
            // At top of file
const userWarnings = new Map();

client.ev.on('messages.upsert', async ({ messages }) => {
    try {
        const m = messages[0];
        if (!m.message || !m.key) return;

        const { getAntiBadSettings } = require('./database/antibad');
        const settings = await getAntiBadSettings();
        
        if (!settings.status || !settings.forbiddenWords.length) return;

        const body = m.message.conversation || 
                    m.message.extendedTextMessage?.text || 
                    m.message.imageMessage?.caption;
        if (!body) return;

        const containsBadWord = settings.forbiddenWords.some(word => 
            body.toLowerCase().includes(word.toLowerCase())
        );

        if (containsBadWord) {
            const sender = m.key.participant || m.key.remoteJid;
            const isGroup = m.key.remoteJid.endsWith('@g.us');
            
            // Always delete the message in groups
            if (isGroup) {
                try {
                    await client.sendMessage(m.key.remoteJid, {
                        delete: {
                            remoteJid: m.key.remoteJid,
                            fromMe: false,
                            id: m.key.id,
                            participant: sender
                        }
                    });
                } catch (deleteError) {
                    console.error('Failed to delete message:', deleteError);
                }
            }

            if (isGroup) {
                const groupMetadata = await client.groupMetadata(m.key.remoteJid);
                const isBotAdmin = groupMetadata.participants.find(p => p.id === client.user.id)?.admin !== undefined;
                const isUserAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin !== undefined;

                if (settings.groupAction === 'warn') {
                    // Warn system with limits
                    const warnings = (userWarnings.get(sender) || 0) + 1;
                    userWarnings.set(sender, warnings);

                    const warningMsg = `🚫 Bad word detected (${warnings}/${settings.warnLimit})\n\n@${sender.split('@')[0]}, this is warning ${warnings} of ${settings.warnLimit}!`;
                    
                    await client.sendMessage(
                        m.key.remoteJid, 
                        { 
                            text: warningMsg,
                            contextInfo: { mentionedJid: [sender] }
                        }, 
                        { quoted: m }
                    );

                    if (warnings >= settings.warnLimit && isBotAdmin && !isUserAdmin) {
                        await client.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
                        userWarnings.delete(sender);
                    }
                } 
                else if (settings.groupAction === 'remove' && isBotAdmin && !isUserAdmin) {
                    // Immediate remove
                    await client.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
                }
            } 
            else {
                // Private chat - always block
                await client.sendMessage(
                    sender,
                    { text: '🚫 You have been blocked for using banned words!' }
                );
                await client.updateBlockStatus(sender, 'block');
            }
        }
    } catch (error) {
        console.error('Anti-bad word error:', error);
    }
});


            if (cmd && mode === "private" && !itsMe && m.sender !== daddy) return;
            
            try {
                const Blocked = await client.fetchBlocklist();
                if (cmd && m.isGroup && Blocked?.includes(m.sender)) {
                    await m.reply("You are blocked from using bot commands.");
                    return;
                }

                if (m.chat.endsWith('@s.whatsapp.net') && cmd && permit === 'true' && !isOwner) {
                    await m.reply("You have no access to commands here. ❌");
                    return;
                }
            } catch (error) {
                KeithLogger.error("Error processing command permissions", error);
            }

            const command = cmd ? body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase() : null;
            if (command) {
                const commandObj = commands[command];
                if (commandObj) {
                    try {
                        await commandObj.execute({ 
                            downloadYouTube, downloadSoundCloud, downloadSpotify, 
                            searchYouTube, searchSoundCloud, searchSpotify, 
                            subscribers, fetchLogoUrl, newsletterMetadata, 
                            isNewsletterAdmin, isNewsletterBotAdmin, isOwner, 
                            anticall, fetchJson, exec, getRandom, 
                            generateProfilePicture, args, dev, client, m, 
                            mode, mime, qmsg, msgKeith, Tag, 
                            generateProfilePicture, text, totalCommands, botname, 
                            url, sendReply, sendMediaMessage, gurl, prefix, 
                            groupAdmin, getGroupAdmins, groupName, groupMetadata, 
                            herokuAppname, herokuapikey, packname, author, 
                            participants, pushname, botNumber, itsMe, store, 
                            isAdmin, isBotAdmin 
                        });
                        KeithLogger.info(`Command executed: ${command}`);
                    } catch (error) {
                        KeithLogger.error(`Error executing command: ${command}`, error);
                    }
                }
            }
        } catch (err) {
            KeithLogger.error("Error processing message", err);
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
            KeithLogger.info(`Loaded ${totalCommands} commands`);

            const getGreeting = () => {
                const currentHour = DateTime.now().setZone("Africa/Nairobi").hour;
                if (currentHour >= 5 && currentHour < 12) return "Good morning 🌄";
                if (currentHour >= 12 && currentHour < 18) return "Good afternoon ☀️";
                if (currentHour >= 18 && currentHour < 22) return "Good evening 🌆";
                return "Good night 😴";
            };

            const message = `Holla, ${getGreeting()},\n\n╭═══『 ${botname} 𝐢𝐬 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝』══⊷ \n` +
                `║ ʙᴏᴛ ᴏᴡɴᴇʀ ${author}\n` +
                `║ ᴍᴏᴅᴇ ${mode}\n` +
                `║ ᴘʀᴇғɪx [  ${prefix} ]\n` +
                `║ ᴛᴏᴛᴀʟ ᴘʟᴜɢɪɴs ${totalCommands}\n` +
                `║ ᴛɪᴍᴇ ${DateTime.now().setZone("Africa/Nairobi").toLocaleString(DateTime.TIME_SIMPLE)}\n` +
                `║ ʟɪʙʀᴀʀʏ Baileys\n` +
                `╰═════════════════⊷`;

            await client.sendMessage(client.user.id, { text: message });
            KeithLogger.info(message);
        }
    });

    client.ev.on("creds.update", saveCreds);

    client.sendText = (jid, text, quoted = "", options) => client.sendMessage(jid, { text, ...options }, { quoted });

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
}

app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));
app.listen(port, () => KeithLogger.info(`Server listening on port http://localhost:${port}`));

startKeith();

module.exports = startKeith;

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    KeithLogger.warning(`Update detected in ${__filename}`);
    delete require.cache[file];
    require(file);
});
