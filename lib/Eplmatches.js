const axios = require('axios');

module.exports = {

    config: {

        name: "eplmatches",

        author: "keithkeizzah",

        description: "Get Premier League match results",

        category: "sports",

        usage: "eplmatches",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId }) {

        try {

            // Fetch match results

            const response = await axios.get('https://apis-keith.vercel.app/epl/matches');

            const { competition, matches } = response.data.result;

            if (!matches || matches.length === 0) {

                return bot.sendMessage(chatId, "⚽ No match results found in the Premier League.");

            }

            // Format matches into groups by matchday

            const matchesByMatchday = matches.reduce((acc, match) => {

                const matchday = `Matchday ${match.matchday}`;

                if (!acc[matchday]) acc[matchday] = [];

                acc[matchday].push(match);

                return acc;

            }, {});

            // Create message header

            let message = `🏴󠁧󠁢󠁥󠁮󠁧󠁿 *${competition} Results*\n\n`;

            // Add matches to message

            for (const [matchday, matchResults] of Object.entries(matchesByMatchday)) {

                message += `📅 *${matchday}*\n`;

                

                matchResults.forEach(match => {

                    message += `\n⚔️ ${match.homeTeam} ${match.score} ${match.awayTeam}\n`;

                    message += `🏆 Winner: ${match.winner}\n`;

                    message += `📊 Status: ${match.status}\n`;

                });

                message += "\n────────────────\n";

            }

            // Send the formatted message

            await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

        } catch (error) {

            console.error('[EPLMATCHES Command Error]:', error);

            await bot.sendMessage(chatId, "⚠️ Failed to fetch match results. Please try again later.");

        }

    }

};