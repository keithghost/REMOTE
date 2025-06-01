
const { keith } = require('../keizzah/keith');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");
const conf = require(__dirname + "/../set");

keith({
  nomCom: "reactch",
  aliases: ["rch", "channelreact"],
  categorie: "WhatsApp",
  reaction: "❤️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
//channel codes
  // Validate input
  if (!arg || arg.length < 2) {
    return repondre(zk, dest, ms, 'Example: .reactch https://whatsapp.com/channel/xxxx emoji');
  }

  const channelUrl = arg[0].trim();
  if (!channelUrl.startsWith("https://whatsapp.com/channel/")) {
    return repondre(zk, dest, ms, "Please provide a valid WhatsApp channel URL.");
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
    const emojiInput = arg.slice(1).join(' ').toLowerCase();
    const styledEmoji = emojiInput.split('').map(c => {
      if (c === ' ') return '―';
      return stylishEmojiMap[c] || c;
    }).join('');

    // Extract channel and message IDs
    const urlParts = channelUrl.split('/');
    const channelId = urlParts[4];
    const messageId = urlParts[5] || '';

    if (!channelId) {
      return repondre(zk, dest, ms, "Invalid channel URL format. Couldn't extract channel ID.");
    }

    // Get channel metadata
    const channelInfo = await zk.newsletterMetadata("invite", channelId);
    
    // Common context info for messages
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel React'}`,
        body: `Reacting in ${channelInfo.name}`,
        thumbnailUrl: channelInfo.picture?.url || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Send initial processing message
    await zk.sendMessage(dest, {
      text: `⏳ Preparing to react with *${styledEmoji}* in *${channelInfo.name}*...`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    // Perform the reaction
    await zk.newsletterReactMessage(channelInfo.id, messageId, styledEmoji);

    // Send success message
    await zk.sendMessage(dest, {
      text: `✅ Successfully reacted with *${styledEmoji}* in *${channelInfo.name}*`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

  } catch (error) {
    console.error("Channel react error:", error);
    
    let errorMessage = "Failed to react to channel message.";
    if (error.message.includes("not found")) {
      errorMessage = "Channel or message not found. Please check the URL.";
    } else if (error.message.includes("permission")) {
      errorMessage = "You don't have permission to react to this message.";
    }

    repondre(zk, dest, ms, `${errorMessage}\nError: ${error.message}`);
  }
});
