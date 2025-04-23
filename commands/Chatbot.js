const { keith } = require('../keizzah/keith');
const axios = require('axios');
const conf = require(__dirname + "/../set");

keith({
  nomCom: "movie",
  aliases: ["sinhalamovie", "filmsub"],
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

    const movies = searchData.result.data.slice(0, 10); // Get top 10 results

    // Prepare search results list
    let resultsList = `*${conf.BOT || 'Movie Search Results'}*\n`;
    resultsList += `Search: "${query}"\n\n`;
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

    // Set up reply handler
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
            text: "Failed to fetch movie details. Please try another one.",
            quoted: messageContent
          });
        }

        const movieInfo = movieData.result.data;

        // Prepare quality options
        let qualityOptions = `*${movieInfo.title || selectedMovie.title}*\n\n`;
        qualityOptions += `📅 ${movieInfo.date || 'Unknown'} | 🌍 ${movieInfo.country || 'Unknown'}\n`;
        qualityOptions += `⭐ TMDB: ${movieInfo.tmdbRate || 'N/A'} | SinhalaSub: ${movieInfo.sinhalasubVote || 'N/A'}\n`;
        qualityOptions += `🎭 ${movieInfo.category?.join(', ') || 'Unknown'}\n\n`;
        qualityOptions += `*Available Qualities:*\n\n`;

        // Add pixel drain options if available
        if (movieInfo.pixeldrain_dl?.length > 0) {
          qualityOptions += `*PixelDrain Links:*\n`;
          movieInfo.pixeldrain_dl.forEach((quality, index) => {
            qualityOptions += `${index+1}. ${quality.quality} (${quality.size})\n`;
          });
          qualityOptions += '\n';
        }

        // Add DDL options if available
        if (movieInfo.ddl_dl?.length > 0) {
          qualityOptions += `*DDL Links:*\n`;
          movieInfo.ddl_dl.forEach((quality, index) => {
            const offset = movieInfo.pixeldrain_dl?.length || 0;
            qualityOptions += `${offset + index + 1}. ${quality.quality} (${quality.size})\n`;
          });
          qualityOptions += '\n';
        }

        // Add Mega options if available
        if (movieInfo.meda_dl?.length > 0) {
          qualityOptions += `*Mega Links:*\n`;
          const offset = (movieInfo.pixeldrain_dl?.length || 0) + (movieInfo.ddl_dl?.length || 0);
          movieInfo.meda_dl.forEach((quality, index) => {
            qualityOptions += `${offset + index + 1}. ${quality.quality} (${quality.size})\n`;
          });
        }

        qualityOptions += '\nReply with the number of the quality you want to download';

        // Send movie details with quality options
        await zk.sendMessage(dest, {
          image: { url: movieInfo.image || '' },
          caption: qualityOptions,
          contextInfo: {
            externalAdReply: {
              showAdAttribution: true,
              title: movieInfo.title || selectedMovie.title,
              body: `Available in ${(movieInfo.pixeldrain_dl?.length || 0) + (movieInfo.ddl_dl?.length || 0) + (movieInfo.meda_dl?.length || 0)} qualities`,
              thumbnailUrl: movieInfo.image || conf.URL || '',
              sourceUrl: conf.GURL || '',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: messageContent });

        // Store all download options in an array for easy access
        const allDownloads = [
          ...(movieInfo.pixeldrain_dl || []),
          ...(movieInfo.ddl_dl || []),
          ...(movieInfo.meda_dl || [])
        ];

        // Set up quality selection handler
        const qualityHandler = async (qualityUpdate) => {
          try {
            const qualityMessage = qualityUpdate.messages[0];
            if (!qualityMessage.message) return;

            // Check if this is a reply to our quality options
            const isQualityReply = qualityMessage.message.extendedTextMessage?.contextInfo?.stanzaId === messageContent.key.id;
            if (!isQualityReply) return;

            const qualityResponse = qualityMessage.message.conversation || 
                                  qualityMessage.message.extendedTextMessage?.text;

            // Validate quality selection
            const selectedQualityIndex = parseInt(qualityResponse) - 1;
            if (isNaN(selectedQualityIndex) || selectedQualityIndex < 0 || selectedQualityIndex >= allDownloads.length) {
              return await zk.sendMessage(dest, {
                text: `Please reply with a number between 1-${allDownloads.length}.`,
                quoted: qualityMessage
              });
            }

            const selectedQuality = allDownloads[selectedQualityIndex];

            // Send the download link
            await zk.sendMessage(dest, {
              text: `*${movieInfo.title || selectedMovie.title}*\n\n` +
                    `📦 *Quality:* ${selectedQuality.quality}\n` +
                    `📏 *Size:* ${selectedQuality.size}\n\n` +
                    `🔗 *Download Link:* ${selectedQuality.link}\n\n` +
                    `ℹ️ Copy this link and paste in your browser to download`,
              contextInfo: {
                externalAdReply: {
                  showAdAttribution: true,
                  title: `${selectedQuality.quality} Download`,
                  body: movieInfo.title || selectedMovie.title,
                  thumbnailUrl: movieInfo.image || conf.URL || '',
                  sourceUrl: conf.GURL || '',
                  mediaType: 1,
                  renderLargerThumbnail: true
                }
              }
            }, { quoted: qualityMessage });

            // Remove quality listener after successful selection
            zk.ev.off("messages.upsert", qualityHandler);

          } catch (error) {
            console.error("Error handling quality selection:", error);
            await zk.sendMessage(dest, {
              text: "An error occurred while processing your quality selection. Please try again.",
              quoted: messageContent
            });
          }
        };

        // Add event listener for quality selection
        zk.ev.on("messages.upsert", qualityHandler);

        // Remove quality listener after 5 minutes to prevent memory leaks
        setTimeout(() => {
          zk.ev.off("messages.upsert", qualityHandler);
        }, 300000);

        // Remove initial reply handler after successful movie selection
        zk.ev.off("messages.upsert", replyHandler);

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
    repondre(`Failed to process movie search. Error: ${error.message}`);
  }
});
