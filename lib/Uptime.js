const os = require('os');
const process = require('process');
const fs = require('fs');
const path = require('path');
const config = require('./set.js');

module.exports = {
    config: {
        name: "uptime",
        author: "keithkeizzah",
        description: "Display bot statistics",
        category: "System",
        usage: "stats",
        usePrefix: true
    },

    onStart: async function({ bot, chatId }) {
        try {
            const uptime = process.uptime(); 
            const uptimeString = formatUptime(uptime);

            const memoryUsage = process.memoryUsage();
            const memoryUsageMB = (memoryUsage.rss / (1024 * 1024)).toFixed(2);

            const cpuUsage = os.loadavg()[0]; // Using only the 1-minute average
            const cpuUsageString = cpuUsage.toFixed(2);

            const statsMessage = `
📊 ${config.botName} Statistics 📊

🕒 Uptime: ${uptimeString}
💾 Memory Usage: ${memoryUsageMB} MB
⚡ CPU Load: ${cpuUsageString} (1min avg)
            `.trim();

            // Create a button for the channel link
            const channelButton = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Join Our Channel",
                                url: config.sourceUrl
                            }
                        ]
                    ]
                }
            };

            await bot.sendMessage(chatId, statsMessage, channelButton);
        } catch (error) {
            console.error('[ERROR]', error);
            await bot.sendMessage(chatId, 'An error occurred while fetching the stats.');
        }
    }
};

function formatUptime(uptime) {
    const days = Math.floor(uptime / (3600 * 24));
    const hours = Math.floor((uptime % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
