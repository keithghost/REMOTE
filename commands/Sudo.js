const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");



// UEFA Champions League Matches Command
keith({
  nomCom: "uclmatches",
  aliases: ["uclresults", "uclfixtures", "uclgames"],
  categorie: "sports",
  reaction: "🏆"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Champions League matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "UCL Matches",
          body: "Loading match results...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo.svg/1200px-UEFA_Champions_League_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/ucl/matches');
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
    let message = `*🏆 ${competition} Match Results* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Add matches for each matchday
    Object.keys(matchesByMatchday).sort().forEach(matchday => {
      message += `📌 Matchday ${matchday}\n`;
      message += "--------------------------------\n";
      
      matchesByMatchday[matchday].forEach(match => {
        // Shorten long team names
        const homeTeam = match.homeTeam
          .replace("FC Internazionale Milano", "Inter Milan")
          .replace("Sporting Clube de Portugal", "Sporting CP")
          .replace("Sport Lisboa e Benfica", "Benfica")
          .replace("GNK Dinamo Zagreb", "Dinamo Zagreb")
          .replace("FK Shakhtar Donetsk", "Shakhtar")
          .replace("FK Crvena Zvezda", "Red Star");
        
        const awayTeam = match.awayTeam
          .replace("FC Internazionale Milano", "Inter Milan")
          .replace("Sporting Clube de Portugal", "Sporting CP")
          .replace("Sport Lisboa e Benfica", "Benfica")
          .replace("GNK Dinamo Zagreb", "Dinamo Zagreb")
          .replace("FK Shakhtar Donetsk", "Shakhtar")
          .replace("FK Crvena Zvezda", "Red Star");

        // Determine result emoji
        let resultEmoji = "⚖️"; // Draw
        if (match.winner !== "Draw") {
          resultEmoji = match.winner === match.homeTeam ? "🏠" : "✈️";
        }
        
        message += `${homeTeam.padEnd(20)} ${match.score.padEnd(7)} ${awayTeam.padEnd(20)} ${resultEmoji}\n`;
      });
      
      message += "\n";
    });

    message += "```\n";  // End monospace block
    
    // Add key information
    message += "\n*Key:*\n";
    message += "🏠 Home win\n";
    message += "✈️ Away win\n";
    message += "⚖️ Draw\n";
    
    // Add interesting facts about the matchday
    const lastMatchday = Object.keys(matchesByMatchday).sort().pop();
    const lastMatchdayMatches = matchesByMatchday[lastMatchday];
    const homeWins = lastMatchdayMatches.filter(match => match.winner === match.homeTeam).length;
    const awayWins = lastMatchdayMatches.filter(match => match.winner === match.awayTeam).length;
    message += `\n*Matchday ${lastMatchday} Stats:* ${homeWins} home wins, ${awayWins} away wins, ${lastMatchdayMatches.length - homeWins - awayWins} draws`;

    // Find highest scoring game
    const highestScoringGame = matches.reduce((highest, match) => {
      const [home, away] = match.score.split(' - ').map(Number);
      const total = home + away;
      return total > highest.total ? { match, total } : highest;
    }, { total: 0 });
    
    if (highestScoringGame.total > 0) {
      message += `\n\n*Highest Scoring Game:* ${highestScoringGame.match.homeTeam} ${highestScoringGame.match.score} ${highestScoringGame.match.awayTeam}`;
    }

    message += `\n\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "UCL Match Results",
          body: `Latest ${competition} results`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo.svg/1200px-UEFA_Champions_League_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('UCL Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch matches: ${error.message}`);
  }
});
// UCL Upcoming Matches Command
keith({
  nomCom: "uclupcoming",
  aliases: ["uclfixtures", "championsleague", "uclupcoming"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Champions League fixtures...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "UCL Fixtures",
          body: "Loading upcoming matches...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2021.svg/1200px-UEFA_Champions_League_logo_2021.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/ucl/upcomingmatches');
    const data = response.data;

    if (!data.status || !data.result?.upcomingMatches?.length) {
      return repondre(zk, dest, ms, "No upcoming matches data available at the moment.");
    }

    const { competition, upcomingMatches } = data.result;

    // Filter out invalid matches
    const validMatches = upcomingMatches.filter(match => 
      match.homeTeam && match.awayTeam && match.matchday !== "N/A"
    );

    if (validMatches.length === 0) {
      return repondre(zk, dest, ms, "No valid upcoming matches found.");
    }

    // Format the matches data
    let message = `*🏆 ${competition} Fixtures* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Group matches by matchday
    const matchesByMatchday = {};
    validMatches.forEach(match => {
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
        
        // Highlight big clubs with emojis
        const homeTeam = match.homeTeam.includes('Barcelona') ? '🔵🔴 ' + match.homeTeam :
                        match.homeTeam.includes('Paris') ? '💎 ' + match.homeTeam :
                        match.homeTeam.includes('Inter') ? '⚫🔵 ' + match.homeTeam :
                        match.homeTeam.includes('Arsenal') ? '🔴 ' + match.homeTeam :
                        match.homeTeam;

        const awayTeam = match.awayTeam.includes('Barcelona') ? '🔵🔴 ' + match.awayTeam :
                        match.awayTeam.includes('Paris') ? '💎 ' + match.awayTeam :
                        match.awayTeam.includes('Inter') ? '⚫🔵 ' + match.awayTeam :
                        match.awayTeam.includes('Arsenal') ? '🔴 ' + match.awayTeam :
                        match.awayTeam;

        message += `⏰ ${formattedDate} UTC\n`;
        message += `🏠 ${homeTeam}\n`;
        message += `🆚 ${awayTeam}\n\n`;
      });
    });

    message += "```\n";  // End monospace block
    
    // Add team emoji legend
    message += "\n*Club Icons:*\n";
    message += "🔵🔴 Barcelona | 💎 PSG\n";
    message += "⚫🔵 Inter | 🔴 Arsenal\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Champions League Fixtures",
          body: `Upcoming ${competition} matches`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/UEFA_Champions_League_logo_2021.svg/1200px-UEFA_Champions_League_logo_2021.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('UCL Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch fixtures: ${error.message}`);
  }
});

// Serie A Top Scorers Command
keith({
  nomCom: "serieascorers",
  aliases: ["serieatopscorers", "serieagoals", "capocannoniere"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Serie A top scorers...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Serie A Top Scorers",
          body: "Loading Capocannoniere race data...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Serie_A_logo_%282019%29.svg/1200px-Serie_A_logo_%282019%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/seriea/scorers');
    const data = response.data;

    if (!data.status || !data.result?.topScorers?.length) {
      return repondre(zk, dest, ms, "No top scorers data available at the moment.");
    }

    const { competition, topScorers } = data.result;

    // Format the top scorers data
    let message = `*⚽ ${competition} Top Scorers (Capocannoniere Race)* 🥇\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Rank Player                  Team            Goals Assists Pens\n";
    message += "------------------------------------------------------------\n";

    // Add each scorer's data
    topScorers.forEach(scorer => {
      // Highlight current Capocannoniere leader
      const rankPrefix = scorer.rank === 1 ? "🥇" : `${scorer.rank}.`;
      
      // Shorten long team names
      const teamName = scorer.team
        .replace("FC Internazionale Milano", "Inter")
        .replace("ACF Fiorentina", "Fiorentina")
        .replace("Bologna FC 1909", "Bologna");
      
      message += `${rankPrefix.padEnd(4)} `;
      message += `${scorer.player.substring(0, 20).padEnd(20)} `;
      message += `${teamName.substring(0, 15).padEnd(15)} `;
      message += `${scorer.goals.toString().padEnd(5)} `;
      message += `${(scorer.assists === "N/A" ? "0" : scorer.assists).toString().padEnd(7)} `;
      message += `${(scorer.penalties === "N/A" ? "0" : scorer.penalties).toString()}\n`;
    });

    message += "```\n";  // End monospace block
    
    // Add key information
    message += "\n*Key:*\n";
    message += "🥇 Current Capocannoniere leader\n";
    message += "Pens: Penalty goals scored\n";
    message += "N/A values are shown as 0 in table\n";
    
    // Add interesting facts about top scorers
    const topScorer = topScorers[0];
    message += `\n*Did you know?* ${topScorer.player} (${topScorer.team.replace("FC Internazionale Milano", "Inter")}) leads the race with ${topScorer.goals} goals`;
    if (topScorer.penalties !== "N/A" && topScorer.penalties > 0) {
      message += ` (${topScorer.penalties} from penalties)`;
    }
    message += "!";

    // Add assist leader
    const assistLeader = [...topScorers].sort((a, b) => {
      const aAssists = a.assists === "N/A" ? 0 : a.assists;
      const bAssists = b.assists === "N/A" ? 0 : b.assists;
      return bAssists - aAssists;
    })[0];
    
    if (assistLeader.assists !== "N/A" && assistLeader.assists > 0) {
      message += `\n\n*Top Playmaker:* ${assistLeader.player} leads in assists (${assistLeader.assists})`;
    }

    message += `\n\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Serie A Top Scorers",
          body: `Current ${competition} Capocannoniere race`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Serie_A_logo_%282019%29.svg/1200px-Serie_A_logo_%282019%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Serie A Top Scorers command error:', error);
    repondre(zk, dest, ms, `Failed to fetch top scorers: ${error.message}`);
  }
});

// Serie A Standings Command
keith({
  nomCom: "serieastandings",
  aliases: ["serieatable", "sastandings", "satable"],
  categorie: "sports",
  reaction: "🇮🇹"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Serie A standings...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Serie A Standings",
          body: "Loading complete league table...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Serie_A_logo_%282019%29.svg/1200px-Serie_A_logo_%282019%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/seriea/standings');
    const data = response.data;

    if (!data.status || !data.result?.standings?.length) {
      return repondre(zk, dest, ms, "No standings data available at the moment.");
    }

    const { competition, standings } = data.result;

    // Format the standings data
    let message = `*🇮🇹 ${competition} Standings* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Pos  Team                   P   W   D   L   GF  GA  GD   Pts\n";
    message += "-----------------------------------------------------------\n";

    // Add each team's standings
    standings.forEach(team => {
      // Add position indicators
      const positionPrefix = team.position === 1 ? "🏆" : 
                          (team.position <= 4 ? "🔵" :  // Champions League
                          (team.position === 5 ? "🟢" :  // Europa League
                          (team.position === 6 ? "🟡" :  // Conference League
                          (team.position >= 18 ? "🔴" : "  ")))); // Relegation

      // Highlight big clubs
      const teamName = team.team.includes('Inter') ? '⚫🔵 ' + team.team :
                      team.team.includes('Juventus') ? '⚪⚫ ' + team.team :
                      team.team.includes('Milan') ? '🔴⚫ ' + team.team :
                      team.team.includes('Roma') ? '🔴🟡 ' + team.team :
                      team.team.includes('Napoli') ? '🔵 ' + team.team :
                      team.team;

      message += `${team.position.toString().padEnd(3)} ${positionPrefix} `;
      message += `${teamName.substring(0, 20).padEnd(20)} `;
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
    message += "🏆 League leader\n";
    message += "🔵 Champions League (1-4)\n";
    message += "🟢 Europa League (5th)\n";
    message += "🟡 Conference League (6th)\n";
    message += "🔴 Relegation zone (18-20)\n";
    message += "⚫🔵 Inter | ⚪⚫ Juventus\n";
    message += "🔴⚫ Milan | 🔴🟡 Roma\n";
    message += "🔵 Napoli\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Serie A Standings",
          body: `Complete ${competition} league table`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Serie_A_logo_%282019%29.svg/1200px-Serie_A_logo_%282019%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Serie A Standings command error:', error);
    repondre(zk, dest, ms, `Failed to fetch standings: ${error.message}`);
  }
});
// Serie A Matches Command
keith({
  nomCom: "serieamatches",
  aliases: ["seriearesults", "serieafixtures", "serieagames"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Serie A matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Serie A Matches",
          body: "Loading match results and fixtures...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Serie_A_logo_%282019%29.svg/1200px-Serie_A_logo_%282019%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/seriea/matches');
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
    message += "```\n";  // Start monospace block for alignment
    
    // Add matches for each matchday
    Object.keys(matchesByMatchday).sort().forEach(matchday => {
      message += `📌 Matchday ${matchday}\n`;
      message += "--------------------------------\n";
      
      matchesByMatchday[matchday].forEach(match => {
        // Determine result emoji
        let resultEmoji = "⚖️"; // Draw
        if (match.winner !== "Draw") {
          resultEmoji = match.winner === match.homeTeam ? "🏠" : "✈️";
        }
        
        // Shorten long team names
        const homeTeam = match.homeTeam
          .replace("FC Internazionale Milano", "Inter Milan")
          .replace("ACF Fiorentina", "Fiorentina")
          .replace("Parma Calcio 1913", "Parma");
        
        const awayTeam = match.awayTeam
          .replace("FC Internazionale Milano", "Inter Milan")
          .replace("ACF Fiorentina", "Fiorentina")
          .replace("Parma Calcio 1913", "Parma");

        message += `${homeTeam.padEnd(20)} ${match.score.padEnd(7)} ${awayTeam.padEnd(20)} ${resultEmoji}\n`;
      });
      
      message += "\n";
    });

    message += "```\n";  // End monospace block
    
    // Add key information
    message += "\n*Key:*\n";
    message += "🏠 Home win\n";
    message += "✈️ Away win\n";
    message += "⚖️ Draw\n";
    
    // Add interesting fact about most recent matchday
    const lastMatchday = Object.keys(matchesByMatchday).sort().pop();
    const lastMatchdayMatches = matchesByMatchday[lastMatchday];
    const draws = lastMatchdayMatches.filter(match => match.winner === "Draw").length;
    message += `\n*Did you know?* Matchday ${lastMatchday} had ${draws} draws out of ${lastMatchdayMatches.length} matches!`;

    message += `\n\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Serie A Match Results",
          body: `Recent ${competition} results`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Serie_A_logo_%282019%29.svg/1200px-Serie_A_logo_%282019%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Serie A Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch matches: ${error.message}`);
  }
});

// Serie A Upcoming Matches Command
keith({
  nomCom: "serieaupcoming",
  aliases: ["serieafixtures", "saupcoming", "samatches"],
  categorie: "sports",
  reaction: "🇮🇹"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Serie A upcoming matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Serie A Fixtures",
          body: "Loading upcoming matches...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Serie_A_logo_%282019%29.svg/1200px-Serie_A_logo_%282019%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/seriea/upcomingmatches');
    const data = response.data;

    if (!data.status || !data.result?.upcomingMatches?.length) {
      return repondre(zk, dest, ms, "No upcoming matches data available at the moment.");
    }

    const { competition, upcomingMatches } = data.result;

    // Format the matches data
    let message = `*🇮🇹 ${competition} Upcoming Matches* ⚽\n\n`;
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
          timeZone: 'Europe/Rome'
        });
        
        // Highlight big teams with emojis
        const homeTeam = match.homeTeam.includes('Inter') ? '⚫🔵 ' + match.homeTeam :
                        match.homeTeam.includes('Juventus') ? '⚪⚫ ' + match.homeTeam :
                        match.homeTeam.includes('Milan') ? '🔴⚫ ' + match.homeTeam :
                        match.homeTeam.includes('Roma') ? '🔴🟡 ' + match.homeTeam :
                        match.homeTeam.includes('Napoli') ? '🔵 ' + match.homeTeam :
                        match.homeTeam;

        const awayTeam = match.awayTeam.includes('Inter') ? '⚫🔵 ' + match.awayTeam :
                        match.awayTeam.includes('Juventus') ? '⚪⚫ ' + match.awayTeam :
                        match.awayTeam.includes('Milan') ? '🔴⚫ ' + match.awayTeam :
                        match.awayTeam.includes('Roma') ? '🔴🟡 ' + match.awayTeam :
                        match.awayTeam.includes('Napoli') ? '🔵 ' + match.awayTeam :
                        match.awayTeam;

        message += `⏰ ${formattedDate} CET\n`;
        message += `🏠 ${homeTeam}\n`;
        message += `🆚 ${awayTeam}\n\n`;
      });
    });

    message += "```\n";  // End monospace block
    
    // Add team emoji legend
    message += "\n*Club Colors:*\n";
    message += "⚫🔵 Inter | ⚪⚫ Juventus\n";
    message += "🔴⚫ Milan | 🔴🟡 Roma\n";
    message += "🔵 Napoli\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Serie A Fixtures",
          body: `Upcoming ${competition} matches`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Serie_A_logo_%282019%29.svg/1200px-Serie_A_logo_%282019%29.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Serie A Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch upcoming matches: ${error.message}`);
  }
});

// Ligue 1 Top Scorers Command
keith({
  nomCom: "ligue1scorers",
  aliases: ["ligue1topscorers", "ligue1goals", "ligue1goldenboot"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Ligue 1 top scorers...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Ligue 1 Top Scorers",
          body: "Loading golden boot race data...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/ligue1/scorers');
    const data = response.data;

    if (!data.status || !data.result?.topScorers?.length) {
      return repondre(zk, dest, ms, "No top scorers data available at the moment.");
    }

    const { competition, topScorers } = data.result;

    // Format the top scorers data
    let message = `*⚽ ${competition} Top Scorers (Golden Boot Race)* 🥇\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Rank Player                  Team            Goals Assists Pens\n";
    message += "------------------------------------------------------------\n";

    // Add each scorer's data
    topScorers.forEach(scorer => {
      // Highlight current golden boot leader
      const rankPrefix = scorer.rank === 1 ? "🥇" : `${scorer.rank}.`;
      
      message += `${rankPrefix.padEnd(4)} `;
      message += `${scorer.player.substring(0, 20).padEnd(20)} `;
      message += `${scorer.team.substring(0, 15).padEnd(15)} `;
      message += `${scorer.goals.toString().padEnd(5)} `;
      message += `${(scorer.assists === "N/A" ? "0" : scorer.assists).toString().padEnd(7)} `;
      message += `${(scorer.penalties === "N/A" ? "0" : scorer.penalties).toString()}\n`;
    });

    message += "```\n";  // End monospace block
    
    // Add key information
    message += "\n*Key:*\n";
    message += "🥇 Current golden boot leader\n";
    message += "Pens: Penalty goals scored\n";
    message += "N/A values are shown as 0 in table\n";
    
    // Add interesting facts about top scorers
    const topScorer = topScorers[0];
    message += `\n*Did you know?* ${topScorer.player} (${topScorer.team}) leads the race with ${topScorer.goals} goals`;
    if (topScorer.penalties !== "N/A" && topScorer.penalties > 0) {
      message += ` (${topScorer.penalties} from penalties)`;
    }
    message += "!";

    message += `\n\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Ligue 1 Top Scorers",
          body: `Current ${competition} golden boot race`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Ligue 1 Top Scorers command error:', error);
    repondre(zk, dest, ms, `Failed to fetch top scorers: ${error.message}`);
  }
});

// Ligue 1 Standings Command
keith({
  nomCom: "ligue1standings",
  aliases: ["ligue1table", "l1standings", "l1table"],
  categorie: "sports",
  reaction: "🇫🇷"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Ligue 1 standings...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Ligue 1 Standings",
          body: "Loading complete league table...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/ligue1/standings');
    const data = response.data;

    if (!data.status || !data.result?.standings?.length) {
      return repondre(zk, dest, ms, "No standings data available at the moment.");
    }

    const { competition, standings } = data.result;

    // Format the standings data
    let message = `*🇫🇷 ${competition} Standings* ⚽\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Pos  Team                   P   W   D   L   GF  GA  GD   Pts\n";
    message += "-----------------------------------------------------------\n";

    // Add each team's standings
    standings.forEach(team => {
      // Add position indicators
      const positionPrefix = team.position === 1 ? "🥇" : 
                          (team.position <= 3 ? "🔵" :  // Champions League
                          (team.position === 4 ? "🟢" :  // UCL Qualifiers
                          (team.position === 5 ? "🟡" :  // Europa League
                          (team.position === 6 ? "🟠" :  // Conference League
                          (team.position >= 16 ? "🔴" : "  "))))); // Relegation

      // Highlight PSG with special emoji
      const teamName = team.team.includes('Paris Saint-Germain') ? '💎 ' + team.team :
                      team.team.includes('Olympique de Marseille') ? '🔵 ' + team.team :
                      team.team.includes('Olympique Lyonnais') ? '🔴🔵 ' + team.team :
                      team.team;

      message += `${team.position.toString().padEnd(3)} ${positionPrefix} `;
      message += `${teamName.substring(0, 20).padEnd(20)} `;
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
    message += "🔵 Champions League (1-3)\n";
    message += "🟢 UCL Qualifiers (4th)\n";
    message += "🟡 Europa League (5th)\n";
    message += "🟠 Conference League (6th)\n";
    message += "🔴 Relegation playoff (16th) & Relegation (17-18)\n";
    message += "💎 PSG | 🔵 Marseille | 🔴🔵 Lyon\n";
    
    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Ligue 1 Standings",
          body: `Complete ${competition} league table`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Ligue 1 Standings command error:', error);
    repondre(zk, dest, ms, `Failed to fetch standings: ${error.message}`);
  }
});

// Ligue 1 Matches Command
keith({
  nomCom: "ligue1matches",
  aliases: ["ligue1results", "ligue1fixtures", "ligue1games"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Ligue 1 matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Ligue 1 Matches",
          body: "Loading match results and fixtures...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/ligue1/matches');
    const data = response.data;

    if (!data.status || !data.result?.matches?.length) {
      return repondre(zk, dest, ms, "No match data available at the moment.");
    }

    const { competition, matches } = data.result;

    // Separate finished and upcoming matches
    const finishedMatches = matches.filter(match => match.status === "FINISHED");
    const upcomingMatches = matches.filter(match => match.status !== "FINISHED");

    // Group matches by matchday
    const groupByMatchday = (matchesArray) => {
      const grouped = {};
      matchesArray.forEach(match => {
        if (!grouped[match.matchday]) {
          grouped[match.matchday] = [];
        }
        grouped[match.matchday].push(match);
      });
      return grouped;
    };

    const finishedByMatchday = groupByMatchday(finishedMatches);
    const upcomingByMatchday = groupByMatchday(upcomingMatches);

    // Format the matches data
    let message = `*⚽ ${competition} Match Results & Fixtures* 📅\n\n`;

    // Add finished matches section if they exist
    if (Object.keys(finishedByMatchday).length > 0) {
      message += `*📌 Completed Matches*\n`;
      message += "--------------------------------\n";
      
      Object.keys(finishedByMatchday).sort().forEach(matchday => {
        message += `🔹 *Matchday ${matchday}*\n`;
        
        finishedByMatchday[matchday].forEach(match => {
          const resultEmoji = match.winner === "Draw" ? "⚖️" : 
                           (match.winner === match.homeTeam ? "🏠" : "✈️");
          
          message += `${match.homeTeam} ${match.score} ${match.awayTeam} ${resultEmoji}\n`;
        });
        message += "\n";
      });
    }

    // Add upcoming matches section if they exist
    if (Object.keys(upcomingByMatchday).length > 0) {
      message += `*📌 Upcoming Matches*\n`;
      message += "--------------------------------\n";
      
      Object.keys(upcomingByMatchday).sort().forEach(matchday => {
        message += `🔹 *Matchday ${matchday}*\n`;
        
        upcomingByMatchday[matchday].forEach(match => {
          message += `🏠 ${match.homeTeam} vs ${match.awayTeam}\n`;
          if (match.date) {
            const matchDate = new Date(match.date);
            const formattedDate = matchDate.toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            message += `⏰ ${formattedDate}\n`;
          }
          message += "\n";
        });
      });
    }

    message += `\n_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Ligue 1 Matches",
          body: `Recent results and upcoming fixtures`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Ligue 1 Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch matches: ${error.message}`);
  }
});

// Ligue 1 Upcoming Matches Command
keith({
  nomCom: "ligue1upcoming",
  aliases: ["ligue1fixtures", "ligue1upcomingmatch", "ligue1games"],
  categorie: "sports",
  reaction: "⚽"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching Ligue 1 upcoming matches...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Ligue 1 Matches",
          body: "Loading upcoming fixtures...",
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://apis-keith.vercel.app/ligue1/upcomingmatches');
    const data = response.data;

    if (!data.status || !data.result?.upcomingMatches?.length) {
      return repondre(zk, dest, ms, "No upcoming matches data available at the moment.");
    }

    const { competition, upcomingMatches } = data.result;

    // Group matches by matchday
    const matchesByMatchday = {};
    upcomingMatches.forEach(match => {
      if (!matchesByMatchday[match.matchday]) {
        matchesByMatchday[match.matchday] = [];
      }
      matchesByMatchday[match.matchday].push(match);
    });

    // Format the matches data
    let message = `*⚽ ${competition} Upcoming Matches* 📅\n\n`;
    
    // Add matches for each matchday
    Object.keys(matchesByMatchday).sort().forEach(matchday => {
      message += `📌 *Matchday ${matchday}*\n`;
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
        
        message += `🏠 ${match.homeTeam}\n`;
        message += `✈️ ${match.awayTeam}\n`;
        message += `⏰ ${formattedDate}\n\n`;
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
          title: "Ligue 1 Upcoming Matches",
          body: `Next ${competition} fixtures`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Ligue_1_Uber_Eats_logo.svg/1200px-Ligue_1_Uber_Eats_logo.svg.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Ligue 1 Matches command error:', error);
    repondre(zk, dest, ms, `Failed to fetch upcoming matches: ${error.message}`);
  }
});

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
