const { keith } = require('../commandHandler');
const getFBInfo = require("@xaviabot/fb-downloader");

keith({
    pattern: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download Facebook videos",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) return sendReply(client, m, "📘 Please provide a Facebook URL\nExample: *fb https://fb.watch/...*");
        
        const fbUrl = text.match(/(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i)?.[0];
        if (!fbUrl) return sendReply(client, m, '❌ Invalid Facebook URL');

        const fbData = await handleFacebook(fbUrl);
        if (!fbData) {
            return sendReply(client, m, "❌ Failed to download Facebook content");
        }

        return await sendFacebookResponse(context, fbData);
    } catch (error) {
        console.error("Facebook error:", error);
        return sendReply(context.client, context.m, `❌ An error occurred: ${error.message}`);
    }
});

async function handleFacebook(url) {
    try {
        const result = await getFBInfo(url);
        if (!result?.hd && !result?.sd) {
            throw new Error("No downloadable video found");
        }

        return {
            title: result.title || "Facebook Video",
            hdUrl: result.hd,
            sdUrl: result.sd || result.hd, // Fallback to HD if SD not available
            thumbnail: result.thumbnail
        };
    } catch (error) {
        console.error("Facebook handler error:", error);
        throw error;
    }
}

async function sendFacebookResponse(context, fbData) {
    const { client, m } = context;
    
    try {
        const caption = `╭═════════════════⊷
║  ⬇️ *Facebook Downloader* ⬇️
║━━━━━━━━━━━━━━━━━
║ *Title*: ${fbData.title}
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗕𝗘𝗟𝗢𝗪 𝗡𝗨𝗠𝗕𝗘𝗥𝗦
║ 1. HD Quality (MP4)
║ 2. SD Quality (MP4)
║ 3. AUDIO
╰═════════════════⊷`;

        const message = await client.sendMessage(m.chat, {
            image: { url: fbData.thumbnail },
            caption: caption
        });

        const messageId = message.key.id;

        client.ev.on("messages.upsert", async (update) => {
            const messageContent = update.messages[0];
            if (!messageContent.message) return;

            const responseText = messageContent.message.conversation || 
                               messageContent.message.extendedTextMessage?.text;
            const chatId = messageContent.key.remoteJid;

            const isReplyToMessage = messageContent.message.extendedTextMessage?.contextInfo.stanzaId === messageId;

            if (isReplyToMessage) {
                try {
                    await client.sendMessage(chatId, {
                        react: { text: '⬇️', key: messageContent.key }
                    });

                    switch (responseText) {
                        case '1': // HD Quality
                            await client.sendMessage(chatId, {
                                video: { url: fbData.hdUrl },
                                caption: fbData.title
                            }, { quoted: messageContent });
                            break;
                            
                        case '2': // SD Quality
                            await client.sendMessage(chatId, {
                                video: { url: fbData.sdUrl },
                                caption: fbData.title
                            }, { quoted: messageContent });
                            break;
                            
                        case '3': // Thumbnail
                            await client.sendMessage(chatId, {
                                audio: { url: fbData.sdUrl },
                                mimetype: 'audio/mp4',
                            }, { quoted: messageContent });
                            break;
                            
                        default:
                            await client.sendMessage(chatId, {
                                text: "❌ Invalid option selected"
                            }, { quoted: messageContent });
                    }
                } catch (error) {
                    console.error("Facebook reply handling error:", error);
                    await client.sendMessage(chatId, {
                        text: "❌ Failed to process your Facebook download request"
                    }, { quoted: messageContent });
                }
            }
        });
    } catch (error) {
        console.error("Facebook response sending error:", error);
        throw error;
    }
}
