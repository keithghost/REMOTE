const { keith } = require('../commandHandler');
const axios = require('axios');
const yts = require("yt-search");

const API_BASE = "https://apis-keith.vercel.app";
keith({
    pattern: "tiktok",
    alias: ["tt", "tiktokdl"],
    desc: "Download TikTok videos with audio",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) return sendReply(client, m, "Please provide a TikTok URL to download");
        
        // Validate TikTok URL
        if (!text.match(/tiktok\.com|vt\.tiktok\.com/)) {
            return sendReply(client, m, "❌ Please provide a valid TikTok URL");
        }

        const tiktokData = await handleTikTok(text);
        if (!tiktokData) {
            return sendReply(client, m, "❌ Failed to download TikTok content");
        }

        return await sendTikTokResponse(context, tiktokData);
    } catch (error) {
        console.error("TikTok error:", error);
        return sendReply(context.client, context.m, `❌ An error occurred: ${error.message}`);
    }
});

async function handleTikTok(url) {
    try {
        const response = await axios.get(`${API_BASE}/download/tiktokdl?url=${encodeURIComponent(url)}`, {
            timeout: 15000
        });
        
        if (response.data?.status && response.data?.result) {
            return {
                title: response.data.result.title || "TikTok Video",
                caption: response.data.result.caption || "",
                videoUrl: response.data.result.nowm,
                audioUrl: response.data.result.mp3,
                thumbnail: response.data.result.thumbnail
            };
        }
        throw new Error("Invalid TikTok API response");
    } catch (error) {
        console.error("TikTok handler error:", error);
        throw error;
    }
}

async function sendTikTokResponse(context, tiktokData) {
    const { client, m } = context;
    
    try {
        const caption = `╭═════════════════⊷
║  ⬇️ *TikTok Downloader* ⬇️
║━━━━━━━━━━━━━━━━━
║ *Title*: ${tiktokData.title}
║ *Caption*: ${tiktokData.caption || "None"}
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗕𝗘𝗟𝗢𝗪 𝗡𝗨𝗠𝗕𝗘𝗥𝗦
║ 1. Video (MP4)
║ 2. Document (MP4)
║ 3. Audio (MP3)
║ 4. Document (MP3)
╰═════════════════⊷`;

        const message = await client.sendMessage(m.chat, {
            image: { url: tiktokData.thumbnail },
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
                        case '1': // Video (MP4)
                            await client.sendMessage(chatId, {
                                video: { url: tiktokData.videoUrl },
                                caption: tiktokData.title
                            }, { quoted: messageContent });
                            break;
                            
                        case '2': // Document (MP4)
                            await client.sendMessage(chatId, {
                                document: { url: tiktokData.videoUrl },
                                mimetype: "video/mp4",
                                fileName: `${tiktokData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp4`
                            }, { quoted: messageContent });
                            break;
                            
                        case '3': // Audio (MP3)
                            await client.sendMessage(chatId, {
                                audio: { url: tiktokData.audioUrl },
                                mimetype: "audio/mpeg"
                            }, { quoted: messageContent });
                            break;
                            
                        case '4': // Document (MP3)
                            await client.sendMessage(chatId, {
                                document: { url: tiktokData.audioUrl },
                                mimetype: "audio/mpeg",
                                fileName: `${tiktokData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`
                            }, { quoted: messageContent });
                            break;
                            
                        default:
                            await client.sendMessage(chatId, {
                                text: "❌ Invalid option selected"
                            }, { quoted: messageContent });
                    }
                } catch (error) {
                    console.error("TikTok reply handling error:", error);
                    await client.sendMessage(chatId, {
                        text: "❌ Failed to process your TikTok download request"
                    }, { quoted: messageContent });
                }
            }
        });
    } catch (error) {
        console.error("TikTok response sending error:", error);
        throw error;
    }
}
