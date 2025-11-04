const { keith } = require('../commandHandler');
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//const { keith } = require('../commandHandler');

const formatUptime = (seconds) => {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const dDisplay = d > 0 ? `${d} ${d === 1 ? "day" : "days"}, ` : "";
    const hDisplay = h > 0 ? `${h} ${h === 1 ? "hour" : "hours"}, ` : "";
    const mDisplay = m > 0 ? `${m} ${m === 1 ? "minute" : "minutes"}, ` : "";
    const sDisplay = s > 0 ? `${s} ${s === 1 ? "second" : "seconds"}` : "";

    return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`.trim().replace(/,\s*$/, "");
};

keith(
  {
    pattern: "uptime",
    aliases: ["up", "runtime"],
    category: "System",
    description: "Show bot runtime",
  },
  async (from, client, conText) => {
    const { reply, botname, pushName, author } = conText;

    try {
      const contactMessage = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
        },
        message: {
          contactMessage: {
            displayName: author,
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${author};;;;\nFN:${author}\nitem1.TEL;waid=${pushName}:${pushName}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          },
        },
      };

      const uptimeText = `${botname} uptime is: *${formatUptime(process.uptime())}*`;

      await client.sendMessage(from, { text: uptimeText }, { quoted: contactMessage });
    } catch (error) {
      console.error("Error sending uptime message:", error);
    }
  }
);
//========================================================================================================================

//const { keith } = require('../commandHandler');

keith(
  {
    pattern: "ping",
    aliases: ["speed", "latency"],
    category: "System",
    description: "Show bot speed",
  },
  async (from, client, conText) => {
    const { botname, author } = conText;

    try {
      const start = performance.now();

      const contactMessage = {
        key: {
          fromMe: false,
          participant: "0@s.whatsapp.net",
          remoteJid: "status@broadcast",
        },
        message: {
          contactMessage: {
            displayName: author,
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;${author};;;;\nFN:${author}\nitem1.TEL;waid=1234567890:1234567890\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          },
        },
      };

      const latencyText = `${botname} speed: *${Math.round(performance.now() - start)}ms*`;

      await client.sendMessage(from, { text: latencyText }, { quoted: contactMessage });
    } catch (error) {
      console.error("Error sending ping message:", error);
    }
  }
);
