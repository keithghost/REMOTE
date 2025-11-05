
const { keith } = require('../commandHandler');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const FormData = require('form-data');
const mime = require('mime-types');

function getMediaType(quoted) {
  if (quoted.imageMessage) return "image";
  if (quoted.videoMessage) return "video";
  if (quoted.stickerMessage) return "sticker";
  if (quoted.audioMessage) return "audio";
  if (quoted.documentMessage) return "document";
  return "unknown";

async function saveMediaToTemp(client, quotedMedia, type) {
  const tmpDir = path.join(__dirname, "..", "tmp");
  await fs.ensureDir(tmpDir);
  const fileName = `${type}-${Date.now()}`;
  const filePath = path.join(tmpDir, fileName);
  const savedPath = await client.downloadAndSaveMediaMessage(quotedMedia, filePath);
  return savedPath;
}

async function uploadToUguu(filePath) {
  if (!fs.existsSync(filePath)) throw new Error("File does not exist");

  const mimeType = mime.lookup(filePath) || 'application/octet-stream';
  const form = new FormData();
  form.append('files[]', fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: mimeType
  });

  const response = await axios.post('https://uguu.se/upload.php', form, {
    headers: {
      ...form.getHeaders(),
      'origin': 'https://uguu.se',
      'referer': 'https://uguu.se/',
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
    }
  });

  const result = response.data;
  if (result.success && result.files?.[0]?.url) {
    return result.files[0].url;
  } else {
    throw new Error("Uguu upload failed or malformed response");
  }
}
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
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//
keith({
  pattern: "shazam",
  alias: ["identify", "whatmusic", "whatsong"],
  desc: "Identify music from quoted audio or video",
  category: "search",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply, botname } = conText;

  if (!quotedMsg) return reply("📌 Reply to an audio or video message to identify music");

  const type = getMediaType(quotedMsg);
  if (type === "unknown") return reply("❌ Unsupported media type");

  const mediaNode = quoted?.[`${type}Message`];
  if (!mediaNode) return reply("❌ Could not extract media content");

  let filePath;
  try {
    filePath = await saveMediaToTemp(client, mediaNode, type);
    const mediaUrl = await uploadToUguu(filePath);

    const { data: result } = await axios.get(`https://apiskeith.vercel.app/ai/shazam?url=${mediaUrl}`);
    if (!result?.status || !result?.result?.title) return reply("❌ No music info found");

    const { title, artists, album, release_date } = result.result;

    let txt = `*${botname} Music ID*\n\n`;
    txt += `*Title:* ${title}\n`;
    if (artists?.length) txt += `*Artists:* ${artists.join(', ')}\n`;
    if (album) txt += `*Album:* ${album}\n`;
    if (release_date) txt += `*Release Date:* ${release_date}`;

    await client.sendMessage(from, { text: txt }, { quoted: mek });

  } catch (err) {
    console.error("Shazam error:", err);
    await reply("❌ Failed to identify music. Try with a shorter or fresh clip.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
