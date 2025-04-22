
/*const { keith } = require('../keizzah/keith');
const gis = require('g-i-s');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

keith({
  nomCom: "img7",
  categorie: "Search",
  reaction: "📷"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  if (!arg[0]) {
    return zk.sendMessage(dest, { text: "❌ Please enter an image search query." });
  }

  const searchTerm = arg.join(" ");

  try {
    gis(searchTerm, async (error, results) => {
      if (error || !results || results.length === 0) {
        return zk.sendMessage(dest, { text: "⚠️ No images found or an error occurred during the search." });
      }

      // Limit to 5 images only
      let images = results.slice(0, 5);
      let push = [];

      for (let img of images) {
        if (!img.url) continue; // Ensure valid image URLs
        push.push({
          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: true,
            imageMessage: { url: img.url }
          })
        });
      }

      if (push.length === 0) {
        return zk.sendMessage(dest, { text: "❌ No valid image results found." });
      }

      const botMessage = generateWAMessageFromContent(dest, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: [...push]
              })
            })
          }
        }
      }, { quoted: ms });

      await zk.relayMessage(dest, botMessage.message, { messageId: botMessage.key.id });
    });
  } catch (error) {
    console.error("❌ Error searching for images:", error);
    zk.sendMessage(dest, { text: "⚠️ An unexpected error occurred. Please try again later." });
  }
});*/
const { keith } = require('../keizzah/keith');
const axios = require("axios");
const yts = require("yt-search");
const fs = require('fs');
const conf = require(__dirname + '/../set');
const FormData = require('form-data');

keith({
  nomCom: "yts",
  categorie: "Search",
  reaction: "✋"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg } = commandeOptions;
  const query = arg.join(" ");

  if (!query) {
    return repondre("Please provide a search query.");
  }

  try {
    // Show searching reaction
    await zk.sendMessage(dest, { react: { text: "🔍", key: ms.key } });

    const results = await yts(query);
    const videos = results.videos.slice(0, 9); // Get first 9 results

    if (videos.length === 0) {
      return repondre("No results found.");
    }

    // Prepare carousel cards
    const push = [];
    for (const video of videos) {
      try {
        let thumbnailBuffer;
        try {
          const imageResponse = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
          thumbnailBuffer = Buffer.from(imageResponse.data, 'binary');
          // Optional: Enhance thumbnail using remini (uncomment if you want to use)
          // thumbnailBuffer = await remini(thumbnailBuffer, "enhance");
        } catch (e) {
          console.error("Error processing thumbnail:", e);
          thumbnailBuffer = null;
        }

        push.push({
          title: video.title,
          description: `⏱️ ${video.timestamp} | 👀 ${video.views}`,
          thumbnail: thumbnailBuffer,
          buttons: [
            {
              buttonId: `.ytmp3 ${video.url}`,
              buttonText: { displayText: "🎧 Audio" },
              type: 1
            },
            {
              buttonId: `.ytmp4 ${video.url}`,
              buttonText: { displayText: "📹 Video" },
              type: 1
            }
          ]
        });
      } catch (e) {
        console.error("Error processing video result:", e);
      }
    }

    // Send carousel message
    const message = {
      text: `*${conf.BOT} YouTube Search Results*\n\n*Query:* ${query}`,
      footer: "Swipe to browse results | Tap buttons to get download commands",
      title: "",
      buttonText: "View Results",
      sections: [{
        title: "YouTube Search Results",
        rows: push.map((item, index) => ({
          title: `${index + 1}. ${item.title.substring(0, 60)}${item.title.length > 60 ? '...' : ''}`,
          rowId: `.ytmp3 ${videos[index].url}`,
          description: item.description,
        }))
      }]
    };

    await zk.sendMessage(dest, message, { quoted: ms });

    // Show success reaction
    await zk.sendMessage(dest, { react: { text: "✅", key: ms.key } });

  } catch (error) {
    console.error("Error during the search process:", error);
    // Show error reaction
    await zk.sendMessage(dest, { react: { text: "❌", key: ms.key } });
    repondre("Error during the search process: " + error.message);
  }
});

// Optional: Remini image enhancement function (uncomment if you want to use)
/*
async function remini(imageData, operation) {
  return new Promise(async (resolve, reject) => {
    const availableOperations = ["enhance", "recolor", "dehaze"];
    if (!availableOperations.includes(operation)) {
      operation = availableOperations[0];
    }
    
    const baseUrl = "https://inferenceengine.vyro.ai/" + operation + ".vyro";
    const formData = new FormData();
    
    formData.append("image", imageData, { filename: "enhance_image_body.jpg", contentType: "image/jpeg" });
    formData.append("model_version", 1, { "Content-Transfer-Encoding": "binary", contentType: "multipart/form-data; charset=utf-8" });
    
    formData.submit({
      url: baseUrl,
      host: "inferenceengine.vyro.ai",
      path: "/" + operation,
      protocol: "https:",
      headers: {
        "User-Agent": "okhttp/4.9.3",
        Connection: "Keep-Alive",
        "Accept-Encoding": "gzip"
      }
    }, function (err, res) {
      if (err) return reject(err);
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
  });
}
*/
