const { keith } = require('../keizzah/keith');
const {ajouterUtilisateurAvecWarnCount , getWarnCountByJID , resetWarnCountByJID} = require('../bdd/warn')
const s = require("../set");
const fs = require('fs');
const Heroku = require('heroku-client');

let conf;

try {
  conf = require(__dirname + "/../set");
} catch (error) {
  console.error("Configuration file not found. Setting conf to undefined.");
  conf = {};
}

// Function to get a description of an environment variable
function getDescriptionFromEnv(varName) {
  try {
    const filePath = "./app.json";
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const config = JSON.parse(fileContent);
    return config.env[varName]?.description || "No description available.";
  } catch (error) {
    console.error("Error reading app.json:", error);
    return "No description available.";
  }
}

keith({
  nomCom: 'env',
  aliases: ['getvar', 'settings', 'setting'],
  desc: "Settings of bot",
  categorie: "HEROKU-CLIENT",
  reaction: "⤵️",
}, async (chatId, zk, context) => {
  const { repondre, ms, superUser, auteurMessage, arg } = context;

  if (!superUser) {
    repondre("This command is for my owner only!");
    return;
  }

  const settingsOptions = [
    { nom: "ANTI_DELETE_MESSAGE", choix: ['yes', "no"], desc: "Delete message if enabled" },
    { nom: "ANTICALL", choix: ['yes', 'no'], desc: "Decline unnecessary calls when enabled" },
    { nom: "AUTOBIO", choix: ['yes', 'no'], desc: "Update your bio status when enabled" },
    { nom: "GREET", choix: ['yes', 'no'], desc: "Update your greet message when enabled" },
    { nom: "AUTO_BLOCK", choix: ['yes', 'no'], desc: "Block users automatically" },
    { nom: "GROUP_CONTROL", choix: ['yes', 'no'], desc: "Control group settings" },
    { nom: "AUTO_STATUS_REPLY", choix: ['yes', 'no'], desc: "Reply to status messages automatically" },
    { nom: "AUTO_REACT", choix: ['yes', 'no'], desc: "Automatically react to messages" },
    { nom: "AUTO_VIEW_STATUS", choix: ['yes', 'no'], desc: "Automatically view status updates" },
    { nom: 'AUTO_DOWNLOAD_STATUS', choix: ['yes', 'no'], desc: "Automatically download status" },
    { nom: "PM_PERMIT", choix: ['yes', 'no'], desc: "Permit personal messages" },
    { nom: "AUTO_LIKE_STATUS", choix: ['yes', 'no'], desc: "Like status messages automatically" },
    { nom: 'PUBLIC_MODE', choix: ["public", "private"], desc: "Control public/private mode" },
    { nom: "STARTING_BOT_MESSAGE", choix: ['yes', "no"], desc: "Send a starting bot message" },
    { nom: "AUTO_READ_MESSAGES", choix: ['yes', 'no'], desc: "Auto read incoming messages" },
    { nom: 'PRESENCE', choix: ["1", "2", '3'], desc: "Set the bot's presence" },
    { nom: "CHATBOT", choix: ['yes', 'no'], desc: "Enable the chat bot feature" },
    { nom: "CHATBOT_INBOX", choix: ['yes', 'no'], desc: "Enable the chat bot feature in my inbox" },
    { nom: "VOICE_CHATBOT", choix: ['yes', 'no'], desc: "Enable the chat bot feature for voice" },
    { nom: "VOICE_CHATBOT_INBOX", choix: ['yes', 'no'], desc: "Enable the chat bot feature for voice in your inbox" },
    { nom: "ANTICALL_MESSAGE", choix: ['text'], desc: "Message to send when anti-call is enabled" },
    { nom: "PREFIX", choix: ['text'], desc: "Set the bot's command prefix" },
    { nom: "OWNER_NAME", choix: ['text'], desc: "Owner's name" },
    { nom: "BOT_NAME", choix: ['text'], desc: "Set the bot's name" },
    { nom: "NUMERO_OWNER", choix: ['text'], desc: "Owner's phone number" },
    { nom: "URL", choix: ['text'], desc: "URL related to the bot" },
    { nom: "GREET_MSG", choix: ['text'], desc: "Greet message when bot starts" },
    { nom: "WARN_COUNT", choix: ["1", "2", "3"], desc: "Set the warning level for users" },
    { nom: "AUTOBIO_MSG", choix: ['text'], desc: "Automatic bio message" },
    { nom: "AUTO_STATUS_MSG", choix: ['text'], desc: "Automatic status message" }
  ];

  const currentSettings = await getCurrentSettings();

  let settingsMenu = "╭━━━━ 〔 *HEROKU SETTINGS⚔️🗡️* 〕━━━━━━┈⊷𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭𑲭\n\n";
  settingsOptions.forEach((option, index) => {
    const currentState = currentSettings[option.nom];
    const stateEmoji = currentState === 'yes' || currentState === 'on' ? '✅' : '❌';
    settingsMenu += `${index + 1}- *${option.nom}* {${currentState}} ${stateEmoji}\nDesc: ${option.desc}\n`;
  });
  settingsMenu += "\n*Please choose a variable by its number*";

  const initialMessage = await zk.sendMessage(chatId, { text: settingsMenu }, { quoted: ms });

  // Await user choice for a setting
  const userChoice = await zk.awaitForMessage({
    chatJid: chatId,
    sender: auteurMessage,
    timeout: 60000,
    filter: msg => msg.message.extendedTextMessage?.contextInfo.stanzaId === initialMessage.key.id &&
                    msg.message.extendedTextMessage.text > 0 &&
                    msg.message.extendedTextMessage.text <= settingsOptions.length
  });

  const selectedOption = settingsOptions[userChoice.message.extendedTextMessage.text - 1];
  const currentState = currentSettings[selectedOption.nom];

  let newState;

  // Handle special cases for MODE and PRESENCE
  if (selectedOption.nom === 'PUBLIC_MODE') {
    newState = currentState === 'public' ? 'private' : 'public';
  } else if (selectedOption.nom === 'PRESENCE') {
    const presenceValues = ["1", "2", "3"];
    const currentIndex = presenceValues.indexOf(currentState);
    newState = presenceValues[(currentIndex + 1) % presenceValues.length]; // Cycle through 1, 2, 3
  } else if (selectedOption.nom === 'WARN_COUNT') {
    const warnValues = ["1", "2", "3"];
    const currentIndex = warnValues.indexOf(currentState);
    newState = warnValues[(currentIndex + 1) % warnValues.length]; // Cycle through 1, 2, 3
  } else if (selectedOption.nom === 'ANTICALL_MESSAGE' || selectedOption.nom === 'PREFIX' || selectedOption.nom === 'OWNER_NAME' || selectedOption.nom === 'BOT_NAME' || selectedOption.nom === 'NUMERO_OWNER' || selectedOption.nom === 'URL' || selectedOption.nom === 'GREET_MSG' || selectedOption.nom === 'AUTOBIO_MSG' || selectedOption.nom === 'AUTO_STATUS_MSG') {
    // Require text input for these settings
    const text = arg.join(" ");

    // Check if the text is empty or invalid
    if (!text) {
      repondre(`*You need to provide a message for the ${selectedOption.nom} setting.*`);
      return;
    }

    // Update the setting with the provided message
    await updateHerokuConfigVar(selectedOption.nom, text);
    repondre(`*The setting '${selectedOption.nom}' has been updated: '${text}'*`);
    return;
  } else {
    // Default toggle for yes/no
    newState = currentState === 'yes' ? 'no' : 'yes';
  }

  // Update the selected variable to the new state
  await updateHerokuConfigVar(selectedOption.nom, newState);
  repondre(`*The Heroku variable '${selectedOption.nom}' has been updated to '${newState}'. The bot is restarting...*`);
});

// Function to update a setting in Heroku
async function updateHerokuConfigVar(varName, value) {
  const heroku = new Heroku({ token: conf.HEROKU_API_KEY });
  try {
    await heroku.patch(`/apps/${conf.HEROKU_APP_NAME}/config-vars`, {
      body: {
        [varName]: value
      }
    });
  } catch (error) {
    console.error(`Error updating Heroku config variable '${varName}':`, error);
  }
}

// Function to retrieve the current settings from Heroku
async function getCurrentSettings() {
  const heroku = new Heroku({ token: conf.HEROKU_API_KEY });
  try {
    const response = await heroku.get(`/apps/${conf.HEROKU_APP_NAME}/config-vars`);
    return response;
  } catch (error) {
    console.error("Error fetching current settings from Heroku:", error);
    return {};
  }
}

keith(
    {
        nomCom : 'warn',
        desc: 'to warn',
        categorie : 'Group'
        
    },async (dest,zk,commandeOptions) => {

 const {ms , arg, repondre,superUser,verifGroupe,verifAdmin , msgRepondu , auteurMsgRepondu} = commandeOptions;
if(!verifGroupe ) {repondre('this is a group commands') ; return};

if(verifAdmin || superUser) {
   if(!msgRepondu){repondre('reply a message of user to warn'); return};
   
   if (!arg || !arg[0] || arg.join('') === '') {
    await ajouterUtilisateurAvecWarnCount(auteurMsgRepondu)
   let warn = await getWarnCountByJID(auteurMsgRepondu)
   let warnlimit = s.WARN_COUNT
   
   if( warn >= warnlimit ) { await repondre('this user reach limit of warning , so i kick him/her');
                zk.groupParticipantsUpdate(dest, [auteurMsgRepondu], "remove")
 } else { 

    var rest = warnlimit - warn ;
     repondre(`this user is warned , rest before kick : ${rest} `)
   }
} else if ( arg[0] === 'reset') { await resetWarnCountByJID(auteurMsgRepondu) 

    repondre("Warn count is reset for this user")} else ( repondre('reply to a user by typing  .warn ou .warn reset'))
   
}  else {
    repondre('you are not admin')
}
 
   });
