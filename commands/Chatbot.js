const { keith } = require('../keizzah/keith');
const axios = require('axios');
const conf = require(__dirname + "/../set");

keith({
  nomCom: "movie",
  aliases: ["movies", "sinhalasub"],
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
      return repondre("No movies found with that name. Try a different search term.");
    }

    const movies = searchData.result.data.slice(0, 5); // Get top 5 results

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

    // Set up reply handler for movie selection
    const movieSelectionHandler = async (update) => {
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

        // Send loading reaction
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

        // Get movie details
        const movieUrl = `https://apis-keith.vercel.app/movie/sinhalasub/movie?url=${encodeURIComponent(selectedMovie.link)}`;
        const movieResponse = await axios.get(movieUrl);
        const movieData = movieResponse.data;

        if (!movieData.status || !movieData.result?.data) {
          return await zk.sendMessage(dest, {
            text: "Failed to get movie details. Please try another one.",
            quoted: messageContent
          });
        }

        const movieInfo = movieData.result.data;

        // Prepare quality options
        const qualityOptions = [];
        
        if (movieInfo.pixeldrain_dl?.length > 0) {
          qualityOptions.push(...movieInfo.pixeldrain_dl.map(q => ({...q, type: 'pixeldrain'})));
        }
        
        if (movieInfo.ddl_dl?.length > 0) {
          qualityOptions.push(...movieInfo.ddl_dl.map(q => ({...q, type: 'ddl'})));
        }
        
        if (movieInfo.meda_dl?.length > 0) {
          qualityOptions.push(...movieInfo.meda_dl.map(q => ({...q, type: 'mega'})));
        }

        if (qualityOptions.length === 0) {
          return await zk.sendMessage(dest, {
            text: "No download links available for this movie.",
            quoted: messageContent
          });
        }

        // Prepare quality selection message
        let qualityList = `*${movieInfo.title || selectedMovie.title}*\n\n`;
        qualityList += `📅 ${movieInfo.date || 'Unknown date'}\n`;
        qualityList += `🌍 ${movieInfo.country || 'Unknown country'}\n`;
        qualityList += `⭐ TMDB: ${movieInfo.tmdbRate || '?'}/10 | SinhalaSub: ${movieInfo.sinhalasubVote || '?'}/10\n\n`;
        qualityList += `*Available Qualities:*\n`;
        qualityList += qualityOptions.map((q, i) => 
          `${i+1}. ${q.quality} (${q.size}) [${q.type.toUpperCase()}]`
        ).join('\n');
        qualityList += '\n\nReply with the number of the quality you want to download';

        // Send quality options
        const qualityMessage = await zk.sendMessage(dest, {
          text: qualityList,
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

        // Set up reply handler for quality selection
        const qualitySelectionHandler = async (update) => {
          try {
            const qualityContent = update.messages[0];
            if (!qualityContent.message) return;

            // Check if this is a reply to our quality selection
            const isQualityReply = qualityContent.message.extendedTextMessage?.contextInfo?.stanzaId === qualityMessageId;
            if (!isQualityReply) return;

            const qualityResponse = qualityContent.message.conversation || 
                                  qualityContent.message.extendedTextMessage?.text;

            // Validate response
            const selectedQualityIndex = parseInt(qualityResponse) - 1;
            if (isNaN(selectedQualityIndex) || selectedQualityIndex < 0 || selectedQualityIndex >= qualityOptions.length) {
              return await zk.sendMessage(dest, {
                text: `Please reply with a number between 1-${qualityOptions.length}.`,
                quoted: qualityContent
              });
            }

            const selectedQuality = qualityOptions[selectedQualityIndex];

            // Send loading reaction
            await zk.sendMessage(dest, {
              react: { text: '⏳', key: qualityContent.key },
            });

            // Send the download link
            await zk.sendMessage(dest, {
              text: `*${movieInfo.title || selectedMovie.title}*\n\n` +
                    `📦 *Quality:* ${selectedQuality.quality}\n` +
                    `📏 *Size:* ${selectedQuality.size}\n` +
                    `🔗 *Download Link:* ${selectedQuality.link}\n\n` +
                    `*Note:* This link will expire after some time. Download soon!`,
              contextInfo: {
                externalAdReply: {
                  showAdAttribution: true,
                  title: movieInfo.title || selectedMovie.title,
                  body: `${selectedQuality.quality} | ${selectedQuality.size}`,
                  thumbnailUrl: movieInfo.image || conf.URL || '',
                  sourceUrl: conf.GURL || '',
                  mediaType: 1,
                  renderLargerThumbnail: true
                }
              }
            }, { quoted: qualityContent });

            // Remove both handlers after successful selection
            zk.ev.off("messages.upsert", movieSelectionHandler);
            zk.ev.off("messages.upsert", qualitySelectionHandler);

          } catch (error) {
            console.error("Error handling quality selection:", error);
            await zk.sendMessage(dest, {
              text: "An error occurred while processing your request. Please try again.",
              quoted: qualityContent
            });
          }
        };

        // Add event listener for quality replies
        zk.ev.on("messages.upsert", qualitySelectionHandler);

        // Remove listener after 5 minutes to prevent memory leaks
        setTimeout(() => {
          zk.ev.off("messages.upsert", qualitySelectionHandler);
        }, 300000);

        // Remove the movie selection handler since we're now handling quality
        zk.ev.off("messages.upsert", movieSelectionHandler);

      } catch (error) {
        console.error("Error handling movie download:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    // Add event listener for movie selection replies
    zk.ev.on("messages.upsert", movieSelectionHandler);

    // Remove listener after 5 minutes to prevent memory leaks
    setTimeout(() => {
      zk.ev.off("messages.upsert", movieSelectionHandler);
    }, 300000);

  } catch (error) {
    console.error("Movie search error:", error);
    repondre(`Failed to search for movies. Error: ${error.message}`);
  }
});
