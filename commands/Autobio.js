//
const {keith} = require("../keizzah/keith");
//const { keith } = require("../keith");
const conf = require(__dirname + '/../set');

keith({
  nomCom: "owner3",
  categorie: "owner",
  reaction: "⚔️"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  // Create vcard for owner
  const vcard = 
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    `FN:${conf.OWNER_NAME}\n` +
    'ORG:Bot Owner;\n' +
    `TEL;type=CELL;type=VOICE;waid=${conf.OWNER_NUMBER}:${conf.OWNER_NUMBER}\n` +
    'END:VCARD';

  // Send owner contact
  await zk.sendMessage(dest, {
    text: `⚔️ *Bot Owner* ⚔️\n\n` +
          `Contact ${conf.OWNER_NAME} for any issues or inquiries:`,
    contacts: {
      displayName: conf.OWNER_NAME,
      contacts: [{ vcard }]
    },
    contextInfo: {
      externalAdReply: {
        title: "Bot Owner",
        body: `Contact ${conf.OWNER_NAME}`,
        mediaType: 1,
        sourceUrl: conf.GURL,
        thumbnailUrl: "https://i.imgur.com/3Q5X7zE.png",
        showAdAttribution: true
      }
    }
  }, { quoted: ms });
});
