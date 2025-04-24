const { keith } = require("../keizzah/keith");
const axios = require('axios');
const cheerio = require('cheerio');
const { repondre } = require(__dirname + "/../keizzah/context");

// Soccer Odds Command
keith({
  nomCom: "odds",
  aliases: ["footballodds", "matchodds", "bettingodds"],
  categorie: "sports",
  reaction: "💰"
}, async (dest, zk, commandOptions) => {
  const { ms, userJid } = commandOptions;

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching latest soccer odds...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Soccer Odds",
          body: "Loading betting odds from top matches...",
          thumbnailUrl: "https://www.oddsportal.com/images/logo-oddsportal.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Scrape data from OddsPortal
    const url = 'https://www.oddsportal.com/matches/soccer/';
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const matches = [];
    $('.table-main tbody tr:not(.center)').each((i, row) => {
      const teams = $(row).find('.name').text().trim() || 'N/A';
      const oddsElements = $(row).find('.odds');
      const homeOdds = $(oddsElements[0]).text().trim() || 'N/A';
      const drawOdds = $(oddsElements[1]).text().trim() || 'N/A';
      const awayOdds = $(oddsElements[2]).text().trim() || 'N/A';
      
      if (teams !== 'N/A') {
        matches.push({
          teams,
          odds: {
            home: homeOdds,
            draw: drawOdds,
            away: awayOdds
          }
        });
      }
    });

    // Filter out invalid matches and limit to top 10
    const validMatches = matches.filter(match => 
      match.teams !== 'N/A' && 
      match.odds.home !== 'N/A' && 
      match.odds.draw !== 'N/A' && 
      match.odds.away !== 'N/A'
    ).slice(0, 10);

    if (validMatches.length === 0) {
      return repondre(zk, dest, ms, "No valid odds data available at the moment.");
    }

    // Format the odds data
    let message = `*⚽ Top Soccer Match Odds* 💰\n\n`;
    message += "```\n";  // Start monospace block for alignment
    
    // Table header
    message += "Match                      Home   Draw   Away\n";
    message += "--------------------------------------------\n";

    // Add each match's odds
    validMatches.forEach(match => {
      // Shorten long team names
      const shortenedMatch = match.teams.length > 25 
        ? match.teams.substring(0, 22) + '...' 
        : match.teams;
      
      message += `${shortenedMatch.padEnd(25)} `;
      message += `${match.odds.home.padEnd(6)} `;
      message += `${match.odds.draw.padEnd(6)} `;
      message += `${match.odds.away}\n`;
    });

    message += "```\n";  // End monospace block
    
    // Add disclaimer
    message += "\n*Note:* Odds are subject to change. Always gamble responsibly.\n";
    message += `_Data sourced from OddsPortal | ${new Date().toLocaleString()}_`;

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "Soccer Betting Odds",
          body: "Latest odds from top matches",
          thumbnailUrl: "https://www.oddsportal.com/images/logo-oddsportal.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('Odds command error:', error);
    repondre(zk, dest, ms, `Failed to fetch odds: ${error.message}`);
  }
});

/*const { keith } = require("../keizzah/keith");
const axios = require('axios');
const cheerio = require('cheerio');
const { repondre } = require(__dirname + "/../keizzah/context");

// AEW Roster Command
keith({
  nomCom: "aewroster",
  aliases: ["aewwrestlers", "allelitewrestlers"],
  categorie: "sports",
  reaction: "🤼",
  arg: ["text"]
}, async (dest, zk, commandOptions) => {
  const { ms, userJid, arg } = commandOptions;
  const searchName = arg.join(" ").trim().toLowerCase();

  try {
    // Send initial loading message
    await zk.sendMessage(dest, {
      text: "⏳ Fetching AEW roster...",
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "AEW Roster",
          body: "Loading All Elite Wrestling roster...",
          thumbnailUrl: "https://www.allelitewrestling.com/images/aew-logo.png",
          mediaType: 1
        }
      }
    }, { quoted: ms });

    // Fetch and scrape data
    const url = 'https://www.allelitewrestling.com/aew-roster';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const wrestlers = [];

    // Extract wrestler data
    $('div.wrestler-card').each((i, element) => {
      const name = $(element).find('h3').text().trim() || 'N/A';
      const image = $(element).find('img').attr('src') || 'https://www.allelitewrestling.com/images/aew-logo.png';
      const bio = $(element).find('p').text().trim() || 'No bio available';

      wrestlers.push({ name, image, bio });
    });

    if (wrestlers.length === 0) {
      return repondre(zk, dest, ms, "No wrestlers found on the AEW roster page.");
    }

    // Filter if search term provided
    let filteredWrestlers = wrestlers;
    if (searchName) {
      filteredWrestlers = wrestlers.filter(w => 
        w.name.toLowerCase().includes(searchName)
      );
      
      if (filteredWrestlers.length === 0) {
        return repondre(zk, dest, ms, `No AEW wrestlers found matching "${searchName}".`);
      }
    }

    // Format the output
    let message = `*🤼 AEW Roster ${searchName ? `(Filter: ${searchName})` : ''}*\n\n`;
    message += `📊 Total Wrestlers: ${filteredWrestlers.length}\n\n`;

    // Show first 5 results (or all if filtered)
    const resultsToShow = searchName ? filteredWrestlers : filteredWrestlers.slice(0, 5);
    
    resultsToShow.forEach(wrestler => {
      message += `*${wrestler.name}*\n`;
      message += `${wrestler.bio}\n\n`;
    });

    if (!searchName && filteredWrestlers.length > 5) {
      message += `ℹ️ Showing 5 of ${filteredWrestlers.length} wrestlers. Use "!aewroster [name]" to search specific wrestlers.\n`;
    }

    message += `_Data scraped from allelitewrestling.com_`;

    // Get first wrestler image for thumbnail
    const thumbnail = resultsToShow[0]?.image || "https://www.allelitewrestling.com/images/aew-logo.png";

    // Send the formatted message
    await zk.sendMessage(dest, {
      text: message,
      contextInfo: {
        mentionedJid: [userJid],
        externalAdReply: {
          title: "AEW Wrestlers",
          body: `${filteredWrestlers.length} wrestlers found${searchName ? ` for "${searchName}"` : ''}`,
          thumbnailUrl: thumbnail,
          mediaType: 1
        }
      }
    }, { quoted: ms });

  } catch (error) {
    console.error('AEW Roster command error:', error);
    repondre(zk, dest, ms, `Failed to fetch AEW roster: ${error.message}`);
  }
});*/
