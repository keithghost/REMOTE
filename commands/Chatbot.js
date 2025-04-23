const { keith } = require('../keizzah/keith');
const axios = require('axios');
const conf = require(__dirname + "/../set");

keith({
  nomCom: "zoom",
  aliases: ["zoommovie", "zmovie"],
  categorie: "Search",
  reaction: "🎬"
}, async (dest, zk, commandOptions) => {
  const { arg, ms, repondre } = commandOptions;

  if (!arg[0]) {
    return repondre("Please provide a movie name to search on Zoom.lk");
  }

  const query = arg.join(" ");

  try {
    const searchUrl = `https://apis-keith.vercel.app/movie/zoom/search?text=${encodeURIComponent(query)}`;
    const searchResponse = await axios.get(searchUrl);
    
    if (!searchResponse.data.status || !searchResponse.data.result.data.length) {
      return repondre('No movies found for the specified query.');
    }

    const movies = searchResponse.data.result.data;
    let searchResultsMessage = "🎬 *Zoom.lk Search Results*\n\n";
    movies.slice(0, 5).forEach((movie, index) => {
      searchResultsMessage += `${index + 1}. ${movie.title}\n`;
    });
    searchResultsMessage += "\nReply with the number of the movie you want to download.";

    await repondre(searchResultsMessage);

    const collected = await zk.awaitMessages(dest, {
      filter: (msg) => !msg.key.fromMe && msg.key.remoteJid === dest,
      max: 1,
      time: 60000
    });

    if (!collected || !collected.length) {
      return repondre("Selection timed out. Please try again.");
    }

    const selectedNumber = parseInt(collected[0].message.conversation);
    if (isNaN(selectedNumber)) {
      return repondre("Invalid selection. Please reply with a number.");
    }

    if (selectedNumber < 1 || selectedNumber > movies.length) {
      return repondre("Invalid selection number. Please try again.");
    }

    const selectedMovie = movies[selectedNumber - 1];
    const downloadUrl = `https://apis-keith.vercel.app/movie/zoom/movie?url=${encodeURIComponent(selectedMovie.link)}`;
    const downloadResponse = await axios.get(downloadUrl);
    
    if (!downloadResponse.data.status || !downloadResponse.data.result.data.dl_link) {
      return repondre('Failed to retrieve download link for the selected movie.');
    }

    const movieData = downloadResponse.data.result.data;
    const messagePayload = {
      document: { url: movieData.dl_link },
      mimetype: 'application/zip',
      fileName: `${movieData.title}.zip`,
      contextInfo: {
        externalAdReply: {
          title: movieData.title,
          body: `Size: ${movieData.size}\nViews: ${movieData.view}`,
          mediaType: 1,
          sourceUrl: conf.GURL,
          thumbnailUrl: "https://i.ibb.co/2qY7dY3/zoom-lk.jpg",
          renderLargerThumbnail: false,
          showAdAttribution: true,
        },
      },
    };

    await zk.sendMessage(dest, messagePayload, { quoted: ms });

  } catch (error) {
    console.error('Error during Zoom movie download process:', error);
    return repondre(`Download failed due to an error: ${error.message || error}`);
  }
});

keith({
  nomCom: "movie",
  aliases: ["movies", "sinhalasub"],
  categorie: "Download",
  reaction: "🎬"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms, arg } = commandeOptions;

  if (!arg || !arg[0]) {
    return repondre('Please provide a movie name to search!\nExample: .movie Avengers');
  }

  const query = arg.join(' ').trim();

  try {
    const searchUrl = `https://apis-keith.vercel.app/movie/sinhalasub/search?text=${encodeURIComponent(query)}`;
    const searchResponse = await axios.get(searchUrl);
    const searchData = searchResponse.data;

    if (!searchData.status || !searchData.result?.data || searchData.result.data.length === 0) {
      return repondre("No movies found with that name. Try a different search term.");
    }

    const movies = searchData.result.data.slice(0, 5);
    let resultsList = `*${conf.BOT || 'Movie Search Results'}*\n`;
    resultsList += `Query: "${query}"\n\n`;
    resultsList += movies.map((movie, index) => 
      `${index+1}. ${movie.title}`
    ).join('\n\n');
    resultsList += '\n\nReply with the number of the movie you want to download';

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

    const movieSelectionHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        const selectedIndex = parseInt(responseText) - 1;
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= movies.length) {
          return await zk.sendMessage(dest, {
            text: `Please reply with a number between 1-${movies.length}.`,
            quoted: messageContent
          });
        }

        const selectedMovie = movies[selectedIndex];
        await zk.sendMessage(dest, {
          react: { text: '⬇️', key: messageContent.key },
        });

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

        let qualityList = `*${movieInfo.title || selectedMovie.title}*\n\n`;
        qualityList += `📅 ${movieInfo.date || 'Unknown date'}\n`;
        qualityList += `🌍 ${movieInfo.country || 'Unknown country'}\n`;
        qualityList += `⭐ TMDB: ${movieInfo.tmdbRate || '?'}/10 | SinhalaSub: ${movieInfo.sinhalasubVote || '?'}/10\n\n`;
        qualityList += `*Available Qualities:*\n`;
        qualityList += qualityOptions.map((q, i) => 
          `${i+1}. ${q.quality} (${q.size}) [${q.type.toUpperCase()}]`
        ).join('\n');
        qualityList += '\n\nReply with the number of the quality you want to download';

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

        const qualitySelectionHandler = async (update) => {
          try {
            const qualityContent = update.messages[0];
            if (!qualityContent.message) return;

            const isQualityReply = qualityContent.message.extendedTextMessage?.contextInfo?.stanzaId === qualityMessageId;
            if (!isQualityReply) return;

            const qualityResponse = qualityContent.message.conversation || 
                                  qualityContent.message.extendedTextMessage?.text;

            const selectedQualityIndex = parseInt(qualityResponse) - 1;
            if (isNaN(selectedQualityIndex) || selectedQualityIndex < 0 || selectedQualityIndex >= qualityOptions.length) {
              return await zk.sendMessage(dest, {
                text: `Please reply with a number between 1-${qualityOptions.length}.`,
                quoted: qualityContent
              });
            }

            const selectedQuality = qualityOptions[selectedQualityIndex];
            await zk.sendMessage(dest, {
              react: { text: '⏳', key: qualityContent.key },
            });

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

        zk.ev.on("messages.upsert", qualitySelectionHandler);
        setTimeout(() => {
          zk.ev.off("messages.upsert", qualitySelectionHandler);
        }, 300000);

        zk.ev.off("messages.upsert", movieSelectionHandler);

      } catch (error) {
        console.error("Error handling movie download:", error);
        await zk.sendMessage(dest, {
          text: "An error occurred while processing your request. Please try again.",
          quoted: messageContent
        });
      }
    };

    zk.ev.on("messages.upsert", movieSelectionHandler);
    setTimeout(() => {
      zk.ev.off("messages.upsert", movieSelectionHandler);
    }, 300000);

  } catch (error) {
    console.error("Movie search error:", error);
    repondre(`Failed to search for movies. Error: ${error.message}`);
  }
});
