
const { keith } = require('../keizzah/keith');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");
const conf = require(__dirname + "/../set");

let idChannelList = [
  { id: "120363266249040649@newsletter", name: "🗿" }
];


keith({
  nomCom: "reactgc",
  aliases: ["r", "groupreact"],
  categorie: "group",
  reaction: "❤️"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre } = commandeOptions;

  // Validate input
  if (!arg || arg.length < 2) {
    return repondre('Example: .react https://chat.whatsapp.com/xxxx emoji');
  }

  const groupUrl = arg[0].trim();
  if (!groupUrl.startsWith("https://chat.whatsapp.com/")) {
    return repondre("Please provide a valid WhatsApp group invite URL.");
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

    // Extract group ID from URL
    const groupId = groupUrl.split('/')[3];
    if (!groupId) {
      return repondre("Invalid group URL format. Couldn't extract group ID.");
    }

    // Get group metadata
    const groupInfo = await zk.groupMetadata(groupId);
    
    // Common context info for messages
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Group React'}`,
        body: `Reacting in ${groupInfo.subject}`,
        thumbnailUrl: groupInfo.picture?.url || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Send initial processing message
    await zk.sendMessage(dest, {
      text: `⏳ Preparing to react with *${styledEmoji}* in *${groupInfo.subject}*...`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    // Perform the reaction (assuming you're reacting to the quoted message)
    if (!ms.quoted) {
      return repondre("Please quote a message to react to.");
    }
    
    await zk.sendReaction(ms.quoted.key.remoteJid, ms.quoted.key.id, styledEmoji);

    // Send success message
    await zk.sendMessage(dest, {
      text: `✅ Successfully reacted with *${styledEmoji}* in *${groupInfo.subject}*`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

  } catch (error) {
    console.error("Group react error:", error);
    
    let errorMessage = "Failed to react to group message.";
    if (error.message.includes("not found")) {
      errorMessage = "Group or message not found. Please check the URL.";
    } else if (error.message.includes("permission")) {
      errorMessage = "You don't have permission to react to this message.";
    }

    repondre(`${errorMessage}\nError: ${error.message}`);
  }
});

keith({
  nomCom: "reactch",
  aliases: ["rch", "channelreact"],
  categorie: "channel",
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

keith({
  nomCom: "channeljid",
  aliases: ["newsletterjid", "getchannelid"],
  categorie: "channel",
  reaction: "🆔"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  // Check if the message is from a channel
  if (!ms.key.remoteJid.endsWith('@newsletter')) {
    return repondre(zk, dest, ms, "❌ This command only works in WhatsApp channels!");
  }

  try {
    const channelJid = ms.key.remoteJid;
    
    // Common context info for messages
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Info'}`,
        body: "Channel JID Information",
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Send the channel JID with formatted message
    await zk.sendMessage(dest, {
      text: `📬 *Channel JID Information*\n\n` +
            `• *Full JID:* ${channelJid}\n` +
            `• *Channel ID:* ${channelJid.split('@')[0]}\n\n` +
            `Use this ID for channel-related commands.`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

  } catch (error) {
    console.error("Channel JID error:", error);
    repondre(zk, dest, ms, `❌ Failed to get channel JID. Error: ${error.message}`);
  }
});

keith({
  nomCom: "channelname",
  aliases: ["channame", "setchannelname", "updatenewsletter"],
  categorie: "channel",
  reaction: "✏️",
  description: "Update WhatsApp channel name"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Check if the message is from a channel
  if (!ms.key.remoteJid.endsWith('@newsletter')) {
    return repondre(zk, dest, ms, "❌ This command only works in WhatsApp channels!");
  }

  // Validate new name input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 
      "✏️ Please provide a new name for the channel!\n" +
      `Example: *${conf.PREFIX || '.'}channelname New Channel Name*`
    );
  }

  const newName = arg.join(' ').trim();
  
  // Validate name length (WhatsApp limits channel names to 100 chars)
  if (newName.length > 100) {
    return repondre(zk, dest, ms, "❌ Channel name must be 100 characters or less");
  }

  try {
    // Common context info for messages
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Manager'}`,
        body: "Updating channel name",
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Send updating status
    await zk.sendMessage(dest, {
      text: `⏳ Updating channel name to "${newName}"...`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    // Update the channel name
    await zk.newsletterUpdateName(ms.key.remoteJid, newName);

    // Send success message
    await zk.sendMessage(dest, {
      text: `✅ Channel name successfully updated to:\n"*${newName}*"`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

  } catch (error) {
    console.error("Channel name update error:", error);
    
    let errorMessage = "❌ Failed to update channel name";
    if (error.message.includes("too long")) {
      errorMessage = "❌ Channel name is too long (max 100 characters)";
    } else if (error.message.includes("permission")) {
      errorMessage = "❌ You don't have permission to rename this channel";
    }

    repondre(zk, dest, ms, `${errorMessage}\nError: ${error.message}`);
  }
});

keith({
  nomCom: "channelfollow",
  aliases: ["followchannel", "subscribechannel"],
  categorie: "channel",
  reaction: "📩",
  description: "Follow a WhatsApp channel using its link"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 
      `📌 Usage: *${conf.PREFIX || '.'}channelfollow <channel-link>*\n` +
      `Example: *${conf.PREFIX || '.'}channelfollow https://whatsapp.com/channel/XXXXXX*`
    );
  }

  const channelLink = arg[0].trim();
  if (!channelLink.startsWith("https://whatsapp.com/channel/")) {
    return repondre(zk, dest, ms, "❌ Invalid channel link format. Please provide a valid WhatsApp channel link.");
  }

  try {
    // Extract channel ID from link
    const channelId = channelLink.split('/')[4];
    if (!channelId) {
      return repondre(zk, dest, ms, "❌ Could not extract channel ID from the link.");
    }

    // Common context info
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Manager'}`,
        body: "Following channel...",
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Get channel info first
    const channelInfo = await zk.newsletterMetadata("invite", channelId);

    // Send processing message
    await zk.sendMessage(dest, {
      text: `⏳ Preparing to follow: *${channelInfo.name}*...`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    // Follow the channel
    await zk.newsletterFollow(`${channelId}@newsletter`);

    // Success message
    await zk.sendMessage(dest, {
      text: `✅ Successfully followed channel:\n` +
            `*${channelInfo.name}*\n\n` +
            `📩 You will now receive updates from this channel.`,
      contextInfo: {
        ...commonContextInfo,
        externalAdReply: {
          ...commonContextInfo.externalAdReply,
          title: `Followed: ${channelInfo.name}`,
          thumbnailUrl: channelInfo.picture?.url || conf.URL || ''
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error("Channel follow error:", error);
    
    let errorMessage = "❌ Failed to follow channel";
    if (error.message.includes("already exists")) {
      errorMessage = "ℹ️ You're already following this channel";
    } else if (error.message.includes("not found")) {
      errorMessage = "❌ Channel not found or link is invalid";
    } else if (error.message.includes("permission")) {
      errorMessage = "❌ You don't have permission to follow this channel";
    }

    repondre(zk, dest, ms, `${errorMessage}\nError: ${error.message}`);
  }
});


keith({
  nomCom: "channelunfollow",
  aliases: ["unfollowchannel", "leavechannel"],
  categorie: "channel",
  reaction: "❌",
  description: "Unfollow a WhatsApp channel using its link"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 
      `📌 Usage: *${conf.PREFIX || '.'}channelunfollow <channel-link>*\n` +
      `Example: *${conf.PREFIX || '.'}channelunfollow https://whatsapp.com/channel/XXXXXX*`
    );
  }

  const channelLink = arg[0].trim();
  if (!channelLink.startsWith("https://whatsapp.com/channel/")) {
    return repondre(zk, dest, ms, "❌ Invalid channel link format. Please provide a valid WhatsApp channel link.");
  }

  try {
    // Extract channel ID from link
    const channelId = channelLink.split('/')[4];
    if (!channelId) {
      return repondre(zk, dest, ms, "❌ Could not extract channel ID from the link.");
    }

    // Common context info
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Manager'}`,
        body: "Unfollowing channel...",
        thumbnailUrl: conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Get channel info first
    const channelInfo = await zk.newsletterMetadata("invite", channelId);

    // Send confirmation prompt
    const confirmationMsg = await zk.sendMessage(dest, {
      text: `⚠️ Are you sure you want to unfollow:\n` +
            `*${channelInfo.name}*?\n\n` +
            `Reply with *yes* to confirm or *no* to cancel.`,
      contextInfo: {
        ...commonContextInfo,
        externalAdReply: {
          ...commonContextInfo.externalAdReply,
          title: `Unfollow: ${channelInfo.name}`,
          thumbnailUrl: channelInfo.picture?.url || conf.THUMBNAIL || ''
        }
      }
    }, { quoted: ms });

    // Set up reply handler
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message || messageContent.key.remoteJid !== dest) return;

        // Check if this is a reply to our confirmation message
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === confirmationMsg.key.id;
        if (!isReply) return;

        const response = messageContent.message.conversation?.toLowerCase() || 
                        messageContent.message.extendedTextMessage?.text?.toLowerCase();

        if (response === 'yes') {
          // Unfollow the channel
          await zk.newsletterUnfollow(`${channelId}@newsletter`);
          
          await zk.sendMessage(dest, {
            text: `✅ Successfully unfollowed:\n*${channelInfo.name}*\n\n` +
                  `You will no longer receive updates from this channel.`,
            contextInfo: commonContextInfo
          }, { quoted: messageContent });
          
        } else if (response === 'no') {
          await zk.sendMessage(dest, {
            text: `🚫 Operation cancelled.\n` +
                  `You're still following *${channelInfo.name}*`,
            contextInfo: commonContextInfo
          }, { quoted: messageContent });
        } else {
          await zk.sendMessage(dest, {
            text: "⚠️ Please reply with *yes* or *no* to confirm.",
            quoted: messageContent
          });
          return;
        }

        // Remove listener
        zk.ev.off("messages.upsert", replyHandler);

      } catch (error) {
        console.error("Unfollow error:", error);
        await zk.sendMessage(dest, {
          text: "❌ An error occurred while processing your request.",
          quoted: messageContent
        });
        zk.ev.off("messages.upsert", replyHandler);
      }
    };

    // Add event listener
    zk.ev.on("messages.upsert", replyHandler);

    // Timeout after 1 minute
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 60000);

  } catch (error) {
    console.error("Channel unfollow error:", error);
    
    let errorMessage = "❌ Failed to process channel unfollow";
    if (error.message.includes("not found")) {
      errorMessage = "❌ Channel not found or you're not following it";
    } else if (error.message.includes("permission")) {
      errorMessage = "❌ You don't have permission to unfollow this channel";
    }

    repondre(zk, dest, ms, `${errorMessage}\nError: ${error.message}`);
  }
});



keith({
  nomCom: "channeldescription",
  aliases: ["setdescription", "updatedescription", "chdesc"],
  categorie: "channel",
  reaction: "✏️",
  description: "Update WhatsApp channel description"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Check if the message is from a channel
  if (!ms.key.remoteJid.endsWith('@newsletter')) {
    return repondre(zk, dest, ms, "❌ This command only works in WhatsApp channels!");
  }

  // Validate description input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms,
      `✏️ Please provide a new description for the channel!\n` +
      `Usage: *${conf.PREFIX || '.'}channeldescription Your new description here*`
    );
  }

  const newDescription = arg.join(' ').trim();
  
  // Validate description length
  if (newDescription.length > 500) {
    return repondre(zk, dest, ms, "❌ Description must be 500 characters or less");
  }

  try {
    const channelJid = ms.key.remoteJid;
    const channelId = channelJid.split('@')[0];
    
    // Get channel info first to verify access
    const channelInfo = await zk.newsletterMetadata("invite", channelId);

    // Common context info
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Manager'}`,
        body: `Updating ${channelInfo.name}'s description`,
        thumbnailUrl: channelInfo.picture?.url || conf.THUMBNAIL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Update the description
    await zk.newsletterUpdateDescription(channelJid, newDescription);

    // Send success message
    await zk.sendMessage(dest, {
      text: `✅ Channel description updated successfully!\n\n` +
            `*${channelInfo.name}*\n` +
            `📝 New Description: ${newDescription}`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

  } catch (error) {
    console.error("Channel description error:", error);
    
    let errorMessage = "❌ Failed to update description";
    if (error.message.includes("too long")) {
      errorMessage = "❌ Description is too long (max 500 characters)";
    } else if (error.message.includes("permission")) {
      errorMessage = "❌ You don't have permission to edit this channel";
    }

    repondre(zk, dest, ms, `${errorMessage}\nError: ${error.message}`);
  }
});


keith({
  nomCom: "channelfwd",
  aliases: ["cfwd", "channelforward"],
  categorie: "channel",
  reaction: "📢",
  description: "Forward message to your WhatsApp channel (Admin only)"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre } = commandeOptions;

  // Check if user provided channel link and message
  if (!arg || arg.length < 2) {
    return repondre(
      `📌 Usage: *${conf.PREFIX || '.'}channelfwd <channel-link> <message>*\n` +
      `Example: *${conf.PREFIX || '.'}channelfwd https://whatsapp.com/channel/XXXXXX Hello members!*`
    );
  }

  const channelLink = arg[0].trim();
  const message = arg.slice(1).join(' ');

  // Validate channel link format
  if (!channelLink.startsWith("https://whatsapp.com/channel/")) {
    return repondre("❌ Invalid channel link format. Please provide a valid WhatsApp channel link.");
  }

  try {
    // Extract channel ID
    const channelId = channelLink.split('/')[4];
    if (!channelId) {
      return repondre("❌ Could not extract channel ID from the link.");
    }

    const channelJid = `${channelId}@newsletter`;

    // Verify admin status and get channel info
    const channelInfo = await zk.newsletterMetadata("invite", channelId);
    /*if (!channelInfo.canSend) {
      return repondre("❌ You need to be an admin of this channel to forward messages.");
    }*/

    // Common context info
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Manager'}`,
        body: `Message from admin`,
        thumbnailUrl: channelInfo.picture?.url || conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Forward the message
    await zk.sendMessage(channelJid, {
      text: `📢 *Admin Announcement*\n\n${message}`,
      contextInfo: commonContextInfo
    });

    return repondre(`✅ Message successfully forwarded to *${channelInfo.name}*`);

  } catch (error) {
    console.error("Channel forward error:", error);
    
    let errorMessage = "❌ Failed to forward message";
    if (error.message.includes("not found")) {
      errorMessage = "❌ Channel not found or invalid link";
    } else if (error.message.includes("permission")) {
      errorMessage = "❌ You don't have admin privileges for this channel";
    }

    return repondre(`${errorMessage}\nError: ${error.message}`);
  }
});

const axios = require('axios');




keith({
  nomCom: "playch",
  aliases: ["channelplay"],
  categorie: "channel",
  reaction: "🎵",
  description: "Send music to saved channels (Owner only)",
  owner: true
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre } = commandeOptions;

  // Help message if no arguments
  if (!arg || !arg[0]) {
    return repondre(
      `🎵 *Usage Examples:*\n` +
      `• ${conf.PREFIX || '.'}playch https://youtube.com/watch?v=xxx -1\n` +
      `• ${conf.PREFIX || '.'}playch "mellow vibes" -2\n` +
      `• ${conf.PREFIX || '.'}playch --addid id@newsletter | Channel Name\n` +
      `• ${conf.PREFIX || '.'}playch --delid 2`
    );
  }

  // Add ID Channel
  if (arg[0] === '--addid') {
    const input = arg.slice(1).join(' ').split('|').map(v => v.trim());
    const [idch, name] = input;

    if (!idch || !name) {
      return repondre("❌ Invalid format.\nExample: .playch --addid 120xxx@newsletter | Channel Name");
    }

    if (idChannelList.find(ch => ch.id === idch)) {
      return repondre("❌ Channel ID already exists.");
    }

    idChannelList.push({ id: idch, name });
    return repondre(`✅ Channel added as *${name}*`);
  }

  // Delete ID Channel
  if (arg[0] === '--delid') {
    const index = parseInt(arg[1]) - 1;
    if (isNaN(index) || !idChannelList[index]) {
      return repondre("❌ Invalid channel index.");
    }

    const removed = idChannelList.splice(index, 1);
    return repondre(`✅ Channel *${removed[0].name}* removed successfully.`);
  }

  // Process music sending
  try {
    // Extract channel index if specified (-1, -2 etc)
    const lastArg = arg[arg.length - 1];
    const channelIndexMatch = lastArg.match(/^-(\d+)$/);
    const chIndex = channelIndexMatch ? parseInt(channelIndexMatch[1]) - 1 : 0;
    const query = channelIndexMatch ? arg.slice(0, -1).join(' ') : arg.join(' ');
    const channel = idChannelList[chIndex];

    if (!channel) {
      return repondre(`❌ Channel #${chIndex + 1} not configured.`);
    }

    let audioInfo;
    if (/^https?:\/\//i.test(query)) {
      // YouTube URL
      const { data } = await axios.get(`https://cloudkutube.eu/api/yta?url=${encodeURIComponent(query)}`);
      if (data.status !== "success") throw new Error("Failed to get audio");
      audioInfo = data.result;
      audioInfo.videoUrl = query;
    } else {
      // Search query
      const search = await axios.get(`https://flowfalcon.dpdns.org/search/youtube?q=${encodeURIComponent(query)}`);
      if (!search.data?.result?.length) throw new Error("Video not found");
      const video = search.data.result[0];
      const { data } = await axios.get(`https://cloudkutube.eu/api/yta?url=${encodeURIComponent(video.link)}`);
      if (data.status !== "success") throw new Error("Failed to get audio");
      audioInfo = data.result;
      audioInfo.videoUrl = video.link;
    }

    // Download audio
    const audioRes = await axios.get(audioInfo.url, { responseType: "arraybuffer" });
    const audioBuffer = Buffer.from(audioRes.data, "binary");

    // Prepare context
    const contextInfo = {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channel.id,
        serverMessageId: Math.floor(Math.random() * 999999),
        newsletterName: channel.name
      },
      externalAdReply: {
        title: audioInfo.title,
        body: `By ${audioInfo.author}`,
        thumbnailUrl: audioInfo.thumbnail,
        mediaType: 1,
        sourceUrl: audioInfo.videoUrl
      }
    };

    // Send to channel
    await zk.sendMessage(channel.id, {
      audio: audioBuffer,
      mimetype: "audio/mp4",
      ptt: true,
      contextInfo
    });

    return repondre(
      `✅ Successfully sent to *${channel.name}*\n` +
      `🎵 *Title:* ${audioInfo.title}\n` +
      `👤 *Artist:* ${audioInfo.author}\n` +
      `#️⃣ *Channel Index:* ${chIndex + 1}`
    );

  } catch (error) {
    console.error("Playch error:", error);
    return repondre(`❌ Failed to send audio: ${error.message}`);
  }
});
