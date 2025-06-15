const { keith } = require('../commandHandler');
const axios = require('axios');
const getFBInfo = require("@xaviabot/fb-downloader");
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const { downloadAndSaveMediaMessage } = require('@whiskeysockets/baileys');
const acrcloud = require("acrcloud");
const catbox = new Catbox();

async function uploadToCatbox(filePath) {
  if (!fs.existsSync(filePath)) throw new Error("File does not exist");
  try {
    const uploadResult = await catbox.uploadFile({ path: filePath });
    if (uploadResult) return uploadResult;
    else throw new Error("Error retrieving file link");
  } catch (error) {
    throw new Error(String(error));
  }
}


keith({
    pattern: "shazam",
    alias: ["arcloud", "arc"],
    desc: "Identify music artist",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { m, mime, reply } = context;

        if (!/video|audio/.test(mime)) {
            return reply("Please tag an audio or short video message so I can analyze it.");
        }

        const acr = new acrcloud({
            host: 'identify-ap-southeast-1.acrcloud.com',
            access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
            access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
        });

        const targetMsg = m.quoted ? m.quoted : m;
        let buffer;

        try {
            buffer = await targetMsg.download();
        } catch {
            return reply("Failed to download media. Please try again.");
        }

        const result = await acr.identify(buffer);
        const { status, metadata } = result;

        if (status.code !== 0) {
            return reply(`Recognition failed: ${status.msg}`);
        }

        if (!metadata?.music?.length) {
            return reply("No recognizable song found.");
        }

        const song = metadata.music[0];
        const txt = [
            `🎶 *Title:* ${song.title}`,
            song.artists ? `👤 *Artists:* ${song.artists.map(a => a.name).join(', ')}` : '',
            song.album ? `💿 *Album:* ${song.album.name}` : '',
            song.genres ? `🎧 *Genres:* ${song.genres.map(g => g.name).join(', ')}` : '',
            `📅 *Release Date:* ${song.release_date}`
        ].filter(Boolean).join('\n');

        reply(txt);
    } catch (error) {
        reply("Song not recognizable or an error occurred.");
    }
});

keith({
  pattern: "url",
  alias: ["upload", "urlconvert"],
  desc: "convert to url",
  category: "Download",
  react: "🎵",
  filename: __filename
}, async (context) => {
  try {
    const { client, m, sendReply } = context;
    const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (quotedMessage) {
      let filePath;

      if (quotedMessage.imageMessage) {
        filePath = await client.downloadAndSaveMediaMessage(quotedMessage.imageMessage);
      } else if (quotedMessage.videoMessage) {
        filePath = await client.downloadAndSaveMediaMessage(quotedMessage.videoMessage);
      } else if (quotedMessage.stickerMessage) {
        filePath = await client.downloadAndSaveMediaMessage(quotedMessage.stickerMessage);
      } else if (quotedMessage.audioMessage) {
        filePath = await client.downloadAndSaveMediaMessage(quotedMessage.audioMessage);
      } else if (quotedMessage.documentMessage) {
        filePath = await client.downloadAndSaveMediaMessage(quotedMessage.documentMessage);
      } else {
        return sendReply(client, m, "Please quote a supported file (image, video, audio, document, etc.) to upload.");
      }

      try {
        const link = await uploadToCatbox(filePath);
        await sendReply(client, m, `📁 File Uploaded:\n\n${link}`);
      } catch (error) {
        await sendReply(client, m, '❌ Error uploading file:\n' + error);
        console.error(error);
      }
    } else {
      return sendReply(client, m, "📌 Please quote a media or document message to upload.");
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }
});


keith({
    pattern: "spotify",
    alias: ["sp", "spotifydl"],
    desc: "Download Spotify tracks",
    category: "Download",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, botname, sendReply } = context;

        // Validate input
        if (!text) {
            return await sendReply(client, m, 
                '🎧 Please provide a Spotify track name or URL\n\n' +
                'Examples:\n' +
                '*spotify Spectre*\n' +
                '*spotify https://open.spotify.com/track/4Nwrh5BlZ8I31znYQULS7G*'
            );
        }

        // Show processing message
        const processingMsg = await sendReply(client, m, '🔍 Searching Spotify...');

        // Prepare query (URL or search term)
        const query = text.includes('spotify.com') ? encodeURIComponent(text) : encodeURIComponent(text);
        const apiUrl = `https://apis-keith.vercel.app/download/spotify?q=${query}`;

        // Fetch track info with timeout
        const response = await Promise.race([
            axios.get(apiUrl, { timeout: 15000 }),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Spotify API timeout')), 20000)
            )
        ]);

        if (!response.data?.status || !response.data?.result?.track?.downloadLink) {
            throw new Error('No downloadable track found');
        }

        const track = response.data.result.track;

        // Build caption
        const caption = `╭═════════════════⊷
║  🎵 *Spotify Downloader* 🎵
║━━━━━━━━━━━━━━━━━
║ *Title:* ${track.title}
║ *Artist:* ${track.artist}
║ *Duration:* ${track.duration}
║ *Popularity:* ${track.popularity}
║━━━━━━━━━━━━━━━━━
║ Downloaded by ${botname}
╰═════════════════⊷`;

        // Delete processing message
        await client.sendMessage(m.chat, { delete: processingMsg.key });

        // Send audio file with metadata
        await client.sendMessage(m.chat, {
            audio: { url: track.downloadLink },
            mimetype: 'audio/mpeg',
            fileName: `${track.artist} - ${track.name}.mp3`.replace(/[^\w\s.-]/g, ''),
            contextInfo: {
                externalAdReply: {
                    title: track.name,
                    body: track.artist,
                    thumbnailUrl: track.thumbnail,
                    mediaType: 2,
                    mediaUrl: track.url
                }
            },
            caption: caption
        });

    } catch (error) {
        console.error('Spotify Download Error:', error);
        
        let errorMessage;
        if (error.message.includes('timeout')) {
            errorMessage = '⌛ Server took too long to respond. Please try again later.';
        } else if (error.message.includes('No downloadable track')) {
            errorMessage = '❌ No downloadable track found. The song may not be available.';
        } else {
            errorMessage = `❌ Error: ${error.message}`;
        }
        
        await sendReply(client, m, errorMessage);
        
        // Delete processing message if it exists
        if (processingMsg) {
            await client.sendMessage(m.chat, { delete: processingMsg.key });
        }
    }
});
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
