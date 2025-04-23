const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");

// EPL Matches Command
keith({
  nomCom: "eplmatches",
  aliases: ["premierleague", "football"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⚽ Fetching Premier League matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "EPL Matches",
          body: "Loading latest match results...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/epl/matches');
    const data = response.data;

    if (!data.status || !data.result?.matches?.length) {
      return repondre(zk, dest, ms, "No match data available at the moment.");
    }

    const { competition, matches } = data.result;

    // Format the matches data
    let message = `*📊 ${competition} Results* ⚽\n\n`;
    
    // Group matches by matchday
    const matchesByMatchday = {};
    matches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    // Add matches to message grouped by matchday
    Object.keys(matchesByMatchday).sort().forEach(matchday => {
      message += `*📅 Matchday ${matchday}*\n`;
      
      matchesByMatchday[matchday].forEach(match => {
        const resultEmoji = match.winner === "Draw" ? "🤝" : "🏆";
        message += `\n${match.homeTeam} 🆚 ${match.awayTeam}\n`;
        message += `🔹 Score: ${match.score}\n`;
        message += `🔹 Result: ${resultEmoji} ${match.winner}\n`;
        message += `🔹 Status: ${match.status}\n`;
      });
      
      message += "\n────────────────\n";
    });

    // Add footer with update time
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Premier League Results",
          body: `Latest ${competition} match results`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('EPL command error:', error);
    repondre(zk, dest, ms, `Failed to fetch match data: ${error.message}`);
  }
});



// Upcoming EPL Matches Command
keith({
  nomCom: "eplupcoming",
  aliases: ["eplnext", "upcomingepl", "nextepl"],
  categorie: "sports",
  reaction: "📅"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching upcoming Premier League matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "EPL Fixtures",
          body: "Loading upcoming match schedule...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/epl/upcomingmatches');
    const data = response.data;

    if (!data.status || !data.result?.upcomingMatches?.length) {
      return repondre(zk, dest, ms, "No upcoming matches found.");
    }

    const { competition, upcomingMatches } = data.result;

    // Format the matches data
    let message = `*📅 Upcoming ${competition} Fixtures* ⚽\n\n`;
    
    // Group matches by matchday
    const matchesByMatchday = {};
    upcomingMatches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    // Add matches to message grouped by matchday
    Object.keys(matchesByMatchday).sort().forEach(matchday => {
      message += `*🗓️ Matchday ${matchday}*\n`;
      
      matchesByMatchday[matchday].forEach(match => {
        const matchDate = new Date(match.date).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        message += `\n⚽ ${match.homeTeam} vs ${match.awayTeam}\n`;
        message += `⏰ ${matchDate}\n`;
      });
      
      message += "\n────────────────\n";
    });

    // Add footer with update time
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Upcoming EPL Matches",
          body: `Next ${competition} fixtures`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('EPL Upcoming command error:', error);
    repondre(zk, dest, ms, `Failed to fetch upcoming matches: ${error.message}`);
  }
});
