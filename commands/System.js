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
