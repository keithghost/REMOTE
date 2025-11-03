
const { keith } = require('../commandHandler');
//========================================================================================================================
keith({
  pattern: "setsudo",
  aliases: ['setsudo'],
 // react: "👑",
  category: "Owner",
  description: "Sets User as Sudo",
}, async (from, client, conText) => {
  const { mek, reply, react, isSuperUser, quotedUser, setSudo } = conText;

  if (!isSuperUser) {
    await react("❌");
    return reply("❌ Owner Only Command!");
  }

  if (!quotedUser) {
    await react("❌");
    return reply("❌ Please reply to/quote a user!");
  }

  try {
    let result;
    
    if (quotedUser) {
      if (quotedUser.startsWith('@') && quotedUser.includes('@lid')) {
        result = quotedUser.replace('@', '') + '@lid';
      } else {
        result = quotedUser;
      }
    }

    let finalResult = result;
    if (result && result.includes('@lid')) {
      finalResult = await client.getJidFromLid(result);
    }
    const userNumber = finalResult.split("@")[0];
    const added = await setSudo(userNumber);
    const msg = added
      ? `✅ Added @${userNumber} to sudo list.`
      : `⚠️ @${userNumber} is already in sudo list.`;

    await client.sendMessage(from, {
      text: msg,
      mentions: [quotedUser]
    }, { quoted: mek });
    await react("✅");

  } catch (error) {
    console.error("setsudo error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "delsudo",
  aliases: ['removesudo'],
 // react: "👑",
  category: "Owner",
  description: "Deletes User as Sudo",
}, async (from, client, conText) => {
  const { mek, reply, react, isSuperUser, quotedUser, delSudo } = conText;

  if (!isSuperUser) {
    await react("❌");
    return reply("❌ Owner Only Command!");
  }

  try {
    let result;
    
    if (quotedUser) {
      if (quotedUser.startsWith('@') && quotedUser.includes('@lid')) {
        result = quotedUser.replace('@', '') + '@lid';
      } else {
        result = quotedUser;
      }
    }

    let finalResult = result;
    if (result && result.includes('@lid')) {
      finalResult = await client.getJidFromLid(result);
    }
    const userNumber = finalResult.split("@")[0];
    const removed = await delSudo(userNumber);
    const msg = removed
      ? `❌ Removed @${userNumber} from sudo list.`
      : `⚠️ @${userNumber} is not in the sudo list.`;

    await client.sendMessage(from, {
      text: msg,
      mentions: [quotedUser]
    }, { quoted: mek });
    await react("✅");

  } catch (error) {
    console.error("delsudo error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "issudo",
  aliases: ['checksudo'],
 // react: "👑",
  category: "Owner",
  description: "Check if user is sudo",
}, async (from, client, conText) => {
  const { mek, reply, react, isSuperUser, quotedUser, isSudo } = conText;

  if (!isSuperUser) {
    await react("❌");
    return reply("❌ Owner Only Command!");
  }

  if (!quotedUser) {
    await react("❌");
    return reply("❌ Please reply to/quote a user!");
  }

  try {
    let result;
    
    if (quotedUser) {
      if (quotedUser.startsWith('@') && quotedUser.includes('@lid')) {
        result = quotedUser.replace('@', '') + '@lid';
      } else {
        result = quotedUser;
      }
    }

    let finalResult = result;
    if (result && result.includes('@lid')) {
      finalResult = await client.getJidFromLid(result);
    }
    const userNumber = finalResult.split("@")[0];
    const isUserSudo = await isSudo(userNumber);
    const msg = isUserSudo
      ? `✅ @${userNumber} is a sudo user.`
      : `❌ @${userNumber} is not a sudo user.`;

    await client.sendMessage(from, {
      text: msg,
      mentions: [quotedUser]
    }, { quoted: mek });
    await react("✅");

  } catch (error) {
    console.error("issudo error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "getsudo",
  aliases: ['getsudos', 'listsudo', 'listsudos'],
  //react: "👑",
  category: "Owner",
  description: "Get All Sudo Users",
}, async (from, client, conText) => {
  const { mek, reply, react, isSuperUser, getSudoNumbers, dev, devNumbers } = conText;

  try {
    if (!isSuperUser) {
      await react("❌");
      return reply("❌ Owner Only Command!");
    }

    // Get sudo numbers from database
    const sudoFromDB = await getSudoNumbers() || [];
    
    // Current dev from settings
    const currentDev = dev ? [dev.replace(/\D/g, '')] : [];

    // Combine all sudo users
    const allSudos = [...new Set([...sudoFromDB, ...devNumbers, ...currentDev])];

    if (!allSudos.length) {
      return reply("⚠️ No sudo users found.");
    }

    let msg = "*👑 ALL SUDO USERS*\n\n";
    
    // Database sudo users
    if (sudoFromDB.length > 0) {
      msg += `*Database Sudo Users (${sudoFromDB.length}):*\n`;
      sudoFromDB.forEach((num, i) => {
        msg += `${i + 1}. wa.me/${num}\n`;
      });
      msg += '\n';
    }

    // Hardcoded dev numbers from context
    if (devNumbers && devNumbers.length > 0) {
      msg += `*Hardcoded Dev Numbers (${devNumbers.length}):*\n`;
      devNumbers.forEach((num, i) => {
        msg += `${i + 1}. wa.me/${num}\n`;
      });
      msg += '\n';
    }

    // Current dev from settings
    if (currentDev.length > 0) {
      msg += `*Current Dev (${currentDev.length}):*\n`;
      currentDev.forEach((num, i) => {
        msg += `${i + 1}. wa.me/${num}\n`;
      });
      msg += '\n';
    }

    msg += `*Total Sudo Users: ${allSudos.length}*`;
    
    await reply(msg);
    await react("✅");

  } catch (error) {
    console.error("getsudo error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
