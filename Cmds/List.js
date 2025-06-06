const { keith } = require('../commandHandler');
const { DateTime } = require('luxon');

keith({
    pattern: "list",
    alias: ["allcommands", "cmdlist"],
    desc: "Display all available commands in an elegant list format",
    category: "Utility",
    react: "📜",
    filename: __filename
}, async ({ client, m, prefix }) => {
    try {
        // ======================
        //  CONFIGURATION
        // ======================
        const BOT_NAME = client.user.name;
        const TIME_ZONE = 'Africa/Nairobi';
        const MAX_COMMANDS_PER_SECTION = 15;

        // ======================
        //  HELPER FUNCTIONS
        // ======================
        const getFormattedTimestamp = () => {
            const now = DateTime.now().setZone(TIME_ZONE);
            return {
                date: now.toLocaleString(DateTime.DATE_FULL),
                time: now.toLocaleString(DateTime.TIME_WITH_SECONDS),
                weekday: now.toFormat('cccc')
            };
        };

        const formatCommandEntry = (cmd, index) => {
            const aliases = cmd.alias?.length ? 
                `\n   ├ 🔄 Aliases: ${cmd.alias.map(a => `*${a}*`).join(', ')}` : 
                '';
            
            const description = cmd.desc ?
                `\n   └ 📝 ${cmd.desc}` :
                '\n   └ ℹ️ No description available';
            
            return `🔹 *${index + 1}. ${prefix}${cmd.pattern}*${aliases}${description}\n`;
        };

        // ======================
        //  COMMAND PROCESSING
        // ======================
        const { date, time, weekday } = getFormattedTimestamp();
        const allCommands = require('../commandHandler').commands
            .filter(cmd => !cmd.dontAddCommandList)
            .sort((a, b) => a.pattern.localeCompare(b.pattern));

        // ======================
        //  MESSAGE CONSTRUCTION
        // ======================
        let messageSections = [];
        let currentSection = [];
        
        // Split commands into sections
        allCommands.forEach((cmd, index) => {
            currentSection.push(formatCommandEntry(cmd, index));
            
            if ((index + 1) % MAX_COMMANDS_PER_SECTION === 0 || 
                index === allCommands.length - 1) {
                messageSections.push(currentSection.join(''));
                currentSection = [];
            }
        });

        // Create header
        const header = `╔═══════════════════════════╗\n` +
                     `  📜 *${BOT_NAME} COMMAND LIST*  \n` +
                     `╚═══════════════════════════╝\n\n` +
                     `🗓️ *Date:* ${date} (${weekday})\n` +
                     `⏱️ *Time:* ${time}\n` +
                     `🔢 *Total Commands:* ${allCommands.length}\n\n` +
                     `╔═══════════════════════════╗\n` +
                     `  🛠️ AVAILABLE COMMANDS  \n` +
                     `╚═══════════════════════════╝\n\n`;

        // Create footer
        const footer = `\n╔═══════════════════════════╗\n` +
                      `  ℹ️ TIP: Use *${prefix}help <command>*\n` +
                      `  for detailed command information\n` +
                      `╚═══════════════════════════╝`;

        // ======================
        //  MESSAGE DELIVERY
        // ======================
        // Send initial header message
        const initialMessage = await client.sendMessage(m.chat, {
            text: header,
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: `${BOT_NAME} Command List`,
                    body: `Exploring ${allCommands.length} powerful commands`,
                    mediaType: 1
                }
            }
        });

        // Send command sections with delay
        for (const [i, section] of messageSections.entries()) {
            await new Promise(resolve => setTimeout(resolve, 500));
            await client.sendMessage(m.chat, {
                text: `📦 *Section ${i + 1}/${messageSections.length}*\n\n${section}`,
                contextInfo: { forwardedNewsletterMessageInfo: { newsletterJid: 'status@broadcast' } }
            });
        }

        // Send footer
        await client.sendMessage(m.chat, { text: footer });

    } catch (error) {
        console.error("Command List Error:", error);
        await client.sendMessage(m.chat, {
            text: `❌ An error occurred while generating the command list.\n` +
                  `Error: ${error.message}`,
            contextInfo: { mentionedJid: [m.sender] }
        });
    }
});
