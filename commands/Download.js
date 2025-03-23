const { keith } = require("../keizzah/keith");
const axios = require('axios');
const ytSearch = require('yt-search');
const conf = require(__dirname + '/../set');
const { Catbox } = require("node-catbox");
const fs = require('fs-extra');
const { downloadAndSaveMediaMessage } = require('@whiskeysockets/baileys');
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

// Define the command with aliases for play

  keith(
    {
      nomCom: "play",
      aliases: ["song", "playdoc", "audio", "mp3"],
      categorie: "download",
      reaction: "🎥",
    },
    async (dest, zk, commandOptions) => {
      const { arg, ms } = commandOptions;

      // Check if a query is provided
      if (!arg[0]) {
        return repondre(zk, dest, ms, "Please provide a video name.");
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

        // Send the audio file as a document
        await zk.sendMessage(dest, {
          document: { url: downloadUrl },
          mimetype: "audio/mp3",
          fileName: `${title.replace(/[^a-zA-Z0-9 ]/g, "")}.mp3`,
        });
      } catch (error) {
        // Handle unexpected errors
        return repondre(zk, dest, ms, `An error occurred: ${error.message}`);
      }
    }
  );
};
// Define the command with aliases for video
keith({
  nomCom: "video",
  aliases: ["videodoc", "film", "mp4"],
  categorie: "download",
  reaction: "🎥"
}, async (dest, zk, commandOptions) => {
  const { arg, ms } = commandOptions;

  // Check if a query is provided
  if (!arg[0]) {
    return repondre(zk, dest, ms, "Please provide a video name.");
  }

  const query = arg.join(" ");

  try {
    // Perform a YouTube search based on the query
    const searchResults = await ytSearch(query);

    // Check if any videos were found
    if (!searchResults || !searchResults.videos.length) {
      return repondre(zk, dest, ms, 'No video found for the specified query.');
    }

    const firstVideo = searchResults.videos[0];
    const videoUrl = firstVideo.url;

    // Function to get download data from APIs
    const getDownloadData = async (url) => {
      try {
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error('Error fetching data from API:', error);
        return { success: false };
      }
    };

    // List of APIs to try
    const apis = [
      `https://api-rin-tohsaka.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://www.dark-yasiya-api.site/download/ytmp4?url=${encodeURIComponent(videoUrl)}`,
      `https://api.giftedtech.web.id/api/download/dlmp4?url=${encodeURIComponent(videoUrl)}&apikey=gifted-md`,
      `https://api.dreaded.site/api/ytdl/video?url=${encodeURIComponent(videoUrl)}`
    ];

    let downloadData;
    for (const api of apis) {
      downloadData = await getDownloadData(api);
      if (downloadData && downloadData.success) break;
    }

    // Check if a valid download URL was found
    if (!downloadData || !downloadData.success) {
      return repondre(zk, dest, ms, 'Failed to retrieve download URL from all sources. Please try again later.');
    }

    const downloadUrl = downloadData.result.download_url;
    const videoDetails = downloadData.result;

    // Prepare the message payload with external ad details
    const messagePayloads = [
      {
        video: { url: downloadUrl },
        mimetype: 'video/mp4',
        contextInfo: {
          externalAdReply: {
            title: videoDetails.title,
            body: videoDetails.title,
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: firstVideo.thumbnail,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      },
      {
        document: { url: downloadUrl },
        mimetype: 'video/mp4',
        contextInfo: {
          externalAdReply: {
            title: videoDetails.title,
            body: videoDetails.title,
            mediaType: 1,
            sourceUrl: conf.GURL,
            thumbnailUrl: firstVideo.thumbnail,
            renderLargerThumbnail: false,
            showAdAttribution: true,
          },
        },
      }
    ];

    // Send the download link to the user
    for (const messagePayload of messagePayloads) {
      await sendMessage(zk, dest, ms, messagePayload);
    }

  } catch (error) {
    console.error('Error during download process:', error);
    return repondre(zk, dest, ms, `Download failed due to an error: ${error.message || error}`);
  }
});

// Command to upload image, video, or audio file
keith({
  'nomCom': 'url',       // Command to trigger the function
  'categorie': "download", // Command category
  'reaction': '👨🏿‍💻'    // Reaction to use on command
}, async (dest, zk, context) => {
  const { msgRepondu, ms } = context;

  // If no message (image/video/audio) is mentioned, prompt user
  if (!msgRepondu) {
    return repondre(zk, dest, ms, "Please mention an image, video, or audio.");
  }

  let mediaPath;

  // Check if the message contains a video
  if (msgRepondu.videoMessage) {
    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
  } else if (msgRepondu.gifMessage) {
    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.gifMessage);
  } else if (msgRepondu.stickerMessage) {
    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
  } else if (msgRepondu.documentMessage) {
    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.documentMessage);
  } else if (msgRepondu.imageMessage) {
    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
  } else if (msgRepondu.audioMessage) {
    mediaPath = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
  } else {
    // If no media (image, video, or audio) is found, prompt user
    return repondre(zk, dest, ms, "Please mention an image, video, or audio.");
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
