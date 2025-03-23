const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const { repondre, sendMessage } = require('../keizzah/context'); // Import repondre and sendMessage

// Initialize Catbox
const catbox = new Catbox();

// Function to upload a file to Catbox and return the URL
async function uploadToCatbox(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("File does not exist");
  }
  try {
    const uploadResult = await catbox.uploadFile({ path: filePath });
    if (uploadResult) {
      return uploadResult;
    } else {
      throw new Error("Error retrieving file link");
    }
  } catch (error) {
    throw new Error(String(error));
  }
}

// Define the 'play' command
keith(
  {
    nomCom: "play",
    aliases: ["song", "playdoc", "audio", "mp3"],
    categorie: "download",
    reaction: "🎵",
  },
  async (dest, zk, commandOptions) => {
    const { arg, ms } = commandOptions;

    // Check if a query is provided
    if (!arg[0]) {
      return repondre(zk, dest, ms, "Please provide a song name.");
    }

    const query = arg.join(" ");

    try {
      // Perform a YouTube search
      const search = await ytSearch(query);
      if (!search.all.length) {
        return repondre(zk, dest, ms, "No results found for your query.");
      }

      const link = search.all[0].url;

      // Generate the API URL
      const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${link}`;

      // Fetch the audio data from the API using axios
      const response = await axios.get(apiUrl);
      if (!response.data.status || !response.data.result) {
        return repondre(
          zk,
          dest,
          ms,
          "Failed to fetch data from the API. Please try again."
        );
      }

      const { title, downloadUrl, format, quality } = response.data.result;
      const thumbnail = search.all[0].thumbnail;

      // Send a message with song details and thumbnail
      await sendMessage(zk, dest, ms, {
        image: { url: thumbnail },
        caption: `
╭═════════════════⊷
║ *Title*: ${title}
║ *Format*: ${format}
║ *Quality*: ${quality}
╰═════════════════⊷
*Powered by ${conf.BOT}*`,
      });

      // Send the audio file
      await zk.sendMessage(dest, {
        audio: { url: downloadUrl },
        mimetype: "audio/mp4",
      });
    } catch (error) {
      // Handle unexpected errors
      return repondre(zk, dest, ms, `An error occurred: ${error.message}`);
    }
  }
);

// Define the 'url' command to upload media
keith({
  nomCom: 'url',       // Command to trigger the function
  categorie: "download", // Command category
  reaction: '👨🏿‍💻'    // Reaction to use on command
}, async (dest, zk, context) => {
  const { msgRepondu, ms } = context;

  // If no media (image, video, or audio) is mentioned, prompt user
  if (!msgRepondu) {
    return repondre(zk, dest, ms, "Please mention an image, video, or audio.");
  }

  let mediaPath;

  // Check the type of media and save it locally
  if (msgRepondu.videoMessage || msgRepondu.gifMessage || msgRepondu.stickerMessage || msgRepondu.documentMessage || msgRepondu.imageMessage || msgRepondu.audioMessage) {
    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu);
  } else {
    return repondre(zk, dest, ms, "Please mention a valid media type (image, video, or audio).");
  }

  try {
    // Upload the media to Catbox and get the URL
    const fileUrl = await uploadToCatbox(mediaPath);

    // Delete the local media file after upload
    fs.unlinkSync(mediaPath);

    // Respond with the URL of the uploaded file
    repondre(zk, dest, ms, fileUrl);
  } catch (error) {
    console.error("Error while creating your URL:", error);
    repondre(zk, dest, ms, "Oops, there was an error.");
  }
});
