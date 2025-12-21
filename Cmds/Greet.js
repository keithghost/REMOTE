const { keith } = require('../commandHandler');
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================


keith({
  pattern: "channelunmute",
  aliases: ["unmutec", "newsletterunmute"],
  category: "channel",
  description: "Unmute a WhatsApp channel"
}, async (from, client, conText) => {
  const { mek, reply } = conText;

  // Ensure command is run inside a channel
  if (!mek.key.remoteJid.endsWith("@newsletter")) {
    return reply("❌ This command only works in WhatsApp channels!");
  }

  try {
    // Unmute the channel
    await client.newsletterUnmute(mek.key.remoteJid);

    await reply("🔔 Channel unmuted successfully");
  } catch (err) {
    console.error("Channel unmute error:", err);
  }
});
//========================================================================================================================


keith({
  pattern: "channelmute",
  aliases: ["mutec", "newslettermute"],
  category: "channel",
  description: "Mute a WhatsApp channel"
}, async (from, client, conText) => {
  const { mek, reply } = conText;

  // Ensure command is run inside a channel
  if (!mek.key.remoteJid.endsWith("@newsletter")) {
    return reply("❌ This command only works in WhatsApp channels!");
  }

  try {
    // Mute the channel
    await client.newsletterMute(mek.key.remoteJid);

    await reply("🔇 Channel muted successfully");
  } catch (err) {
    console.error("Channel mute error:", err);
  }
});
//========================================================================================================================

keith({
  pattern: "channeldescription",
  aliases: ["setdescription", "updatedescription", "chdesc"],
  category: "channel",
  description: "Update WhatsApp channel description"
}, async (from, client, conText) => {
  const { mek, q, reply } = conText;

  // Ensure command is run inside a channel
  if (!mek.key.remoteJid.endsWith("@newsletter")) {
    return reply("❌ This command only works in WhatsApp channels!");
  }

  // Validate description input
  if (!q) {
    return reply("✏️ Please provide a new description for the channel!\nExample: channeldescription Your new description here");
  }

  const newDescription = q.trim();

  // Validate description length
  if (newDescription.length > 500) {
    return reply("❌ Description must be 500 characters or less");
  }

  try {
    // Update the description
    await client.newsletterUpdateDescription(mek.key.remoteJid, newDescription);

    await reply("✅ Channel description updated successfully");
  } catch (err) {
    console.error("Channel description error:", err);
  }
});
//========================================================================================================================


keith({
  pattern: "channelname",
  aliases: ["channame", "setchannelname", "updatenewsletter"],
  category: "channel",
  description: "Update WhatsApp channel name"
}, async (from, client, conText) => {
  const { mek, q, reply } = conText;

  // Ensure command is run inside a channel
  if (!mek.key.remoteJid.endsWith("@newsletter")) {
    return reply("❌ This command only works in WhatsApp channels!");
  }

  // Validate new name input
  if (!q) {
    return reply("✏️ Please provide a new name for the channel!\nExample: channelname New Channel Name");
  }

  const newName = q.trim();

  // Validate name length
  if (newName.length > 100) {
    return reply("❌ Channel name must be 100 characters or less");
  }

  try {
    // Update the channel name
    await client.newsletterUpdateName(mek.key.remoteJid, newName);

    await reply(`✅ Channel name successfully updated to: "${newName}"`);
  } catch (err) {
    console.error("Channel name update error:", err);
  }
});
//========================================================================================================================

keith({
  pattern: "channeljid",
  aliases: ["newsletterjid", "getchannelid"],
  category: "channel",
  description: "Show only the JID of the current channel"
}, async (from, client, conText) => {
  const { mek, reply } = conText;

  try {
    const jid = mek.key.remoteJid;

    if (!jid.endsWith("@newsletter")) {
      return reply("❌ This command only works inside a WhatsApp channel.");
    }

    await reply(`${jid}`);

  } catch (err) {
    console.error("Channel JID error:", err);
  }
});
//========================================================================================================================
//
keith({
  pattern: "channelcreate",
  aliases: ["createchannel", "newchannel"],
  category: "channel",
  description: "Create a new WhatsApp channel"
}, async (from, client, conText) => {
  const { q, reply } = conText;

  if (!q) {
    return reply("❌ Please provide a name for the channel.\nExample: channelcreate MyAwesomeChannel");
  }

  try {
    await client.newsletterCreate(q.trim());
    await reply("✅ Channel created successfully");
  } catch (err) {
    console.error("Channel create error:", err);
  }
});
