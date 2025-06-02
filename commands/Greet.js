
const { keith } = require('../keizzah/keith');
const { sendMessage, repondre } = require(__dirname + "/../keizzah/context");
const conf = require(__dirname + "/../set");

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
  nomCom: "channelmute",
  aliases: ["mutechannel", "silencechannel"],
  categorie: "channel",
  reaction: "🔇",
  description: "Mute the current WhatsApp channel"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  // Check if the message is from a channel
  if (!ms.key.remoteJid.endsWith('@newsletter')) {
    return repondre(zk, dest, ms, 
      "❌ This command must be used within a WhatsApp channel!\n" +
      "Join the channel you want to mute and use the command there."
    );
  }

  try {
    const channelJid = ms.key.remoteJid;
    
    // Get channel info
    const channelInfo = await zk.newsletterMetadata("invite", channelJid.split('@')[0]);

    // Common context info for messages
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Manager'}`,
        body: `Muting ${channelInfo.name}`,
        thumbnailUrl: channelInfo.picture?.url || conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Mute the channel immediately
    await zk.newsletterMute(channelJid);

    // Send success message
    await zk.sendMessage(dest, {
      text: `🔇 Successfully muted:\n*${channelInfo.name}*\n\n` +
            `You will no longer receive notifications from this channel.`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

  } catch (error) {
    console.error("Channel mute error:", error);
    
    let errorMessage = "❌ Failed to mute channel";
    if (error.message.includes("not found")) {
      errorMessage = "❌ Channel not found or you're not following it";
    } else if (error.message.includes("permission")) {
      errorMessage = "❌ You don't have permission to mute this channel";
    } else if (error.message.includes("already muted")) {
      errorMessage = "ℹ️ This channel is already muted";
    }

    repondre(zk, dest, ms, `${errorMessage}\nError: ${error.message}`);
  }
});


keith({
  nomCom: "channelunmute",
  aliases: ["unmutechannel", "soundchannel"],
  categorie: "channel",
  reaction: "🔊",
  description: "Unmute the current WhatsApp channel"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  // Check if the message is from a channel
  if (!ms.key.remoteJid.endsWith('@newsletter')) {
    return repondre(zk, dest, ms, 
      "❌ This command must be used within a WhatsApp channel!\n" +
      "Join the channel you want to unmute and use the command there."
    );
  }

  try {
    const channelJid = ms.key.remoteJid;
    
    // Get channel info
    const channelInfo = await zk.newsletterMetadata("invite", channelJid.split('@')[0]);

    // Common context info for messages
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Manager'}`,
        body: `Unmuting ${channelInfo.name}`,
        thumbnailUrl: channelInfo.picture?.url || conf.URL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Unmute the channel immediately
    await zk.newsletterUnmute(channelJid);

    // Send success message
    await zk.sendMessage(dest, {
      text: `🔊 Successfully unmuted:\n*${channelInfo.name}*\n\n` +
            `You will now receive notifications from this channel.`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

  } catch (error) {
    console.error("Channel unmute error:", error);
    
    let errorMessage = "❌ Failed to unmute channel";
    if (error.message.includes("not found")) {
      errorMessage = "❌ Channel not found or you're not following it";
    } else if (error.message.includes("permission")) {
      errorMessage = "❌ You don't have permission to unmute this channel";
    } else if (error.message.includes("not muted")) {
      errorMessage = "ℹ️ This channel is not currently muted";
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
      `Usage: *${conf.PREFIX || '.'}channeldescription Your new channel description here*`
    );
  }

  const newDescription = arg.join(' ').trim();
  
  // Validate description length (WhatsApp limits description length)
  if (newDescription.length > 500) {
    return repondre(zk, dest, ms, "❌ Description must be 500 characters or less");
  }

  try {
    const channelJid = ms.key.remoteJid;
    
    // Common context info for messages
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Channel Manager'}`,
        body: "Updating channel description",
        thumbnailUrl: conf.THUMBNAIL || '',
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Get current channel info
    const channelInfo = await zk.newsletterMetadata("invite", channelJid.split('@')[0]);

    // Send updating status
    await zk.sendMessage(dest, {
      text: `⏳ Updating channel description...`,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    // Update the channel description
    await zk.newsletterUpdateDescription(channelJid, newDescription);

    // Send success message with old and new description
    await zk.sendMessage(dest, {
      text: `✅ Channel description updated successfully!\n\n` +
            `📌 *Previous Description:*\n${channelInfo.description || 'No description'}\n\n` +
            `🆕 *New Description:*\n${newDescription}`,
      contextInfo: {
        ...commonContextInfo,
        externalAdReply: {
          ...commonContextInfo.externalAdReply,
          title: `Description Updated | ${channelInfo.name}`,
          thumbnailUrl: channelInfo.picture?.url || conf.URL || ''
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error("Channel description update error:", error);
    
    let errorMessage = "❌ Failed to update channel description";
    if (error.message.includes("too long")) {
      errorMessage = "❌ Description is too long (max 500 characters)";
    } else if (error.message.includes("permission")) {
      errorMessage = "❌ You don't have permission to update this channel's description";
    }

    repondre(zk, dest, ms, `${errorMessage}\nError: ${error.message}`);
  }
});
