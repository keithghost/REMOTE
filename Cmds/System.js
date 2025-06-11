const { keith } = require('../commandHandler');
const speed = require("performance-now");
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

keith({
    pattern: "disk",
    alias: ["storage", "space"],
    desc: "Check disk usage",
    category: "System",
    react: "💾",
    filename: __filename
}, async (context) => {
    const { reply, isOwner } = context;

    if (!isOwner) {
        return reply("You need owner privileges to execute this command!");
    }

    await reply("Checking disk usage, please wait...");

    try {
        const { stdout, stderr } = await execAsync('du -h --max-depth=1');

        if (stdout.trim()) {
            const lines = stdout.trim().split("\n");
            const totalUsage = lines.pop(); // Last line contains total disk usage

            await reply(`${lines.join("\n")}\n\n*Total Disk Usage:* ${totalUsage}`);
        }

        if (stderr.trim()) {
            await reply(stderr);
        }
    } catch (error) {
        console.error("Error executing disk command:", error);
        await reply("An error occurred while checking disk usage.");
    }
});

keith({
    pattern: "listjunk",
    alias: ["junklist", "showjunk"],
    desc: "List junk files before deletion",
    category: "System",
    react: "📂",
    filename: __filename
}, async (context) => {
    const { reply, isOwner } = context;

    if (!isOwner) {
        return reply("You need owner privileges to execute this command!");
    }

    await reply("Scanning for junk files...");

    // Function to list junk files
    const listJunkFiles = async (dir, filters, folderName) => {
        try {
            const files = await fsp.readdir(dir);
            const junkFiles = files.filter(item => filters.some(filter => item.startsWith(filter) || item.endsWith(filter)));

            if (junkFiles.length === 0) {
                return reply(`*No junk files found in the ${folderName} folder!*`);
            }

            console.log(`Junk files in ${folderName}:`, junkFiles);
            await reply(`*Junk files in the ${folderName} folder:*\n${junkFiles.join("\n")}`);

        } catch (err) {
            console.error(`Error scanning ${folderName} folder:`, err);
            reply(`Unable to scan ${folderName} folder: ${err.message}`);
        }
    };

    // Listing session junk files
    await listJunkFiles("./session", ["pre-key", "sender-key", "session-", "app-state"], "session");

    // Listing tmp junk files
    const tmpDir = path.resolve("./tmp");
    await listJunkFiles(tmpDir, ["gif", "png", "mp3", "mp4", "opus", "jpg", "webp", "webm", "zip"], "tmp");
});

keith({
    pattern: "deljunk",
    alias: ["deletejunk", "clearjunk"],
    desc: "Clear junk files",
    category: "System",
    react: "🗑️",
    filename: __filename
}, async (context) => {
    const { reply, isOwner } = context;

    if (!isOwner) {
        return reply("You need owner privileges to execute this command!");
    }

    await reply("Scanning for junk files...");

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Function to clean junk files from a directory
    const cleanJunkFiles = async (dir, filters, folderName) => {
        try {
            const files = await fsp.readdir(dir);
            const junkFiles = files.filter(item => filters.some(filter => item.startsWith(filter) || item.endsWith(filter)));

            console.log(`${junkFiles.length} junk files found in ${folderName}`);
            await sleep(2000);
            reply(`*Clearing ${junkFiles.length} junk files in the ${folderName} folder...*`);

            for (const file of junkFiles) {
                await fsp.unlink(`${dir}/${file}`);
            }

            await sleep(2000);
            reply(`*Successfully cleared all junk files in the ${folderName} folder!*`);
        } catch (err) {
            console.error(`Error scanning ${folderName} folder:`, err);
            reply(`Unable to scan ${folderName} folder: ${err.message}`);
        }
    };

    // Cleaning session junk
    await cleanJunkFiles("./session", ["pre-key", "sender-key", "session-", "app-state"], "session");

    // Cleaning tmp junk
    const tmpDir = path.resolve("./tmp");
    await cleanJunkFiles(tmpDir, ["gif", "png", "mp3", "mp4", "opus", "jpg", "webp", "webm", "zip"], "tmp");
});



keith({
    pattern: "restart",
    alias: ["reboot", "startbot"],
    desc: "bot restart",
    category: "System",
    react: "🗿",
    filename: __filename
}, async (context) => {
    const { reply, isOwner } = context;

    if (!isOwner) {
        return reply("You need owner privileges to execute this command!");
    }

    try {
        await reply("*Restarting...*");

        // Sleep function for delay
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await sleep(3000); // Wait for 3 seconds before restarting

        process.exit(0); // Exit gracefully
    } catch (error) {
        console.error("Error during restart:", error);
    }
});

keith({
    pattern: "alive",
    alias: ["test", "testing"],
    desc: "bot test",
    category: "System",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { client, m } = context;

        // Sound file URLs
        const audioFiles = [
            'https://files.catbox.moe/hpwsi2.mp3',
            'https://files.catbox.moe/xci982.mp3',
            'https://files.catbox.moe/utbujd.mp3',
            'https://files.catbox.moe/w2j17k.m4a',
            'https://files.catbox.moe/851skv.m4a',
            'https://files.catbox.moe/qnhtbu.m4a',
            'https://files.catbox.moe/lb0x7w.mp3',
            'https://files.catbox.moe/efmcxm.mp3',
            'https://files.catbox.moe/gco5bq.mp3',
            'https://files.catbox.moe/26oeeh.mp3',
            'https://files.catbox.moe/a1sh4u.mp3',
            'https://files.catbox.moe/vuuvwn.m4a',
            'https://files.catbox.moe/wx8q6h.mp3',
            'https://files.catbox.moe/uj8fps.m4a',
            'https://files.catbox.moe/dc88bx.m4a',
            'https://files.catbox.moe/tn32z0.m4a'
        ];

        // Randomly pick an audio file
        const vn = audioFiles[Math.floor(Math.random() * audioFiles.length)];

        // Other variables
        const name = m.pushName || client.getName(m.sender);
        const url = 'https://github.com/Keithkeizzah/KEITH-MD2';
        const murl = 'https://whatsapp.com/channel/0029Vaan9TF9Bb62l8wpoD47';
        const img = 'https://i.imgur.com/vTs9acV.jpeg';

        // Constructing the contact message
        const con = {
            key: {
                fromMe: false,
                participant: `${m.sender.split('@')[0]}@s.whatsapp.net`,
                ...(m.chat ? { remoteJid: '254748387615@s.whatsapp.net' } : {}),
            },
            message: {
                contactMessage: {
                    displayName: name,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${name}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                },
            },
        };

        // Audio file message with external ad reply info
        const doc = {
            audio: {
                url: vn,
            },
            mimetype: 'audio/mpeg',
            ptt: true,
            waveform: [100, 0, 100, 0, 100, 0, 100],
            fileName: 'shizo',
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: '𝗜 𝗔𝗠 𝗔𝗟𝗜𝗩𝗘',
                    body: 'Regards Keithkeizzah',
                    thumbnailUrl: img,
                    sourceUrl: murl,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                },
            },
        };

        // Send the message
        await client.sendMessage(m.chat, doc, { quoted: con });

    } catch (error) {
        console.error('Error in alive command:', error);
    }
});

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

        let uptimeText = `${botname} uptime is: *${uptimes(process.uptime())}*`;
        
        await client.sendMessage(
            m.chat, 
            { text: uptimeText }, 
            { quoted: customContactMessage }
        );

        //await reply(uptimeText);

    } catch (error) {
        console.error("Error sending uptime message:", error);
    }
});
