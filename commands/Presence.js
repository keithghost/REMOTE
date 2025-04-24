const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");


// All Leagues Command
keith({
  nomCom: "leagues",
  aliases: ["allleagues", "listleagues", "sportsleagues"],
  categorie: "sports",
  reaction: "🏆",
  arg: ["text"]
}, async (dest, zk, commandOptions) => {
  const { ms, userJid, arg } = commandOptions;
  const sportFilter = arg.join(" ").trim().toLowerCase();

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching leagues list...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Sports Leagues",
          body: "Loading all available leagues...",
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/badge/football.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
    const data = response.data;

    if (!data.leagues || data.leagues.length === 0) {
      return repondre(zk, dest, ms, "No leagues data available at the moment.");
    }

    // Filter leagues by sport if specified
    let leagues = data.leagues;
    if (sportFilter) {
      leagues = leagues.filter(league => 
        league.strSport.toLowerCase().includes(sportFilter) ||
        league.strLeague.toLowerCase().includes(sportFilter)
    }

    if (leagues.length === 0) {
      return repondre(zk, dest, ms, `No leagues found for "${sportFilter}". Try a different sport.`);
    }

    // Group leagues by sport
    const leaguesBySport = {};
    leagues.forEach(league => {
      if (!leaguesBySport[league.strSport]) {
        leaguesBySport[league.strSport] = [];
      }
      leaguesBySport[league.strSport].push(league);
    });

    // Format the leagues data
    let message = `*🏆 Available Leagues${sportFilter ? ` (${sportFilter})` : ''}*\n\n`;

    // Add leagues by sport category
    Object.keys(leaguesBySport).sort().forEach(sport => {
      message += `*${sport}*\n`;
      
      leaguesBySport[sport].forEach(league => {
        message += `- ${league.strLeague}`;
        if (league.strLeagueAlternate) {
          message += ` (${league.strLeagueAlternate.split(',').shift().trim()})`;
        }
        message += `\n`;
      });
      
      message += "\n";
    });

    message += `ℹ️ Total Leagues: ${leagues.length}\n`;
    message += `🔍 Use "!leagues [sport]" to filter (e.g. "!leagues soccer")\n\n`;
    message += `_Data provided by TheSportsDB.com_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Sports Leagues",
          body: `${leagues.length} leagues available${sportFilter ? ` in ${sportFilter}` : ''}`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/badge/football.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Leagues command error:', error);
    repondre(zk, dest, ms, `Failed to fetch leagues: ${error.message}`);
  }
});

// Venue Search Command
keith({
  nomCom: "venuesearch",
  aliases: ["stadium", "arena", "venueinfo"],
  categorie: "sports",
  reaction: "🏟️",
  arg: ["text"]
}, async (dest, zk, commandOptions) => {
  const { ms, userJid, arg } = commandOptions;
  const venueName = arg.join(" ").trim();

  if (!venueName) {
    return repondre(zk, dest, ms, "Please specify a venue name to search for.");
  }

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: `⏳ Searching for ${venueName}...`,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Venue Search",
          body: `Looking up ${venueName} information...`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/venue/thumb/stadium.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchvenues.php?t=${encodeURIComponent(venueName)}`);
    const data = response.data;

    if (!data.venues || data.venues.length === 0) {
      return repondre(zk, dest, ms, `No venues found with name "${venueName}". Try a different name.`);
    }

    // Filter for soccer venues first, then other sports
    const soccerVenues = data.venues.filter(v => v.strSport === "Soccer");
    const otherVenues = data.venues.filter(v => v.strSport !== "Soccer");
    const sortedVenues = [...soccerVenues, ...otherVenues];

    // Format the venue data
    let message = `*🏟️ Venue Search Results*\n\n`;

    // Show top 3 venues to avoid message length issues
    const venuesToShow = sortedVenues.slice(0, 3);
    
    venuesToShow.forEach((venue, index) => {
      message += `*${index + 1}. ${venue.strVenue}*\n`;
      message += `📍 ${venue.strLocation || 'N/A'}\n`;
      message += `⚽ Sport: ${venue.strSport || 'N/A'}\n`;
      message += `🪑 Capacity: ${venue.intCapacity || 'N/A'}\n`;
      message += `🏛️ Built: ${venue.intFormedYear || 'N/A'}\n`;
      
      if (venue.strDescriptionEN && venue.strDescriptionEN.length > 0) {
        const shortDesc = venue.strDescriptionEN.length > 150 
          ? venue.strDescriptionEN.substring(0, 150) + '...' 
          : venue.strDescriptionEN;
        message += `📝 ${shortDesc}\n`;
      }
      
      if (venue.strWebsite) {
        message += `🌐 ${venue.strWebsite}\n`;
      }
      
      message += "\n";
    });

    // Mention if there are more results
    if (sortedVenues.length > 3) {
      message += `ℹ️ ${sortedVenues.length - 3} more venues found. Try a more specific search.\n\n`;
    }

    message += `_Data provided by TheSportsDB.com_`;

    // Get thumbnail for first venue
    const firstVenueThumb = sortedVenues[0].strThumb || 
                           sortedVenues[0].strLogo || 
                           "https://www.thesportsdb.com/images/media/venue/thumb/stadium.png";

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: `${venueName} Venues`,
          body: `${sortedVenues.length} venues found`,
          thumbnailUrl: firstVenueThumb,
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Venue Search command error:', error);
    repondre(zk, dest, ms, `Failed to search for venue: ${error.message}`);
  }
});

// Match History Command
keith({
  nomCom: "matchhistory",
  aliases: ["h2h", "headtohead", "fixturehistory"],
  categorie: "sports",
  reaction: "📊",
  arg: ["text"]
}, async (dest, zk, commandOptions) => {
  const { ms, userJid, arg } = commandOptions;
  const teams = arg.join(" ").trim();

  if (!teams || !teams.includes(" vs ")) {
    return repondre(zk, dest, ms, "Please specify two teams in format: Team1 vs Team2");
  }

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: `⏳ Fetching match history for ${teams}...`,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Match History Search",
          body: `Looking up ${teams} encounters...`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/badge/football.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Format team names for API
    const [team1, team2] = teams.split(" vs ").map(t => t.trim());
    const apiQuery = `${team1}_vs_${team2}`;

    // Fetch data from API
    const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encodeURIComponent(apiQuery)}`);
    const data = response.data;

    if (!data.event || data.event.length === 0) {
      return repondre(zk, dest, ms, `No match history found for ${teams}. Try different team names.`);
    }

    // Filter for completed matches only
    const completedMatches = data.event.filter(match => match.strStatus === "Match Finished");
    
    if (completedMatches.length === 0) {
      return repondre(zk, dest, ms, `No completed matches found for ${teams}.`);
    }

    // Sort matches by date (newest first)
    completedMatches.sort((a, b) => new Date(b.dateEvent) - new Date(a.dateEvent));

    // Get team badges (use first match with badges)
    const homeBadge = completedMatches.find(m => m.strHomeTeamBadge)?.strHomeTeamBadge;
    const awayBadge = completedMatches.find(m => m.strAwayTeamBadge)?.strAwayTeamBadge;

    // Format the match history data
    let message = `*⚽ ${team1} vs ${team2} Head-to-Head*\n`;
    message += `📊 Total Matches: ${completedMatches.length}\n\n`;
    message += "*Recent Matches:*\n";

    // Add last 5 matches (or fewer if not available)
    const recentMatches = completedMatches.slice(0, 5);
    recentMatches.forEach(match => {
      const matchDate = new Date(match.dateEvent).toLocaleDateString();
      const competition = match.strLeague === "Club Friendlies" ? "Friendly" : match.strLeague;
      
      message += `📅 ${matchDate} (${competition})\n`;
      message += `🏠 ${match.strHomeTeam} ${match.intHomeScore} - ${match.intAwayScore} ${match.strAwayTeam} ✈️\n`;
      
      if (match.strVideo) {
        message += `▶️ Highlights: ${match.strVideo}\n`;
      }
      
      message += "\n";
    });

    // Calculate win/loss/draw stats
    let team1Wins = 0, team2Wins = 0, draws = 0;
    completedMatches.forEach(match => {
      if (match.intHomeScore > match.intAwayScore) {
        match.strHomeTeam.includes(team1) ? team1Wins++ : team2Wins++;
      } else if (match.intHomeScore < match.intAwayScore) {
        match.strHomeTeam.includes(team1) ? team2Wins++ : team1Wins++;
      } else {
        draws++;
      }
    });

    message += `*Overall Stats*\n`;
    message += `✅ ${team1} Wins: ${team1Wins}\n`;
    message += `✅ ${team2} Wins: ${team2Wins}\n`;
    message += `⚖️ Draws: ${draws}\n\n`;
    message += `_Data provided by TheSportsDB.com_`;

    // Prepare team badges for message
    const badges = [];
    if (homeBadge) badges.push(homeBadge);
    if (awayBadge) badges.push(awayBadge);

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: `${team1} vs ${team2} History`,
          body: `${completedMatches.length} matches recorded`,
          thumbnailUrl: badges.length > 0 ? badges[0] : "https://www.thesportsdb.com/images/media/league/badge/football.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Match History command error:', error);
    repondre(zk, dest, ms, `Failed to fetch match history: ${error.message}`);
  }
});
// Team Roster Command
keith({
  nomCom: "teamroster",
  aliases: ["squad", "teamplayers", "rostersearch"],
  categorie: "sports",
  reaction: "👥",
  arg: ["text"]
}, async (dest, zk, commandOptions) => {
  const { ms, userJid, arg } = commandOptions;
  const teamName = arg.join(" ").trim();

  if (!teamName) {
    return repondre(zk, dest, ms, "Please specify a team name to search for.");
  }

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: `⏳ Fetching ${teamName} roster...`,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Team Roster Search",
          body: `Looking up ${teamName} players...`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/team/badge/football.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?t=${encodeURIComponent(teamName)}`);
    const data = response.data;

    if (!data.player || data.player.length === 0) {
      return repondre(zk, dest, ms, `No players found for team "${teamName}". Try a different team name.`);
    }

    // Filter for soccer players only
    const players = data.player.filter(p => p.strSport === "Soccer");
    
    if (players.length === 0) {
      return repondre(zk, dest, ms, `No football players found for team "${teamName}".`);
    }

    // Group players by position
    const playersByPosition = {};
    players.forEach(player => {
      const position = player.strPosition || "Other";
      if (!playersByPosition[position]) {
        playersByPosition[position] = [];
      }
      playersByPosition[position].push(player);
    });

    // Format the roster data
    let message = `*👥 ${teamName} Roster*\n`;
    message += `📊 Total Players: ${players.length}\n\n`;

    // Add players by position
    Object.keys(playersByPosition).sort().forEach(position => {
      message += `*${position} (${playersByPosition[position].length})*\n`;
      
      playersByPosition[position].forEach(player => {
        message += `- ${player.strPlayer} (${player.strNationality || 'N/A'})\n`;
      });
      
      message += "\n";
    });

    // Add manager if exists
    const manager = players.find(p => p.strPosition === "Manager");
    if (manager) {
      message += `*Manager*\n`;
      message += `- ${manager.strPlayer} (${manager.strNationality || 'N/A'})\n\n`;
    }

    message += `_Data provided by TheSportsDB.com_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: `${teamName} Roster`,
          body: `${players.length} players listed`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/team/badge/football.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Team Roster command error:', error);
    repondre(zk, dest, ms, `Failed to fetch team roster: ${error.message}`);
  }
});
// Player Search Command
keith({
  nomCom: "playersearch",
  aliases: ["searchplayer", "playerinfo", "player"],
  categorie: "sports",
  reaction: "🔍",
  arg: ["text"]
}, async (dest, zk, commandOptions) => {
  const { ms, userJid, arg } = commandOptions;
  const searchPlayer = arg.join(" ").trim();

  if (!searchPlayer) {
    return repondre(zk, dest, ms, "Please specify a player name to search for.");
  }

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: `⏳ Searching for ${searchPlayer}...`,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Player Search",
          body: `Looking up ${searchPlayer} information...`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/player/thumb/football.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(searchPlayer)}`);
    const data = response.data;

    if (!data.player || data.player.length === 0) {
      return repondre(zk, dest, ms, `No player found with name "${searchPlayer}". Try a different name.`);
    }

    // Filter for soccer players only and sort by relevance
    const soccerPlayers = data.player
      .filter(p => p.strSport === "Soccer")
      .sort((a, b) => parseFloat(b.relevance) - parseFloat(a.relevance));

    if (soccerPlayers.length === 0) {
      return repondre(zk, dest, ms, `No football players found with name "${searchPlayer}".`);
    }

    const player = soccerPlayers[0]; // Get most relevant soccer player

    // Format the player data
    let message = `*🔍 ${player.strPlayer}*\n`;
    message += `⚽ *Position:* ${player.strPosition || 'N/A'}\n`;
    message += `🏴 *Nationality:* ${player.strNationality || 'N/A'}\n`;
    message += `🏟️ *Team:* ${player.strTeam || 'N/A'}\n`;
    message += `🎂 *Born:* ${player.dateBorn ? new Date(player.dateBorn).toLocaleDateString() : 'N/A'}\n`;
    message += `📊 *Status:* ${player.strStatus || 'N/A'}\n\n`;

    // Add player image if available
    let imageUrl = null;
    if (player.strCutout) {
      imageUrl = player.strCutout;
    } else if (player.strThumb) {
      imageUrl = player.strThumb;
    }

    // Send the formatted message
    const messageOptions = {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: `${player.strPlayer} Info`,
          body: `${player.strTeam || 'Professional Footballer'}`,
          thumbnailUrl: imageUrl || "https://www.thesportsdb.com/images/media/player/thumb/football.png",
          mediaType: 1
        }
      }
    };

    await zk.sendMessage(dest, messageOptions, { quoted: ms });

    // If there are more results, mention them
    if (soccerPlayers.length > 1) {
      const otherPlayers = soccerPlayers.slice(1, 4).map(p => `- ${p.strPlayer} (${p.strTeam})`).join('\n');
      const moreText = soccerPlayers.length > 4 ? `and ${soccerPlayers.length - 4} more...` : '';
      
      await zk.sendMessage(dest, {
        text: `*Other players found:*\n${otherPlayers}\n${moreText}\n\nUse a more specific name for better results.`,
        contextInfo: { mentionedJid: [userJid] }
      }, { quoted: ms });
    }

  } catch (error) {
    console.error('Player Search command error:', error);
    repondre(zk, dest, ms, `Failed to search for player: ${error.message}`);
  }
});
// Team Search Command
keith({
  nomCom: "teamsearch",
  aliases: ["searchteam", "clubinfo", "team"],
  categorie: "sports",
  reaction: "🔍",
  arg: ["text"]  // Add arg to context
}, async (dest, zk, commandOptions) => {
  const { ms, userJid, arg } = commandOptions;
  const searchteam = arg.join(" ").trim();

  if (!searchteam) {
    return repondre(zk, dest, ms, "Please specify a team name to search for.");
  }

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: `⏳ Searching for ${searchteam}...`,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Team Search",
          body: `Looking up ${searchteam} information...`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/team/search/qwertyuiop.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from API
    const response = await axios.get(`https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(searchteam)}`);
    const data = response.data;

    if (!data.teams || data.teams.length === 0) {
      return repondre(zk, dest, ms, `No team found with name "${searchteam}". Try a different name.`);
    }

    const team = data.teams[0]; // Get first result

    // Format the team data
    let message = `*🔍 ${team.strTeam} (${team.strTeamShort})*\n`;
    message += `🏟️ *Stadium:* ${team.strStadium} (Capacity: ${team.intStadiumCapacity || 'N/A'})\n`;
    message += `📍 *Location:* ${team.strLocation || 'N/A'}\n`;
    message += `📅 *Founded:* ${team.intFormedYear || 'N/A'}\n`;
    message += `🏆 *League:* ${team.strLeague || 'N/A'}\n`;
    message += `🔗 *Website:* ${team.strWebsite || 'N/A'}\n\n`;
    
    // Add social media links if available
    if (team.strFacebook || team.strTwitter || team.strInstagram) {
      message += `*Social Media:*\n`;
      if (team.strFacebook) message += `- Facebook: ${team.strFacebook}\n`;
      if (team.strTwitter) message += `- Twitter: ${team.strTwitter}\n`;
      if (team.strInstagram) message += `- Instagram: ${team.strInstagram}\n`;
      message += `\n`;
    }

    // Add description (trimmed to avoid message length issues)
    if (team.strDescriptionEN) {
      const maxDescriptionLength = 500;
      const description = team.strDescriptionEN.length > maxDescriptionLength 
        ? team.strDescriptionEN.substring(0, maxDescriptionLength) + '...' 
        : team.strDescriptionEN;
      message += `*About ${team.strTeam}:*\n${description}\n\n`;
    }

    // Add alternative names if available
    if (team.strTeamAlternate) {
      message += `*Also known as:* ${team.strTeamAlternate}\n`;
    }

    message += `\n_Data provided by TheSportsDB.com_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: `${team.strTeam} Information`,
          body: `${team.strLeague || 'Football Club'}`,
          thumbnailUrl: `https://www.thesportsdb.com/images/media/team/badge/${team.strTeam.toLowerCase().replace(/ /g, '-')}.png`,
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Team Search command error:', error);
    repondre(zk, dest, ms, `Failed to search for team: ${error.message}`);
  }
});
