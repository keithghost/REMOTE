const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');


//========================================================================================================================



keith({
    pattern: "forwardch",
    alias: ["fwdh", "sendtochannel"],
    desc: "Forward messages to WhatsApp channels",
    category: "Channel",
    react: "📤",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, botname, reply } = context;
            
            // Get quoted message
            const quoted = m.quoted ? m.quoted : null;
            const mime = quoted?.mimetype || "";
            
            // Help message if no arguments
            if (!text) {
                return reply(
                    `📤 *Channel Forward Usage:*\n` +
                    `• ${process.env.PREFIX || '.'}forwardch <channel-url> [quoted-message]\n` +
                    `Example: ${process.env.PREFIX || '.'}forwardch https://whatsapp.com/channel/xxxx (reply to a message)\n\n` +
                    `Supported media types:\n` +
                    `🎵 Audio (PTT) | 🎥 Video | 🖼️ Image | 🏷️ Sticker | 📝 Text`
                );
            }

            // Extract channel URL from command
            const channelUrl = text.trim();
            
            if (!channelUrl.startsWith("https://whatsapp.com/channel/")) {
                return reply("❌ Please provide a valid WhatsApp channel URL starting with https://whatsapp.com/channel/");
            }

            // Check if there's a quoted message to forward
            if (!quoted) {
                return reply("❌ Please quote/reply to a message you want to forward to the channel");
            }

            // Extract channel ID from URL
            const urlParts = channelUrl.split('/');
            const channelId = urlParts[4];
            
            if (!channelId) {
                return reply("❌ Invalid channel URL format. Couldn't extract channel ID.");
            }

            try {
                // Get channel metadata
                const channelInfo = await client.newsletterMetadata("invite", channelId);
                
                // Prepare the message to forward based on media type
                let messageToForward = {};
                let mediaType = "text";

                if (/audio/.test(mime)) {
                    messageToForward.audio = quoted.audio;
                    messageToForward.mimetype = mime;
                    messageToForward.ptt = true; // Force audio to be PTT
                    mediaType = "audio";
                } else if (/video/.test(mime)) {
                    messageToForward.video = quoted.video;
                    messageToForward.mimetype = mime;
                    messageToForward.caption = quoted.caption || "";
                    mediaType = "video";
                } else if (/image/.test(mime)) {
                    if (quoted?.sticker) {
                        messageToForward.sticker = quoted.sticker;
                        mediaType = "sticker";
                    } else {
                        messageToForward.image = quoted.image;
                        messageToForward.mimetype = mime;
                        messageToForward.caption = quoted.caption || "";
                        mediaType = "image";
                    }
                } else if (quoted.text) {
                    messageToForward.text = quoted.text;
                    mediaType = "text";
                } else {
                    return reply("❌ Unsupported message type. Please quote audio, video, image, sticker, or text");
                }

                // Add context info
                messageToForward.contextInfo = {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: channelInfo.id,
                        serverMessageId: Math.floor(Math.random() * 999999),
                        newsletterName: channelInfo.name
                    },
                    externalAdReply: {
                        title: `${botname || 'Channel Forward'}`,
                        body: `Forwarded ${mediaType} to ${channelInfo.name}`,
                        thumbnailUrl: channelInfo.picture?.url || '',
                        mediaType: 1,
                        sourceUrl: channelUrl
                    }
                };

                // Send processing message
                await reply(`⏳ Forwarding ${mediaType} to channel *${channelInfo.name}*...`);

                // Forward the message to channel
                await client.sendMessage(channelInfo.id, messageToForward);

                // Send success message
                return reply(`✅ Successfully forwarded ${mediaType} to channel *${channelInfo.name}*`);

            } catch (error) {
                console.error("Channel forward error:", error);
                
                let errorMessage = "Failed to forward message to channel";
                if (error.message.includes("not found")) {
                    errorMessage = "Channel not found. Please check the URL.";
                } else if (error.message.includes("permission")) {
                    errorMessage = "You don't have permission to send to this channel.";
                } else if (error.message.includes("media")) {
                    errorMessage = "This media type isn't supported for channels.";
                }

                return reply(`❌ ${errorMessage}\nError: ${error.message}`);
            }
        });
    } catch (error) {
        console.error("Outer error in forwardch:", error);
        return context.reply("❌ An unexpected error occurred while processing your request.");
    }
});

//========================================================================================================================


keith({
    pattern: "channelreact",
    alias: ["rtch", "reactchannel"],
    desc: "React to channel posts",
    category: "Channel",
    react: "🧾",
    filename: __filename
}, async (context) => {
    try {
        await ownerMiddleware(context, async () => {
            const { client, m, text, botname, reply } = context;
            
            // Validate input
            if (!text || text.split(' ').length < 2) {
                return reply('Example: .reactch https://whatsapp.com/channel/xxxx emoji');
            }

            const args = text.split(' ');
            const channelUrl = args[0].trim();
            
            if (!channelUrl.startsWith("https://whatsapp.com/channel/")) {
                return reply("Please provide a valid WhatsApp channel URL.");
            }

            // Stylish emoji mapping
            const stylishEmojiMap = {
                a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
                h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
                o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
                v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
                '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
                '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
            };

            try {
                // Process emoji input
                const emojiInput = args.slice(1).join(' ').toLowerCase();
                const styledEmoji = emojiInput.split('').map(c => {
                    if (c === ' ') return '―';
                    return stylishEmojiMap[c] || c;
                }).join('');

                // Extract channel and message IDs
                const urlParts = channelUrl.split('/');
                const channelId = urlParts[4];
                const messageId = urlParts[5] || '';

                if (!channelId) {
                    return reply("Invalid channel URL format. Couldn't extract channel ID.");
                }

                // Get channel metadata
                const channelInfo = await client.newsletterMetadata("invite", channelId);
                
                // Common context info for messages
                const commonContextInfo = {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: `${botname || 'Channel React'}`,
                        body: `Reacting in ${channelInfo.name}`,
                        thumbnailUrl: channelInfo.picture?.url || '',
                        sourceUrl: channelUrl || '',
                        mediaType: 1,
                        renderLargerThumbnail: false
                    }
                };

                // Send initial processing message
                await client.sendMessage(m.chat, {
                    text: `⏳ Preparing to react with *${styledEmoji}* in *${channelInfo.name}*...`,
                    contextInfo: commonContextInfo
                }, { quoted: m });

                // Perform the reaction
                await client.newsletterReactMessage(channelInfo.id, messageId, styledEmoji);

                // Send success message
                await client.sendMessage(m.chat, {
                    text: `✅ Successfully reacted with *${styledEmoji}* in *${channelInfo.name}*`,
                    contextInfo: commonContextInfo
                }, { quoted: m });

            } catch (error) {
                console.error("Channel react error:", error);
                
                let errorMessage = "Failed to react to channel message.";
                if (error.message.includes("not found")) {
                    errorMessage = "Channel or message not found. Please check the URL.";
                } else if (error.message.includes("permission")) {
                    errorMessage = "You don't have permission to react to this message.";
                }

                return reply(`${errorMessage}\nError: ${error.message}`);
            }
        });
    } catch (error) {
        console.error("Outer error in channelreact:", error);
        return context.reply("An unexpected error occurred while processing your request.");
    }
});
