const { keith } = require('../commandHandler');
const speed = require("performance-now");
const util = require('util');
const execAsync = util.promisify(require('child_process').exec);
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const os = require('os');

// Function to format bytes into human-readable form
const formatSize = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};


keith({
    pattern: "deljunk",
    alias: ["deletejunk", "clearjunk", "cleanjunk"],
    desc: "Clear junk files from multiple directories",
    category: "System",
    react: "🗑️",
    filename: __filename
}, async (context) => {
    const { reply, isOwner } = context;

    if (!isOwner) {
        return reply("✖ You need owner privileges to execute this command!");
    }

    await reply("🔍 Scanning for junk files...");

    // File extensions to consider as junk
    const JUNK_FILE_TYPES = [
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg',
        // Videos
        '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv',
        // Audio
        '.mp3', '.wav', '.ogg', '.opus', '.m4a', '.flac',
        // Documents
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
        // Archives
        '.zip', '.rar', '.7z', '.tar', '.gz',
        // Other
        '.log', '.tmp', '.temp', '.cache'
    ];

    // Directories to clean with their specific filters
    const DIRECTORIES_TO_CLEAN = [
        {
            path: "./session",
            filters: ["pre-key", "sender-key", "session-", "app-state"],
            name: "session"
        },
        {
            path: "./tmp",
            filters: JUNK_FILE_TYPES.map(ext => ext.slice(1)), // remove dot
            name: "temporary"
        },
        {
            path: "./logs",
            filters: ['.log', '.txt'],
            name: "logs"
        },
        {
            path: "./message_data",
            filters: JUNK_FILE_TYPES.map(ext => ext.slice(1)),
            name: "message data"
        }
    ];

    // Additional directories that might exist
    const POTENTIAL_DIRS = ['temp', 'cache', 'downloads', 'upload'];

    // Function to clean junk files from a directory
    const cleanJunkFiles = async (dirPath, filters, folderName) => {
        try {
            const dirExists = await fsp.access(dirPath).then(() => true).catch(() => false);
            if (!dirExists) {
                console.log(`Directory ${dirPath} doesn't exist, skipping...`);
                return { count: 0, folder: folderName };
            }

            const files = await fsp.readdir(dirPath);
            const junkFiles = files.filter(item => {
                const lowerItem = item.toLowerCase();
                return filters.some(filter => 
                    lowerItem.includes(filter.toLowerCase()) || 
                    JUNK_FILE_TYPES.some(ext => lowerItem.endsWith(ext))
                );
            });

            if (junkFiles.length === 0) {
                console.log(`No junk files found in ${folderName}`);
                return { count: 0, folder: folderName };
            }

            console.log(`Found ${junkFiles.length} junk files in ${folderName}`);
            await reply(`🗑️ Clearing ${junkFiles.length} junk files from ${folderName}...`);

            let deletedCount = 0;
            for (const file of junkFiles) {
                try {
                    const filePath = path.join(dirPath, file);
                    const stat = await fsp.stat(filePath);
                    
                    if (stat.isDirectory()) {
                        // Recursively delete directory contents
                        await cleanDirectory(filePath);
                    } else {
                        await fsp.unlink(filePath);
                    }
                    deletedCount++;
                } catch (err) {
                    console.error(`Error deleting ${file}:`, err);
                }
            }

            return { count: deletedCount, folder: folderName };
        } catch (err) {
            console.error(`Error scanning ${folderName}:`, err);
            await reply(`⚠ Error cleaning ${folderName}: ${err.message}`);
            return { count: 0, folder: folderName, error: true };
        }
    };

    // Recursively clean a directory
    const cleanDirectory = async (dirPath) => {
        const files = await fsp.readdir(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = await fsp.stat(filePath);
            
            if (stat.isDirectory()) {
                await cleanDirectory(filePath);
                await fsp.rmdir(filePath);
            } else {
                await fsp.unlink(filePath);
            }
        }
    };

    // Check for additional potential directories
    for (const dir of POTENTIAL_DIRS) {
        const dirPath = path.resolve(`./${dir}`);
        try {
            await fsp.access(dirPath);
            DIRECTORIES_TO_CLEAN.push({
                path: dirPath,
                filters: JUNK_FILE_TYPES.map(ext => ext.slice(1)),
                name: dir
            });
        } catch (err) {
            // Directory doesn't exist, skip
        }
    }

    // Process all directories
    let totalDeleted = 0;
    const results = [];
    
    for (const dir of DIRECTORIES_TO_CLEAN) {
        const result = await cleanJunkFiles(dir.path, dir.filters, dir.name);
        results.push(result);
        totalDeleted += result.count;
    }

    // Summary
    if (totalDeleted === 0) {
        await reply("✅ No junk files found to delete!");
    } else {
        let summary = "🗑️ *Junk Cleanup Summary:*\n";
        results.forEach(res => {
            summary += `• ${res.folder}: ${res.count} files${res.error ? ' (with errors)' : ''}\n`;
        });
        summary += `\n✅ *Total deleted:* ${totalDeleted} junk files`;
        await reply(summary);
    }

    // Clear system temp if possible
    if (os.platform() === 'win32') {
        try {
            await execAsync('del /q /f /s %temp%\\*.*');
            await reply("♻ Also cleared system temporary files!");
        } catch (err) {
            console.error('Error clearing system temp:', err);
        }
    }
});
keith({
    pattern: "botstatus",
    alias: ["status", "sysinfo"],
    desc: "Display bot system information",
    category: "System",
    react: "📊",
    filename: __filename
}, async (context) => {
    const { reply, isOwner } = context;

    if (!isOwner) {
        return reply("You need owner privileges to execute this command!");
    }

    const startTime = speed();

    // Get system uptime in hours, minutes, seconds
    const uptime = os.uptime();
    const formattedUptime = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

    // Get RAM usage
    const totalRam = os.totalmem();
    const freeRam = os.freemem();
    const usedRam = totalRam - freeRam;

    // Get disk usage
    let disk = { size: "N/A", free: "N/A" };
    try {
        const { stdout } = await execAsync('df -h --total | grep total');
        const diskValues = stdout.trim().split(/\s+/);
        disk.size = diskValues[1];
        disk.free = diskValues[3];
    } catch (error) {
        console.error("Error fetching disk usage:", error);
    }

    // Network Usage (Downloaded/Uploaded)
    let download = "N/A", upload = "N/A";
    try {
        const { stdout } = await execAsync("vnstat --oneline | awk -F';' '{print $4, $6}'");
        const netValues = stdout.trim().split(" ");
        download = netValues[0] || "N/A";
        upload = netValues[1] || "N/A";
    } catch (error) {
        console.error("Error fetching network stats:", error);
    }

    // Calculate ping using performance-now
    const endTime = speed();
    const ping = `${(endTime - startTime).toFixed(2)} ms`;

    // Bot system status message
    const botStatus = `📊 *Bot Status* 📊
🔸 *Ping:* ${ping}
🔸 *Uptime:* ${formattedUptime}
🔸 *RAM Usage:* ${formatSize(usedRam)} / ${formatSize(totalRam)}
🔸 *Free RAM:* ${formatSize(freeRam)}
🔸 *Disk Usage:* ${disk.size} / ${disk.free}
🔸 *Free Disk:* ${disk.free}
🔸 *Platform:* ${os.platform()}
🔸 *NodeJS Version:* ${process.version}
🔸 *CPU Model:* ${os.cpus()[0].model}
🔸 *Downloaded:* ${download}
🔸 *Uploaded:* ${upload}`;

    await reply(botStatus);
});

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
    desc: "List junk files in all directories before deletion",
    category: "System",
    react: "📂",
    filename: __filename
}, async (context) => {
    const { reply, isOwner } = context;

    if (!isOwner) {
        return reply("✖ You need owner privileges to execute this command!");
    }

    await reply("🔍 Scanning for junk files in all directories...");

    // File extensions to consider as junk
    const JUNK_FILE_TYPES = [
        // Images
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg',
        // Videos
        '.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv',
        // Audio
        '.mp3', '.wav', '.ogg', '.opus', '.m4a', '.flac',
        // Documents
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
        // Archives
        '.zip', '.rar', '.7z', '.tar', '.gz',
        // Other
        '.log', '.tmp', '.temp', '.cache'
    ];

    // Directories to scan with their specific filters
    const DIRECTORIES_TO_SCAN = [
        {
            path: "./session",
            filters: ["pre-key", "sender-key", "session-", "app-state"],
            name: "session"
        },
        {
            path: "./tmp",
            filters: JUNK_FILE_TYPES.map(ext => ext.slice(1)), // remove dot
            name: "temporary files"
        },
        {
            path: "./logs",
            filters: ['.log', '.txt'],
            name: "logs"
        },
        {
            path: "./message_data",
            filters: JUNK_FILE_TYPES.map(ext => ext.slice(1)),
            name: "message data"
        }
    ];

    // Additional directories that might exist
    const POTENTIAL_DIRS = ['temp', 'cache', 'downloads', 'upload'];

    // Function to list junk files from a directory
    const listJunkFiles = async (dirPath, filters, folderName) => {
        try {
            const dirExists = await fsp.access(dirPath).then(() => true).catch(() => false);
            if (!dirExists) {
                return { 
                    folder: folderName, 
                    files: [], 
                    message: `📌 Directory '${folderName}' doesn't exist\n` 
                };
            }

            const files = await fsp.readdir(dirPath);
            const junkFiles = files.filter(item => {
                const lowerItem = item.toLowerCase();
                return filters.some(filter => 
                    lowerItem.includes(filter.toLowerCase()) || 
                    JUNK_FILE_TYPES.some(ext => lowerItem.endsWith(ext))
                );
            });

            if (junkFiles.length === 0) {
                return { 
                    folder: folderName, 
                    files: [], 
                    message: `✅ No junk files found in '${folderName}'\n` 
                };
            }

            // Format file list with sizes
            const filesWithSizes = await Promise.all(
                junkFiles.map(async file => {
                    try {
                        const filePath = path.join(dirPath, file);
                        const stats = await fsp.stat(filePath);
                        const size = (stats.size / 1024).toFixed(2); // KB
                        return `${file} (${size} KB)`;
                    } catch {
                        return file;
                    }
                })
            );

            return {
                folder: folderName,
                files: filesWithSizes,
                message: `📂 *${folderName}* (${junkFiles.length} files):\n` +
                        `${filesWithSizes.slice(0, 20).join("\n")}` +
                        (filesWithSizes.length > 20 ? `\n...and ${filesWithSizes.length - 20} more files` : "") +
                        `\n\n`
            };
        } catch (err) {
            console.error(`Error scanning ${folderName}:`, err);
            return {
                folder: folderName,
                files: [],
                message: `⚠ Error scanning '${folderName}': ${err.message}\n`
            };
        }
    };

    // Check for additional potential directories
    for (const dir of POTENTIAL_DIRS) {
        const dirPath = path.resolve(`./${dir}`);
        try {
            await fsp.access(dirPath);
            DIRECTORIES_TO_SCAN.push({
                path: dirPath,
                filters: JUNK_FILE_TYPES.map(ext => ext.slice(1)),
                name: dir
            });
        } catch (err) {
            // Directory doesn't exist, skip
        }
    }

    // Process all directories
    let totalJunkFiles = 0;
    let report = "🗑️ *Junk Files Report:*\n\n";
    
    for (const dir of DIRECTORIES_TO_SCAN) {
        const result = await listJunkFiles(dir.path, dir.filters, dir.name);
        report += result.message;
        totalJunkFiles += result.files.length;
    }

    // Final summary
    report += `📊 *Total junk files found:* ${totalJunkFiles}\n`;
    report += `\nUse *${context.prefix}deljunk* to remove these files`;

    // Split long messages to avoid getting blocked
    const MAX_MESSAGE_LENGTH = 1500;
    if (report.length > MAX_MESSAGE_LENGTH) {
        const parts = [];
        while (report.length > 0) {
            parts.push(report.substring(0, MAX_MESSAGE_LENGTH));
            report = report.substring(MAX_MESSAGE_LENGTH);
        }
        for (const part of parts) {
            await reply(part);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } else {
        await reply(report);
    }
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
