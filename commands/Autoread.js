
const { generateWAMessageContent, generateWAMessageFromContent, proto } = require('@whiskeysockets/baileys').default;
const gis = require('g-i-s');

module.exports = {
  nomCom: "img4",
  categorie: "Search",
  reaction: "📷",
  async run(dest, zk, commandeOptions) {
    const { repondre, ms, arg } = commandeOptions;

    if (!arg[0]) {
      repondre('Which image should I search for?');
      return;
    }

    await zk.sendMessage(dest, { react: { text: '📷', key: ms.key } });

    const searchTerm = arg.join(" ");
    const results = await searchImages(searchTerm);

    if (!results || results.length === 0) {
      repondre('No images found for your search term.');
      return;
    }

    const carousel = await createImageCarousel(results, searchTerm);
    await zk.relayMessage(dest, carousel.message, { messageId: carousel.key.id });
    await zk.sendMessage(dest, { react: { text: '✅', key: ms.key } });
  }
};

async function searchImages(term) {
  return new Promise((resolve) => {
    gis(term, (error, results) => {
      if (error || !results || results.length === 0) {
        resolve([]);
      } else {
        // Shuffle and limit to 5 results
        const shuffled = results.sort(() => 0.5 - Math.random());
        resolve(shuffled.slice(0, 5));
      }
    });
  });
}

async function createImageCarousel(images, searchTerm) {
  const push = [];
  let i = 1;

  for (const image of images) {
    push.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `📷 Image ${i} of ${images.length}`
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: 'Swipe to view more results'
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: '',
        hasMediaAttachment: true,
        imageMessage: await createImageMessage(image.url)
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [
          {
            "name": "cta_url",
            "buttonParamsJson": JSON.stringify({
              "display_text": "View Image",
              "url": image.url
            })
          }
        ]
      })
    });
    i++;
  }

  return generateWAMessageFromContent(dest, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: '*📷 Image Search Results for:* ' + `*${searchTerm}*`
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: 'Swipe to browse through the images'
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
}

async function createImageMessage(url) {
  const { imageMessage } = await generateWAMessageContent({
    image: { url }
  }, {
    upload: zk.waUploadToServer
  });
  return imageMessage;
}
