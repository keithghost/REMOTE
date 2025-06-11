const { keith } = require('../commandHandler');
const axios = require('axios');
//const { keith } = require('../commandHandler');
const getFBInfo = require("@xaviabot/fb-downloader");

keith({
    pattern: "facebook",
    alias: ["fb", "fbdl"],
    desc: "Download Facebook videos with quality options",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, botname, sendReply } = context;

        // Validate input
        if (!text) {
            return await sendReply(client, m, 
                '📘 Please provide a Facebook URL\n\n' +
                'Example: *fb https://fb.watch/...*\n' +
                'Or: *facebook https://www.facebook.com/...*'
            );
        }
        
        // Extract URL
        const fbUrl = text.match(/(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i)?.[0];
        if (!fbUrl) {
            return await sendReply(client, m, 
                '❌ Invalid Facebook URL\n\n' +
                'Supported formats:\n' +
                '- https://fb.watch/...\n' +
                '- https://www.facebook.com/...'
            );
        }

        // Processing message
        const processingMsg = await sendReply(client, m, '⏳ Fetching Facebook video info...');

        try {
            // Fetch video info with timeout
            const result = await Promise.race([
                getFBInfo(fbUrl),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
                )
            ]);

            if (!result?.hd && !result?.sd) {
                throw new Error('No downloadable video found');
            }

            // Build menu message
            const caption = `╭═════════════════⊷
║  📹 *Facebook Video Downloader* 📹
║━━━━━━━━━━━━━━━━━
║ *Title:* ${result.title || 'Untitled Video'}
║ *Duration:* ${result.duration || 'N/A'}
║ *Source:* ${fbUrl}
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗡𝗨𝗠𝗕𝗘𝗥:
║ 1. HD Quality (MP4)
║ 2. SD Quality (MP4)
║ 3. Audio Only (MP3)
║━━━━━━━━━━━━━━━━━
║ Downloaded by ${botname}
╰═════════════════⊷`;

            // Send menu with thumbnail
            await client.sendMessage(m.chat, {
                image: { url: result.thumbnail || '' },
                caption: caption
            });

            // Delete processing message
            await client.sendMessage(m.chat, {
                delete: processingMsg.key
            });

            // Store video info for reply handling
            const messageId = (await client.sendMessage(m.chat, {
                text: "Please reply with the number of your choice"
            })).key.id;

            // Handle user reply
            client.ev.on("messages.upsert", async (update) => {
                const message = update.messages[0];
                if (!message.message || message.key.remoteJid !== m.chat) return;

                const replyText = message.message.conversation || 
                                message.message.extendedTextMessage?.text;
                const isReply = message.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;

                if (isReply) {
                    try {
                        await client.sendMessage(m.chat, {
                            react: { text: '⏳', key: message.key }
                        });

                        let response;
                        switch (replyText.trim()) {
                            case '1':
                                if (!result.hd) throw new Error('HD quality not available');
                                response = {
                                    video: { url: result.hd },
                                    caption: `📹 HD Video - ${result.title || ''}`,
                                    mimetype: 'video/mp4'
                                };
                                break;
                                
                            case '2':
                                if (!result.sd) throw new Error('SD quality not available');
                                response = {
                                    video: { url: result.sd },
                                    caption: `📹 SD Video - ${result.title || ''}`,
                                    mimetype: 'video/mp4'
                                };
                                break;
                                
                            case '3':
                                response = {
                                    audio: { url: result.hd || result.sd },
                                    mimetype: 'audio/mpeg',
                                    fileName: `${(result.title || 'facebook_audio').replace(/[^\w]/g, '_')}.mp3`
                                };
                                break;
                                
                            default:
                                await client.sendMessage(m.chat, {
                                    text: "❌ Invalid option. Please reply with 1, 2, or 3"
                                }, { quoted: message });
                                return;
                        }

                        await client.sendMessage(m.chat, response, { quoted: message });
                        
                    } catch (error) {
                        console.error('Reply handling error:', error);
                        await client.sendMessage(m.chat, {
                            text: `❌ Error: ${error.message}`
                        }, { quoted: message });
                    }
                }
            });

        } catch (error) {
            // Delete processing message on error
            await client.sendMessage(m.chat, {
                delete: processingMsg.key
            });
            throw error;
        }

    } catch (error) {
        console.error('Facebook Download Error:', error);
        
        const errorMessage = error.message.includes('private or restricted') 
            ? '🔒 This video is private or restricted'
            : error.message.includes('timeout')
                ? '⌛ Download timeout. Please try again later'
                : `❌ Error: ${error.message}`;
            
        await sendReply(client, m, errorMessage);
    }
});
keith({
    pattern: "tiktok",
    alias: ["tt", "tiktokdl"],
    desc: "Download TikTok videos",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply } = context;

        if (!text) return sendReply(client, m, "Please provide a TikTok URL to download");
        
        // Validate TikTok URL
        if (!text.match(/tiktok\.com|vm\.tiktok\.com/)) {
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
        const apiUrl = `https://ytdlp.giftedtech.web.id/api/ytmp4.php?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl, {
            timeout: 15000
        });
        
        if (response.data?.status && response.data?.success) {
            return {
                title: response.data.result.title || "TikTok Video",
                format: response.data.result.format || "Unknown",
                videoUrl: response.data.result.stream_url,
                downloadUrl: response.data.result.download_url,
                thumbnail: response.data.result.thumbnail,
                srcUrl: response.data.result.src_url
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
║ *Quality*: ${tiktokData.format}
║━━━━━━━━━━━━━━━━━
║ 𝗥𝗘𝗣𝗟𝗬 𝗪𝗜𝗧𝗛 𝗕𝗘𝗟𝗢𝗪 𝗡𝗨𝗠𝗕𝗘𝗥𝗦
║ 1. Stream Video (MP4)
║ 2. Download Video document 
║ 3. tiktok audio
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
                        case '1': // Stream Video (MP4)
                            await client.sendMessage(chatId, {
                                video: { url: tiktokData.videoUrl },
                                caption: tiktokData.title
                            }, { quoted: messageContent });
                            break;
                            
                        case '2': // Download Video (MP4)
                            await client.sendMessage(chatId, {
                                document: { url: tiktokData.downloadUrl },
                                mimetype: "video/mp4",
                                fileName: `${tiktokData.title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp4`
                            }, { quoted: messageContent });
                            break;
                            
                        case '3': // Thumbnail (Image)
                            await client.sendMessage(chatId, {
                                audio: { url: tiktokData.downloadUrl },
                                mimetype: "audio/mp4",
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
