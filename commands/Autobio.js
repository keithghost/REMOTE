const { keith } = require('../keizzah/keith');
//const { keith } = require('../keizzah/keith');
const conf = require(__dirname + '/../set');

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
//const { keith } = require('../keizzah/keith');

keith({
  nomCom: "vcard",
  desc: "to generate owner vcard number",
  categorie: "owner",
  reaction: "⚔️"
}, async (dest, zk, commandeOptions) => {
  const { ms, auteurMsgRepondu, arg, nomAuteurMessage, repondre } = commandeOptions;
  
  let targetName;
  let targetNumber;

  // Check if the command is a reply to a message
  if (auteurMsgRepondu) {
    targetNumber = auteurMsgRepondu.split('@')[0];
    targetName = nomAuteurMessage || "User";
  } 
  // Check if arguments are provided
  else if (arg && arg.length > 0) {
    targetName = arg.join(" ").replace(/[0-9]/g, '').trim() || "User";
    const possibleNumber = arg.join("").replace(/[^0-9]/g, '');
    
    if (possibleNumber.length > 5) {
      targetNumber = possibleNumber;
    } else {
      return repondre('❌ Please provide a valid phone number or mention a user');
    }
  } 
  // No valid input provided
  else {
    return repondre('❌ Please mention a user or provide a phone number and name');
  }

  // Validate we have required data
  if (!targetNumber) {
    return repondre('❌ Could not determine phone number');
  }

  // Create vcard
  const vcard = 
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    'FN:' + targetName + '\n' +
    'ORG:undefined;\n' +
    'TEL;type=CELL;type=VOICE;waid=' + targetNumber + ':+' + targetNumber + '\n' +
    'END:VCARD';

  // Send the contact
  try {
    await zk.sendMessage(dest, {
      contacts: {
        displayName: targetName,
        contacts: [{ vcard }],
      },
    }, { quoted: ms });
  } catch (error) {
    console.error('Error sending vcard:', error);
    repondre('❌ An error occurred while sending the contact');
  }
});
