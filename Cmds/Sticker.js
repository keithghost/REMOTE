
const { keith } = require('../commandHandler');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
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
//========================================================================================================================
keith({
  pattern: "take",
  aliases: ["restick", "grabsticker"],
  description: "Quote a sticker and resend it with your packname and author",
  category: "Utility",
  filename: __filename
}, async (from, client, conText) => {
  const { quotedMsg, pushName, author, mek, reply } = conText;

  if (!quotedMsg?.stickerMessage) {
    return reply("❌ Quote a sticker to restick.");
  }

  try {
    const media = quotedMsg.stickerMessage;
    const result = await client.downloadAndSaveMediaMessage(media);

    const sticker = new Sticker(result, {
      pack: pushName,
      author: author,
      type: StickerTypes.FULL,
      categories: ["🤩", "🎉"],
      id: "restick-123",
      quality: 70,
      background: "transparent"
    });

    const buffer = await sticker.toBuffer();
    await client.sendMessage(from, { sticker: buffer }, { quoted: mek });
  } catch (err) {
    console.error("take error:", err);
    await reply("❌ Failed to restick the quoted sticker.");
  }
});
//========================================================================================================================
//=======================
keith({
  pattern: "sticker",
  aliases: ["stik", "s", "stikpack"],
  description: "Create sticker from quoted image or video",
  category: "Sticker",
  filename: __filename
}, async (from, client, conText) => {
  const { quotedMsg, pushName, author, mek, reply } = conText;

  if (!quotedMsg) return reply("❌ Quote an image or a short video.");

  let media;
  if (quotedMsg.imageMessage) {
    media = quotedMsg.imageMessage;
  } else if (quotedMsg.videoMessage) {
    media = quotedMsg.videoMessage;
  } else {
    return reply("❌ That is neither an image nor a short video.");
  }

  try {
    const result = await client.downloadAndSaveMediaMessage(media);

    const sticker = new Sticker(result, {
      pack: pushName,
      author: author,
      type: StickerTypes.FULL,
      categories: ["🤩", "🎉"],
      id: "12345",
      quality: 70,
      background: "transparent"
    });

    const buffer = await sticker.toBuffer();
    await client.sendMessage(from, { sticker: buffer }, { quoted: mek });
  } catch (err) {
    console.error("sticker error:", err);
    await reply("❌ Failed to generate sticker.");
  }
});
//=======================
