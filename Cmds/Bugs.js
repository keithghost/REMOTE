const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');


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
