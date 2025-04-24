const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");

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
