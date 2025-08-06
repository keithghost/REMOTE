const axios = require('axios');

module.exports = {

    config: {

        name: "eplscorers",

        author: "keithkeizzah",

        description: "Get Premier League top scorers with golden boot race analysis",

        category: "sports",

        usage: "eplscorers",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId }) {

        try {

            // Fetch top scorers data

            const { data } = await axios.get('https://apis-keith.vercel.app/epl/scorers');

            const { competition, topScorers } = data.result;

            if (!topScorers || topScorers.length === 0) {

                return bot.sendMessage(chatId, "⚽ No scorer data available for the Premier League.");

            }

            // Create message header

            let message = `🏆 *${competition} Top Scorers* 🥇\n\n`;

            message += "📊 *Golden Boot Race*\n\n";

            // Add golden boot contenders analysis

            const goldenBootContenders = topScorers.slice(0, 3);

            message += "🔥 *Top Contenders*:\n";

            goldenBootContenders.forEach(player => {

                message += `\n${this.getMedal(player.rank)} ${player.player} (${player.team}) - ${player.goals} goals`;

                if (player.rank === 1) {

                    message += ` 🥇 *Current Leader*`;

                }

            });

            // Add full top 10 table

            message += "\n\n📋 *Top 10 Scorers*:\n";

            message += "┌─────────┬──────────────────────┬──────────────────┬───────┐\n";

            message += "│ Rank    │ Player               │ Team             │ Goals │\n";

            message += "├─────────┼──────────────────────┼──────────────────┼───────┤\n";

            topScorers.forEach(player => {

                message += `│ ${player.rank.toString().padEnd(7)} │ ${player.player.padEnd(20)} │ ${player.team.padEnd(16)} │ ${player.goals.toString().padEnd(5)} │\n`;

            });

            message += "└─────────┴──────────────────────┴──────────────────┴───────┘\n\n";

            // Add interesting stats

            const topAssist = topScorers.reduce((prev, current) => 

                (prev.assists > current.assists) ? prev : current

            );

            message += `🎯 *Top Playmaker*: ${topAssist.player} (${topAssist.assists} assists)\n`;

            message += `📌 Most penalties: ${topScorers[0].player} (${topScorers[0].penalties})\n`;

            // Send the formatted message

            await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

        } catch (error) {

            console.error('[EPL Scorers Error]:', error);

            await bot.sendMessage(chatId, "⚠️ Failed to fetch scorer data. Please try again later.");

        }

    },

    getMedal: (rank) => {

        const medals = ["🥇", "🥈", "🥉"];

        return rank <= 3 ? medals[rank - 1] : `#${rank}`;

    }

};