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

