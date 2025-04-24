
const { keith } = require("../keizzah/keith");
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
});
