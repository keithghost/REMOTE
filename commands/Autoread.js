
const { keith } = require('../keizzah/keith');
const gis = require('g-i-s');
const { generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys');

keith({
  nomCom: "img6",
  categorie: "Search",
  reaction: "📷"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg[0]) {
    return repondre('Which image are you looking for?');
  }

  const searchTerm = arg.join(" ");
  
  gis(searchTerm, async (error, results) => {
    if (error) {
      return repondre("Oops, an error occurred while searching for images.");
    }

    // Limit to 5 images only
    let images = results.slice(0, 5);
    let push = [];

    for (let img of images) {
      push.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `🔎 *Search Result*\n\n*Title:* ${searchTerm}\n*Source:* ${img.url}`
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: 'Swipe through the images to view different options.'
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          hasMediaAttachment: true,
          imageMessage: { url: img.url }
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: "cta_copy",
              buttonParamsJson: JSON.stringify({
                display_text: "View Full Image",
                copy_code: img.url
              })
            }
          ]
        })
      });
    }

    const botMessage = generateWAMessageFromContent(dest, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `📸 *Results for:* ${searchTerm}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'Swipe over the images and tap the button to copy the image URL.'
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards: [...push]
            })
          })
        }
      }
    }, { quoted: ms });

    await zk.relayMessage(dest, botMessage.message, { messageId: botMessage.key.id });
  });
});
