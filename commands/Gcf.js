const { keith } = require("../keizzah/keith");
const axios = require('axios');
const { repondre } = require(__dirname + "/../keizzah/context");

// Sports Leagues Command,,
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
    const { data } = await axios.get('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php', {
      timeout: 10000 // 10 seconds timeout
    });

    if (!data?.leagues?.length) {
      return repondre(zk, dest, ms, "⚠️ No league data available at the moment. Please try again later.");
    }

    // Filter and sort soccer leagues
    const soccerLeagues = data.leagues
      .filter(league => league.strSport === "Soccer" && league.strLeague !== "_No League")
      .sort((a, b) => a.strLeague.localeCompare(b.strLeague));

    if (!soccerLeagues.length) {
      return repondre(zk, dest, ms, "⚠️ No soccer leagues found in the database.");
    }

    // Format the leagues data
    let message = `*⚽ Available Soccer Leagues* 🏆\n\n`;
    message += "```\n"; // Monospace block for alignment
    
    // Add each league with proper numbering
    soccerLeagues.forEach((league, index) => {
      const displayName = league.strLeagueAlternate 
        ? `${league.strLeague} (${league.strLeagueAlternate.split(',')[0]})` // Take first alternate name if multiple
        : league.strLeague;
      message += `${(index + 1).toString().padStart(2, '0')}. ${displayName}\n`;
    });

    message += "```\n"; // End monospace block
    
    // Add metadata
    message += `\n📊 Total: ${soccerLeagues.length} professional soccer leagues\n`;
    message += `🔍 Use !leagueinfo [name] for details\n`;
    message += `🕒 Last updated: ${new Date().toLocaleString()}`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Available Soccer Leagues",
          body: `Showing ${soccerLeagues.length} leagues`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/banner/i6o0kh1549873472.jpg",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('❌ Leagues command error:', error);
    const errorMessage = error.response 
      ? "⚠️ The sports data service is currently unavailable."
      : error.request
      ? "⚠️ Request timed out. Please try again later."
      : "⚠️ Failed to process leagues request.";
    
    repondre(zk, dest, ms, errorMessage);
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

  if (!arg || arg.trim().length < 3) {
    return repondre(zk, dest, ms, "❌ Please specify a league name (at least 3 characters)\nExample: !leagueinfo premier league");
  }

  try {
    await zk.sendMessage(dest, {
      text: `🔍 Searching for league: ${arg}`,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "League Search",
          body: `Looking up "${arg}"...`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/banner/i6o0kh1549873472.jpg",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    const { data } = await axios.get('https://www.thesportsdb.com/api/v1/json/3/all_leagues.php', {
      timeout: 10000
    });

    if (!data?.leagues?.length) {
      return repondre(zk, dest, ms, "⚠️ No league data available at the moment.");
    }

    // Normalize search term and find matches
    const searchTerm = arg.trim().toLowerCase();
    const matchingLeagues = data.leagues.filter(league => {
      if (league.strSport !== "Soccer") return false;
      
      const primaryMatch = league.strLeague.toLowerCase().includes(searchTerm);
      const alternateMatch = league.strLeagueAlternate && 
        league.strLeagueAlternate.toLowerCase().includes(searchTerm);
      
      return primaryMatch || alternateMatch;
    });

    if (!matchingLeagues.length) {
      return repondre(zk, dest, ms, `⚠️ No soccer leagues found matching "${arg}"\nTry a different name or check !leagues for available options.`);
    }

    // Format the league info
    let message = `*ℹ️ League Information* ⚽\n\n`;
    const resultsToShow = matchingLeagues.slice(0, 3); // Limit to top 3 results
    
    resultsToShow.forEach((league, index) => {
      message += `*${index + 1}. ${league.strLeague}*\n`;
      if (league.strLeagueAlternate) {
        message += `📛 Alternate Names: ${league.strLeagueAlternate}\n`;
      }
      message += `⚽ Sport: ${league.strSport}\n`;
      message += `🆔 ID: ${league.idLeague}\n\n`;
    });

    if (matchingLeagues.length > 3) {
      message += `ℹ️ Showing top 3 of ${matchingLeagues.length} matches. Refine your search for better results.\n\n`;
    }

    message += `_Data provided by TheSportsDB | ${new Date().toLocaleString()}_`;

    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: `${resultsToShow[0].strLeague}`,
          body: `League information`,
          thumbnailUrl: "https://www.thesportsdb.com/images/media/league/banner/i6o0kh1549873472.jpg",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('❌ Leagueinfo command error:', error);
    const errorMsg = error.code === 'ECONNABORTED'
      ? "⚠️ Search timed out. Please try again with a more specific term."
      : "⚠️ Failed to fetch league information. Service may be unavailable.";
    
    repondre(zk, dest, ms, errorMsg);
  }
});
