const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");




// La Liga Top Scorers Command
keith({
  nomCom: "laligascorers",
  aliases: ["laligatopscorers", "laligagoals", "pichichi"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching La Liga top scorers...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "La Liga Top Scorers",
          body: "Loading Pichichi race data...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/laliga/scorers');
    const data = response.data;

    if (!data.status || !data.result?.topScorers?.length) {
      return repondre(zk, dest, ms, "No top scorers data available at the moment.");
    }

    const { competition, topScorers } = data.result;

    // Format the top scorers data
    let message = `*⚽ ${competition} Top Scorers (Pichichi Race)* 🥇\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Rank Player                  Team            Goals Assists Pens\n";
    message += "------------------------------------------------------------\n";

    // Add each scorer's data
    topScorers.forEach(scorer => {
      message += `${scorer.rank.toString().padEnd(4)} `;
      message += `${scorer.player.substring(0, 20).padEnd(20)} `;
      message += `${scorer.team.substring(0, 15).padEnd(15)} `;
      message += `${scorer.goals.toString().padEnd(5)} `;
      message += `${(scorer.assists === "N/A" ? "0" : scorer.assists).toString().padEnd(7)} `;
      message += `${(scorer.penalties === "N/A" ? "0" : scorer.penalties).toString()}\n`;
    });

    message += "```\n";  // End monospace block
    
    // Add key information
    message += "\n*Key:*\n";
    message += "🥇 Current Pichichi leader\n";
    message += "Pens: Penalty goals scored\n";
    message += "N/A values are shown as 0 in table\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "La Liga Top Scorers",
          body: `Current ${competition} Pichichi race`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('La Liga Top Scorers command error:', error);
    repondre(zk, dest, ms, `Failed to fetch top scorers: ${error.message}`);
  }
});
// La Liga Matches Command
keith({
  nomCom: "laligamatches",
  aliases: ["laligaresults", "laligafixures", "laligagames"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching La Liga matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "La Liga Matches",
          body: "Loading recent match results...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/laliga/matches');
    const data = response.data;

    if (!data.status || !data.result?.matches?.length) {
      return repondre(zk, dest, ms, "No match data available at the moment.");
    }

    const { competition, matches } = data.result;

    // Group matches by matchday
    const matchesByMatchday = {};
    matches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    // Format the matches data
    let message = `*⚽ ${competition} Match Results* 📅\n\n`;
    
    // Add matches for each matchday
    Object.keys(matchesByMatchday).sort().forEach(matchday => {
      message += `📌 *Matchday ${matchday}*\n`;
      message += "--------------------------------\n";
      
      matchesByMatchday[matchday].forEach(match => {
        // Determine result emoji
        let resultEmoji = "⚖️"; // Draw
        if (match.winner !== "Draw") {
          resultEmoji = match.winner === match.homeTeam ? "🏠" : "✈️";
        }
        
        message += `${match.homeTeam} vs ${match.awayTeam}\n`;
        message += `🔹 ${match.score} ${resultEmoji} (${match.status})\n\n`;
      });
      
      message += "\n";
    });

    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "La Liga Match Results",
          body: `Recent ${competition} matches`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('La Liga Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch matches: ${error.message}`);
  }
});

// La Liga Standings Command
keith({
  nomCom: "laligastandings",
  aliases: ["laligatable", "laliga", "laligaleaguetable"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching La Liga standings...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "La Liga Standings",
          body: "Loading complete league table...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/laliga/standings');
    const data = response.data;

    if (!data.status || !data.result?.standings?.length) {
      return repondre(zk, dest, ms, "No standings data available at the moment.");
    }

    const { competition, standings } = data.result;

    // Format the standings data
    let message = `*⚽ ${competition} Standings* 🏆\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Pos  Team                   P   W   D   L   GF  GA  GD   Pts\n";
    message += "-----------------------------------------------------------\n";

    // Add each team's standings
    standings.forEach(team => {
      // Add position indicators
      const positionPrefix = team.position === 1 ? "🥇" : 
                           (team.position <= 4 ? "🔵" :  // Champions League
                           (team.position <= 6 ? "🟢" :  // Europa/Conference
                           (team.position >= 18 ? "🔴" : "  "))); // Relegation

      message += `${team.position.toString().padEnd(3)} ${positionPrefix} `;
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
    
    // Add league position indicators
    message += "\n*Key:*\n";
    message += "🥇 League leader\n";
    message += "🔵 Champions League spots (1-4)\n";
    message += "🟢 Europa League spots (5-6)\n";
    message += "🔴 Relegation zone (18-20)\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "La Liga Standings",
          body: `Complete ${competition} league table`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('La Liga Standings command error:', error);
    repondre(zk, dest, ms, `Failed to fetch standings: ${error.message}`);
  }
});
// La Liga Upcoming Matches Command
keith({
  nomCom: "laligaupcoming",
  aliases: ["laligafixtures", "laligaupcomingmatch", "llmatches"],
  categorie: "sports",
  reaction: "🇪🇸"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching La Liga upcoming matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "La Liga Fixtures",
          body: "Loading upcoming matches...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/laliga/upcomingmatches');
    const data = response.data;

    if (!data.status || !data.result?.upcomingMatches?.length) {
      return repondre(zk, dest, ms, "No upcoming matches data available at the moment.");
    }

    const { competition, upcomingMatches } = data.result;

    // Format the matches data
    let message = `*🇪🇸 ${competition} Upcoming Matches* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Group matches by matchday
    const matchesByMatchday = {};
    upcomingMatches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    // Add matches for each matchday
    Object.keys(matchesByMatchday).sort().forEach(matchday => {
      message += `📅 Matchday ${matchday}:\n`;
      message += "--------------------------------\n";
      
      matchesByMatchday[matchday].forEach(match => {
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        });
        
        // Highlight big teams with emojis
        const homeTeam = match.homeTeam.includes('Real Madrid') ? '👑 ' + match.homeTeam :
                        match.homeTeam.includes('Barcelona') ? '🔵🔴 ' + match.homeTeam :
                        match.homeTeam.includes('Atlético') ? '🔴⚪ ' + match.homeTeam :
                        match.homeTeam;
        
        const awayTeam = match.awayTeam.includes('Real Madrid') ? '👑 ' + match.awayTeam :
                        match.awayTeam.includes('Barcelona') ? '🔵🔴 ' + match.awayTeam :
                        match.awayTeam.includes('Atlético') ? '🔴⚪ ' + match.awayTeam :
                        match.awayTeam;

        message += `⏰ ${formattedDate} UTC\n`;
        message += `🏠 ${homeTeam}\n`;
        message += `🆚 ${awayTeam}\n\n`;
      });
    });

    message += "```\n";  // End monospace block
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "La Liga Fixtures",
          body: `Upcoming ${competition} matches`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LaLiga.svg/1200px-LaLiga.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('La Liga Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch upcoming matches: ${error.message}`);
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
          body: "Loading complete league table...",
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
    message += "Pos  Team                   P   W   D   L   GF  GA  GD   Pts\n";
    message += "-----------------------------------------------------------\n";

    // Add each team's standings
    standings.forEach(team => {
      // Add position indicators
      const positionPrefix = team.position === 1 ? "🥇" : 
                           (team.position <= 4 ? "🔵" :  // Champions League
                           (team.position <= 6 ? "🟢" :  // Europa/Conference
                           (team.position >= 18 ? "🔴" : "  "))); // Relegation

      message += `${team.position.toString().padEnd(3)} ${positionPrefix} `;
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
    
    // Add league position indicators
    message += "\n*Key:*\n";
    message += "🥇 League leader\n";
    message += "🔵 Champions League spots (1-4)\n";
    message += "🟢 Europa/Conference League (5-6)\n";
    message += "🔴 Relegation zone (18-20)\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Premier League Standings",
          body: `Complete ${competition} league table`,
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

// Bundesliga Top Scorers Command
keith({
  nomCom: "bundesligascorers",
  aliases: ["bundesligagoals", "blscorers", "bltopscorers", "goldenboot"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Bundesliga top scorers...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Bundesliga Top Scorers",
          body: "Loading golden boot race...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/bundesliga/scorers');
    const data = response.data;

    if (!data.status || !data.result?.topScorers?.length) {
      return repondre(zk, dest, ms, "No top scorers data available at the moment.");
    }

    const { competition, topScorers } = data.result;

    // Format the top scorers data
    let message = `*⚽ ${competition} Top Scorers* 🥇\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Rank Player                Team                Goals Assists Pens\n";
    message += "--------------------------------------------------------\n";

    // Add each player's stats
    topScorers.forEach(player => {
      // Handle "N/A" values
      const assists = player.assists === "N/A" ? "-" : player.assists;
      const penalties = player.penalties === "N/A" ? "-" : player.penalties;
      
      // Add golden boot emoji for top scorer
      const rankPrefix = player.rank === 1 ? "🥇" : 
                       (player.rank <= 3 ? "🏅" : "  ");
      
      message += `${player.rank.toString().padEnd(3)} ${rankPrefix} `;
      message += `${player.player.substring(0, 18).padEnd(18)} `;
      message += `${player.team.substring(0, 18).padEnd(18)} `;
      message += `${player.goals.toString().padEnd(5)} `;
      message += `${assists.toString().padEnd(7)} `;
      message += `${penalties}\n`;
    });

    message += "```\n";  // End monospace block
    
    // Add key explanation
    message += "\n*Key:*\n";
    message += "🥇 Current top scorer\n";
    message += "🏅 Top 3 scorers\n";
    message += "Pens = Penalty goals\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Bundesliga Top Scorers",
          body: `Current ${competition} golden boot race`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Bundesliga Top Scorers command error:', error);
    repondre(zk, dest, ms, `Failed to fetch top scorers: ${error.message}`);
  }
});
// Bundesliga Standings Command
keith({
  nomCom: "bundesligastandings",
  aliases: ["bundesligatable", "blstandings", "bltable"],
  categorie: "sports",
  reaction: "🇩🇪"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Bundesliga standings...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Bundesliga Standings",
          body: "Loading current league table...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/bundesliga/standings');
    const data = response.data;

    if (!data.status || !data.result?.standings?.length) {
      return repondre(zk, dest, ms, "No standings data available at the moment.");
    }

    const { competition, standings } = data.result;

    // Format the standings data
    let message = `*🇩🇪 ${competition} Standings* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Pos  Team                   P   W   D   L   GF  GA  GD   Pts\n";
    message += "-----------------------------------------------------------\n";

    // Add each team's standings
    standings.forEach(team => {
      // Add trophy emoji for top position
      const positionPrefix = team.position === 1 ? "🥇" : 
                           (team.position <= 4 ? "🏆" : 
                           (team.position <= 6 ? "🟢" : 
                           (team.position >= 16 ? "🔴" : "  ")));
      
      message += `${team.position.toString().padEnd(3)} ${positionPrefix} `;
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
    
    // Add league position indicators
    message += "\n*Key:*\n";
    message += "🥇 League leader\n";
    message += "🏆 Champions League spots\n";
    message += "🟢 Europa League/Conference spots\n";
    message += "🔴 Relegation zone\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Bundesliga Standings",
          body: `Current ${competition} league table`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Bundesliga Standings command error:', error);
    repondre(zk, dest, ms, `Failed to fetch standings: ${error.message}`);
  }
});

// Bundesliga Matches Command
keith({
  nomCom: "bundesligaresults",
  aliases: ["bundesligamatches", "blresults", "blmatches"],
  categorie: "sports",
  reaction: "🇩🇪"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Bundesliga match results...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Bundesliga Results",
          body: "Loading recent match results...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/bundesliga/matches');
    const data = response.data;

    if (!data.status || !data.result?.matches?.length) {
      return repondre(zk, dest, ms, "No match results available at the moment.");
    }

    const { competition, matches } = data.result;

    // Format the matches data
    let message = `*🇩🇪 ${competition} Match Results* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Group matches by matchday
    const matchesByMatchday = {};
    matches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    // Add matches for each matchday
    Object.keys(matchesByMatchday).sort((a, b) => b - a).forEach(matchday => {
      message += `📅 Matchday ${matchday}:\n`;
      message += "--------------------------------\n";
      
      matchesByMatchday[matchday].forEach(match => {
        // Determine result emoji
        let resultEmoji = "⚖️"; // Default for draw
        if (match.winner !== "Draw") {
          resultEmoji = match.winner === match.homeTeam ? "🏠" : "✈️";
        }
        
        message += `${resultEmoji} ${match.homeTeam} ${match.score} ${match.awayTeam}\n`;
        message += `   🏆 Winner: ${match.winner}\n\n`;
      });
    });

    message += "```\n";  // End monospace block
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Bundesliga Results",
          body: `Recent ${competition} match results`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Bundesliga Results command error:', error);
    repondre(zk, dest, ms, `Failed to fetch match results: ${error.message}`);
  }
});


// Bundesliga Upcoming Matches Command
keith({
  nomCom: "bundesligaupcoming",
  aliases: ["bundesligafixtures", "blmatches", "blfixtures"],
  categorie: "sports",
  reaction: "🇩🇪"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Bundesliga upcoming matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Bundesliga Fixtures",
          body: "Loading upcoming matches...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/bundesliga/upcomingmatches');
    const data = response.data;

    if (!data.status || !data.result?.upcomingMatches?.length) {
      return repondre(zk, dest, ms, "No upcoming matches data available at the moment.");
    }

    const { competition, upcomingMatches } = data.result;

    // Format the matches data
    let message = `*🇩🇪 ${competition} Upcoming Matches* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Group matches by matchday
    const matchesByMatchday = {};
    upcomingMatches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    // Add matches for each matchday
    Object.keys(matchesByMatchday).sort().forEach(matchday => {
      message += `📅 Matchday ${matchday}:\n`;
      message += "--------------------------------\n";
      
      matchesByMatchday[matchday].forEach(match => {
        const matchDate = new Date(match.date);
        const formattedDate = matchDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        message += `⏰ ${formattedDate}\n`;
        message += `🏠 ${match.homeTeam}\n`;
        message += `🆚 ${match.awayTeam}\n\n`;
      });
    });

    message += "```\n";  // End monospace block
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Bundesliga Fixtures",
          body: `Upcoming ${competition} matches`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Bundesliga Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch upcoming matches: ${error.message}`);
  }
});
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

    message += "```\n\n";  // End monospace block
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
