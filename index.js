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
    __setModuleDefault(result, mod);
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
let path = require("path");
const ADM_PUBLIC = process.env.ANTIDELTE_PUBLIC || 'no';
const googleTTS = require('google-tts-api');
const FileType = require('file-type');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

let evt = require(__dirname + "/keizzah/keith");
const { respond, sendMessage } = require(__dirname + "/keizzah/context");

let { reagir } = require(__dirname + "/keizzah/app");
var session = conf.session.replace(/Zokou-MD-WHATSAPP-BOT;;;=>/g, "");
const prefixe = conf.PREFIXE;
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
        
       zk.ev.on("call", async callData => {
  if (conf.ANTICALL === 'yes') {
    const callId = callData[0].id;
    const callerId = callData[0].from;
    const currentTime = Date.now();

    if (currentTime - lastTextTime >= messageDelay) {
      try {
        await zk.rejectCall(callId, callerId);
        await zk.sendMessage(callerId, {
          text: conf.ANTICALL_MSG
        });
        lastTextTime = currentTime;
      } catch (error) {
        console.error('Error handling call:', error);
      }
    } else {
      console.log('Message not sent due to delay constraint');
    }
  }
}); 
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
        
        
const isAnyLink = (message) => {
    const linkPattern = /https?:\/\/[^\s]+/;
    return linkPattern.test(message);
};

zk.ev.on('messages.upsert', async (msg) => {
    try {
        const { messages } = msg;
        const message = messages[0];

        if (!message.message) return;

        const from = message.key.remoteJid;
        const sender = message.key.participant || message.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        if (!isGroup) return;

        const groupMetadata = await zk.groupMetadata(from);
        const groupAdmins = groupMetadata.participants
            .filter((member) => member.admin)
            .map((admin) => admin.id);
        
        // Check if bot is admin
        const botNumber = `${conf.NUMERO_OWNER}@s.whatsapp.net`;
        const isBotAdmin = groupAdmins.includes(botNumber);

        if (conf.GCF === 'yes') {
            const messageType = Object.keys(message.message)[0];
            const body = messageType === 'conversation'
                ? message.message.conversation
                : message.message[messageType]?.text || '';

            if (!body) return;

            // Skip messages from admins
            if (groupAdmins.includes(sender)) return;

            if (isAnyLink(body)) {
                // Delete the message
                await zk.sendMessage(from, { delete: message.key });

                if (isBotAdmin) {
                    // If bot is admin, remove the sender
                    await zk.groupParticipantsUpdate(from, [sender], 'remove');
                    
                    await zk.sendMessage(from, {
                        text: `🚨 *Anti-Link Triggered!*\n@${sender.split('@')[0]} has been removed for sending links`,
                        mentions: [sender],
                        contextInfo: getContextInfo()
                    });
                } else {
                    // If bot is not admin, request promotion
                    await zk.sendMessage(from, {
                        text: `⚠️ *Anti-Link Warning!*\n` +
                              `Promote me to admin to kick link senders!\n` +
                              `Detected link from @${sender.split('@')[0]}`,
                        mentions: [sender],
                        contextInfo: getContextInfo()
                    });
                }
            }
        }
    } catch (err) {
        console.error('Error handling message:', err);
    }
});

zk.ev.on('group-participants.update', async (update) => {
    if (conf.EVENTS !== "yes") return; // Ensure events is enabled
    
    try {
        const { id, participants, action } = update;
        
        // Get group metadata
        const groupMetadata = await zk.groupMetadata(id);
        const groupName = groupMetadata.subject;
        const totalMembers = groupMetadata.participants.length;
        
        for (const participant of participants) {
            // Get user's details
            const user = await zk.getContact(participant);
            const userName = user?.notify || user?.vname || participant.split('@')[0];
            
            // Prepare base message
            let message = '';
            let remainingMembers = totalMembers;
            
            if (action === 'add') {
                message = `🎉 Welcome *${userName}* to *${groupName}*!\n` +
                         `You're our *${ordinalSuffix(totalMembers)}* member!`;
            } else if (action === 'remove') {
                remainingMembers = totalMembers - 1;
                message = `😢 Goodbye *${userName}*!\n` +
                         `Now *${remainingMembers}* members in *${groupName}*`;
            }
            
            if (!message) continue;

            // Try to get profile picture
            let pfpUrl = '';
            try {
                const pfp = await zk.profilePictureUrl(participant, 'image');
                pfpUrl = pfp || '';
            } catch {
                pfpUrl = '';
            }

            // Create quoted message
            const quotedMsg = {
                key: {
                    remoteJid: id,
                    fromMe: false,
                    id: '1234567890' // Random ID
                },
                message: {
                    conversation: `${action === 'add' ? 'Joined' : 'Left'} the group`
                }
            };

            // Prepare message options
            const messageOptions = {
                contextInfo: getContextInfo(quotedMsg),
                mentions: [participant]
            };

            // Send message with profile picture if available
            if (pfpUrl) {
                await zk.sendMessage(id, {
                    image: { url: pfpUrl },
                    caption: message,
                    ...messageOptions
                });
            } else {
                await zk.sendMessage(id, {
                    text: message,
                    ...messageOptions
                });
            }
        }
    } catch (error) {
        console.error('Error handling group participant update:', error);
    }
});

// Ordinal suffix helper function
function ordinalSuffix(num) {
    const j = num % 10, k = num % 100;
    if (j === 1 && k !== 11) return num + "st";
    if (j === 2 && k !== 12) return num + "nd";
    if (j === 3 && k !== 13) return num + "rd";
    return num + "th";
}
        


/**
 * Handles link violations by non-admins
 * @param {string} from - Group JID
 * @param {string} sender - Sender JID
 * @param {object} message - Original message object
 * @param {object} groupMetadata - Group metadata
 */
/*const handleLinkViolation = async (from, sender, message, groupMetadata) => {
  try {
    // Delete the message first
    await zk.sendMessage(from, { delete: message.key });

    // Try to remove the sender from the group
    await zk.groupParticipantsUpdate(from, [sender], 'remove');

    // Send notification to the group
    const contextInfo = getContextInfo('Link Violation', sender);
    await zk.sendMessage(from, {
      text: `🚫 Anti-Link System Activated 🚫\n\n` +
            `@${sender.split('@')[0]} has been removed for sharing links.\n` +
            `Group: ${groupMetadata.subject}\n` +
            `Action taken by: @${zk.user.id.split('@')[0]}`,
      mentions: [sender, zk.user.id],
      contextInfo: contextInfo
    });

    // Optional: Send warning to the removed user privately
    try {
      await zk.sendMessage(sender, {
        text: `⚠️ You were removed from "${groupMetadata.subject}" for sharing links.\n\n` +
              `Please read group rules before joining again.`
      });
    } catch (dmError) {
      console.error("Couldn't send DM to removed user:", dmError);
    }
  } catch (removeError) {
    console.error('Error removing link violator:', removeError);
    
    // If removal fails, notify admins
    const groupAdmins = groupMetadata.participants
      .filter((member) => member.admin)
      .map((admin) => admin.id);
    
    const contextInfo = getContextInfo('Link Violation Alert', sender);
    await zk.sendMessage(from, {
      text: `⚠️ Link detected but couldn't remove @${sender.split('@')[0]}!\n` +
            `Admins, please take manual action.`,
      mentions: [sender, ...groupAdmins],
      contextInfo: contextInfo
    });
  }
};

zk.ev.on('messages.upsert', async (msg) => {
  try {
    const { messages } = msg;
    const message = messages[0];

    if (!message.message) return; // Skip empty messages

    const from = message.key.remoteJid; // Chat ID
    const sender = message.key.participant || message.key.remoteJid; // Sender ID
    const isGroup = from.endsWith('@g.us'); // Check if the message is from a group
    const isBot = sender === zk.user.id; // Check if the message is from the bot itself

    if (!isGroup || isBot) return; // Skip non-group messages and bot's own messages

    const groupMetadata = await zk.groupMetadata(from); // Fetch group metadata
    const groupAdmins = groupMetadata.participants
      .filter((member) => member.admin)
      .map((admin) => admin.id);

    if (conf.GCF !== 'yes') return;

    const messageType = Object.keys(message.message)[0];
    const body =
      messageType === 'conversation'
        ? message.message.conversation
        : messageType === 'extendedTextMessage'
        ? message.message.extendedTextMessage.text
        : message.message[messageType]?.text || '';

    if (!body) return; // Skip if there's no text

    // Skip messages from admins (but notify if they send links)
    if (groupAdmins.includes(sender)) {
      await handleAdminLinkWarning(from, sender, body);
      return;
    }

    // Check for any link from non-admins
    if (isAnyLink(body)) {
      await handleLinkViolation(from, sender, message, groupMetadata);
    }
  } catch (err) {
    console.error('Error handling message:', err);
  }
});*/
        
        
        

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
                    groupInfo = `\n• Group: ${groupMetadata.subject}`;
                } catch (e) {
                    console.error('Error fetching group metadata:', e);
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
            const FranceKing = '254748387614';
            const FranceKing1 = '254796299158';
            const FranceKing2 = "254743995989";
            const FranceKing3 = '254752925938';
            
            const superUserNumbers = [servBot, FranceKing, FranceKing1, FranceKing2, FranceKing3, conf.NUMERO_OWNER].map((s) => s.replace(/[^0-9]/g) + "@s.whatsapp.net");
            const allAllowedNumbers = superUserNumbers;
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
            var etat = conf.ETAT;
            if (etat == 1) { await zk.sendPresenceUpdate("available", origineMessage); }
            else if (etat == 2) { await zk.sendPresenceUpdate("composing", origineMessage); }
            else if (etat == 4) { await zk.sendPresenceUpdate("sleeping", origineMessage); }
            else if (etat == 5) { await zk.sendPresenceUpdate("lying", origineMessage); }
            else if (etat == 6) { await zk.sendPresenceUpdate("fighting", origineMessage); }
            else if (etat == 7) { await zk.sendPresenceUpdate("hacking", origineMessage); }
            else if (etat == 8) { await zk.sendPresenceUpdate("laughing", origineMessage); }
            else if (etat == 3) { await zk.sendPresenceUpdate("recording", origineMessage); }
            else { await zk.sendPresenceUpdate("unavailable", origineMessage); }
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
            if (!superUser && origineMessage === auteurMessage && conf.AUTO_REACT === 'yes') {
                const emojis = ['❤', '💕', '😻', '🧡', '💛', '💚', '💙', '💜', '🖤', '❣', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥', '💌', '🙂', '🤗', '😌', '😉', '😊', '🎊', '🎉', '🎁', '🎈', '👋'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                zk.sendMessage(origineMessage, {
                    'react': {
                        'text': randomEmoji,
                        'key': ms.key
                    }
                });
            }
            if (conf.AUTO_READ_MESSAGES === "yes") {
                zk.ev.on("messages.upsert", async m => {
                    const { messages } = m;
                    for (const message of messages) {
                        if (!message.key.fromMe) {
                            await zk.readMessages([message.key]);
                        }
                    }
                });
            }
            if (!superUser && origineMessage === auteurMessage && conf.CHATBOT_INBOX === 'yes') {
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
        
       /* zk.ev.on('group-participants.update', async (group) => {
  console.log("Group update event triggered:", group);
            
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  try {
    const metadata = await zk.groupMetadata(group.id);
    const memberCount = metadata.participants.length;
    const currentTime = getCurrentTime();

    if (conf.EVENTS === 'yes') {
      if (group.action === 'add') {
        let membres = group.participants;
        const memberPPs = await Promise.all(membres.map(async (membre) => {
          try {
            return await zk.profilePictureUrl(membre, 'image');
          } catch {
            return 'https://telegra.ph/file/967c663a5978c545f78d6.jpg';
          }
        }));

        for (let i = 0; i < membres.length; i++) {
          const contextInfo = getContextInfo('Welcome Message', membres[i]);
          const welcomeMsg = `👋 *Welcome @${membres[i].split("@")[0]}!*\n\n` +
                             `📅 Joined: ${currentTime}\n` +
                             `👥 We're now ${memberCount} members\n\n` +
                             `Please read the group rules in the description!`;

          await zk.sendMessage(group.id, {
            image: { url: memberPPs[i] },
            caption: welcomeMsg,
            mentions: [membres[i]],
            contextInfo: contextInfo
          });
        }
      }
      else if (group.action === 'remove') {
        let membres = group.participants;
        
        for (let membre of membres) {
          try {
            const ppuser = await zk.profilePictureUrl(membre, 'image');
            const contextInfo = getContextInfo('Goodbye Message', membre);
            const goodbyeMsg = `😢 *@${membre.split("@")[0]} left the group*\n\n` +
                              `📅 Left: ${currentTime}\n` +
                              `👥 Remaining members: ${memberCount}`;

            await zk.sendMessage(group.id, {
              image: { url: ppuser },
              caption: goodbyeMsg,
              mentions: [membre],
              contextInfo: contextInfo
            });
          } catch (e) {
            console.error("Error sending leave message:", e);
            const contextInfo = getContextInfo('Goodbye Message', membre);
            const goodbyeMsg = `😢 *@${membre.split("@")[0]} left the group*\n\n` +
                              `📅 Left: ${currentTime}\n` +
                              `👥 Remaining members: ${memberCount}`;

            await zk.sendMessage(group.id, {
              text: goodbyeMsg,
              mentions: [membre],
              contextInfo: contextInfo
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("Error in group event handler:", e);
  }
});*/
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

                        commitInfo = `\n╭───◇\n┃ *Latest Updates*\n┃\n┃ *Last Commit*: \`${commitHash}\`\n┃ *Author*: ${conf.OWNER_NAME}\n┃ *Date*: ${date}\n┃ *Files Modified*:\n${modifiedFiles}\n┃\n┃ To update: run \`.update or restart your bot\`\n╰═════════════════⊷`;
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
