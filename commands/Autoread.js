
const { keith } = require('../keizzah/keith');
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
});
