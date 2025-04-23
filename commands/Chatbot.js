const { keith } = require('../keizzah/keith');
const axios = require('axios');
const conf = require(__dirname + "/../set");

keith({
  nomCom: "movie",
  aliases: ["sinhalasub", "film", "cinema"],
  categorie: "Download",
  reaction: "🎬"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre('Please provide a movie name to search!\nExample: .movie Avengers');
  }

  const query = arg.join(' ').trim();

  try {
    // Search for movies
    const searchUrl = `https://apis-keith.vercel.app/movie/sinhalasub/search?text=${encodeURIComponent(query)}`;
    const searchResponse = await axios.get(searchUrl);
    const searchData = searchResponse.data;

    if (!searchData.status || !searchData.result?.data || searchData.result.data.length === 0) {
      return repondre("No movies found matching your search. Try a different query.");
    }

    const movies = searchData.result.data.slice(0, 10); // Get top 10 results

    // Prepare search results list
    let resultsList = `*${conf.BOT || 'Movie Search Results'}*\n`;
    resultsList += `Query: "${query}"\n\n`;
    resultsList += movies.map((movie, index) => 
      `${index+1}. ${movie.title}`
    ).join('\n\n');
    resultsList += '\n\nReply with the number of the movie you want to download';

    // Send search results
    const message = await zk.sendMessage(dest, {
      text: resultsList,
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: `${conf.BOT || 'Movie Search'}`,
          body: `Results for: ${query}`,
          thumbnailUrl: conf.URL || '',
          sourceUrl: conf.GURL || '',
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: ms });

    const messageId = message.key.id;

    // Set up reply handler for quality selection
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        // Check if this is a reply to our search results
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        // Validate response
        const selectedIndex = parseInt(responseText) - 1;
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= movies.length) {
          return await zk.sendMessage(dest, {
            text: `Please reply with a number between 1-${movies.length}.`,
            quoted: messageContent
          });
        }

        const selectedMovie = movies[selectedIndex];

        // Get movie details
        const movieUrl = `https://apis-keith.vercel.app/movie/sinhalasub/movie?url=${encodeURIComponent(selectedMovie.link)}`;
        const movieResponse = await axios.get(movieUrl);
        const movieData = movieResponse.data;

        if (!movieData.status || !movieData.result?.data) {
          return await zk.sendMessage(dest, {
            text: "Failed to fetch movie details. Please try another one.",
            quoted: messageContent
          });
        }

        const movieInfo = movieData.result.data;

        // Prepare quality options
        let qualityOptions = `*${movieInfo.title || selectedMovie.title}*\n\n`;
        qualityOptions += `📅 ${movieInfo.date || 'Unknown date'}\n`;
        qualityOptions += `🌍 ${movieInfo.country || 'Unknown country'}\n`;
        qualityOptions += `⭐ TMDB: ${movieInfo.tmdbRate || 'N/A'} | SinhalaSub: ${movieInfo.sinhalasubVote || 'N/A'}\n\n`;
        qualityOptions += `*Available Qualities:*\n\n`;

        // Add download options from all sources
        const allQualities = [
          ...(movieInfo.pixeldrain_dl || []).map(q => ({...q, source: 'PixelDrain'})),
          ...(movieInfo.ddl_dl || []).map(q => ({...q, source: 'DDL'})),
          ...(movieInfo.meda_dl || []).map(q => ({...q, source: 'MEGA'}))
        ];

        // Group by quality and show available sources
        const qualityGroups = {};
        allQualities.forEach(item => {
          if (!qualityGroups[item.quality]) {
            qualityGroups[item.quality] = [];
          }
          qualityGroups[item.quality].push(item);
        });

        Object.entries(qualityGroups).forEach(([quality, options], index) => {
          qualityOptions += `${index+1}. ${quality} (${options[0].size})\n`;
          options.forEach((opt, optIndex) => {
            qualityOptions += `   ${optIndex+1}) ${opt.source}\n`;
          });
          qualityOptions += '\n';
        });

        qualityOptions += '\nReply with the quality number and source (e.g., "1 1" for first quality from first source)';

        // Send quality options
        const qualityMessage = await zk.sendMessage(dest, {
          text: qualityOptions,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              title: movieInfo.title || selectedMovie.title,
              body: `Select quality for download`,
              thumbnailUrl: movieInfo.image || conf.URL || '',
              sourceUrl: conf.GURL || '',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: messageContent });

        const qualityMessageId = qualityMessage.key.id;

        // Set up quality selection handler
        const qualityHandler = async (update) => {
          try {
            const qualityContent = update.messages[0];
            if (!qualityContent.message) return;

            // Check if this is a reply to our quality selection
            const isQualityReply = qualityContent.message.extendedTextMessage?.contextInfo?.stanzaId === qualityMessageId;
            if (!isQualityReply) return;

            const qualityResponse = qualityContent.message.conversation || 
                                  qualityContent.message.extendedTextMessage?.text;

            // Parse quality and source selection
            const [qualityNum, sourceNum] = qualityResponse.trim().split(/\s+/).map(Number);
            const qualities = Object.entries(qualityGroups);
            
            if (isNaN(qualityNum) {
              return await zk.sendMessage(dest, {
                text: 'Please reply with numbers (e.g., "1 1" for first quality from first source)',
                quoted: qualityContent
              });
            }

            if (qualityNum < 1 || qualityNum > qualities.length) {
              return await zk.sendMessage(dest, {
                text: `Please select a quality between 1-${qualities.length}.`,
                quoted: qualityContent
              });
            }

            const selectedQuality = qualities[qualityNum - 1][1];
            const selectedSource = sourceNum ? (selectedQuality[sourceNum - 1] || selectedQuality[0]) : selectedQuality[0];

            // Send the download link
            await zk.sendMessage(dest, {
              text: `*${movieInfo.title || selectedMovie.title}*\n\n` +
                    `📦 Quality: ${selectedQuality[0].quality}\n` +
                    `💾 Size: ${selectedQuality[0].size}\n` +
                    `🔗 Source: ${selectedSource.source}\n\n` +
                    `Download Link: ${selectedSource.link}\n\n` +
                    `Enjoy your movie! 🍿`,
              contextInfo: {
                externalAdReply: {
                  showAdAttribution: true,
                  title: movieInfo.title || selectedMovie.title,
                  body: `${selectedQuality[0].quality} | ${selectedSource.source}`,
                  thumbnailUrl: movieInfo.image || conf.URL || '',
                  sourceUrl: conf.GURL || '',
                  mediaType: 1,
                  renderLargerThumbnail: true
                }
              }
            }, { quoted: qualityContent });

            // Remove listeners after successful selection
            zk.ev.off("messages.upsert", replyHandler);
            zk.ev.off("messages.upsert", qualityHandler);

          } catch (error) {
            console.error("Error handling quality selection:", error);
            await zk.sendMessage(dest, {
              text: "An error occurred while processing your selection. Please try again.",
              quoted: qualityContent
            });
          }
        };

        // Add event listener for quality selection
        zk.ev.on("messages.upsert", qualityHandler);

        // Remove listener after 5 minutes to prevent memory leaks
        setTimeout(() => {
          zk.ev.off("messages.upsert", qualityHandler);
        }, 300000);

      } catch (error) {
        console.error("Error handling movie download:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    // Add event listener for replies
    zk.ev.on("messages.upsert", replyHandler);

    // Remove listener after 5 minutes to prevent memory leaks
    setTimeout(() => {
      zk.ev.off("messages.upsert", replyHandler);
    }, 300000);

  } catch (error) {
    console.error("Movie search error:", error);
    repondre(`Failed to process movie request. Error: ${error.message}`);
  }
});
