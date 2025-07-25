const { keith } = require("../keizzah/keith");
const { downloadMediaMessage, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { exec } = require('child_process');
const { writeFile } = require("fs/promises");
const fs = require('fs-extra');
const moment = require("moment-timezone");
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { default: axios } = require('axios');

const conf = require(__dirname + "/../set");
//========================================================================================================================
//========================================================================================================================
// Tagall Command
keith({ nomCom: "tagall", categorie: 'Group', reaction: "📣" }, async (dest, zk, commandeOptions) => {
  const { ms, arg, nomGroupe, infosGroupe, repondre, nomAuteurMessage, superUser } = commandeOptions;

  const metadata = await zk.groupMetadata(dest);
  if (!metadata) {
    return repondre("✋🏿 This command is reserved for groups ❌");
  }

  const mess = arg && arg.length > 0 ? arg.join(' ') : 'No message provided';
  const membresGroupe = metadata.participants;

  let tag = `========================\n🌟 *ALPHA-MD* 🌟\n========================\n👥 Group: ${nomGroupe} 🚀\n👤 Author: *${nomAuteurMessage}* 👋\n📜 Message: *${mess}* 📝\n========================\n\n`;

  const emoji = ['🦴', '👀', '😮‍💨', '❌', '✔️', '😇', '⚙️', '🔧', '🎊', '😡', '🙏🏿', '⛔️', '$', '😟', '🥵', '🐅'];
  const random = Math.floor(Math.random() * (emoji.length - 1));

  membresGroupe.forEach(membre => {
    // Get just the display name without @lid
    const displayName = membre.id.split('@')[0];
    tag += `${emoji[random]} @${displayName}\n`;
  });

  await zk.sendMessage(dest, {
    text: tag,
    mentions: membresGroupe.map((i) => i.id) // Still using full JID for mentions
  });
});
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
// Demote Command
keith({ nomCom: "demote", categorie: 'Group', reaction: "⬇️" }, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre, nomAuteurMessage, auteurMessage, superUser, verifGroupe, verifAdmin, verifZokouAdmin, infosGroupe } = commandeOptions;

  if (!verifGroupe) {
    return repondre("✋🏿 This command is reserved for groups only ❌");
  }

  if (!verifAdmin) {
    return repondre("✋🏿 You must be an admin to use this command ❌");
  }

  // Check if user is mentioned or replied to
  const mentioned = ms.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const quoted = ms.message.extendedTextMessage?.contextInfo?.participant || '';

  let usersToDemote = [];
  
  if (mentioned.length > 0) {
    usersToDemote = mentioned;
  } else if (quoted) {
    usersToDemote.push(quoted);
  } else if (arg && arg[0] && arg[0].includes('@')) {
    usersToDemote.push(arg[0].replace('@', '') + '@s.whatsapp.net');
  } else {
    return repondre("✋🏿 Please mention or reply to the user(s) you want to demote ❌\nExample: .demote @user");
  }

  // Filter out the bot itself and the group creator
  const metadata = await zk.groupMetadata(dest);
  const groupCreator = metadata.owner;
  
  usersToDemote = usersToDemote.filter(user => {
    return user !== auteurMessage && // Don't allow self-demotion
           user !== groupCreator && // Can't demote group creator
           !user.includes(zk.user.id); // Can't demote the bot
  });

  if (usersToDemote.length === 0) {
    return repondre("✋🏿 No valid users to demote ❌");
  }

  try {
    await zk.groupParticipantsUpdate(
      dest,
      usersToDemote,
      "demote"
    );

    let successMessage = "⬇️ Demoted user(s):\n";
    usersToDemote.forEach(user => {
      const username = user.split('@')[0];
      successMessage += `▸ @${username}\n`;
    });

    await zk.sendMessage(dest, {
      text: successMessage,
      mentions: usersToDemote
    });

  } catch (error) {
    console.error("Demote error:", error);
    repondre("❌ An error occurred while trying to demote the user(s)");
  }
});
//========================================================================================================================
//========================================================================================================================

//========================================================================================================================
//========================================================================================================================
// Promote Command
keith({ nomCom: "promote", categorie: 'Group', reaction: "⬆️" }, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre, nomAuteurMessage, auteurMessage, superUser, verifGroupe, verifAdmin, verifZokouAdmin, infosGroupe } = commandeOptions;

  if (!verifGroupe) {
    return repondre("✋🏿 This command is reserved for groups only ❌");
  }

  if (!verifAdmin) {
    return repondre("✋🏿 You must be an admin to use this command ❌");
  }

  // Check if user is mentioned or replied to
  const mentioned = ms.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const quoted = ms.message.extendedTextMessage?.contextInfo?.participant || '';

  let usersToPromote = [];
  
  if (mentioned.length > 0) {
    usersToPromote = mentioned;
  } else if (quoted) {
    usersToPromote.push(quoted);
  } else if (arg && arg[0] && arg[0].includes('@')) {
    usersToPromote.push(arg[0].replace('@', '') + '@s.whatsapp.net');
  } else {
    return repondre("✋🏿 Please mention or reply to the user(s) you want to promote ❌\nExample: .promote @user");
  }

  // Filter out the bot itself (you might want to allow promoting the bot)
  usersToPromote = usersToPromote.filter(user => !user.includes(zk.user.id));

  if (usersToPromote.length === 0) {
    return repondre("✋🏿 No valid users to promote ❌");
  }

  try {
    await zk.groupParticipantsUpdate(
      dest,
      usersToPromote,
      "promote"
    );

    let successMessage = "⬆️ Promoted user(s):\n";
    usersToPromote.forEach(user => {
      const username = user.split('@')[0];
      successMessage += `▸ @${username}\n`;
    });

    await zk.sendMessage(dest, {
      text: successMessage,
      mentions: usersToPromote
    });

  } catch (error) {
    console.error("Promote error:", error);
    repondre("❌ An error occurred while trying to promote the user(s)");
  }
});
//========================================================================================================================
//========================================================================================================================

//========================================================================================================================
//========================================================================================================================
// Remove (Kick) Command
keith({ nomCom: "remove", aliases: ["kik"], categorie: 'Group', reaction: "🚪" }, async (dest, zk, commandeOptions) => {
  const { ms, arg, repondre, nomAuteurMessage, auteurMessage, superUser, verifGroupe, verifAdmin, verifZokouAdmin, infosGroupe } = commandeOptions;

  if (!verifGroupe) {
    return repondre("✋🏿 This command is reserved for groups only ❌");
  }

  if (!verifAdmin) {
    return repondre("✋🏿 You must be an admin to use this command ❌");
  }

  // Check if user is mentioned or replied to
  const mentioned = ms.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
  const quoted = ms.message.extendedTextMessage?.contextInfo?.participant || '';
  const reason = arg.join(' ') || 'No reason provided';

  let usersToRemove = [];
  
  if (mentioned.length > 0) {
    usersToRemove = mentioned;
  } else if (quoted) {
    usersToRemove.push(quoted);
  } else if (arg && arg[0] && arg[0].includes('@')) {
    usersToRemove.push(arg[0].replace('@', '') + '@s.whatsapp.net');
  } else {
    return repondre("✋🏿 Please mention or reply to the user(s) you want to remove ❌\nExample: .remove @user [reason]");
  }

  // Filter out yourself, group owner, and bot
  const metadata = await zk.groupMetadata(dest);
  const groupOwner = metadata.owner;
  
  usersToRemove = usersToRemove.filter(user => {
    return user !== auteurMessage && // Can't remove yourself
           user !== groupOwner &&    // Can't remove group owner
           !user.includes(zk.user.id); // Can't remove the bot
  });

  if (usersToRemove.length === 0) {
    return repondre("✋🏿 No valid users to remove ❌");
  }

  try {
    await zk.groupParticipantsUpdate(
      dest,
      usersToRemove,
      "remove"
    );

    let successMessage = `🚪 Removed user(s) from the group:\n` +
                         `📌 Reason: ${reason}\n\n`;
    
    usersToRemove.forEach(user => {
      const username = user.split('@')[0];
      successMessage += `▸ @${username}\n`;
    });

    await zk.sendMessage(dest, {
      text: successMessage,
      mentions: usersToRemove
    });

  } catch (error) {
    console.error("Remove error:", error);
    repondre("❌ An error occurred while trying to remove the user(s)");
  }
});
//========================================================================================================================
//========================================================================================================================

//========================================================================================================================
//========================================================================================================================
// Group Link Command
keith({ nomCom: "link", aliases: ["invite"], categorie: 'Group', reaction: "🔗" }, async (dest, zk, commandeOptions) => {
  const { repondre, nomAuteurMessage, nomGroupe, verifGroupe, verifAdmin } = commandeOptions;

  if (!verifGroupe) {
    return repondre("✋🏿 This command only works in groups ❌");
  }

  try {
    // Check if bot is admin (needed to generate link)
    if (!verifAdmin) {
      return repondre("✋🏿 I need to be admin to generate group link ❌");
    }

    const link = await zk.groupInviteCode(dest);
    const lien = `https://chat.whatsapp.com/${link}`;
    
    const mess = `🌟 *Group Invite Link* 🌟\n\n` +
                 `👥 *Group:* ${nomGroupe}\n` +
                 `👤 *Requested by:* ${nomAuteurMessage}\n\n` +
                 `🔗 *Link:* ${lien}\n\n` +
                 `_Share this link carefully!_\n` +
                 `_enjoy_`;

    await repondre(mess);

    // Optional: Also send the link as a button
    await zk.sendMessage(dest, {
      text: `Click below to join ${nomGroupe}`,
      templateButtons: [{
        index: 1,
        urlButton: {
          displayText: "Join Group",
          url: lien
        }
      }]
    });

  } catch (error) {
    console.error("Link error:", error);
    if (error.message.includes("401")) {
      repondre("❌ I don't have admin permissions to generate link");
    } else if (error.message.includes("404")) {
      repondre("❌ Group not found");
    } else {
      repondre("❌ Failed to generate group link");
    }
  }
});
//========================================================================================================================
//========================================================================================================================

 //========================================================================================================================
//========================================================================================================================
// Delete Command (No Confirmation)
keith({ 
  nomCom: "delete", 
  aliases: ["del", "dele"],
  categorie: 'Utility', 
  reaction: "🗑️" 
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, auteurMessage, verifAdmin, verifZokouAdmin, superUser } = commandeOptions;

  // Check if replying to a message
  if (!ms.message.extendedTextMessage?.contextInfo?.stanzaId) {
    return repondre("✋ Reply to a message to delete it");
  }

  const quotedMessage = ms.message.extendedTextMessage.contextInfo;
  const isFromGroup = dest.endsWith('@g.us');

  try {
    // Check permissions
    if (isFromGroup) {
      const isMessageSender = quotedMessage.participant === auteurMessage;
      if (!(verifAdmin || isMessageSender || superUser || verifZokouAdmin)) {
        return repondre("❌ You can only delete your own messages or need admin rights");
      }
    } else {
      const isMessageSender = quotedMessage.participant === auteurMessage;
      if (!(isMessageSender || superUser)) {
        return repondre("❌ You can only delete your own messages");
      }
    }

    // Delete the message silently
    await zk.sendMessage(dest, {
      delete: {
        id: quotedMessage.stanzaId,
        participant: quotedMessage.participant,
        remoteJid: dest,
        fromMe: quotedMessage.participant === zk.user.id
      }
    });

  } catch (error) {
    console.error("Delete error:", error);
    repondre("❌ Failed to delete - Check my permissions");
  }
});
//========================================================================================================================
//========================================================================================================================   
//========================================================================================================================
//========================================================================================================================
// Group Leave Command
keith({ 
  nomCom: "leave",  
  aliases: ["left"],
  categorie: 'Group', 
  reaction: "👋" 
}, async (dest, zk, commandeOptions) => {
  const { repondre, auteurMessage, superUser, verifGroupe } = commandeOptions;

  if (!verifGroupe) {
    return repondre("❌ This command only works in groups");
  }

  // Only bot owner can make the bot leave groups
  
  try {
    await zk.groupLeave(dest);
    
    // This message will only send if leave fails (successful leave won't trigger)
  } catch (error) {
    console.error("Leave error:", error);
    repondre("❌ Failed to leave group: " + error.message);
  }
});
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
// Group Name Command
keith({ 
  nomCom: "groupname", 
  aliases: ["gname", "gne"],
  categorie: 'Group', 
  reaction: "🏷️" 
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, verifGroupe, verifAdmin, auteurMessage } = commandeOptions;

  if (!verifGroupe) {
    return repondre("❌ This command only works in groups");
  }

  if (!verifAdmin) {
    return repondre("❌ You must be an admin to change group name");
  }

  const newName = arg.join(' ').trim();

  if (!newName || newName.length === 0) {
    return repondre("✍️ Please provide a new group name\nExample: .groupname Alpha Squad");
  }

  if (newName.length > 25) {
    return repondre("📛 Group name too long (max 25 characters)");
  }

  try {
    await zk.groupUpdateSubject(dest, newName);
    repondre(`✅ Group name updated to:\n*${newName}*`);
    
  } catch (error) {
    console.error("Name change error:", error);
    repondre("❌ Failed to change group name - Check my admin permissions");
  }
});
//========================================================================================================================
//========================================================================================================================
 //========================================================================================================================
//========================================================================================================================
// Group Description Command
keith({ 
  nomCom: "groupdesc", 
  aliases: ["gdesc"],
  categorie: 'Group', 
  reaction: "📝" 
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, verifGroupe, verifAdmin, auteurMessage } = commandeOptions;

  if (!verifGroupe) {
    return repondre("❌ This command only works in groups");
  }

  if (!verifAdmin) {
    return repondre("❌ You must be an admin to change group description");
  }

  const newDescription = arg.join(' ').trim();

  if (!newDescription || newDescription.length === 0) {
    // If no description provided, show current description
    try {
      const metadata = await zk.groupMetadata(dest);
      const currentDesc = metadata.desc || "No description set";
      return repondre(`📜 Current group description:\n\n${currentDesc}\n\nUse .groupdesc [text] to update`);
    } catch (error) {
      return repondre("❌ Failed to fetch current description");
    }
  }

  if (newDescription.length > 512) {
    return repondre("📛 Description too long (max 512 characters)");
  }

  try {
    await zk.groupUpdateDescription(dest, newDescription);
    repondre(`✅ Group description updated to:\n\n${newDescription}`);
    
  } catch (error) {
    console.error("Description change error:", error);
    repondre("❌ Failed to change description - Check my admin permissions");
  }
});
//========================================================================================================================
//========================================================================================================================   
//========================================================================================================================
//========================================================================================================================
// Hidetag Command (Mention all silently)
keith({ 
  nomCom: "hidetag",  
  categorie: 'Group', 
  reaction: "👥" 
}, async (dest, zk, commandeOptions) => {
  const { arg, ms, repondre, verifGroupe, infosGroupe, auteurMessage } = commandeOptions;

  if (!verifGroupe) {
    return repondre("❌ This command only works in groups");
  }

  try {
    const metadata = await zk.groupMetadata(dest);
    const members = metadata.participants;
    const tag = members.map(member => member.id);

    // Check if replying to a message
    const quotedMsg = ms.message.extendedTextMessage?.contextInfo?.quotedMessage;
    let messageContent = '';

    if (quotedMsg) {
      // Get content from quoted message
      if (quotedMsg.conversation) {
        messageContent = quotedMsg.conversation;
      } else if (quotedMsg.extendedTextMessage?.text) {
        messageContent = quotedMsg.extendedTextMessage.text;
      }
    } else if (arg.length > 0) {
      // Use provided text
      messageContent = arg.join(' ');
    } else {
      return repondre("✍️ Please provide text or reply to a message\nExample: .hidetag Hello everyone");
    }

    // Send message with hidden mentions
    await zk.sendMessage(dest, {
      text: messageContent,
      mentions: tag,
      ephemeralExpiration: 86400 // 24 hours (optional)
    });

  } catch (error) {
    console.error("Hidetag error:", error);
    repondre("❌ Failed to send hidden mention - Check my permissions");
  }
});
//========================================================================================================================
//========================================================================================================================  
      
      
