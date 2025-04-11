const { keith } = require("../keizzah/keith");
const axios = require('axios');
const acrcloud = require("acrcloud");
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const yts = require("yt-search");
const ytdl = require("ytdl-core");
const { repondre } = require(__dirname + "/../keizzah/context");

// Initialize Catbox
const catbox = new Catbox();

// Initialize ACRCloud
const acr = new acrcloud({
  host: 'identify-ap-southeast-1.acrcloud.com',
  access_key: '26afd4eec96b0f5e5ab16a7e6e05ab37',
  access_secret: 'wXOZIqdMNZmaHJP1YDWVyeQLg579uK2CfY6hWMN8'
});

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
  categorie: "Ai",
  reaction: '🔍'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, arg, ms } = commandOptions;
  const question = arg.join(" ").trim();

  try {
    if (!msgRepondu?.imageMessage) {
      return repondre(zk, dest, ms, "❌ Please quote an image and provide a question.\nExample: /vision what's in this picture?");
    }

    if (!question) {
      return repondre(zk, dest, ms, "❌ Please provide a question for analysis.\nExample: /vision describe this image in detail");
    }

    const mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
    const imageUrl = await uploadToCatbox(mediaPath);
    fs.unlinkSync(mediaPath);

    const analysis = await analyzeImage(imageUrl, question);
    
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

keith({
  nomCom: 'shazam',
  aliases: ['identify', 'findsong'],
  categorie: "Ai",
  reaction: '🎵'
}, async (dest, zk, commandOptions) => {
  const { msgRepondu, ms } = commandOptions;

  try {
    if (!msgRepondu?.audioMessage && !msgRepondu?.videoMessage) {
      return repondre(zk, dest, ms, "❌ Please quote an *audio* or *video* (3+ seconds) to identify the song.");
    }

    const bufferPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage || msgRepondu.videoMessage);
    const buffer = fs.readFileSync(bufferPath);

    const { status, metadata } = await acr.identify(buffer);
    fs.unlinkSync(bufferPath);

    if (status.code !== 0) {
      throw new Error(
        status.code === 3001 ? "No match found. Try with clearer/longer audio." :
        status.code === 3003 ? "Fingerprint generation failed. Audio may be too short/noisy." :
        status.msg
      );
    }

    const { title, artists, album, genres, release_date } = metadata.music[0];
    let result = `🎵 *Song Found!*\n\n` +
      `📌 *Title*: ${title}\n` +
      (artists ? `🎤 *Artists*: ${artists.map(v => v.name).join(', ')}\n` : '') +
      (album ? `💿 *Album*: ${album.name}\n` : '') +
      (release_date ? `📅 *Released*: ${release_date}\n` : '');

    await zk.sendMessage(dest, { 
      text: result, 
      contextInfo: { forwardingScore: 999 } 
    });

  } catch (error) {
    console.error("Shazam Error:", error);
    repondre(zk, dest, ms, `❌ Failed: ${error.message || "Unknown error"}`);
  }
});

keith({
  nomCom: "xvideo",
  aliases: ["xvideos", "porn", "xxx"],
  categorie: "download",
  reaction: "🔞"
}, async (dest, zk, commandOptions) => {
  const { arg, ms } = commandOptions;

  
  if (!arg[0]) {
    return repondre(zk, dest, ms, "Please provide a search term.");
  }

  const query = arg.join(" ");

  try {
    
    const searchResponse = await axios.get(`https://apis-keith.vercel.app/search/searchxvideos?q=${encodeURIComponent(query)}`);
    const searchData = searchResponse.data;

    
    if (!searchData.status || !searchData.result || searchData.result.length === 0) {
      return repondre(zk, dest, ms, 'No videos found for the specified query.');
    }

    const firstVideo = searchData.result[0];
    const videoUrl = firstVideo.url;

    
    const downloadResponse = await axios.get(`https://apis-keith.vercel.app/download/porn?url=${encodeURIComponent(videoUrl)}`);
    const downloadData = downloadResponse.data;

    
    if (!downloadData.status || !downloadData.result) {
      return repondre(zk, dest, ms, 'Failed to retrieve download URL. Please try again later.');
    }

    const downloadUrl = downloadData.result.downloads.highQuality || downloadData.result.downloads.lowQuality;
    const videoInfo = downloadData.result.videoInfo;

    
    const messagePayloads = [
      {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        caption: `*${videoInfo.title}*\n\nDuration: ${videoInfo.duration} seconds`,
        contextInfo: {
          externalAdReply: {
            title: videoInfo.title,
            body: "XVIDEOS Search Result",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: videoInfo.thumbnail,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      },
      {
        document: { url: downloadUrl },
        mimetype: 'video/mp4',
        fileName: `${videoInfo.title}.mp4`,
        caption: `*${videoInfo.title}*\n\nDuration: ${videoInfo.duration} seconds`,
        contextInfo: {
          externalAdReply: {
            title: videoInfo.title,
            body: "XVIDEOS Search Result",
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: videoInfo.thumbnail,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }
    ];

    
    for (const messagePayload of messagePayloads) {
      await zk.sendMessage(dest, messagePayload, { quoted: ms });
    }

  } catch (error) {
    console.error('Error during download process:', error);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});
