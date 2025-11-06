
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

const TG_API = "https://api.telegram.org/bot8313451751:AAHN_5RniuG3iGKIiDJ9_DsOaiVxmejzTcE";

keith({
  pattern: "tgs",
  aliases: ["telesticker"],
  description: "Import Telegram sticker set and convert to WhatsApp stickers",
  category: "Sticker",
  filename: __filename
}, async (from, client, conText) => {
  const { q, reply, author, isSuperUser, mek } = conText;

  if (!isSuperUser) return reply("❌ Only Mods can use this command.");
  if (!q || !q.includes('/addstickers/')) return reply("❌ Provide a valid Telegram sticker link.");

  const name = q.split('/addstickers/')[1];
  const setUrl = `${TG_API}/getStickerSet?name=${encodeURIComponent(name)}`;

  try {
    const res = await axios.get(setUrl);
    const set = res.data.result;

    const type = set.is_animated || set.is_video ? "animated/video sticker" : "static sticker";
    await reply(`*Telegram Sticker Set*\n\n*Name:* ${set.name}\n*Type:* ${type}\n*Length:* ${set.stickers.length}\n\nDownloading...`);

    for (const item of set.stickers) {
      if (item.is_animated || item.is_video) continue; // skip unsupported formats

      const fileRes = await axios.get(`${TG_API}/getFile?file_id=${item.file_id}`);
      const filePath = fileRes.data.result.file_path;

      const bufferRes = await axios({
        method: 'GET',
        url: `https://api.telegram.org/file/bot${TG_API.split('/bot')[1]}/${filePath}`,
        responseType: 'arraybuffer'
      });

      const sticker = new Sticker(bufferRes.data, {
        pack: author,
        author: author,
        type: StickerTypes.FULL,
        categories: ["🤩", "🎉"],
        id: "tgs-import",
        quality: 60,
        background: "transparent"
      });

      const stickerBuffer = await sticker.toBuffer();
      await client.sendMessage(from, { sticker: stickerBuffer }, { quoted: mek });
    }
  } catch (err) {
    console.error("tgs error:", err);
    reply("❌ Error importing Telegram sticker set: " + err.message);
  }
});
//========================================================================================================================


keith({
  pattern: "stickersearch",
  aliases: ["ssearch"],
  description: "Search Tenor and send animated stickers",
  category: "Sticker",
  filename: __filename
  
}, async (from, client, conText) => {
  const { q, reply, pushName, author, mek } = conText;

  if (!q) return reply("❌ Where is the request?\n\nExample: stickersearch happy dance");

  const tenorApiKey = "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";
  const searchTerm = encodeURIComponent(q);

  try {
    for (let i = 0; i < 5; i++) {
      const res = await axios.get(
        `https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${tenorApiKey}&client_key=keith-md&limit=8&media_filter=gif`
      );

      const gifUrl = res.data.results[i]?.media_formats?.gif?.url;
      if (!gifUrl) continue;

      const sticker = new Sticker(gifUrl, {
        pack: pushName,
        author: author,
        type: StickerTypes.FULL,
        categories: ["🤩", "🎉"],
        id: "keith-md",
        quality: 60,
        background: "transparent"
      });

      const buffer = await sticker.toBuffer();
      await client.sendMessage(from, { sticker: buffer }, { quoted: mek });
    }
  } catch (err) {
    console.error("stickersearch error:", err);
    reply("❌ Error while searching for stickers.");
  }
});
//========================================================================================================================
keith({
  pattern: "take",
  aliases: ["restick", "grabsticker"],
  description: "Quote a sticker and resend it with your packname and author",
  category: "Sticker",
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
