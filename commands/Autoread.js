const { generateWAMessageContent, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys').default;
const gis = require('g-i-s');

module.exports = {
  nomCom: "img6",
  categorie: "Search",
  reaction: "📷",
  run: async (dest, zk, commandeOptions) => {
    const { repondre, ms, arg } = commandeOptions;

    if (!arg[0]) {
      repondre('Which image should I search for?');
      return;
    }

    const searchTerm = arg.join(" ");
    
    try {
      await repondre('🔍 Searching for images...');
      
      // Search for images
      gis(searchTerm, async (error, results) => {
        if (error || !results || results.length === 0) {
          repondre("Couldn't find any images for your search term.");
          return;
        }

        // Limit to 5 results
        const imageResults = results.slice(0, 5);
        
        // Create interactive message cards for each image
        const push = [];
        let index = 1;
        
        for (const image of imageResults) {
          push.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: `📷 Image ${index} of ${imageResults.length}`
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: 'Tap the button to send this image'
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: searchTerm,
              hasMediaAttachment: true,
              imageMessage: await createImageMessage(zk, image.url)
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  "name": "cta_copy",
                  "buttonParamsJson": JSON.stringify({
                    "display_text": "Send This Image",
                    "copy_code": `.sendimg ${image.url}`
                  })
                }
              ]
            })
          });
          index++;
        }

        // Create the carousel message
        const botMessage = generateWAMessageFromContent(dest, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.create({
                  text: '*🔍 Image Search Results for:* ' + `*${searchTerm}*`
                }),
                footer: proto.Message.InteractiveMessage.Footer.create({
                  text: 'Swipe to browse images. Tap any button to send that image.'
                }),
                header: proto.Message.InteractiveMessage.Header.create({
                  hasMediaAttachment: false
                }),
                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                  cards: push
                })
              })
            }
          }
        }, {
          quoted: ms
        });

        // Send the message
        await zk.relayMessage(dest, botMessage.message, { messageId: botMessage.key.id });
      });
    } catch (error) {
      console.error('Error in image search:', error);
      repondre("An error occurred while searching for images.");
    }
  }
};

async function createImageMessage(zk, imageUrl) {
  const { imageMessage } = await generateWAMessageContent({
    image: { url: imageUrl }
  }, {
    upload: zk.waUploadToServer
  });
  return imageMessage;
}
