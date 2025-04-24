const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");

// Sports Leagues Command
keith({
  nomCom: "leagues",
  aliases: ["sportsleagues", "availableleagues", "listleagues"],
  categorie: "sports",
  reaction: "🏆"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching available sports leagues...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Sports Leagues",
          body: "Loading list of all leagues...",
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/banner/i6o0kh1549873472.jpg",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch data from TheSportsDB API
    const response = await axios.get('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
    const data = response.data;

    if (!data.leagues || data.leagues.length === 0) {
      return repondre(zk, dest, ms, "No league data available at the moment.");
    }

    // Filter only soccer leagues and sort alphabetically
    const soccerLeagues = data.leagues
      .filter(league => league.strSport === "Soccer")
      .sort((a, b) => a.strLeague.localeCompare(b.strLeague));

    // Format the leagues data
    let message = `*⚽ Available Soccer Leagues* 🏆\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Add each league
    soccerLeagues.forEach((league, index) => {
      const leagueName = league.strLeagueAlternate 
        ? `${league.strLeague} (${league.strLeagueAlternate})`
        : league.strLeague;
      
      message += `${(index + 1).toString().padStart(2, '0')}. ${leagueName}\n`;
    });

    message += "```\n";  // End monospace block
    
    // Add additional info
    message += `\nTotal: ${soccerLeagues.length} soccer leagues available\n`;
    message += `_Use !leagueinfo [league name] for details_\n`;
    message += `_Last updated: ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Available Soccer Leagues",
          body: "List of all professional soccer leagues",
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/banner/i6o0kh1549873472.jpg",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Leagues command error:', error);
    repondre(zk, dest, ms, `Failed to fetch leagues: ${error.message}`);
  }
});

// League Info Command
keith({
  nomCom: "leagueinfo",
  aliases: ["leaguedetails", "league"],
  categorie: "sports",
  reaction: "ℹ️"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, userJid } = commandOptions;

  if (!arg || arg.length < 3) {
    return repondre(zk, dest, ms, "Please specify a league name (at least 3 characters)");
  }

  try {
    await zk.sendMessage(dest, {
      text: `⏳ Searching for league: ${arg}`,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "League Search",
          body: "Looking up league information...",
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/banner/i6o0kh1549873472.jpg",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    const response = await axios.get('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php');
    const data = response.data;

    if (!data.leagues || data.leagues.length === 0) {
      return repondre(zk, dest, ms, "No league data available at the moment.");
    }

    // Find matching leagues (case insensitive)
    const searchTerm = arg.toLowerCase();
    const matchingLeagues = data.leagues.filter(league =>
      league.strSport === "Soccer" &&
      (league.strLeague.toLowerCase().includes(searchTerm) ||
      (league.strLeagueAlternate && league.strLeagueAlternate.toLowerCase().includes(searchTerm))
    );

    if (matchingLeagues.length === 0) {
      return repondre(zk, dest, ms, `No soccer leagues found matching "${arg}"`);
    }

    // Format the league info
    let message = `*ℹ️ League Information* ⚽\n\n`;
    
    matchingLeagues.slice(0, 3).forEach(league => { // Limit to top 3 results
      message += `*${league.strLeague}*\n`;
      if (league.strLeagueAlternate) {
        message += `Alternate Name: ${league.strLeagueAlternate}\n`;
      }
      message += `Sport: ${league.strSport}\n`;
      message += `ID: ${league.idLeague}\n\n`;
    });

    if (matchingLeagues.length > 3) {
      message += `_Showing 3 of ${matchingLeagues.length} matches. Try a more specific search._\n`;
    }

    message += `_Data provided by TheSportsDB | ${new Date().toLocaleString()}_`;

    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "League Information",
          body: `Details for ${matchingLeagues[0].strLeague}`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/banner/i6o0kh1549873472.jpg",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Leagueinfo command error:', error);
    repondre(zk, dest, ms, `Failed to fetch league info: ${error.message}`);
  }
});
