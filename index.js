const express = require('express');
const app = express();
const PORT = process.env.PORT || 8000;
app.get("/", (req, res) => {
  res.send("ALPHA MD IS ALIVE ✅");
  });
// Add port listening
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result,mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const logger_1 = __importDefault(require("@whiskeysockets/baileys/lib/Utils/logger"));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require("pino");
const boom_1 = require("@hapi/boom");
const conf = require("./set");
const axios = require("axios");
let fs = require("fs-extra");
//const { initAntiDeleteDB, getAntiDeleteSettings } = require('./database/antidelete');
const store2 = { chats: {} }; // Message storage
const { getCurrentPresence } = require('./database/presence');
const { initAntiBotDB, getAntiBotSettings } = require('./database/antibot');
const { initAntiCallDB, getAntiCallSettings, updateAntiCallSettings } = require('./database/anticall');
const { initAutoViewStatusDB, getAutoViewStatusSettings } = require('./database/autoviewstatus');
const { initChatbotDB, getChatbotSettings, updateChatbotSettings } = require('./database/chatbot');
const { initPresenceDB, getPresenceSettings } = require('./database/presence');
const { getAntiBadWordSettings } = require('./database/antibadword');
//const { initAutobioDB, getAutobioSettings } = require('./database/autobio');
const { initAntiLinkDB, getAntiLinkSettings } = require('./database/antilink');
const { initWarnDB, addWarning, getWarnings } = require('./database/warn');
const { getEvent } = require('./database/events');
const { initAutoBioDB, getAutoBioSettings } = require('./database/autobio');
const { initAutoReadDB, getAutoReadStatus } = require('./database/autoread');
const { initGreetDB, getGreetSettings, addRepliedContact } = require('./database/greet');
const { initAutoReactDB, getAutoReactSettings } = require('./database/autoreact');
//const { initAutolikeDB, getAutolikeSettings } = require('./database/autolike');
const { initAutoLikeDB, getAutoLikeSettings } = require('./database/autolike');

//const { initAntideleteDB, getAntideleteSettings } = require('./database/antidelete');
let path = require("path");
const ADM_PUBLIC = process.env.ANTIDELTE_PUBLIC || 'yes';
const ADM_GROUP = process.env.ANTIDELTE_GROUP || 'yes';
const googleTTS = require('google-tts-api');
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

let evt = require(__dirname + "/keizzah/keith");
const { respond, sendMessage } = require(__dirname + "/keizzah/context");

let { reagir } = require(__dirname + "/keizzah/app");
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, "");
const prefixe = conf.PREFIXE;
//const prefixe = (conf.PREFIXE || '').split(',').map(prefix => prefix.trim()).filter(Boolean);
const zlib = require('zlib');

async function authentification() {
    try {
        if (!fs.existsSync(__dirname + "/auth/creds.json")) {
            console.log("Session connected...");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "ALPHA" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/auth/creds.json", decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        } else if (fs.existsSync(__dirname + "/auth/creds.json") && conf.session !== "zokk") {
            console.log("Updating existing session...");
            const [header, b64data] = conf.session.split(';;;'); 

            if (header === "ALPHA" && b64data) {
                let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
                let decompressedData = zlib.gunzipSync(compressedData);
                fs.writeFileSync(__dirname + "/auth/creds.json", decompressedData, "utf8");
            } else {
                throw new Error("Invalid session format");
            }
        }
    } catch (e) {
        console.log("Session Invalid: " + e.message);
        return;
    }
}
authentification();

const store = (0, baileys_1.makeInMemoryStore)({
    logger: pino().child({ level: "silent", stream: "store" }),
});
setTimeout(() => {
    async function main() {
        const { version, isLatest } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(__dirname + "/auth");
        const sockOptions = {
            version,
            logger: pino({ level: "silent" }),
            browser: ['Alpha-Md', "safari", "1.0.0"],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: true,
            downloadHistory: true,
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30_000,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
            },
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
                    conversation: 'An Error Occurred, Repeat Command!'
                };
            }
        };
        const zk = (0, baileys_1.default)(sockOptions);
        store.bind(zk.ev);
        setInterval(() => { store.writeToFile("store.json"); }, 3000);
       const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        let lastTextTime = 0;
        const messageDelay = 5000;  
        initAntiCallDB().catch(console.error);
        initWarnDB().catch(console.error);
        initAntiBotDB().catch(console.error);
        initAntiLinkDB().catch(console.error);
        //initAntiDeleteDB().catch(console.error);
        initAutoBioDB().catch(console.error);
        initChatbotDB().catch(console.error);
        initAutoReactDB().catch(console.error);
        initGreetDB().catch(console.error);
        initPresenceDB().catch(console.error);
        initAutoViewStatusDB().catch(console.error);
        initAutoLikeDB().catch(console.error);
        initAutoReadDB().catch(console.error);

       zk.ev.on("call", async callData => {
    const settings = await getAntiCallSettings();
    if (settings.status !== 'yes') return;

    const callId = callData[0].id;
    const callerId = callData[0].from;
    const currentTime = Date.now();

    if (currentTime - lastTextTime >= messageDelay) {
        try {
            if (settings.action === 'block') {
                await zk.blockUser(callerId);
            }
            await zk.rejectCall(callId, callerId);
            await zk.sendMessage(callerId, { text: conf.ANTICALL_MSG });
            lastTextTime = currentTime;
        } catch (error) {
            console.error('Error handling call:', error);
        }
    } else {
        console.log('Message not sent due to delay constraint');
    }
});
        

// Autobio function

const autoBioSettings = await getAutoBioSettings();
if (autoBioSettings.status === 'on') {
    setInterval(async () => {
        try {
            const date = new Date();
            const formattedDate = date.toLocaleString('en-US', { 
                timeZone: autoBioSettings.timezone 
            });
            const dayOfWeek = date.toLocaleString('en-US', { 
                weekday: 'long', 
                timeZone: autoBioSettings.timezone 
            });

            // Correct method for updating profile status
            await zk.updateProfileStatus(
                `${conf.BOT} is active 24/7\n\n${formattedDate} (${dayOfWeek})\n\n${autoBioSettings.message}`
            );
        } catch (error) {
            console.error('AutoBio error:', error);
        }
    }, 10 * 1000); // Updates every 10 seconds
}



// AutoLike Status function


        //newsletter forwading 
        const getContextInfo = (title = '', userJid = '') => ({
    mentionedJid: [userJid],
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363266249040649@newsletter",
      newsletterName: "Keith Support 🔥",
      serverMessageId: Math.floor(100000 + Math.random() * 900000),
    },
  });
        let lastReactionTime = 0;

zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const settings = await getAutoLikeSettings();
    
    if (settings.status !== 'on') return;

    for (const message of messages) {
        if (message.key?.remoteJid === "status@broadcast") {
            const now = Date.now();
            if (now - lastReactionTime < settings.throttle_delay) continue;

            try {
                const randomEmoji = settings.emojis[Math.floor(Math.random() * settings.emojis.length)];
                
                await zk.sendMessage(message.key.remoteJid, {
                    react: {
                        key: message.key,
                        text: randomEmoji
                    }
                }, {
                    statusJidList: [message.key.participant]
                });

                lastReactionTime = now;
                await delay(settings.reaction_delay);
            } catch (error) {
                console.error('AutoLike reaction failed:', error);
            }
        }
    }
});
        

// Anti-delete handler
/*async function setupAntiDelete(zk) {
    const antiDeleteSettings = await getAntiDeleteSettings();
    if (antiDeleteSettings.status !== 'on') return;

    zk.ev.on("messages.upsert", async (m) => {  
        const { messages } = m;  
        const ms = messages[0];  
        if (!ms.message) return;  

        const messageKey = ms.key;  
        const remoteJid = messageKey.remoteJid;  

        // Ignore status updates
        if (remoteJid === "status@broadcast") return;  

        // Initialize chat storage if it doesn't exist  
        if (!store2.chats[remoteJid]) {  
            store2.chats[remoteJid] = [];  
        }  

        // Save the received message to storage  
        store2.chats[remoteJid].push(ms);  

        // Handle deleted messages  
        if (ms.message.protocolMessage?.type === 0) {  
            const deletedKey = ms.message.protocolMessage.key;  
            const chatMessages = store2.chats[remoteJid];  
            const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);  

            if (!deletedMessage) return;

            try {  
                const deleterJid = ms.key.participant || ms.key.remoteJid;
                const originalSenderJid = deletedMessage.key.participant || deletedMessage.key.remoteJid;
                const isGroup = remoteJid.endsWith('@g.us');
                
                // Get group info if message was from a group
                let groupInfo = '';
                if (isGroup) {
                    try {
                        const groupMetadata = await zk.groupMetadata(remoteJid);
                        groupInfo = `\n• Group: ${groupMetadata.subject}`;
                    } catch (e) {
                        console.error('Error fetching group metadata:', e);
                    }
                }

                const notification = `👿 *Anti-Delete Alert* 👿\n` +
                                    `• Deleted by: @${deleterJid.split("@")[0]}\n` +
                                    `• Original sender: @${originalSenderJid.split("@")[0]}\n` +
                                    `${groupInfo}\n` +
                                    `• Chat type: ${isGroup ? 'Group' : 'Private'}`;

                const contextInfo = getContextInfo('Deleted Message Alert', deleterJid);

                // Common message options
                const baseMessage = {
                    mentions: [deleterJid, originalSenderJid],
                    contextInfo: contextInfo
                };

                // Handle different message types
                if (deletedMessage.message.conversation) {
                    await zk.sendMessage(remoteJid, {
                        text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMessage.message.conversation}`,
                        ...baseMessage
                    });
                } 
                else if (deletedMessage.message.extendedTextMessage) {
                    await zk.sendMessage(remoteJid, {
                        text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMessage.message.extendedTextMessage.text}`,
                        ...baseMessage
                    });
                }
                else if (deletedMessage.message.imageMessage) {
                    const caption = deletedMessage.message.imageMessage.caption || '';
                    const imagePath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.imageMessage);
                    await zk.sendMessage(remoteJid, {
                        image: { url: imagePath },
                        caption: `${notification}\n\n📷 *Image Caption:*\n${caption}`,
                        ...baseMessage
                    });
                }  
                else if (deletedMessage.message.videoMessage) {
                    const caption = deletedMessage.message.videoMessage.caption || '';
                    const videoPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.videoMessage);
                    await zk.sendMessage(remoteJid, {
                        video: { url: videoPath },
                        caption: `${notification}\n\n🎥 *Video Caption:*\n${caption}`,
                        ...baseMessage
                    });
                }  
                else if (deletedMessage.message.audioMessage) {
                    const audioPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.audioMessage);
                    await zk.sendMessage(remoteJid, {
                        audio: { url: audioPath },
                        ptt: true,
                        caption: `${notification}\n\n🎤 *Voice Message Deleted*`,
                        ...baseMessage
                    });
                }  
                else if (deletedMessage.message.stickerMessage) {
                    const stickerPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.stickerMessage);
                    await zk.sendMessage(remoteJid, {
                        sticker: { url: stickerPath },
                        caption: notification,
                        ...baseMessage
                    });
                }
                else {
                    // For other message types we don't specifically handle
                    await zk.sendMessage(remoteJid, {
                        text: `${notification}\n\n⚠️ *Unsupported message type was deleted*`,
                        ...baseMessage
                    });
                }
            } catch (error) {  
                console.error('Error handling deleted message:', error);  
            }  
        }  
    });
}*/
        // Function to create a notification for deleted messages
function createNotification(deletedMessage) {
    const deletedBy = deletedMessage.key.participant || deletedMessage.key.remoteJid;
    return `*😈 ${conf.BOT} ANTIDELETE👿*\n\n` +
           `*Time deleted🥀:* ${new Date().toLocaleString()}\n` +
           `*Deleted by🌷:* @${deletedBy.split('@')[0]}\n\n*Powered by ${conf.OWNER_NAME}*\n\n`;
}

// Helper function to download media based on message type
async function downloadMessageMedia(message) {
    if (message.imageMessage) return await zk.downloadAndSaveMediaMessage(message.imageMessage);
    if (message.videoMessage) return await zk.downloadAndSaveMediaMessage(message.videoMessage);
    if (message.audioMessage) return await zk.downloadAndSaveMediaMessage(message.audioMessage);
    if (message.stickerMessage) return await zk.downloadAndSaveMediaMessage(message.stickerMessage);
    return null;
}

// Event listener for all incoming messages
zk.ev.on("messages.upsert", async (m) => {
    if (ADM_GROUP !== "yes") return; // Check if antidelete is enabled

    const { messages } = m;
    const ms = messages[0];
    if (!ms.message) return;

    const messageKey = ms.key;
    const remoteJid = messageKey.remoteJid;

    // Only proceed if it's a group message
    if (!remoteJid.endsWith('@g.us')) return;

    // Store received messages for future reference
    if (!store.chats[remoteJid]) {
        store.chats[remoteJid] = [];
    }
    store.chats[remoteJid].push(ms);

    // Handle deleted messages
    if (ms.message.protocolMessage && ms.message.protocolMessage.type === 0) {
        const deletedKey = ms.message.protocolMessage.key;

        // Find the deleted message in stored messages
        const chatMessages = store.chats[remoteJid];
        const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);

        if (deletedMessage) {
            try {
                const notification = createNotification(deletedMessage);

                // Handle deleted text messages
                if (deletedMessage.message.conversation) {
                    await zk.sendMessage(remoteJid, {
                        text: `${notification}*Message:* ${deletedMessage.message.conversation}`,
                        mentions: [deletedMessage.key.participant]
                    });
                    return;
                }

                // Handle deleted media messages
                const mediaBuffer = await downloadMessageMedia(deletedMessage.message);
                
                // Determine media type
                let mediaType = null;
                if (deletedMessage.message.imageMessage) mediaType = 'image';
                else if (deletedMessage.message.videoMessage) mediaType = 'video';
                else if (deletedMessage.message.audioMessage) mediaType = 'audio';
                else if (deletedMessage.message.stickerMessage) mediaType = 'sticker';

                if (mediaBuffer && mediaType) {
                    const mediaOptions = {
                        [mediaType]: { url: mediaBuffer },
                        mentions: [deletedMessage.key.participant]
                    };

                    // Add caption for all media types except stickers
                    if (mediaType !== 'sticker') {
                        mediaOptions.caption = notification;
                    }

                    await zk.sendMessage(remoteJid, mediaOptions);
                } else {
                    await zk.sendMessage(remoteJid, {
                        text: `${notification}⚠️ Unsupported media type was deleted.`,
                        mentions: [deletedMessage.key.participant]
                    });
                }
            } catch (error) {
                console.error('Error handling deleted message:', error);
            }
        }
    }
});
        
zk.ev.on("messages.upsert", async (m) => {  
    if (ADM_PUBLIC !== "yes") return; // Ensure antidelete is enabled  

    const { messages } = m;  
    const ms = messages[0];  
    if (!ms.message) return; // Skip messages with no content  

    const messageKey = ms.key;  
    const remoteJid = messageKey.remoteJid;  

    // Ignore status updates
    if (remoteJid === "status@broadcast") return;  

    // Initialize chat storage if it doesn't exist  
    if (!store.chats[remoteJid]) {  
        store.chats[remoteJid] = [];  
    }  

    // Save the received message to storage  
    store.chats[remoteJid].push(ms);  

    // Handle deleted messages  
    if (ms.message.protocolMessage?.type === 0) {  
        const deletedKey = ms.message.protocolMessage.key;  
        const chatMessages = store.chats[remoteJid];  
        const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);  

        if (!deletedMessage) return;

        try {  
            const deleterJid = ms.key.participant || ms.key.remoteJid;
            const originalSenderJid = deletedMessage.key.participant || deletedMessage.key.remoteJid;
            const isGroup = remoteJid.endsWith('@g.us');
            
            // Get group info if message was from a group
            let groupInfo = '';
            if (isGroup) {
                try {
                    const groupMetadata = await zk.groupMetadata(remoteJid);
                    groupInfo = `\n• Group: ${groupMetadata.subject} (${remoteJid})`;
                } catch (e) {
                    console.error('Error fetching group metadata:', e);
                    groupInfo = `\n• Group: ${remoteJid}`;
                }
            }

            const notification = `🗿 *Alpha antidelete* 🗿\n` +
                                `• Deleted by: @${deleterJid.split("@")[0]}\n` +
                                `• Original sender: @${originalSenderJid.split("@")[0]}\n` +
                                `${groupInfo}\n` +
                                `• Chat type: ${isGroup ? 'Group' : 'Private'}`;

            const botOwnerJid = `${conf.NUMERO_OWNER}@s.whatsapp.net`;
            const contextInfo = getContextInfo(deleterJid);

            // Common message options
            const baseMessage = {
                mentions: [deleterJid, originalSenderJid],
                contextInfo: contextInfo
            };

            // Handle different message types
            let messageContent = '';
            let mediaAttachment = null;

            if (deletedMessage.message.conversation) {
                messageContent = deletedMessage.message.conversation;
            } 
            else if (deletedMessage.message.extendedTextMessage) {
                messageContent = deletedMessage.message.extendedTextMessage.text;
            }
            else if (deletedMessage.message.imageMessage) {
                messageContent = deletedMessage.message.imageMessage.caption || '';
                mediaAttachment = {
                    type: 'image',
                    data: deletedMessage.message.imageMessage
                };
            }  
            else if (deletedMessage.message.videoMessage) {
                messageContent = deletedMessage.message.videoMessage.caption || '';
                mediaAttachment = {
                    type: 'video',
                    data: deletedMessage.message.videoMessage
                };
            }  
            else if (deletedMessage.message.audioMessage) {
                mediaAttachment = {
                    type: 'audio',
                    data: deletedMessage.message.audioMessage,
                    isVoiceNote: deletedMessage.message.audioMessage.ptt
                };
            }  
            else if (deletedMessage.message.stickerMessage) {
                mediaAttachment = {
                    type: 'sticker',
                    data: deletedMessage.message.stickerMessage
                };
            }

            // Send the notification with content
            if (mediaAttachment) {
                const mediaPath = await zk.downloadAndSaveMediaMessage(mediaAttachment.data);
                const mediaOptions = {
                    [mediaAttachment.type]: { url: mediaPath },
                    caption: mediaAttachment.type !== 'sticker' ? 
                        `${notification}\n\n📌 *${mediaAttachment.type.charAt(0).toUpperCase() + mediaAttachment.type.slice(1)} Caption:*\n${messageContent}` : 
                        notification,
                    ...baseMessage
                };

                if (mediaAttachment.type === 'audio' && mediaAttachment.isVoiceNote) {
                    mediaOptions.ptt = true;
                }

                await zk.sendMessage(botOwnerJid, mediaOptions);
            } else if (messageContent) {
                await zk.sendMessage(botOwnerJid, {
                    text: `${notification}\n\n📝 *Deleted Content:*\n${messageContent}`,
                    ...baseMessage
                });
            } else {
                await zk.sendMessage(botOwnerJid, {
                    text: `${notification}\n\n⚠️ *Unsupported message type was deleted*`,
                    ...baseMessage
                });
            }
        } catch (error) {  
            console.error('Error handling deleted message:', error);  
        }  
    }  
});
       zk.ev.on("messages.upsert", async (m) => {  
    if (conf.ADM !== "yes") return; // Ensure antidelete is enabled  

    const { messages } = m;  
    const ms = messages[0];  
    if (!ms.message) return; // Skip messages with no content  

    const messageKey = ms.key;  
    const remoteJid = messageKey.remoteJid;  

    // Ignore status updates
    if (remoteJid === "status@broadcast") return;  

    // Initialize chat storage if it doesn't exist  
    if (!store.chats[remoteJid]) {  
        store.chats[remoteJid] = [];  
    }  

    // Save the received message to storage  
    store.chats[remoteJid].push(ms);  

    // Handle deleted messages  
    if (ms.message.protocolMessage?.type === 0) {  
        const deletedKey = ms.message.protocolMessage.key;  
        const chatMessages = store.chats[remoteJid];  
        const deletedMessage = chatMessages.find(msg => msg.key.id === deletedKey.id);  

        if (!deletedMessage) return;

        try {  
            const deleterJid = ms.key.participant || ms.key.remoteJid;
            const originalSenderJid = deletedMessage.key.participant || deletedMessage.key.remoteJid;
            const isGroup = remoteJid.endsWith('@g.us');
            
            // Group Metadata Handling
            let groupInfo = '';
            if (isGroup) {
                try {
                    const groupMetadata = await zk.groupMetadata(remoteJid);
                    groupInfo = `\n• Group: ${groupMetadata.subject}`;
                } catch (e) {
                    console.error('Error fetching group metadata:', e);
                    groupInfo = '\n• Group information unavailable.';
                }
            }

            const notification = `👿 *Alpha antiDelete* 👿\n` +
                                `• Deleted by: @${deleterJid.split("@")[0]}\n` +
                                `• Original sender: @${originalSenderJid.split("@")[0]}\n` +
                                `${groupInfo}\n` +
                                `• Chat type: ${isGroup ? 'Group' : 'Private'}`;

            const contextInfo = getContextInfo('Deleted Message Alert', deleterJid);

            // Common message options
            const baseMessage = {
                mentions: [deleterJid, originalSenderJid],
                contextInfo: contextInfo
            };

            // Handle different message types
            if (deletedMessage.message.conversation) {
                await zk.sendMessage(remoteJid, {
                    text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMessage.message.conversation}`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.extendedTextMessage) {
                await zk.sendMessage(remoteJid, {
                    text: `${notification}\n\n📝 *Deleted Text:*\n${deletedMessage.message.extendedTextMessage.text}`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.imageMessage) {
                const caption = deletedMessage.message.imageMessage.caption || '';
                const imagePath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.imageMessage);
                await zk.sendMessage(remoteJid, {
                    image: { url: imagePath },
                    caption: `${notification}\n\n📷 *Image Caption:*\n${caption}`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.videoMessage) {
                const caption = deletedMessage.message.videoMessage.caption || '';
                const videoPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.videoMessage);
                await zk.sendMessage(remoteJid, {
                    video: { url: videoPath },
                    caption: `${notification}\n\n🎥 *Video Caption:*\n${caption}`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.audioMessage) {
                const audioPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.audioMessage);
                await zk.sendMessage(remoteJid, {
                    audio: { url: audioPath },
                    ptt: true,
                    caption: `${notification}\n\n🎤 *Voice Message Deleted*`,
                    ...baseMessage
                });
            } else if (deletedMessage.message.stickerMessage) {
                const stickerPath = await zk.downloadAndSaveMediaMessage(deletedMessage.message.stickerMessage);
                await zk.sendMessage(remoteJid, {
                    sticker: { url: stickerPath },
                    caption: notification,
                    ...baseMessage
                });
            } else {
                // Handle unsupported message types
                await zk.sendMessage(remoteJid, {
                    text: `${notification}\n\n⚠️ *Unsupported message type was deleted*`,
                    ...baseMessage
                });
            }
        } catch (error) {  
            console.error('Error handling deleted message:', error);  
        }  
    }  
});




function containsBadWord(text, wordlist) {
    if (!text || !wordlist) return false;
    return wordlist.some(word => 
        new RegExp(`\\b${word}\\b`, 'i').test(text)
    );
}

zk.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];
        if (!message?.message) return;

        const from = message.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const { status, action, wordlist } = await getAntiBadWordSettings(from);
        if (status !== 'on') return;

        const sender = message.key.participant || message.key.remoteJid;
        const groupMetadata = await zk.groupMetadata(from);
        const isAdmin = groupMetadata.participants.some(p => 
            p.id === sender && p.admin
        );
        if (isAdmin) return;

        const messageText = message.message.conversation || 
                          message.message.extendedTextMessage?.text || '';
        
        if (!containsBadWord(messageText, wordlist)) return;

        const isBotAdmin = groupMetadata.participants.some(p => 
            p.id === zk.user.id && p.admin
        );

        // Delete message if possible
        if (isBotAdmin) {
            await zk.sendMessage(from, { delete: message.key });
        }

        switch (action) {
            case 'delete':
                await zk.sendMessage(from, {
                    text: `⚠️ Deleted message with bad word from @${sender.split('@')[0]}`,
                    mentions: [sender]
                });
                break;
                
            case 'warn':
                const warnCount = await addWarning(sender, from);
                await zk.sendMessage(from, {
                    text: `⚠️ @${sender.split('@')[0]} warned (${warnCount}/3) for bad language`,
                    mentions: [sender]
                });

                if (warnCount >= 3 && isBotAdmin) {
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');
                    await zk.sendMessage(from, {
                        text: `🚨 @${sender.split('@')[0]} removed for repeated bad language`,
                        mentions: [sender]
                    });
                }
                break;
                
            case 'remove':
                if (isBotAdmin) {
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');
                    await zk.sendMessage(from, {
                        text: `🚨 @${sender.split('@')[0]} removed for bad language`,
                        mentions: [sender]
                    });
                }
                break;
        }
    } catch (error) {
        console.error('AntiBadWord handler error:', error);
    }
});
// Bot detection function
function isBotMessage(message) {
    const messageId = message.key?.id;
    return (messageId?.startsWith('BAES') || 
            messageId?.startsWith('BAE5')) && 
            messageId?.length === 16;
}

// Add to your message handler
zk.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];
        if (!message?.message) return;

        const from = message.key.remoteJid;
        if (!from.endsWith('@g.us')) return; // Only groups

        // Get fresh settings every time
        const { status, action } = await getAntiBotSettings(from);
        if (status !== 'on') return; // Skip if antibot is off

        const sender = message.key.participant || message.key.remoteJid;
        const groupMetadata = await zk.groupMetadata(from);
        const isAdmin = groupMetadata.participants.some(p => 
            p.id === sender && p.admin
        );
        if (isAdmin) return; // Skip admins

        if (!isBotMessage(message)) return;

        const isBotAdmin = groupMetadata.participants.some(p => 
            p.id === zk.user.id && p.admin
        );

        // Delete message if possible
        if (isBotAdmin) {
            await zk.sendMessage(from, { delete: message.key });
        }

        switch (action) {
            case 'delete':
                await zk.sendMessage(from, {
                    text: `⚠️ Deleted bot message from @${sender.split('@')[0]}`,
                    mentions: [sender]
                });
                break;

            case 'warn':
                const warnCount = await addWarning(sender, from);
                await zk.sendMessage(from, {
                    text: `⚠️ @${sender.split('@')[0]} has ${warnCount}/3 bot warnings`,
                    mentions: [sender]
                });

                if (warnCount >= 3 && isBotAdmin) {
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');
                    await zk.sendMessage(from, {
                        text: `🚨 @${sender.split('@')[0]} removed for bot activity`,
                        mentions: [sender]
                    });
                }
                break;

            case 'remove':
                if (isBotAdmin) {
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');
                    await zk.sendMessage(from, {
                        text: `🚨 @${sender.split('@')[0]} removed for bot activity`,
                        mentions: [sender]
                    });
                } else {
                    await zk.sendMessage(from, {
                        text: `⚠️ Promote me to admin to remove bots\n` +
                              `Detected bot: @${sender.split('@')[0]}`,
                        mentions: [sender]
                    });
                }
                break;
        }
    } catch (error) {
        console.error('AntiBot handler error:', error);
    }
});
        

zk.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];
        if (!message.message) return;

        const from = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const groupMetadata = await zk.groupMetadata(from);
        const groupAdmins = groupMetadata.participants
            .filter(member => member.admin)
            .map(admin => admin.id);
        
        // Skip if sender is admin
        if (groupAdmins.includes(sender)) return;

        const antiLinkSettings = await getAntiLinkSettings(from);
        if (antiLinkSettings.status !== 'on') return;

        const messageType = Object.keys(message.message)[0];
        const body = messageType === 'conversation'
            ? message.message.conversation
            : message.message[messageType]?.text || '';
        
        if (!body || !/(https?:\/\/[^\s]+)/.test(body)) return;

        // Delete the message regardless of action
        await zk.sendMessage(from, { delete: message.key });

        switch (antiLinkSettings.action) {
            case 'delete':
                await zk.sendMessage(from, {
                    text: `⚠️ Link deleted from @${sender.split('@')[0]}`,
                    mentions: [sender]
                });
                break;
                
            case 'warn':
                const warnCount = await addWarning(sender, from);
                await zk.sendMessage(from, {
                    text: `⚠️ Warning ${warnCount}/3 to @${sender.split('@')[0]} for sending links\n` +
                          `Message deleted`,
                    mentions: [sender]
                });
                
                if (warnCount >= 3) {
                    if (groupAdmins.includes(zk.user.id)) {
                        await zk.groupParticipantsUpdate(from, [sender], 'remove');
                        await zk.sendMessage(from, {
                            text: `🚨 @${sender.split('@')[0]} removed after 3 warnings`,
                            mentions: [sender]
                        });
                    }
                }
                break;
                
            case 'remove':
                if (groupAdmins.includes(zk.user.id)) {
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');
                    await zk.sendMessage(from, {
                        text: `🚨 @${sender.split('@')[0]} removed for sending links`,
                        mentions: [sender]
                    });
                } else {
                    await zk.sendMessage(from, {
                        text: `⚠️ Promote me to admin to remove link senders\n` +
                              `Detected link from @${sender.split('@')[0]}`,
                        mentions: [sender]
                    });
                }
                break;
        }
    } catch (error) {
        console.error('AntiLink error:', error);
    }
});
        

        
        
        

               
        zk.ev.on("messages.upsert", async (m) => {
            const { messages } = m;
            const ms = messages[0];
            if (!ms.message)
                return;
            const decodeJid = (jid) => {
                if (!jid)
                    return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                }
                else
                    return jid;
            };
            var mtype = (0, baileys_1.getContentType)(ms.message);
            var texte = mtype == "conversation" ? ms.message.conversation : mtype == "imageMessage" ? ms.message.imageMessage?.caption : mtype == "videoMessage" ? ms.message.videoMessage?.caption : mtype == "extendedTextMessage" ? ms.message?.extendedTextMessage?.text : mtype == "buttonsResponseMessage" ?
                ms?.message?.buttonsResponseMessage?.selectedButtonId : mtype == "listResponseMessage" ?
                ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId : mtype == "messageContextInfo" ?
                (ms?.message?.buttonsResponseMessage?.selectedButtonId || ms.message?.listResponseMessage?.singleSelectReply?.selectedRowId || ms.text) : "";
            var origineMessage = ms.key.remoteJid;
            var idBot = decodeJid(zk.user.id);
            var servBot = idBot.split('@')[0];
            const verifGroupe = origineMessage?.endsWith("@g.us");
            var infosGroupe = verifGroupe ? await zk.groupMetadata(origineMessage) : "";
            var nomGroupe = verifGroupe ? infosGroupe.subject : "";
            var msgRepondu = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var auteurMsgRepondu = decodeJid(ms.message?.extendedTextMessage?.contextInfo?.participant);
            var mr = ms.message?.extendedTextMessage?.contextInfo?.mentionedJid;
            var utilisateur = mr ? mr : msgRepondu ? auteurMsgRepondu : "";
            var auteurMessage = verifGroupe ? (ms.key.participant ? ms.key.participant : ms.participant) : origineMessage;
            if (ms.key.fromMe) {
                auteurMessage = idBot;
            }
            var membreGroupe = verifGroupe ? ms.key.participant : '';
            
            const nomAuteurMessage = ms.pushName;
            const FranceKing = '254748387615';
            const FranceKing1 = '254796299159';
            const FranceKing2 = "254743995989";
            const FranceKing3 = '254752925938';
            const {
        getAllSudoNumbers
      } = require("./database/sudo");
            const sudo = await getAllSudoNumbers();
            const superUserNumbers = [servBot, FranceKing, FranceKing1, FranceKing2, FranceKing3, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers.concat(sudo);
            const superUser = allAllowedNumbers.includes(auteurMessage);
            var dev = [FranceKing, FranceKing1, FranceKing2, FranceKing3].map((t) => t.replace(/[^0-9]/g) + "@s.whatsapp.net").includes(auteurMessage);
            function repondre(mes) { zk.sendMessage(origineMessage, { text: mes }, { quoted: ms }); }
            console.log("\t [][]...{ALPHA-MD}...[][]");
            console.log("=========== New Message ===========");
            if (verifGroupe) {
                console.log("Message from the group: " + nomGroupe);
            }
            console.log("Message sent by: " + "[" + nomAuteurMessage + " : " + auteurMessage.split("@s.whatsapp.net")[0] + " ]");
            console.log("Message type: " + mtype);
            console.log("------ Message Content ------");
            console.log(texte);
            function groupeAdmin(membreGroupe) {
                let admin = [];
                for (m of membreGroupe) {
                    if (m.admin == null)
                        continue;
                    admin.push(m.id);
                }
                return admin;
            }
            
            const mbre = verifGroupe ? await infosGroupe.participants : '';
            let admins = verifGroupe ? groupeAdmin(mbre) : '';
            const verifAdmin = verifGroupe ? admins.includes(auteurMessage) : false;
            var verifZokouAdmin = verifGroupe ? admins.includes(idBot) : false;
            const arg = texte ? texte.trim().split(/ +/).slice(1) : null;
            const verifCom = texte ? texte.startsWith(prefixe) : false;
            const com = verifCom ? texte.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
            const lien = conf.URL.split(',')
            function mybotpic() {
                const indiceAleatoire = Math.floor(Math.random() * lien.length);
                const lienAleatoire = lien[indiceAleatoire];
                return lienAleatoire;
            }
            var commandeOptions = {
                superUser, dev,
                verifGroupe,
                mbre,
                membreGroupe,
                verifAdmin,
                infosGroupe,
                nomGroupe,
                auteurMessage,
                nomAuteurMessage,
                idBot,
                verifZokouAdmin,
                prefixe,
                arg,
                repondre,
                mtype,
                groupeAdmin,
                msgRepondu,
                auteurMsgRepondu,
                ms,
                mybotpic
            };
            
if (!superUser && origineMessage === auteurMessage) {
    const autoReactSettings = await getAutoReactSettings();
    if (autoReactSettings.status === 'on') {
        const randomEmoji = autoReactSettings.emojis[
            Math.floor(Math.random() * autoReactSettings.emojis.length)
        ];
        try {
            await zk.sendMessage(origineMessage, {
                react: {
                    text: randomEmoji,
                    key: ms.key
                }
            });
        } catch (error) {
            console.error('AutoReact error:', error);
        }
    }
}
            // Add this function to update presence
async function updatePresence(zk, jid) {
    try {
        const { status, isActive } = await getPresenceSettings();
        if (!isActive) {
            await zk.sendPresenceUpdate('unavailable', jid);
            return;
        }
        await zk.sendPresenceUpdate(status, jid);
    } catch (error) {
        console.error('Error updating presence:', error);
    }
}

// Call this wherever you handle messages (similar to greet)
zk.ev.on("messages.upsert", async (m) => {
    const { messages } = m;
    const ms = messages[0];
    if (!ms.message) return;
    
    await updatePresence(zk, ms.key.remoteJid);
});
            
            
            const autoReadStatus = await getAutoReadStatus();
if (autoReadStatus === 'on') {
    zk.ev.on("messages.upsert", async m => {
        const { messages } = m;
        for (const message of messages) {
            if (!message.key.fromMe) {
                try {
                    await zk.readMessages([message.key]);
                } catch (error) {
                    console.error('AutoRead error:', error);
                }
            }
        }
    });
}
            // Replace the old AUTO_READ_STATUS code with this:
const autoViewStatusSettings = await getAutoViewStatusSettings();
if (autoViewStatusSettings.status === 'on') {
    zk.ev.on("messages.upsert", async (m) => {
        const { messages } = m;
        for (const ms of messages) {
            if (ms.key && ms.key.remoteJid === "status@broadcast") {
                try {
                    await zk.readMessages([ms.key]);
                } catch (error) {
                    console.error('AutoViewStatus error:', error);
                }
            }
        }
    });
}
            
            
            
            if (!superUser && origineMessage === auteurMessage) {
    const chatbotSettings = await getChatbotSettings();
    if (chatbotSettings.status !== 'on' || chatbotSettings.inbox_status !== 'on') return;

    try {
        const currentTime = Date.now();
        if (currentTime - lastTextTime < messageDelay) return;

        const response = await axios.get('https://apis-keith.vercel.app/ai/gpt', {
            params: { q: texte },
            timeout: 10000
        });

        if (response.data?.status && response.data?.result) {
            await zk.sendMessage(origineMessage, {
                text: response.data.result,
                contextInfo: getContextInfo()
            });
            lastTextTime = currentTime;
        }
    } catch (error) {
        console.error('Chatbot error:', error);
        // No error message sent to user
    }
}

            
            if (verifCom) {
                const cd = evt.cm.find(keith => keith.nomCom === com || keith.nomCom === com || keith.aliases && keith.aliases.includes(com));
                if (cd) {
                    try {
                        if (conf.MODE.toLocaleLowerCase() != 'yes' && !superUser) {
                            return;
                        }

                        if (!superUser && origineMessage === auteurMessage && conf.PM_PERMIT === "yes") {
                            repondre("You don't have access to commands here"); return
                        }
                        
                        reagir(origineMessage, zk, ms, cd.reaction);
                        cd.fonction(origineMessage, zk, commandeOptions);
                    }
                    catch (e) {
                        console.log("😡😡 " + e);
                        zk.sendMessage(origineMessage, { text: "😡😡 " + e }, { quoted: ms });
                    }
                }
            }
        });
        
        

        zk.ev.on("contacts.upsert", async (contacts) => {
            const insertContact = (newContact) => {
                for (const contact of newContact) {
                    if (store.contacts[contact.id]) {
                        Object.assign(store.contacts[contact.id], contact);
                    }
                    else {
                        store.contacts[contact.id] = contact;
                    }
                }
                return;
            };
            insertContact(contacts);
        });
        zk.ev.on("connection.update", async (con) => {
            const { lastDisconnect, connection } = con;
            if (connection === "connecting") {
                console.log("ℹ️ Connecting...");
            }
            else if (connection === 'open') {
                await zk.newsletterFollow("120363266249040649@newsletter");
 
                console.log("✅ Connection successful! ☺️");
                console.log("--");
                await (0, baileys_1.delay)(200);
                console.log("------");
                await (0, baileys_1.delay)(300);
                console.log("------------------/-----");
                console.log("The bot is online 🕸\n\n");
                console.log("Loading commands...\n");
                fs.readdirSync(__dirname + "/commands").forEach((fichier) => {
                    if (path.extname(fichier).toLowerCase() == (".js")) {
                        try {
                            require(__dirname + "/commands/" + fichier);
                            console.log(fichier + " installed ✔️");
                        }
                        catch (e) {
                            console.log(`${fichier} could not be loaded due to the following reasons: ${e}`);
                        }
                        (0, baileys_1.delay)(300);
                    }
                });
                (0, baileys_1.delay)(700);
                var md;
                if ((conf.MODE).toLocaleLowerCase() === "yes") {
                    md = "public";
                }
                else if ((conf.MODE).toLocaleLowerCase() === "no") {
                    md = "private";
                }
                else {
                    md = "undefined";
                }
                console.log("Command loading completed ✅");
                
                if ((conf.DP).toLowerCase() === 'yes') {
                    // Fetch GitHub commit information
                    let commitInfo = "";
                    try {
                        const { data } = await axios.get('https://api.github.com/repos/keithghost/REMOTE/commits/main');
                        const commitHash = data.sha;
                        const author = data.commit.author.name;
                        const date = new Date(data.commit.author.date).toLocaleString('en-US', { timeZone: `${conf.TIMEZONE}` });
                        const modifiedFiles = data.files ? data.files.map(file => `📄 ${file.filename}`).join('\n') : 'No files modified';

                        // Get current commit hash from package.json
                        let currentCommitHash = 'unknown';
                        try {
                            const packageData = require('./package.json');
                            currentCommitHash = packageData.commitHash || 'unknown';
                        } catch (error) {
                            console.error('Error reading package.json:', error);
                        }

                        commitInfo = `\n╭───◇\n┃ *Latest Updates*\n┃\n┃ *Last Commit*: \`${commitHash}\`\n┃ *Author*: ${conf.OWNER_NAME}\n┃ *Date*: ${date}\n┃ *Files Modified*:\n${modifiedFiles}\n┃\n┃ To update:  \`.restart your bot\`\n╰═════════════════⊷`;
                    } catch (error) {
                        console.error('Error fetching GitHub commit info:', error);
                        commitInfo = "\n╭───◇\n┃ *Update Info*\n┃\n┃ Failed to fetch update information\n╰═════════════════⊷";
                    }

                    let cmsg = `╭════⊷
║ *『 ${conf.BOT} 𝐢𝐬 𝐎𝐧𝐥𝐢𝐧𝐞』*
║    ᴏᴡɴᴇʀ: ${conf.OWNER_NAME}
║    ᴘʀᴇꜰɪx : [ ${prefixe} ]
║    ᴍᴏᴅᴇ : ${md}
╰═════════════════⊷
${commitInfo}`;

                    await zk.sendMessage(zk.user.id, { text: cmsg });
                }
            }
            else if (connection == "close") {
                let raisonDeconnexion = new boom_1.Boom(lastDisconnect?.error)?.output.statusCode;
                if (raisonDeconnexion === baileys_1.DisconnectReason.badSession) {
                    console.log('Invalid session ID, please rescan the QR code...');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionClosed) {
                    console.log('!!! Connection closed, reconnecting...');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.connectionLost) {
                    console.log('Connection to the server lost 😞, reconnecting...');
                    main();
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason?.connectionReplaced) {
                    console.log('Connection replaced, a session is already open, please close it!!!');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.loggedOut) {
                    console.log('You are logged out, please rescan the QR code');
                }
                else if (raisonDeconnexion === baileys_1.DisconnectReason.restartRequired) {
                    console.log('Restarting... ▶️');
                    main();
                }
                else {
                    console.log('Restarting due to error: ', raisonDeconnexion);
                    const { exec } = require("child_process");
                    exec("pm2 restart all");
                }
                main();
            }
        });
        zk.ev.on("creds.update", saveCreds);
        zk.downloadAndSaveMediaMessage = async (message, filename = '', attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || '';
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
            const stream = await (0, baileys_1.downloadContentFromMessage)(quoted, messageType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await FileType.fromBuffer(buffer);
            let trueFileName = './' + filename + '.' + type.ext;
            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };
        zk.awaitForMessage = async (options = {}) => {
            return new Promise((resolve, reject) => {
                if (typeof options !== 'object') reject(new Error('Options must be an object'));
                if (typeof options.sender !== 'string') reject(new Error('Sender must be a string'));
                if (typeof options.chatJid !== 'string') reject(new Error('ChatJid must be a string'));
                if (options.timeout && typeof options.timeout !== 'number') reject(new Error('Timeout must be a number'));
                if (options.filter && typeof options.filter !== 'function') reject(new Error('Filter must be a function'));
                const timeout = options?.timeout || undefined;
                const filter = options?.filter || (() => true);
                let interval = undefined
                let listener = (data) => {
                    let { type, messages } = data;
                    if (type == "notify") {
                        for (let message of messages) {
                            const fromMe = message.key.fromMe;
                            const chatId = message.key.remoteJid;
                            const isGroup = chatId.endsWith('@g.us');
                            const isStatus = chatId == 'status@broadcast';
                            const sender = fromMe ? zk.user.id.replace(/:.*@/g, '@') : (isGroup || isStatus) ? message.key.participant.replace(/:.*@/g, '@') : chatId;
                            if (sender == options.sender && chatId == options.chatJid && filter(message)) {
                                zk.ev.off('messages.upsert', listener);
                                clearTimeout(interval);
                                resolve(message);
                            }
                        }
                    }
                }
                zk.ev.on('messages.upsert', listener);
                if (timeout) {
                    interval = setTimeout(() => {
                        zk.ev.off('messages.upsert', listener);
                        reject(new Error('Timeout'));
                    }, timeout);
                }
            });
        }
        return zk;
    }
    let fichier = require.resolve(__filename);
    fs.watchFile(fichier, () => {
        fs.unwatchFile(fichier);
        console.log(`Updated ${__filename}`);
        delete require.cache[fichier];
        require(fichier);
    });
    main();
}, 5000);
