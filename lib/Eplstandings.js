const axios = require('axios');

module.exports = {

    config: {

        name: "eplstandings",

        author: "keithkeizzah",

        description: "Get current Premier League standings with qualification indicators",

        category: "sports",

        usage: "eplstandings",

        usePrefix: true,

        role: 0

    },

    onStart: async function ({ bot, chatId }) {

        try {

            // Fetch standings data

            const response = await axios.get('https://apis-keith.vercel.app/epl/standings');

            const { competition, standings } = response.data.result;

            if (!standings || standings.length === 0) {

                return bot.sendMessage(chatId, "⚽ No standings data available for the Premier League.");

            }

            // Create message header

            let message = `🏴󠁧󠁢󠁥󠁮󠁧󠁿 *${competition} Standings*\n\n`;

            message += "📊 *Key:*\n";

            message += "🏆 Champions League\n";

            message += "🎯 Europa League\n";

            message += "⚽ Conference League\n";

            message += "⚠️ Relegation Zone\n\n";

            // Add standings to message

            standings.forEach(team => {

                let positionIndicator = "";

                

                // Add indicators based on position

                if (team.position <= 4) {

                    positionIndicator = " 🏆"; // Champions League

                } else if (team.position === 5) {

                    positionIndicator = " 🎯"; // Europa League

                } else if (team.position === 6) {

                    positionIndicator = " ⚽"; // Conference League

                } else if (team.position >= 18) {

                    positionIndicator = " ⚠️"; // Relegation

                }

                message += `${team.position}. ${team.team}${positionIndicator}\n`;

                message += `   📈 Pld: ${team.played} | W: ${team.won} | D: ${team.draw} | L: ${team.lost}\n`;

                message += `   ⚽ GF: ${team.goalsFor} | GA: ${team.goalsAgainst} | GD: ${team.goalDifference}\n`;

                message += `   🏅 Pts: ${team.points}\n\n`;

            });

            // Add explanation at the bottom

            message += "\n*Qualification Rules:*\n";

            message += "Top 4: Champions League\n";

            message += "5th: Europa League\n";

            message += "6th: Conference League\n";

            message += "Bottom 3: Relegation\n";

            // Send the formatted message

            await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });

        } catch (error) {

            console.error('[EPLSTANDINGS Command Error]:', error);

            await bot.sendMessage(chatId, "⚠️ Failed to fetch standings. Please try again later.");

        }

    }

};