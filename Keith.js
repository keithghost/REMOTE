const fs = require('fs');
const path = require('path');
const { session } = require("./settings");
const chalk = require('chalk');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const express = require('express');
const { useMultiFileAuthState, DisconnectReason, makeInMemoryStore } = require("@whiskeysockets/baileys");

// Logger setup
const logger = pino({ level: 'debug' });
const app = express();
const port = process.env.PORT || 3000;

// Create logs directory
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Authentication
async function authenticateSession() {
    try {
        const credsPath = "./session/creds.json";
        if (!fs.existsSync(credsPath)) {
            logger.info("Creating new session...");
            const [header, b64data] = session.split(';;;');
            if (header === "KEITH" && b64data) {
                const compressed = Buffer.from(b64data.replace('...', ''), 'base64');
                const decompressed = zlib.gunzipSync(compressed);
                fs.writeFileSync(credsPath, decompressed);
                logger.info("Session created successfully");
            }
        }
    } catch (error) {
        logger.error("Session auth failed: " + error.message);
        process.exit(1);
    }
}

// Command handler
const { loadCommands, commands } = require('./commandHandler');

async function startBot() {
    await authenticateSession();
    const { state, saveCreds } = await useMultiFileAuthState("session");
    
    // Create WhatsApp client
    const client = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ["KEITH-MD", "Safari", "3.0"],
        markOnlineOnConnect: true,
        getMessage: async (key) => {
            return { conversation: "Message not found" };
        }
    });

    // Load commands
    await loadCommands();
    logger.info(`Loaded ${commands.length} commands`);

    // Store setup
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent' }) });
    store.bind(client.ev);

    // Connection updates
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                logger.error("Device logged out, please rescan");
                process.exit(1);
            } else {
                logger.info("Reconnecting...");
                startBot();
            }
        } else if (connection === 'open') {
            logger.success("Connected successfully");
            client.sendMessage(client.user.id, { text: "Bot is online!" });
        }
    });

    // Message handler
    client.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;

        // Convert to better format
        const msg = {
            ...m,
            from: m.key.remoteJid,
            sender: m.key.participant || m.key.remoteJid,
            text: m.message.conversation || 
                 m.message.extendedTextMessage?.text || 
                 m.message.imageMessage?.caption || ''
        };

        logger.info(`Message from ${msg.sender}: ${msg.text}`);

        // Check if message is a command
        const { prefix } = require('./settings');
        if (msg.text.startsWith(prefix)) {
            const cmd = msg.text.slice(prefix.length).trim().split(/ +/)[0].toLowerCase();
            const args = msg.text.slice(prefix.length + cmd.length).trim().split(/ +/);

            // Find command
            const command = commands.find(
                (c) => c.pattern === cmd || (c.alias && c.alias.includes(cmd))
            );

            if (command) {
                try {
                    logger.info(`Executing command: ${command.pattern}`);
                    
                    // Send reaction if defined
                    if (command.react) {
                        await client.sendMessage(msg.from, {
                            react: {
                                text: command.react,
                                key: m.key
                            }
                        });
                    }

                    // Execute command
                    await command.function({
                        client,
                        m: msg,
                        args,
                        command: cmd,
                        text: args.join(' '),
                        from: msg.from,
                        sender: msg.sender,
                        reply: (text) => client.sendMessage(msg.from, { text }, { quoted: m })
                    });

                } catch (error) {
                    logger.error(`Command error: ${error.message}`);
                    await client.sendMessage(msg.from, { 
                        text: `❌ Error: ${error.message}` 
                    }, { quoted: m });
                }
            }
        }
    });

    // Save credentials
    client.ev.on('creds.update', saveCreds);

    // Other event handlers can be added here
    client.ev.on('group-participants.update', (data) => {
        logger.info(`Group update: ${JSON.stringify(data)}`);
    });

    // Helper methods
    client.downloadMedia = async (message) => {
        const mime = (message.msg || message).mimetype || '';
        const type = mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
    };
}

// Start web server
app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(port, () => logger.info(`Server running on http://localhost:${port}`));

// Start bot
startBot().catch(err => {
    logger.error("Failed to start bot: " + err.message);
    process.exit(1);
});

// Watch for changes
if (process.argv.includes('--dev')) {
    const watcher = require('chokidar').watch(['./commands', './index.js']);
    watcher.on('change', (path) => {
        logger.info(`Restarting due to changes in ${path}...`);
        process.exit(0);
    });
}
