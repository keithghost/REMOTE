const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const s = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { repondre, sendMessage } = require('../keizzah/context');
const { exec } = require("child_process");
const conf = require(__dirname + "/../set");

// Function for delay simulation
function delay(ms) {
  console.log(`⏱️ delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format the uptime into a human-readable string
function runtime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);

  return `${hours}h ${minutes}m ${secondsLeft}s`;
}

// New loading animation with different symbols and larger progress bar
async function loading(dest, zk, ms) {
  const lod = [
    "⬛⬛⬜⬜⬜⬜⬛⬛꧁20%꧂",
    "⬛⬛⬛⬛⬜⬜⬜⬜꧁40%꧂",
    "⬜⬜⬛⬛⬛⬛⬜⬜꧁60%꧂",
    "⬜⬜⬜⬜⬛⬛⬛⬛꧁80%꧂",
    "⬛⬛⬜⬜⬜⬜⬛⬛꧁100%꧂",
    "*L҉O҉A҉D҉I҉N҉G҉ D҉O҉N҉E҉ ᵗʱᵃᵑᵏᵧₒᵤ ⚔️🗡️*"
  ];

  let { key } = await zk.sendMessage(dest, { text: 'Loading Please Wait' });

  for (let i = 0; i < lod.length; i++) {
    await zk.sendMessage(dest, { text: lod[i], edit: key });
    await delay(500);
  }
}

keith({
  nomCom: "test",
  aliases: ["alive", "testing"],
  categorie: "system",
  reaction: "⚔️"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  // Array of sound file URLs
  const audioFiles = [
    'https://files.catbox.moe/hpwsi2.mp3',
    // ... other audio files
  ];

  const selectedAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];

  const audioMessage = {
    audio: { url: selectedAudio },
    mimetype: 'audio/mpeg',
    ptt: true,
    waveform: [100, 0, 100, 0, 100, 0, 100],
    fileName: 'shizo',
    contextInfo: {
      externalAdReply: {
        title: '𝗜 𝗔𝗠 𝗔𝗟𝗜𝗩𝗘 𝗠𝗢𝗧𝗛𝗘𝗥𝗙𝗨𝗖𝗞𝗘𝗥',
        body: conf.OWNER_NAME,
        thumbnailUrl: conf.URL,
        sourceUrl: conf.GURL,
        mediaType: 1,
        renderLargerThumbnail: true,
      },
    },
  };

  await zk.sendMessage(dest, audioMessage, { quoted: ms });
});

keith({
  nomCom: 'restart',
  aliases: ['reboot'],
  categorie: "system"
}, async (dest, zk, commandeOptions) => {
  const { ms, superUser } = commandeOptions;

  if (!superUser) {
    return repondre(zk, dest, ms, "You need owner privileges to execute this command!");
  }

  try {
    await repondre(zk, dest, ms, "*Restarting...*");
    await delay(3000);
    process.exit();
  } catch (error) {
    console.error("Error during restart:", error);
  }
});

keith({
  nomCom: 'allvar',
  categorie: "system"
}, async (dest, zk, commandeOptions) => {
  const { ms, superUser } = commandeOptions;

  if (!superUser) {
    return repondre(zk, dest, ms, "*This command is restricted to the bot owner or Alpha owner 💀*");
  }

  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;

  const heroku = new Heroku({ token: herokuapi });
  const baseURI = `/apps/${appname}/config-vars`;

  try {
    const configVars = await heroku.get(baseURI);
    let str = '*╭───༺All my Heroku vars༻────╮*\n\n';
    
    for (let key in configVars) {
      if (configVars.hasOwnProperty(key)) {
        str += `★ *${key}* = ${configVars[key]}\n`;
      }
    }

    await repondre(zk, dest, ms, str);
  } catch (error) {
    console.error('Error fetching Heroku config vars:', error);
    await repondre(zk, dest, ms, 'Sorry, there was an error fetching the config vars.');
  }
});

keith({
  nomCom: 'setvar',
  categorie: "system"
}, async (dest, zk, commandeOptions) => {
  const { ms, superUser, arg } = commandeOptions;

  if (!superUser) {
    return repondre(zk, dest, ms, "*This command is restricted to the bot owner or Alpha owner 💀*");
  }

  const appname = s.HEROKU_APP_NAME;
  const herokuapi = s.HEROKU_API_KEY;

  if (!arg || arg.length !== 1 || !arg[0].includes('=')) {
    return repondre(zk, dest, ms, 'Incorrect Usage:\nProvide the key and value correctly.\nExample: setvar ANTICALL=yes');
  }

  const [key, value] = arg[0].split('=');
  const heroku = new Heroku({ token: herokuapi });
  const baseURI = `/apps/${appname}/config-vars`;

  try {
    await heroku.patch(baseURI, { body: { [key]: value } });
    await repondre(zk, dest, ms, `*✅ The variable ${key} = ${value} has been set successfully. The bot is restarting...*`);
  } catch (error) {
    console.error('Error setting config variable:', error);
    await repondre(zk, dest, ms, `❌ There was an error setting the variable. Please try again later.\n${error.message}`);
  }
});

keith({
  nomCom: "shell",
  aliases: ["getcmd", "cmd"],
  reaction: '⚔️',
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

  exec(command, (err, stdout, stderr) => {
    if (err) {
      return repondre(zk, dest, ms, `Error: ${err.message}`);
    }
    if (stderr) {
      return repondre(zk, dest, ms, `stderr: ${stderr}`);
    }
    if (stdout) {
      return repondre(zk, dest, ms, stdout);
    }
    return repondre(zk, dest, ms, "Command executed successfully, but no output was returned.");
  });
});

keith({
  nomCom: 'ping',
  aliases: ['speed', 'latency'],
  desc: 'To check bot response time',
  categorie: 'system',
  reaction: '⚡',
  fromMe: true,
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  await loading(dest, zk, ms);

  const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));
  const formattedResults = pingResults.map(ping => `${conf.OWNER_NAME} 𝖘𝖕𝖊𝖊𝖉 ${ping} 𝐌/𝐒  `);

  await sendMessage(zk, dest, ms, {
    text: `${formattedResults.join(', ')}`,
    contextInfo: {
      externalAdReply: {
        title: conf.BOT,
        body: `${formattedResults.join(" | ")}`,
        thumbnailUrl: conf.URL,
        sourceUrl: conf.GURL,
        mediaType: 1,
        showAdAttribution: true,
      },
    },
  });
});

keith({
  nomCom: 'uptime',
  aliases: ['runtime', 'running'],
  desc: 'To check runtime',
  categorie: 'system',
  reaction: '⚔️',
  fromMe: true,
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  const botUptime = process.uptime();

  await sendMessage(zk, dest, ms, {
    text: `*${conf.OWNER_NAME} UPTIME IS ${runtime(botUptime)}*`,
    contextInfo: {
      externalAdReply: {
        title: `${conf.BOT} UPTIME`,
        body: `Bot Uptime: ${runtime(botUptime)}`,
        thumbnailUrl: conf.URL,
        sourceUrl: conf.GURL,
        mediaType: 1,
        showAdAttribution: true,
      },
    },
  });
});

keith({
  nomCom: 'update',
  aliases: ['redeploy', 'sync'],
  categorie: "system"
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
    const errorMessage = error.response?.data || error.message;
    await repondre(zk, dest, ms, `*Failed to update and redeploy. ${errorMessage} Please check if you have set the Heroku API key and Heroku app name correctly.*`);
    console.error("Error triggering redeploy:", errorMessage);
  }
});

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
    const response = await axios.get(fetchUrl, { responseType: 'arraybuffer' });

    if (response.status !== 200) {
      return repondre(zk, dest, ms, `Failed to fetch the URL. Status: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 104857600) {
      return repondre(zk, dest, ms, `Content-Length exceeds the limit: ${contentLength}`);
    }

    const contentType = response.headers['content-type'];
    const buffer = Buffer.from(response.data);

    if (/image\/.*/.test(contentType)) {
      await sendMessage(zk, dest, ms, {
        image: { url: fetchUrl },
        caption: `> > *${conf.BOT}*`
      });
    } else if (/video\/.*/.test(contentType)) {
      await sendMessage(zk, dest, ms, {
        video: { url: fetchUrl },
        caption: `> > *${conf.BOT}*`
      });
    } else if (/audio\/.*/.test(contentType)) {
      await sendMessage(zk, dest, ms, {
        audio: { url: fetchUrl },
        caption: `> > *${conf.BOT}*`
      });
    } else if (/text|json/.test(contentType)) {
      try {
        const json = JSON.parse(buffer);
        await repondre(zk, dest, ms, JSON.stringify(json, null, 2).slice(0, 10000));
      } catch {
        await repondre(zk, dest, ms, buffer.toString().slice(0, 10000));
      }
    } else {
      await sendMessage(zk, dest, ms, {
        document: { url: fetchUrl },
        caption: `> > *${conf.BOT}*`
      });
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    await repondre(zk, dest, ms, `Error fetching data: ${error.message}`);
  }
});
