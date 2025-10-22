const { keith } = require('../keizzah/keith');
//const { keith } = require('../keizzah/keith');
const conf = require(__dirname + '/../set');
//========================================================================================================================
keith({
  nomCom: "owner",
  desc: "to generate owner vcard number",
  categorie: "owner",
  reaction: "⚔️"
}, async (dest, zk, commandeOptions) => {
  try {
    const { ms } = commandeOptions;

    // Validate required configuration
    if (!conf.OWNER_NAME || !conf.NUMERO_OWNER) {
      throw new Error("Owner configuration is incomplete");
    }

    const vcard = 
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' + conf.OWNER_NAME + '\n' +
      'ORG:undefined;\n' +
      'TEL;type=CELL;type=VOICE;waid=' + conf.NUMERO_OWNER + ':+' + conf.NUMERO_OWNER + '\n' +
      'END:VCARD';

    await zk.sendMessage(dest, {
      contacts: {
        displayName: conf.OWNER_NAME,
        contacts: [{ vcard }],
      },
    }, { quoted: ms });

  } catch (error) {
    console.error("Error in owner command:", error);
    // Optionally send an error message to the user
    await zk.sendMessage(dest, { 
      text: "❌ An error occurred while processing the owner command." 
    }, { quoted: ms });
  }
});
//========================================================================================================================

keith({
  nomCom: "vcard",
  desc: "Generate contact vcard for a user",
  categorie: "owner",
  reaction: "⚔️"
}, async (dest, zk, commandeOptions) => {
  const { ms, auteurMsgRepondu, arg, repondre } = commandeOptions;

  let targetNumber = null;
  let targetName = null;

  // If command is a reply to a message
  if (auteurMsgRepondu) {
    targetNumber = auteurMsgRepondu.split('@')[0];
    if (!arg.length) {
      return repondre("❌ Please provide a name.");
    }
    targetName = arg.join(" ").trim();

    try {
      const contact = await zk.getContact(auteurMsgRepondu);
      if (contact && contact.pushname) {
        targetName = contact.pushname;
      }
    } catch (e) {
      console.log("Couldn't get contact info, using provided name.");
    }
  } else {
    // Extract number from input args
    const possibleNumber = arg.find(part => /^\d+$/.test(part));
    if (!possibleNumber || possibleNumber.length < 5) {
      return repondre('❌ Please provide a valid phone number (at least 5 digits)');
    }
    targetNumber = possibleNumber;

    // Assume the rest is name
    targetName = arg.filter(part => part !== possibleNumber).join(" ").trim();

    if (!targetName) {
      return repondre("❌ Please provide a name along with the number.");
    }
  }

  // Create vcard
  const vcard = 
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    `FN:${targetName}\n` +
    'ORG:;\n' +
    `TEL;type=CELL;type=VOICE;waid=${targetNumber}:+${targetNumber}\n` +
    'END:VCARD';

  // Send contact
  try {
    await zk.sendMessage(dest, {
      contacts: {
        displayName: targetName,
        contacts: [{ vcard }],
      },
    }, { quoted: ms });
  } catch (error) {
    console.error('Error sending vcard:', error);
    repondre('❌ Failed to send contact card');
  }
});

  //========================================================================================================================
