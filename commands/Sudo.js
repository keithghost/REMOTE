const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");



// EPL Top Scorers Command
keith({
  nomCom: "eplscorers",
  aliases: ["epltopscorers", "topscorers", "goldenboot"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Premier League top scorers...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "EPL Top Scorers",
          body: "Loading current golden boot race...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/epl/scorers');
    const data = response.data;

    if (!data.status || !data.result?.topScorers?.length) {
      return repondre(zk, dest, ms, "No top scorers data available at the moment.");
    }

    const { competition, topScorers } = data.result;

    // Format the top scorers data
    let message = `*⚽ ${competition} Top Scorers* 🥇\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Rank Player                 Team                     Goals Assists Pens\n";
    message += "------------------------------------------------------------\n";

    // Add each player's stats
    topScorers.forEach(player => {
      message += `${player.rank.toString().padEnd(4)} `;
      message += `${player.player.substring(0, 20).padEnd(20)} `;
      message += `${player.team.substring(0, 20).padEnd(20)} `;
      message += `${player.goals.toString().padEnd(5)} `;
      message += `${player.assists.toString().padEnd(7)} `;
      message += `${player.penalties}\n`;
    });

    message += "```\n";  // End monospace block
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Premier League Top Scorers",
          body: `Current ${competition} golden boot race`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('EPL Top Scorers command error:', error);
    repondre(zk, dest, ms, `Failed to fetch top scorers: ${error.message}`);
  }
});

// EPL Standings Command
keith({
  nomCom: "eplstandings",
  aliases: ["epltable", "standings", "leaguetable"],
  categorie: "sports",
  reaction: "🏆"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Premier League standings...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "EPL Standings",
          body: "Loading current league table...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/epl/standings');
    const data = response.data;

    if (!data.status || !data.result?.standings?.length) {
      return repondre(zk, dest, ms, "No standings data available at the moment.");
    }

    const { competition, standings } = data.result;

    // Format the standings data
    let message = `*🏆 ${competition} Standings* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Pos  Team                  P   W   D   L   GF  GA  GD  Pts\n";
    message += "---------------------------------------------------------\n";

    // Add each team's standings
    standings.forEach(team => {
      message += `${team.position.toString().padEnd(4)} `;
      message += `${team.team.substring(0, 20).padEnd(20)} `;
      message += `${team.played.toString().padEnd(3)} `;
      message += `${team.won.toString().padEnd(3)} `;
      message += `${team.draw.toString().padEnd(3)} `;
      message += `${team.lost.toString().padEnd(3)} `;
      message += `${team.goalsFor.toString().padEnd(3)} `;
      message += `${team.goalsAgainst.toString().padEnd(3)} `;
      message += `${team.goalDifference.toString().padStart(3)} `;
      message += `${team.points.toString().padStart(3)}\n`;
    });

    message += "```\n";  // End monospace block
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Premier League Standings",
          body: `Current ${competition} league table`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('EPL Standings command error:', error);
    repondre(zk, dest, ms, `Failed to fetch standings: ${error.message}`);
  }
});
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
