const axios = require('axios');

module.exports = {

    config: {

        name: "eplupcoming",

        author: "keithkeizzah",

        description: "Get upcoming Premier League matches",

        category: "sports",

        usage: "epl",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId }) {

        try {

            // Fetch upcoming matches

            const response = await axios.get('https://apis-keith.vercel.app/epl/upcomingmatches');

            const { competition, upcomingMatches } = response.data.result;

            if (!upcomingMatches || upcomingMatches.length === 0) {

                return bot.sendMessage(chatId, "⚽ No upcoming matches found in the Premier League.");

            }

            // Format matches into groups by matchday

            const matchesByMatchday = upcomingMatches.reduce((acc, match) => {

                const matchday = `Matchday ${match.matchday}`;

                if (!acc[matchday]) acc[matchday] = [];

                acc[matchday].push(match);

                return acc;

            }, {});

            // Create message header

            let message = `🏴󠁧󠁢󠁥󠁮󠁧󠁿 *${competition} Fixtures*\n\n`;

            // Add matches to message

            for (const [matchday, matches] of Object.entries(matchesByMatchday)) {

                message += `📅 *${matchday}*\n`;

                

                matches.forEach(match => {

                    const formattedDate = new Date(match.date).toLocaleString('en-US', {

                        weekday: 'short',

                        month: 'short',

                        day: 'numeric',

                        hour: '2-digit',

                        minute: '2-digit',

                        hour12: true

                    });

                    

                    message += `\n⚔️ ${match.homeTeam} vs ${match.awayTeam}\n`;

                    message += `⏰ ${formattedDate}\n`;

                });

                message += "\n────────────────\n";

            }

            // Send the formatted message

            await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

        } catch (error) {

            console.error('[EPL Command Error]:', error);

            await bot.sendMessage(chatId, "⚠️ Failed to fetch upcoming matches. Please try again later.");

        }

    }

};