const { keith } = require('../commandHandler');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const FormData = require('form-data');
const mime = require('mime-types');

function getMediaType(quoted) {
  if (quoted.imageMessage) return "image";
  return "unknown";
}

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
      'user-agent': 'Mozilla/5.0'
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
keith({
  pattern: "countryhouse"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=countryhouse&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "musketeers"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=musketeers&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "jedi"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=jedi&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "knight"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=knight&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "halloween"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=halloween&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "admirer"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=admirer&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "magic"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=magic&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "shopping"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=shopping&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "interior"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=interior&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "shredder"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=shredder&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "woods"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=woods&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "beach"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=beach&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "explorer"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=explorer&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "sepia"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=sepia&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
//========================================================================================================================
keith({
  pattern: "christmas"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=christmas&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});

//========================================================================================================================
keith({
  pattern: "sketch"
  category: "photofunia",
  description: "Apply sketch effect to quoted image"
},
async (from, client, conText) => {
  const { mek, quoted, quotedMsg, reply } = conText;

  if (!quotedMsg) return reply("📌 Reply to an image message to apply  effect");

  const type = getMediaType(quotedMsg);
  if (type !== "image") return reply("❌ Only image messages are supported");

  const mediaNode = quoted?.imageMessage;
  if (!mediaNode) return reply("❌ Could not extract image content");

  let filePath;
  try {
    // Save quoted image locally
    filePath = await saveMediaToTemp(client, mediaNode, type);

    // Upload to Uguu to get a public URL
    const imageUrl = await uploadToUguu(filePath);

    // Call sketch effect API
    const { data: result } = await axios.get(
      `https://apiskeith.vercel.app/effects/apply?effect=sketch&url=${encodeURIComponent(imageUrl)}`
    );

    if (!result?.results || !Array.isArray(result.results) || result.results.length === 0) {
      return reply("❌ No response from  API");
    }

    // Pick Regular size by default
    const sketchUrl = result.results.find(r => r.size === "Regular")?.url || result.results[0].url;

    // Send back the processed image
    await client.sendMessage(from, { image: { url: sketchUrl } }, { quoted: mek });

  } catch (err) {
    console.error("Sketch effect error:", err);
    await reply("❌ Failed to apply effect. Try a different image.");
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
});
