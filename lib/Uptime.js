const os = require('os');
const process = require('process');
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
            const memoryUsage = (process.memoryUsage().rss / (1024 * 1024)).toFixed(2);
            const cpuLoad = os.loadavg()[0].toFixed(2);

            const statsMessage = `
📊 ${config.botname} Statistics 📊

🕒 Uptime: ${formatUptime(uptime)}
💾 Memory Usage: ${memoryUsage} MB
⚡ CPU Load: ${cpuLoad}
            `.trim();

            await bot.sendMessage(chatId, statsMessage);
        } catch (error) {
            console.error('[ERROR]', error);
            await bot.sendMessage(chatId, 'An error occurred while fetching the stats.' + error );
        }
    }
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemaining = Math.floor(seconds % 60);

    return `${days}d ${hours}h ${minutes}m ${secondsRemaining}s`;
}
