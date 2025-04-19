const { keith } = require('../keizzah/keith');
keith({
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
});
