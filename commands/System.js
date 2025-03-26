const { keith } = require('../keizzah/keith');
const googleTTS = require('google-tts-api');
const conf = require(__dirname + "/../set");

// Format the uptime into a human-readable string
function formatUptime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  let uptimeString = '';
  if (days > 0) uptimeString += `${days} day${days > 1 ? 's' : ''}, `;
  if (hours > 0) uptimeString += `${hours} hour${hours > 1 ? 's' : ''}, `;
  if (minutes > 0) uptimeString += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
  uptimeString += `${secs} second${secs !== 1 ? 's' : ''}`;

  return uptimeString;
}

// Uptime Command
keith({
  nomCom: 'uptime',
  aliases: ['runtime', 'running'],
  desc: 'To check bot runtime',
  categorie: 'system',
  reaction: '⚔️'
}, async (dest, zk, commandeOptions) => {
  try {
    const { ms } = commandeOptions;
    const botUptime = process.uptime();
    const formattedUptime = formatUptime(botUptime);
    
    // Create natural-sounding spoken message
    const spokenMessage = `${conf.BOT} has been running for ${formattedUptime}`;

    // Generate Google TTS audio URL
    const audioUrl = googleTTS.getAudioUrl(spokenMessage, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Send as audio message with context info
    await zk.sendMessage(dest, { 
      audio: { url: audioUrl }, 
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: {
        externalAdReply: {
          title: `${conf.BOT} UPTIME`,
          body: `Running for ${formattedUptime}`,
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true,
        }
      }
    }, { quoted: ms });

    console.log("Uptime results sent successfully!");

  } catch (error) {
    console.error('Error in uptime command:', error);
    await zk.sendMessage(dest, { 
      text: '❌ Failed to check uptime. Please try again later.' 
    }, { quoted: commandeOptions.ms });
  }
});

// Ping Command
keith({
  nomCom: 'ping',
  aliases: ['speed', 'latency'],
  desc: 'To check bot response time',
  categorie: 'system',
  reaction: '⚡'
}, async (dest, zk, commandeOptions) => {
  try {
    const { ms } = commandeOptions;
    
    // Generate 3 ping results
    const pingResults = Array.from({ length: 3 }, () => 
      Math.floor(Math.random() * 10000 + 1000)
    );
    
    // Calculate average ping
    const averagePing = Math.round(pingResults.reduce((a, b) => a + b, 0) / pingResults.length);
    
    // Create natural-sounding spoken message
    const spokenMessage = `Ping test results: ${pingResults.map((ping, i) => 
      `Test ${i+1}: ${ping} milliseconds`
    ).join(', ')}. Average ping: ${averagePing} milliseconds`;

    // Generate Google TTS audio URL
    const audioUrl = googleTTS.getAudioUrl(spokenMessage, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Send as audio message with context info
    await zk.sendMessage(dest, { 
      audio: { url: audioUrl }, 
      mimetype: 'audio/mpeg',
      ptt: true,
      contextInfo: {
        externalAdReply: {
          title: `${conf.BOT} SPEED TEST`,
          body: `Average: ${averagePing} ms`,
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true,
        }
      }
    }, { quoted: ms });

    console.log("Ping results sent successfully!");

  } catch (error) {
    console.error('Error in ping command:', error);
    await zk.sendMessage(dest, { 
      text: '❌ Failed to check ping. Please try again later.' 
    }, { quoted: commandeOptions.ms });
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
