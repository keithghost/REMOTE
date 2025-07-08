//========================================================================================================================
const fs = require('fs');
const zlib = require('zlib');
const { session } = require("./settings");
const chalk = require('chalk');
const path = require('path');
const { DateTime } = require("luxon");
const permit = process.env.PERMIT || 'true';
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const { useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const FileType = require("file-type");
const { exec } = require("child_process");
const express = require("express");
const util = require("util");
const speed = require("performance-now");
const { smsg } = require('./lib/smsg');
const makeInMemoryStore = require('./lib/store');
const fetchLogoUrl = require('./lib/ephoto');
const {
    formatp, tanggal, formatDate, getTime, sleep, clockString,
    fetchJson, getBuffer, jsonformat, antispam, generateProfilePicture, parseMention,
    getRandom, fetchBuffer,
} = require("./lib/botFunctions.js");

const KeithLogger = require('./logger');
const { sendReply, sendMediaMessage } = require("./lib/context");
const daddy = "254748387615@s.whatsapp.net";
const { downloadYouTube, downloadSoundCloud, downloadSpotify, searchYouTube, searchSoundCloud, searchSpotify } = require("./lib/dl");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./lib/exif");

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
const { dev, botname, prefix, author, timezone, mode, url } = require('./settings');

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
const { initAntiCallDB } = require('./database/anticall');
const { initAutoBioDB } = require('./database/autobio');
const { initAutoLikeStatusDB } = require('./database/autolikestatus');
const { initAntiBadDB } = require('./database/antibad');
const { initAutoViewDB } = require('./database/autoview');
const { initPresenceDB } = require('./database/presence');
const { initAutoReadDB } = require('./database/autoread');
const { initAntiDeleteDB, getAntiDeleteSettings } = require('./database/antidelete');
const { initChatbotDB } = require('./database/chatbot');
const { initGreetDB } = require('./database/greet');
const { initGroupEventsDB, getGroupEventsSettings } = require('./database/groupevents');
const { initAutoDownloadStatusDB } = require('./database/autodownloadstatus');
const { initAntiLinkDB } = require('./database/antilink');
//const { initAntiMentionDB } = require('./database/antimention');

//========initialization================================================================================================================

//initAntiMentionDB().catch(console.error);
initAutoDownloadStatusDB().catch(console.error);
initAutoReadDB().catch(console.error);
initAutoViewDB().catch(console.error);
initAntiLinkDB().catch(console.error);
initAntiDeleteDB().catch(console.error);
initChatbotDB().catch(console.error);
initGreetDB().catch(console.error);
initGroupEventsDB().catch(console.error);
initAutoLikeStatusDB().catch(console.error);
initAntiBadDB().catch(console.error);
initPresenceDB().catch(console.error);
initAutoBioDB().catch(console.error);
initAntiCallDB().catch(console.error);

//========================================================================================================================
// Main bot function
async function startKeith() {
    await authenticationn();
    loadAllCommands();

    const { state, saveCreds } = await useMultiFileAuthState("session");
    const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
    
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
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg.message || undefined;
            }
            return { conversation: "HERE" };
        },
    });

    store.bind(client.ev);

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
    // Call handler
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
// Message storage setup
//========================================================================================================================
const baseDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
}

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

async function sendDeletedMessageNotification(client, settings, {
    remoteJid,
    deleterJid,
    senderJid,
    isGroup,
    deletedMsg,
    groupInfo = ''
}) {
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

    const targetJid = settings.sendToOwner ? 
        (client?.dev || client.user.id.split(':')[0] + '@s.whatsapp.net') : 
        remoteJid;

    if (deletedMsg.message.conversation) {
        await client.sendMessage(targetJid, {
            text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMsg.message.conversation}`,
            mentions: [deleterJid, senderJid],
            contextInfo
        });
    } 
    else if (deletedMsg.message.extendedTextMessage) {
        await client.sendMessage(targetJid, {
            text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMsg.message.extendedTextMessage.text}`,
            mentions: [deleterJid, senderJid],
            contextInfo
        });
    }
    else if (settings.includeMedia) {
        try {
            if (deletedMsg.message.imageMessage) {
                const buffer = await client.downloadAndSaveMediaMessage(deletedMsg.message.imageMessage);
                await client.sendMessage(targetJid, {
                    image: { url: buffer },
                    caption: notification,
                    mentions: [deleterJid, senderJid],
                    contextInfo
                });
            }
            else if (deletedMsg.message.videoMessage) {
                const buffer = await client.downloadAndSaveMediaMessage(deletedMsg.message.videoMessage);
                await client.sendMessage(targetJid, {
                    video: { url: buffer },
                    caption: notification,
                    mentions: [deleterJid, senderJid],
                    contextInfo
                });
            }
            else if (deletedMsg.message.audioMessage) {
                const buffer = await client.downloadAndSaveMediaMessage(deletedMsg.message.audioMessage);
                await client.sendMessage(targetJid, {
                    audio: { url: buffer },
                    ptt: deletedMsg.message.audioMessage.ptt,
                    caption: notification,
                    mentions: [deleterJid, senderJid],
                    contextInfo
                });
            }
            else if (deletedMsg.message.stickerMessage) {
                const buffer = await client.downloadAndSaveMediaMessage(deletedMsg.message.stickerMessage);
                await client.sendMessage(targetJid, {
                    sticker: { url: buffer },
                    mentions: [deleterJid, senderJid],
                    contextInfo
                });
            }
        } catch (mediaError) {
            console.error('Error processing media message:', mediaError);
            await client.sendMessage(targetJid, {
                text: `${notification}\n\n⚠️ A media message was deleted but could not be retrieved`,
                mentions: [deleterJid, senderJid],
                contextInfo
            });
        }
    }
    else {
        await client.sendMessage(targetJid, {
            text: `${notification}\n\n⚠️ A media message was deleted (media capture is disabled)`,
            mentions: [deleterJid, senderJid],
            contextInfo
        });
    }
}

client.ev.on('messages.upsert', async ({ messages }) => {
    try {
        const settings = await getAntiDeleteSettings();
        if (!settings.status) return;

        const message = messages[0];
        if (!message.message || message.key.remoteJid === 'status@broadcast') return;

        const remoteJid = message.key.remoteJid;
        const chatData = loadChatData(remoteJid);
        
        // Store the entire message object including media info
        chatData.push(JSON.parse(JSON.stringify(message)));
        if (chatData.length > 100) chatData.shift();
        
        saveChatData(remoteJid, chatData);

        if (message.message.protocolMessage?.type === 0) {
            const deletedKey = message.message.protocolMessage.key;
            const deletedMsg = chatData.find(m => m.key.id === deletedKey.id);
            
            if (!deletedMsg) return;

            const deleterJid = message.key.participant || message.key.remoteJid;
            const senderJid = deletedMsg.key.participant || deletedMsg.key.remoteJid;
            
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

            await sendDeletedMessageNotification(client, settings, {
                remoteJid,
                deleterJid,
                senderJid,
                isGroup,
                deletedMsg,
                groupInfo
            });
        }
    } catch (error) {
        console.error('Error in antidelete handler:', error);
    }
});
//========================================================================================================================    
//========================================================================================================================
client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            mek.message = mek.message.ephemeralMessage?.message || mek.message;
            
            const m = smsg(client, mek, store);
            KeithLogger.logMessage(m);

    
//========================================================================================================================
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                try {
                    const { getAutoLikeStatusSettings } = require('./database/autolikestatus');
                    const settings = await getAutoLikeStatusSettings();
                    
                    if (settings.status && settings.emojis && settings.emojis.length > 0) {
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
                    }
                } catch (error) {
                    console.error('Error handling status reaction:', error);
                }
            }
    
//========================================================================================================================            

              if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                try {
                    const { getAutoViewSettings } = require('./database/autoview');
                    const settings = await getAutoViewSettings();
                    
                    if (settings.status) {
                        await client.readMessages([mek.key]);
                    }
                } catch (error) {
                    console.error('Error handling status view:', error);
                }
              }
    
//========================================================================================================================
            
              if (mek.key?.remoteJid) {
                try {
                    const { getAutoReadSettings } = require('./database/autoread');
                    const settings = await getAutoReadSettings();
                    
                    if (settings.status) {
                        const isPrivate = mek.key.remoteJid.endsWith('@s.whatsapp.net');
                        const isGroup = mek.key.remoteJid.endsWith('@g.us');
                        
                        const shouldReadPrivate = settings.chatTypes.includes('private') && isPrivate;
                        const shouldReadGroup = settings.chatTypes.includes('group') && isGroup;

                        if (shouldReadPrivate || shouldReadGroup) {
                            await client.readMessages([mek.key]);
                        }
                    }
                } catch (error) {
                    console.error('Error handling auto-read:', error);
                }
              }
    
//========================================================================================================================           
const channelreact = process.env.CHANNEL_REACT || 'true';

if (channelreact === 'true' && mek.key && mek.key.remoteJid.includes('@newsletter')) {
    try {
        const keithlike = await client.decodeJid(client.user.id);
        const emojis = ['🙏', '👍', '😂', '😯', '😥'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        const delayMessage = 3000;
        
        await client.newsletterReactMessage(mek.key.remoteJid, {
            react: {
                text: randomEmoji,
                key: mek.key
            }
        });
        
        await sleep(delayMessage);
    } catch (error) {
        console.error('Error in channel auto-react:', error);
    }
}
            

    
//========================================================================================================================

    function saveUserJid(jid) {
        try {
            if (!jid) throw new Error("No JID provided");

            // Normalize JID
            const normalizedJid = jid.includes('@') ? jid : jid + '@s.whatsapp.net';

            // Validate JID
            const blockedSuffixes = ['@g.us', '@newsletter'];
            if (blockedSuffixes.some(suffix => normalizedJid.endsWith(suffix))) {
                throw new Error("Cannot save group or newsletter JIDs");
            }

            // Block broadcast JIDs except for specific patterns like status viewers
            const isBroadcastRoot = ['broadcast', 'status@broadcast'].includes(normalizedJid);
            if (normalizedJid.includes('broadcast') && !normalizedJid.endsWith('@s.whatsapp.net')) {
                throw new Error("Cannot save general broadcast JIDs");
            }

            // Read existing
            let userJids = [];
            try {
                const data = fs.readFileSync('./jids.json', 'utf-8');
                userJids = JSON.parse(data);
            } catch {
                userJids = [];
            }

            // Add if new
            if (!userJids.includes(normalizedJid)) {
                userJids.push(normalizedJid);
                fs.writeFileSync('./jids.json', JSON.stringify(userJids, null, 2));
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    }
//========================================================================================================================
    // Listener
//========================================================================================================================

    client.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        const remoteJid = m.key.remoteJid;
        const participant = m.key.participant;

        try {
            if (remoteJid === 'status@broadcast' && participant) {
                saveUserJid(participant);
            } else if (
                !remoteJid.endsWith('@g.us') &&
                !remoteJid.endsWith('@newsletter') &&
                !remoteJid.includes('broadcast')
            ) {
                saveUserJid(remoteJid);
            }
        } catch (e) {
            console.error(`JID saving failed: ${e.message}`);
        }
    });

    //========================================================================================================================    
    function standardizeJid(jid) {
        if (!jid) return '';
        try {
            jid = typeof jid === 'string' ? jid : 
                 (jid.decodeJid ? jid.decodeJid() : String(jid));
            jid = jid.split(':')[0].split('/')[0];
            if (!jid.includes('@')) {
                jid += '@s.whatsapp.net';
            } else if (jid.endsWith('@lid')) {
                return jid.toLowerCase();
            }
            return jid.toLowerCase();
        } catch (e) {
            console.error("JID standardization error:", e);
            return '';
        }
    }

    //========================================================================================================================            
    
            if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

            const body = (m.mtype === "conversation" ? m.message?.conversation :
             m.mtype === "imageMessage" ? m.message?.imageMessage?.caption :
             m.mtype === "extendedTextMessage" ? m.message?.extendedTextMessage?.text : "") || ""
            
            const cmd = typeof body === 'string' && body.startsWith(prefix);
            const args = cmd ? body.trim().split(/ +/).slice(1) : [];
            const pushname = m.pushName || "No Name";
            const botNumber = await client.decodeJid(client.user.id);
            const servBot = botNumber.split('@')[0];

            // Define admin numbers
            const Ghost = "225065362821143"; 
            const Ghost2 = "247566713258194";
            const Ghost3 = "254748387615";
            const Ghost4 = "254786989022";
            const { getAllSudoNumbers } = require("./database/sudo");  
            
            const sudo = await getAllSudoNumbers();
            
            // Standardize all admin numbers
            const superUserNumbers = [servBot, Ghost, Ghost2, Ghost3, Ghost4, dev]
                .map(v => standardizeJid(v))
                .filter(Boolean);
            const adminNumbers = superUserNumbers.concat(sudo);
            
            // Get sender's JID
            const senderJid = standardizeJid(m.sender);

            // Enhanced admin check
            function isUserAdmin(jid) {
                if (adminNumbers.includes(jid)) return true;
                
                // Handle LID cases
                const baseJid = jid.split('@')[0];
                return adminNumbers.some(adminJid => 
                    adminJid.split('@')[0] === baseJid
                );
            }

            const isOwner = isUserAdmin(senderJid);

            // Group-specific checks
            let groupMetadata = null;
            let isBotAdmin = false;
            let isAdmin = false;

            if (m.isGroup) {
                try {
                    groupMetadata = await client.groupMetadata(m.chat);
                    const participants = groupMetadata.participants || [];
                    
                    // Get all admins in the group
                    const groupAdmins = participants
                        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                        .map(p => standardizeJid(p.id));
                    
                    // Check if bot is admin
                    isBotAdmin = groupAdmins.includes(standardizeJid(botNumber));
                    
                    // Check if sender is admin
                    isAdmin = groupAdmins.includes(senderJid) || isOwner;
                    
                } catch (error) {
                    console.error("Error fetching group metadata:", error);
                }
            }

            // Message utilities
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
                return participants
                    .filter(p => p.admin === "superadmin" || p.admin === "admin")
                    .map(p => p.id);
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
            const from = m.chat;
            const qmsg = quoted;
            const participants = m.isGroup && groupMetadata
                ? groupMetadata.participants
                    .filter(p => p.pn)
                    .map(p => p.pn)
                : [];
            const groupAdmin = m.isGroup && groupMetadata
                ? getGroupAdmins(groupMetadata.participants)
                : [];
            const groupSender = m.isGroup && groupMetadata
                ? (() => {
                    const found = groupMetadata.participants.find(p => 
                        standardizeJid(p.id) === senderJid
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
            const reply = (teks) => {
                client.sendMessage(m.chat, { text: teks }, { quoted: m });
            };
            const sender2 = m.key.fromMe 
                            ? (client.user.id.split(':')[0] + '@s.whatsapp.net' || client.user.id) 
                            : (m.key.participant || m.key.remoteJid);            

            const IsGroup = m.chat?.endsWith("@g.us");
 //========================================================================================================================
if (mek.key?.remoteJid) {
    try {
        const { getPresenceSettings } = require('./database/presence');
        const presenceSettings = await getPresenceSettings();
        
        // Handle private chat presence
        if (mek.key.remoteJid.endsWith("@s.whatsapp.net") && presenceSettings.privateChat !== 'off') {
            const presenceType = 
                presenceSettings.privateChat === "online" ? "available" :
                presenceSettings.privateChat === "typing" ? "composing" :
                presenceSettings.privateChat === "recording" ? "recording" : 
                "unavailable";
            await client.sendPresenceUpdate(presenceType, mek.key.remoteJid);
        }
        
        // Handle group chat presence
        if (mek.key.remoteJid.endsWith("@g.us") && presenceSettings.groupChat !== 'off') {
            const presenceType = 
                presenceSettings.groupChat === "online" ? "available" :
                presenceSettings.groupChat === "typing" ? "composing" :
                presenceSettings.groupChat === "recording" ? "recording" : 
                "unavailable";
            await client.sendPresenceUpdate(presenceType, mek.key.remoteJid);
        }
    } catch (error) {
        console.error('Error handling presence:', error);
    }
}
//========================================================================================================================
//========================================================================================================================    
// Status handler
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
//========================================================================================================================
//========================================================================================================================     if (mek.key && mek.key.remoteJid === 'status@broadcast') {
   
//========================================================================================================================
            // Anti-bad word handler
//========================================================================================================================
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
//========================================================================================================================

// Add this with other imports
/*const { getAntiMentionSettings } = require('./database/antimention');

// In your message handler
if (m.message) {
    try {
        // Check for status mentions
        const isStatusMention = 
            m.message?.protocolMessage?.type === 'STATUS_MENTION_MESSAGE' ||
            m.message?.groupStatusMentionMessage?.message?.protocolMessage?.type === 'STATUS_MENTION_MESSAGE' ||
            m.message?.statusMentionMessage?.message?.protocolMessage?.type === 'STATUS_MENTION_MESSAGE';

        if (isStatusMention) {
            const settings = await getAntiMentionSettings();
            
            if (settings.status) {
                const sender = m.key.participant || m.key.remoteJid;
                const isGroup = m.key.remoteJid.endsWith('@g.us');

                // Always delete the message first if possible
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
                    console.error('Failed to delete status mention:', deleteError);
                }

                if (isGroup) {
                    const groupMetadata = await client.groupMetadata(m.key.remoteJid);
                    const isBotAdmin = groupMetadata.participants.find(p => p.id === client.user.id)?.admin !== undefined;
                    const isUserAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin !== undefined;

                    if (settings.groupAction === 'remove' && isBotAdmin && !isUserAdmin) {
                        await client.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
                        await client.sendMessage(
                            m.key.remoteJid, 
                            { 
                                text: `🚫 @${sender.split('@')[0]} has been removed for mentioning status.`,
                                contextInfo: { mentionedJid: [sender] }
                            }
                        );
                    } else {
                        await client.sendMessage(
                            m.key.remoteJid, 
                            { 
                                text: `⚠️ @${sender.split('@')[0]}, mentioning status is not allowed here!`,
                                contextInfo: { mentionedJid: [sender] }
                            }
                        );
                    }
                } else {
                    // Private chat handling
                    if (settings.privateAction === 'block') {
                        await client.sendMessage(
                            sender,
                            { text: '🚫 You have been blocked for mentioning status!' }
                        );
                        await client.updateBlockStatus(sender, 'block');
                    } else {
                        await client.sendMessage(
                            sender,
                            { text: '⚠️ Mentioning status is not allowed!' }
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error('Anti-mention error:', error);
    }
}*/
            
//========================================================================================================================
//========================================================================================================================
// Add this near your other imports
if (m.message) {
    try {
        const { getAntiLinkSettings } = require('./database/antilink');
        const settings = await getAntiLinkSettings();
        
        if (settings.status) {
            const body = m.message.conversation || 
                        m.message.extendedTextMessage?.text || 
                        m.message.imageMessage?.caption;
            
            if (body) {
                // Detect URLs in message
                const urlRegex = /(https?:\/\/[^\s]+)/gi;
                const urls = body.match(urlRegex);
                
                if (urls && urls.length > 0) {
                    const containsUnauthorizedLink = urls.some(url => {
                        try {
                            const domain = new URL(url).hostname.replace('www.', '');
                            return !settings.allowedDomains.some(allowed => 
                                domain.endsWith(allowed)
                            );
                        } catch {
                            return true; // Invalid URL format
                        }
                    });

                    if (containsUnauthorizedLink) {
                        const sender = m.key.participant || m.key.remoteJid;
                        const isGroup = m.key.remoteJid.endsWith('@g.us');
                        
                        // Always delete the message if it contains unauthorized links
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

                            if (settings.groupAction === 'remove' && isBotAdmin && !isUserAdmin) {
                                await client.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
                                await client.sendMessage(
                                    m.key.remoteJid, 
                                    { 
                                        text: `@${sender.split('@')[0]} has been removed for sending unauthorized links.`,
                                        contextInfo: { mentionedJid: [sender] }
                                    }
                                );
                            } else {
                                await client.sendMessage(
                                    m.key.remoteJid, 
                                    { 
                                        text: `@${sender.split('@')[0]}, links are not allowed here!`,
                                        contextInfo: { mentionedJid: [sender] }
                                    }, 
                                    { quoted: m }
                                );
                            }
                        } else {
                            await client.sendMessage(
                                sender,
                                { text: '🚫 You have been blocked for sending unauthorized links!' }
                            );
                            await client.updateBlockStatus(sender, 'block');
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Anti-link error:', error);
    }
}
//========================================================================================================================
//========================================================================================================================
            
           const { getGreetSettings, repliedContacts } = require('./database/greet');

// Handle message processing
const messageText = mek.message?.conversation || mek.message?.extendedTextMessage?.text || "";
const remoteJid = mek.key.remoteJid;
const senderJid2 = mek.key.participant || mek.key.remoteJid;
const senderNumber = senderJid2.split('@')[0];
const isPrivate = remoteJid.endsWith('@s.whatsapp.net');

// Get current settings
const greetSettings = await getGreetSettings();

// Command to update greeting message (only from owner)
if (messageText.match(/^[^\w\s]/) && mek.key.fromMe && isPrivate) {
    const prefix = messageText[0];
    const command = messageText.slice(1).split(" ")[0];
    const newMessage = messageText.slice(prefix.length + command.length).trim();

    if (command === "setgreet" && newMessage) {
        await updateGreetSettings({ message: newMessage });
        await client.sendMessage(remoteJid, {
            text: `Greet message has been updated to:\n"${newMessage}"`
        });
        return;
    }
}

// Handle greetings in private chats only
if (greetSettings.enabled && isPrivate && !mek.key.fromMe && !repliedContacts.has(remoteJid)) {
    const personalizedMessage = greetSettings.message.replace(/@user/g, `@${senderNumber}`);
    
    await client.sendMessage(remoteJid, {
        text: personalizedMessage,
        mentions: [senderJid]
    });
    
    repliedContacts.add(remoteJid);
} 
//========================================================================================================================            
 // Chatbot handler
//========================================================================================================================            

/*const { getChatbotSettings } = require('./database/chatbot');
const chatbotSettings = await getChatbotSettings();
let lastTextTime = 0;

// Skip conditions:
// 1. If message is from the bot itself
// 2. If quoted message is from the bot
// 3. If sender is not owner
if (m.sender === client.user.id || (m.quoted?.fromMe) || !m.isOwner) return;

// Text Chatbot
if ((!IsGroup && chatbotSettings.textPrivate) || (IsGroup && chatbotSettings.textGroup)) {
    try {
        const currentTime = Date.now();
        if (currentTime - lastTextTime < chatbotSettings.messageDelay) {
            console.log('Message skipped: Rate limit exceeded');
            return;
        }

        const response = await axios.get(`https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(text)}`);
        
        if (!response.data?.status || !response.data?.result) {
            throw new Error('Invalid API response');
        }

        await client.sendMessage(m.chat, { 
            text: response.data.result,
            mentions: [m.sender],
            quoted: m
        });
        
        lastTextTime = currentTime;
    } catch (error) {
        console.error('Error in text chatbot:', error);
    }
}

// Voice Chatbot
if ((!IsGroup && chatbotSettings.voicePrivate) || (IsGroup && chatbotSettings.voiceGroup)) {
    try {
        const currentTime = Date.now();
        if (currentTime - lastTextTime < chatbotSettings.messageDelay) {
            console.log('Message skipped: Rate limit exceeded for voice');
            return;
        }

        const response = await axios.get(`https://apis-keith.vercel.app/ai/gpt?q=${encodeURIComponent(text)}`);
        
        if (!response.data?.status || !response.data?.result) {
            throw new Error('Invalid API response');
        }

        const audioUrl = googleTTS.getAudioUrl(response.data.result, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com'
        });

        await client.sendMessage(m.chat, { 
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            ptt: true,
            quoted: m
        });

        lastTextTime = currentTime;
    } catch (error) {
        console.error('Error in voice chatbot:', error);
    }
}           
 */ 
            if (m.chat.endsWith('@s.whatsapp.net') && cmd && permit === 'true' && !isOwner) {
    await m.reply("You have no access to commands here. ❌");
    return;
}
//========================================================================================================================            
//========================================================================================================================
            if (cmd && mode === "private" && !isOwner && m.sender !== daddy) return;
            
            const Blocked = await client.fetchBlocklist();
            if (cmd && m.isGroup && Blocked?.includes(m.sender)) {
                await m.reply("You are blocked from using bot commands.");
                return;
            }
//========================================================================================================================            
            const command = cmd ? body.replace(prefix, "").trim().split(/ +/).shift().toLowerCase() : null;
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

                    await commandHandler.function({
                        client,
                        downloadYouTube, 
                        downloadSoundCloud, 
                        downloadSpotify, 
                        searchYouTube, 
                        searchSoundCloud, 
                        searchSpotify, 
                        fetchLogoUrl, 
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
                        reply,
                        saveUserJid,
                        mode, 
                        mime, 
                        qmsg, 
                        msgKeith, 
                        Tag, 
                        text,
                        botname,
                        prefix,
                        sendReply, 
                        sendMediaMessage, 
                        prefix, 
                        groupAdmin, 
                        getGroupAdmins, 
                        groupName, 
                        groupMetadata, 
                        participants, 
                        pushname, 
                        body,
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
      
//========================================================================================================================
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

    //========================================================================================================================
    // Connection event handler
    //========================================================================================================================
    // Group Participants Update Handler
client.ev.on('group-participants.update', async (keizzah) => {
    const settings = await getGroupEventsSettings();
    if (!settings.enabled) return;

    const getContextInfo = () => ({
        mentionedJid: [keizzah.participants[0]],
        forwardingScore: 999,
        isForwarded: true
    });

    try {
        const metadata = await client.groupMetadata(keizzah.id);
        const count = metadata.participants.length;
        const time = new Date().toLocaleString();

        // Helper function to get profile picture
        const getProfilePic = async (jid) => {
            try {
                return await client.profilePictureUrl(jid, 'image');
            } catch {
                return 'https://i.imgur.com/iEWHnOH.jpeg';
            }
        };

        // Process each participant
        for (const num of keizzah.participants) {
            const userName = num.split('@')[0];
            const dpuser = await getProfilePic(num);

            if (keizzah.action === 'add') {
                const message = settings.welcomeMessage
                    .replace('@user', `@${userName}`)
                    .replace('{group}', metadata.subject)
                    .replace('{count}', count)
                    .replace('{time}', time)
                    .replace('{desc}', metadata.desc || 'No description');

                await client.sendMessage(keizzah.id, {
                    image: { url: dpuser },
                    caption: message,
                    mentions: [num],
                    contextInfo: getContextInfo()
                });
            } 
            else if (keizzah.action === 'remove') {
                const message = settings.goodbyeMessage
                    .replace('@user', `@${userName}`)
                    .replace('{time}', time)
                    .replace('{count}', count);

                await client.sendMessage(keizzah.id, {
                    image: { url: dpuser },
                    caption: message,
                    mentions: [num],
                    contextInfo: getContextInfo()
                });
            }
        }

        // Handle admin changes
        if (settings.showPromotions) {
            const author = keizzah.author.split('@')[0];
            const target = keizzah.participants[0].split('@')[0];

            if (keizzah.action === 'promote') {
                await client.sendMessage(keizzah.id, {
                    text: `🎉 @${author} promoted @${target} to admin!`,
                    mentions: [keizzah.author, keizzah.participants[0]]
                });
            } 
            else if (keizzah.action === 'demote') {
                await client.sendMessage(keizzah.id, {
                    text: `⚠️ @${author} demoted @${target} from admin.`,
                    mentions: [keizzah.author, keizzah.participants[0]]
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
});
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

            const message = `Holla, ${getGreeting()},\n\n╭═══『 ${botname} 𝐢𝐬 𝐜𝐨𝐧𝐧𝐞𝐜𝐭𝐞𝐝』══⊷ \n` +
                `║ ʙᴏᴛ ᴏᴡɴᴇʀ ${author}\n` +
                `║ ᴍᴏᴅᴇ ${mode}\n` +
                `║ ᴘʀᴇғɪx [  ${prefix} ]\n` +
                `║ ᴛɪᴍᴇ ${DateTime.now().setZone("Africa/Nairobi").toLocaleString(DateTime.TIME_SIMPLE)}\n` +
                `║ ʟɪʙʀᴀʀʏ panel\n` +
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
