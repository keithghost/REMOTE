
const { keith } = require('../commandHandler');
const { sendButtons } = require('gifted-btns');
const axios = require('axios');
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================

keith({
  pattern: "copy",
  aliases: ["copied", "cp"],
  description: "Copy quoted message text via button",
  category: "General",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, quotedMsg, reply, botname } = conText;

  if (!quotedMsg) {
    return reply("📌 Reply to a message with `.copy` to generate a copy button.");
  }


  const text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text;
  if (!text) {
    return reply("❌ Could not extract quoted text.");
  }

  try {
    await sendButtons(client, from, {
      title: "",
      text: "*Tap the button below to copy the quoted text👇.*",
      footer: `> *${botname}*`,
      buttons: [
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📋 Copy your Quoted Text",
            id: "copy_text",
            copy_code: text
          })
        }
      ]
    }, { quoted: mek });
  } catch (err) {
    console.error("❌ Copy command failed:", err);
    await client.sendMessage(from, {
      text: "❌ Failed to generate copy button."
    }, { quoted: mek });
  }
});
//========================================================================================================================
//
keith({
  pattern: "repo",
  aliases: ["script", "sc"],
  description: "Send KEITH-MD repo information",
  category: "General",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, pushName, botname, author } = conText;

  try {
    const response = await axios.get("https://api.github.com/repos/Keithkeizzah/KEITH-MD");
    const repoData = response.data;

    const createdDate = new Date(repoData.created_at).toLocaleDateString("en-KE", {
      day: "numeric", month: "short", year: "numeric"
    });

    const lastUpdateDate = new Date(repoData.updated_at).toLocaleDateString("en-KE", {
      day: "numeric", month: "short", year: "numeric"
    });

    const messageText =
      `Hello ${pushName},👋 This is *${botname}*\n` +
      `The best bot in the universe developed by ${author}. Fork and give a star 🌟 to my repo\n\n` +
      `╭───────────────────\n` +
      `│✞ *Stars:* ${repoData.stargazers_count}\n` +
      `│✞ *Forks:* ${repoData.forks_count}\n` +
      `│✞ *Release Date:* ${createdDate}\n` +
      `│✞ *Last Update:* ${lastUpdateDate}\n` +
      `│✞ *Owner:* ${author}\n` +
      `╰───────────────────`;

    await sendButtons(client, from, {
      title: '',
      text: messageText,
      footer: `> *${botname}*`,
      buttons: [
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "🌐 Visit Repository",
            url: repoData.html_url
          })
        },
        {
          name: "cta_copy",
          buttonParamsJson: JSON.stringify({
            display_text: "📋 Copy Session URL",
            id: "copy_session",
            copy_code: "https://keithsite.vercel.app/keithpair"
          })
        }
      ]
    }, { quoted: mek });

  } catch (err) {
    console.error("❌ Repo fetch failed:", err);
    await client.sendMessage(from, {
      text: "❌ Failed to fetch repository information."
    }, { quoted: mek });
  }
});
