const { keith } = require('../commandHandler');
const speed = require("performance-now");

keith({
    pattern: "ping",
    alias: ["speed", "latency"],
    desc: "To check bot speed",
    category: "System",
    react: "🖌️",
    filename: __filename
}, async (context) => {
  const { client, m, botname, author } = context;

  try {
    // Correcting the timestamp calculation
    const startTime = speed();
    
    let customContactMessage = {
      key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
      message: {
        contactMessage: {
          displayName: author,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${author};;;;\nFN:${author}\nitem1.TEL;waid=${m?.sender?.split('@')[0] ?? 'unknown'}:${m?.sender?.split('@')[0] ?? 'unknown'}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        },
      },
    };

    // Measure execution speed after creating the message object
    const pingSpeed = speed() - startTime;

    await client.sendMessage(
      m.chat, 
      { text: `${botname} speed\n\n *${pingSpeed.toFixed(4)} ms*` }, 
      { quoted: customContactMessage }
    );

  } catch (error) {
    console.error("Error sending message:", error);
  }
});


const uptimes = function (seconds) { 
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24)); 
    var h = Math.floor((seconds % (3600 * 24)) / 3600); 
    var m = Math.floor((seconds % 3600) / 60); 
    var s = Math.floor(seconds % 60); 

    var dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : ""; 
    var hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : ""; 
    var mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : ""; 
    var sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : ""; 

    return dDisplay + hDisplay + mDisplay + sDisplay; 
};

keith({
    pattern: "uptime",
    alias: ["up"],
    desc: "Check bot uptime",
    category: "System",
    react: "⏳",
    filename: __filename
}, async (context) => {
    const { client, m, botname, author, reply } = context;

    try {
        let customContactMessage = {
            key: { fromMe: false, participant: `0@s.whatsapp.net`, remoteJid: 'status@broadcast' },
            message: {
                contactMessage: {
                    displayName: author,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${author};;;;\nFN:${author}\nitem1.TEL;waid=${m?.sender?.split('@')[0] ?? 'unknown'}:${m?.sender?.split('@')[0] ?? 'unknown'}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                },
            },
        };

        let uptimeText = `Bot Uptime: *${uptimes(process.uptime())}*`;
        
        await client.sendMessage(
            m.chat, 
            { text: uptimeText }, 
            { quoted: customContactMessage }
        );

        await reply(uptimeText);

    } catch (error) {
        console.error("Error sending uptime message:", error);
    }
});
