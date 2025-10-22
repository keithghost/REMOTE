const { keith } = require('../commandHandler');
const axios = require('axios');

keith({
    pattern: "twitter",
    alias: ["tw", "twdl", "x"],
    desc: "Download Twitter/X videos",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) return sendReply(client, m, "Please provide a Twitter URL to download");
        
        // Validate Twitter URL
        if (!text.match(/twitter\.com|x\.com/)) {
            return sendReply(client, m, "❌ Please provide a valid Twitter URL");
        }

        const twitterData = await handleTwitter(text);
        if (!twitterData) {
            return sendReply(client, m, "❌ Failed to download Twitter content");
        }

        return await sendTwitterResponse(context, twitterData);
    } catch (error) {
        console.error("Twitter error:", error);
        return sendReply(context.client, context.m, `❌ An error occurred: ${error.message}`);
    }
});

async function handleTwitter(url) {
    try {
        const apiUrl = `https://apis-keith.vercel.app/download/twitter?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl, {
            timeout: 15000
        });
        
        if (response.data?.status && response.data?.result) {
            return {
                description: response.data.result.desc || "Twitter Video",
                thumbnail: response.data.result.thumb,
                videoSD: response.data.result.video_sd,
                videoHD: response.data.result.video_hd,
                audio: response.data.result.audio
            };
        }
        throw new Error("Invalid Twitter API response");
    } catch (error) {
        console.error("Twitter handler error:", error);
        throw error;
    }
}

async function sendTwitterResponse(context, twitterData) {
    const { client, m } = context;
    
    try {
        const caption = `╭═════════════════⊷
║  ⬇️ *Twitter Downloader* ⬇️
║━━━━━━━━━━━━━━━━━
║ *Description*: ${twitterData.description}
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗕𝗘𝗟𝗢𝗪 𝗡𝗨𝗠𝗕𝗘𝗥𝗦
║ 1. HD Quality Video (720p)
║ 2. SD Quality Video (480p)
║ 3. Audio Only
║ 4. Thumbnail Image
╰═════════════════⊷`;

        const message = await client.sendMessage(m.chat, {
            image: { url: twitterData.thumbnail },
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
                        case '1': // HD Video
                            await client.sendMessage(chatId, {
                                video: { url: twitterData.videoHD },
                                caption: twitterData.description
                            }, { quoted: messageContent });
                            break;
                            
                        case '2': // SD Video
                            await client.sendMessage(chatId, {
                                video: { url: twitterData.videoSD },
                                caption: twitterData.description
                            }, { quoted: messageContent });
                            break;
                            
                        case '3': // Audio
                            await client.sendMessage(chatId, {
                                audio: { url: twitterData.audio },
                                mimetype: "audio/mp4",
                                caption: "Audio from: " + twitterData.description
                            }, { quoted: messageContent });
                            break;
                            
                        case '4': // Thumbnail
                            await client.sendMessage(chatId, {
                                image: { url: twitterData.thumbnail },
                                caption: "Thumbnail for: " + twitterData.description
                            }, { quoted: messageContent });
                            break;
                            
                        default:
                            await client.sendMessage(chatId, {
                                text: "❌ Invalid option selected"
                            }, { quoted: messageContent });
                    }
                } catch (error) {
                    console.error("Twitter reply handling error:", error);
                    await client.sendMessage(chatId, {
                        text: "❌ Failed to process your Twitter download request"
                    }, { quoted: messageContent });
                }
            }
        });
    } catch (error) {
        console.error("Twitter response sending error:", error);
        throw error;
    }
}
