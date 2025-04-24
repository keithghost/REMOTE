const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");


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
