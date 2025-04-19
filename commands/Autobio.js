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
/*keith({
  nomCom: "vcard",
  desc: "to generate owner vcard number",
  categorie: "owner",
  reaction: "⚔️"
}, async (dest, zk, commandeOptions) => {
  const { ms, auteurMsgRepondu, arg, nomAuteurMessage, auteurMessage } = commandeOptions;

  let targetNumber, targetName;

  if (auteurMsgRepondu) {
    // If user is mentioned/replied to
    targetNumber = auteurMsgRepondu.split('@')[0];
    targetName = nomAuteurMessage || "User";
  } else if (arg && arg.length > 0) {
    // If no mention but has argument
    const possibleNumber = arg[0].replace(/[^0-9]/g, '');
    if (possibleNumber.length > 5) {
      targetNumber = possibleNumber;
      targetName = arg.join(' ').replace(possibleNumber, '').trim() || "User";
    } else {
      return repondre('❌ Please provide a valid phone number or mention a user');
    }
  } else {
    return repondre('❌ Please mention a user or provide a phone number and name');
  }

  const vcard =
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    'FN:' + targetName + '\n' +
    'ORG:undefined;\n' +
    'TEL;type=CELL;type=VOICE;waid=' + targetNumber + ':+' + targetNumber + '\n' +
    'END:VCARD';

  zk.sendMessage(dest, {
    contacts: {
      displayName: targetName,
      contacts: [{ vcard }],
    },
  }, { quoted: ms });
});*/

//const { keith } = require('../keizzah/keith');
keith({
  nomCom: "vcard",
  desc: "to generate owner vcard number",
  categorie: "owner",
  reaction: "⚔️"
}, async (dest, zk, commandeOptions) => {
  const { ms, auteurMsgRepondu, arg, repondre, auteurMessage, infosMessage } = commandeOptions;

  if (!auteurMsgRepondu && !arg) {
    return repondre('❌ Please mention a user or provide a phone number');
  }

  let targetNumber, targetName;

  if (auteurMsgRepondu) {
    // Extract mentioned user's number and name
    targetNumber = auteurMsgRepondu.split('@')[0];
    
    // Get the mentioned user's name from the message context
    const mentionedUser = infosMessage.mentionedJidList?.find(jid => jid.includes(targetNumber));
    if (mentionedUser) {
      // Try to get the pushname (display name) of the mentioned user
      const contact = await zk.fetchStatus(mentionedUser).catch(() => null);
      targetName = contact?.status || "User";
    } else {
      targetName = "User";
    }
  } else {
    // Handle case when arguments are provided instead of mention
    const possibleNumber = arg[0].replace(/[^0-9]/g, '');
    if (possibleNumber.length > 5) {
      targetNumber = possibleNumber;
      targetName = arg.length > 1 ? arg.slice(1).join(' ') : "User";
    } else {
      return repondre('❌ Please provide a valid phone number');
    }
  }

  const vcard =
    'BEGIN:VCARD\n' +
    'VERSION:3.0\n' +
    'FN:' + targetName + '\n' +
    'ORG:undefined;\n' +
    'TEL;type=CELL;type=VOICE;waid=' + targetNumber + ':+' + targetNumber + '\n' +
    'END:VCARD';

  await zk.sendMessage(dest, {
    contacts: {
      displayName: targetName,
      contacts: [{ vcard }],
    },
  }, { quoted: ms });
});
