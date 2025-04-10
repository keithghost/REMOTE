const { keith } = require("../keizzah/keith");
const axios = require('axios');
const acrcloud = require("acrcloud");
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const yts = require("yt-search");
const ytdl = require("ytdl-core");
//const fs = require("fs-extra");
const { repondre } = require(__dirname + "/../keizzah/context");

// Initialize Catbox
const catbox = new Catbox();

// Function to upload a file to Catbox
async function uploadToCatbox(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }
  try {
    const uploadResult = await catbox.uploadFile({ path: filePath });
    return uploadResult;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}

// Function to analyze image with Gemini Vision API
async function analyzeImage(imageUrl, question) {
  try {
    const apiUrl = `https://apis-keith.vercel.app/ai/gemini-vision?image=${encodeURIComponent(imageUrl)}&q=${encodeURIComponent(question)}`;
    const response = await axios.get(apiUrl);
    
    if (response.data.status && response.data.result) {
      return response.data.result;
    }
    throw new Error("API request failed");
  } catch (error) {
    throw new Error(`Vision API error: ${error.message}`);
  }
}


keith({
  nomCom: 'vision',
  aliases: ['analyse', 'aigenerate'],
  categorie: "AI",
  reaction: '🔍'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, arg, ms } = commandOptions;
  const question = arg.join(" ").trim();

  try {
    // Check if there's a quoted image and question
    if (!msgRepondu?.imageMessage) {
      return repondre(zk, dest, ms, "❌ Please quote an image and provide a question.\nExample: /vision what's in this picture?");
    }

    if (!question) {
      return repondre(zk, dest, ms, "❌ Please provide a question for analysis.\nExample: /vision describe this image in detail");
    }

    // Download and upload the image
    const mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
    const imageUrl = await uploadToCatbox(mediaPath);
    fs.unlinkSync(mediaPath); // Clean up

    // Analyze the image
    const analysis = await analyzeImage(imageUrl, question);
    
    // Send the result
    await zk.sendMessage(dest, {
      text: `🔍 *Vision Analysis*:\n\n${analysis}\n\n🖼️ *Image URL*: ${imageUrl}`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
      }
    });

  } catch (error) {
    console.error("Vision command error:", error);
    repondre(zk, dest, ms, `❌ Error: ${error.message}`);
  }
});

// Initialize ACRCloud
const acr = new acrcloud({
  host: 'identify-ap-southeast-1.acrcloud.com',
  access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
  access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
});

keith({
  nomCom: 'shazam',
  aliases: ['identify', 'findsong'],
  categorie: "Music",
  reaction: '🎵'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, ms } = commandOptions;

  try {
    // Check if there's a quoted audio or video
    if (!msgRepondu?.audioMessage && !msgRepondu?.videoMessage) {
      return repondre(zk, dest, ms, "❌ Please quote an audio or video message to identify the song.\nExample: Reply to an audio with /shazam");
    }

    // Download the media
    const buffer = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage || msgRepondu.videoMessage);
    
    // Identify the song
    const { status, metadata } = await acr.identify(buffer);
    fs.unlinkSync(buffer); // Clean up the temporary file

    if (status.code !== 0) {
      return repondre(zk, dest, ms, `❌ Error: ${status.msg}`);
    }

    const { title, artists, album, genres, release_date } = metadata.music[0];
    let resultText = `🎵 *Song Identified*:\n\n📌 *Title*: ${title}`;
    
    if (artists) resultText += `\n🎤 *Artists*: ${artists.map(v => v.name).join(', ')}`;
    if (album) resultText += `\n💿 *Album*: ${album.name}`;
    if (genres) resultText += `\n🎼 *Genres*: ${genres.map(v => v.name).join(', ')}`;
    if (release_date) resultText += `\n📅 *Release Date*: ${release_date}`;

    // Send the result
    await zk.sendMessage(dest, {
      text: resultText,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true
      }
    });

  } catch (error) {
    console.error("Shazam command error:", error);
    repondre(zk, dest, ms, "❌ Could not identify the song. Please try with a clearer audio sample.");
  }
});
