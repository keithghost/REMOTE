const { keith } = require('../commandHandler');
const axios = require('axios');

keith({
    pattern: "tiktok2",
    alias: ["tt2", "tiktokdl2"],
    desc: "Download TikTok videos with quality options",
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

async function handleTikTok(url, format = '720p') {
    try {
        const apiUrl = `https://ytdlp.giftedtech.web.id/api/ytmp4.php?url=${encodeURIComponent(url)}&format=${format}`;
        const response = await axios.get(apiUrl, { timeout: 15000 });
        
        if (response.data?.status && response.data?.result) {
            return {
                title: response.data.result.title || "TikTok Video",
                thumbnail: response.data.result.thumbnail,
                streamUrl: response.data.result.stream_url,
                downloadUrl: response.data.result.download_url,
                info: response.data.result.info,
                availableFormats: ['360p', '480p', '720p', '1080p', '2160p']
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
║━━━━━━━━━━━━━━━━━
║ *Available Qualities*:
║ 1. 360p
║ 2. 480p
║ 3. 720p (Default)
║ 4. 1080p
║ 5. 2160p (4K)
║━━━━━━━━━━━━━━━━━
║ *Info*: ${tiktokData.info}
╰═════════════════⊷

Reply with the quality number you want (1-5)`;

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

                    const qualityMap = {
                        '1': '360p',
                        '2': '480p',
                        '3': '720p',
                        '4': '1080p',
                        '5': '2160p'
                    };

                    const selectedQuality = qualityMap[responseText];
                    
                    if (selectedQuality) {
                        // Show "Processing" message
                        await client.sendMessage(chatId, {
                            text: `⬇️ Downloading video in ${selectedQuality} quality...`
                        }, { quoted: messageContent });

                        // Get the video in selected quality
                        const qualityData = await handleTikTok(messageContent.message.extendedTextMessage.contextInfo.quotedMessage.conversation.match(/(https?:\/\/[^\s]+)/)[0], selectedQuality);
                        
                        // Send the video
                        await client.sendMessage(chatId, {
                            video: { url: qualityData.streamUrl },
                            caption: `${qualityData.title} (${selectedQuality})`
                        });
                    } else {
                        await client.sendMessage(chatId, {
                            text: "❌ Invalid option selected. Please reply with a number between 1-5"
                        }, { quoted: messageContent });
                    }
                } catch (error) {
                    console.error("TikTok reply handling error:", error);
                    await client.sendMessage(chatId, {
                        text: "❌ Failed to process your TikTok download request. The video may not be available in the selected quality."
                    }, { quoted: messageContent });
                }
            }
        });
    } catch (error) {
        console.error("TikTok response sending error:", error);
        throw error;
    }
}
keith({
    pattern: "tiktok",
    alias: ["tt", "tiktokdl"],
    desc: "Download TikTok videos with audio",
    category: "Download",
    react: "⬇️",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply, sendMediaMessage } = context;

        // Validate input
        if (!text) {
            return await sendReply(
                client, 
                m, 
                '🎵 Please provide a TikTok link\nExample: *tiktok https://vm.tiktok.com/...*'
            );
        }

        if (!text.match(/tiktok\.com|vt\.tiktok\.com/)) {
            return await sendReply(client, m, '❌ Invalid TikTok link');
        }

        // API endpoint
        const apiUrl = `https://bk9.fun/download/tiktok?url=${encodeURIComponent(text)}`;

        // Fetch data from API with timeout
        const response = await axios.get(apiUrl, { timeout: 10000 });
        const { data } = response;

        if (!data?.status || !data?.BK9) {
            throw new Error('Invalid response from API');
        }

        const videoData = data.BK9;
        
        if (!videoData?.videoUrl) {
            throw new Error('No video URL found in response');
        }

        // Build detailed caption
        const caption = `
╭═════════════════⊷
║ *TikTok Downloader*
║ *Description:* ${videoData.desc || 'No description'}
║ *Author:* ${videoData.nickname || 'Unknown'}
║ *Music:* ${videoData.music_info?.title || 'No music info'}
║ *Likes:* ${videoData.likes_count?.toLocaleString() || '0'}
║ *Comments:* ${videoData.comment_count?.toLocaleString() || '0'}
╰═════════════════⊷`.trim();

        // Send video
        await sendMediaMessage(client, m, {
            video: { url: videoData.videoUrl },
            caption: caption,
            gifPlayback: false
        });

    } catch (error) {
        console.error('TikTok Download Error:', error);
        await sendReply(
            client, 
            m, 
            `❌ Failed to download TikTok: ${error.message}\nPlease try again later or use a different link.`
        );
    }
});
