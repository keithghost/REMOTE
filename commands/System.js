const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const axios = require("axios");
const { exec } = require("child_process");
const speed = require("performance-now");
const googleTTS = require('google-tts-api');
const { repondre } = require('../keizzah/context');
const conf = require(__dirname + "/../set");

// Utility function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Formats uptime in seconds into a human-readable string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [
    days && `${days} day${days > 1 ? 's' : ''}`,
    hours && `${hours} hour${hours > 1 ? 's' : ''}`,
    minutes && `${minutes} minute${minutes > 1 ? 's' : ''}`,
    `${secs} second${secs !== 1 ? 's' : ''}`
  ].filter(Boolean).join(' ');
}

/**
 * Standardized context info generator
 */
const getContextInfo = (title = '', userJid = '') => ({
  mentionedJid: [userJid],
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: "120363266249040649@newsletter",
    newsletterName: "Keith Support 🔥",
    serverMessageId: Math.floor(100000 + Math.random() * 900000),
  },
  externalAdReply: {
    showAdAttribution: true,
    title: conf.BOT || 'System Command',
    body: title || "Bot Functionality",
    thumbnailUrl: conf.URL || '',
    sourceUrl: conf.GURL || '',
    mediaType: 1,
    renderLargerThumbnail: false
  }
});

// Test command
keith({
  nomCom: "test",
  aliases: ["alive", "testing"],
  categorie: "system",
  reaction: "⚔️"
}, async (dest, zk, { ms, userJid }) => {
  const audioFiles = ['https://files.catbox.moe/hpwsi2.mp3'];
  const selectedAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];

  await zk.sendMessage(dest, {
    audio: { url: selectedAudio },
    mimetype: 'audio/mpeg',
    ptt: true,
    waveform: [100, 0, 100, 0, 100, 0, 100],
    contextInfo: getContextInfo('𝗜 𝗔𝗠 𝗔𝗟𝗜𝗩𝗘 𝗠𝗢𝗧𝗛𝗘𝗥𝗙𝗨𝗖𝗞𝗘𝗥', userJid)
  }, { quoted: ms });
});

// Uptime command
keith({
  nomCom: 'uptime',
  aliases: ['runtime', 'running'],
  categorie: 'system',
  reaction: '⚔️'
}, async (dest, zk, { ms, userJid }) => {
  try {
    const uptime = formatUptime(process.uptime());
    const audioUrl = googleTTS.getAudioUrl(
      `${conf.BOT} has been running for ${uptime}`,
      { lang: 'en', slow: false }
    );

    await zk.sendMessage(dest, { 
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: getContextInfo(
        `Running for ${uptime}`,
        userJid
      )
    }, { quoted: ms });

  } catch (error) {
    console.error('Uptime error:', error);
    repondre(zk, dest, ms, '❌ Failed to check uptime');
  }
});

// Ping command
keith({
  nomCom: 'ping',
  aliases: ['speed', 'latency'],
  categorie: 'system',
  reaction: '⚡'
}, async (dest, zk, { ms, userJid }) => {
  try {
    const pings = [];
    for (let i = 0; i < 3; i++) {
      const start = speed();
      await delay(100);
      pings.push(Math.floor((speed() - start) * 1000));
    }
    const avgPing = Math.round(pings.reduce((a,b) => a + b) / pings.length);

    await zk.sendMessage(dest, { 
      audio: { 
        url: googleTTS.getAudioUrl(
          `Ping results: ${pings.join('ms, ')}ms. Average: ${avgPing}ms`,
          { lang: 'en', slow: false }
        )
      },
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: getContextInfo(
        `Average ping: ${avgPing}ms`,
        userJid
      )
    }, { quoted: ms });

  } catch (error) {
    console.error('Ping error:', error);
    repondre(zk, dest, ms, '❌ Ping test failed');
  }
});


// Restart command
keith({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system",
  reaction: '🔄'
}, async (dest, zk, commandeOptions) => {
  const { ms, superUser } = commandeOptions;

  if (!superUser) {
    return repondre(zk, dest, ms, "You need owner privileges to execute this command!");
  }

  try {
    await repondre(zk, dest, ms, "*Restarting...*");
    await delay(3000);
    process.exit(0);
  } catch (error) {
    console.error("Error during restart:", error);
    await repondre(zk, dest, ms, "❌ Failed to restart the bot.");
  }
});

// All variables command
keith({
  nomCom: 'allvar',
  categorie: "system",
  reaction: '📝'
}, async (dest, zk, commandeOptions) => {
  const { ms, superUser } = commandeOptions;

  if (!superUser) {
    return repondre(zk, dest, ms, "*This command is restricted to the bot owner or Alpha owner 💀*");
  }

  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;

  if (!appname || !herokuapi) {
    return repondre(zk, dest, ms, "Heroku configuration is not set up properly.");
  }

  const heroku = new Heroku({ token: herokuapi });
  const baseURI = `/apps/${appname}/config-vars`;

  try {
    const configVars = await heroku.get(baseURI);
    let str = '*╭───༺All my Heroku vars༻────╮*\n\n';
    
    for (let key in configVars) {
      if (Object.prototype.hasOwnProperty.call(configVars, key)) {
        str += `★ *${key}* = ${configVars[key]}\n`;
      }
    }

    str += '\n*╰───────────────────────╯*';
    await repondre(zk, dest, ms, str);
  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    await repondre(zk, dest, ms, '❌ Sorry, there was an error fetching the config vars.');
  }
});

// Set variable command
keith({
  nomCom: 'setvar',
  categorie: "system",
  reaction: '⚙️'
}, async (dest, zk, commandeOptions) => {
  const { ms, superUser, arg } = commandeOptions;

  if (!superUser) {
    return repondre(zk, dest, ms, "*This command is restricted to the bot owner or Alpha owner 💀*");
  }

  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;

  if (!appname || !herokuapi) {
    return repondre(zk, dest, ms, "Heroku configuration is not set up properly.");
  }

  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    return repondre(zk, dest, ms, 'Incorrect Usage:\nProvide the key and value correctly.\nExample: setvar ANTICALL=yes');
  }

  const [key, value] = arg[0].split('=');
  const heroku = new Heroku({ token: herokuapi });
  const baseURI = `/apps/${appname}/config-vars`;

  try {
    await heroku.patch(baseURI, { body: { [key]: value } });
    await repondre(zk, dest, ms, `*✅ The variable ${key} = ${value} has been set successfully. The bot is restarting...*`);
    await delay(2000);
    process.exit(0);
  } catch (error) {
    console.error('Error setting config variable:', error);
    await repondre(zk, dest, ms, `❌ There was an error setting the variable.\nError: ${error.message}`);
  }
});

// Shell command
keith({
  nomCom: "shell",
  aliases: ["getcmd", "cmd"],
  reaction: '💻',
  categorie: "coding"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg, superUser } = commandeOptions;

  if (!superUser) {
    return repondre(zk, dest, ms, "You are not authorized to execute shell commands.");
  }

  const command = arg.join(" ").trim();

  if (!command) {
    return repondre(zk, dest, ms, "Please provide a valid shell command.");
  }

  exec(command, async (err, stdout, stderr) => {
    if (err) {
      return await repondre(zk, dest, ms, `Error: ${err.message}`);
    }
    if (stderr) {
      return await repondre(zk, dest, ms, `stderr: ${stderr}`);
    }
    if (stdout) {
      return await repondre(zk, dest, ms, stdout.slice(0, 10000)); // Limit output to 10,000 chars
    }
    return await repondre(zk, dest, ms, "Command executed successfully, but no output was returned.");
  });
});

// Update command
keith({
  nomCom: 'update',
  aliases: ['redeploy', 'sync'],
  categorie: "system",
  reaction: '🔄'
}, async (dest, zk, commandeOptions) => {
  const { ms, superUser } = commandeOptions;

  if (!superUser) {
    return repondre(zk, dest, ms, "*This command is restricted to the bot owner or Alpha owner 💀*");
  }

  const herokuAppName = s.HEROKU_APP_NAME;
  const herokuApiKey = s.HEROKU_API_KEY;

  if (!herokuAppName || !herokuApiKey) {
    await repondre(zk, dest, ms, "It looks like the Heroku app name or API key is not set. Please make sure you have set the `HEROKU_APP_NAME` and `HEROKU_API_KEY` environment variables.");
    return;
  }

  try {
    const response = await axios.post(
      `https://api.heroku.com/apps/${herokuAppName}/builds`,
      {
        source_blob: {
          url: "https://github.com/Keithkeizzah/ALPHA-MD/tarball/main",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${herokuApiKey}`,
          Accept: "application/vnd.heroku+json; version=3",
        },
      }
    );

    await repondre(zk, dest, ms, "*Your bot is getting updated, wait 2 minutes for the redeploy to finish! This will install the latest version of ALPHA-MD.*");
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    await repondre(zk, dest, ms, `*Failed to update and redeploy. ${errorMessage} Please check if you have set the Heroku API key and Heroku app name correctly.*`);
    console.error("Error triggering redeploy:", error);
  }
});

// Fetch command
keith({
  nomCom: "fetch",
  aliases: ["get", "find"],
  categorie: "coding",
  reaction: '🛄',
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;
  const urlInput = arg.join(" ");

  if (!/^https?:\/\//.test(urlInput)) {
    return repondre(zk, dest, ms, "Start the *URL* with http:// or https://");
  }

  try {
    const url = new URL(urlInput);
    const fetchUrl = `${url.origin}${url.pathname}?${url.searchParams.toString()}`;
    const response = await axios.get(fetchUrl, { 
      responseType: 'arraybuffer',
      maxContentLength: 104857600 // 100MB limit
    });

    if (response.status !== 200) {
      return repondre(zk, dest, ms, `Failed to fetch the URL. Status: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers['content-type'];
    const buffer = Buffer.from(response.data);

    if (/image\/.*/.test(contentType)) {
      await zk.sendMessage(dest, {
        image: buffer,
        caption: `> > *${conf.BOT}*`
      }, { quoted: ms });
    } else if (/video\/.*/.test(contentType)) {
      await zk.sendMessage(dest, {
        video: buffer,
        caption: `> > *${conf.BOT}*`
      }, { quoted: ms });
    } else if (/audio\/.*/.test(contentType)) {
      await zk.sendMessage(dest, {
        audio: buffer,
        caption: `> > *${conf.BOT}*`
      }, { quoted: ms });
    } else if (/text|json/.test(contentType)) {
      try {
        const json = JSON.parse(buffer.toString());
        await repondre(zk, dest, ms, JSON.stringify(json, null, 2).slice(0, 10000));
      } catch {
        await repondre(zk, dest, ms, buffer.toString().slice(0, 10000));
      }
    } else {
      await zk.sendMessage(dest, {
        document: buffer,
        mimetype: contentType,
        caption: `> > *${conf.BOT}*`
      }, { quoted: ms });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    await repondre(zk, dest, ms, `❌ Error fetching data: ${error.message}`);
  }
});
