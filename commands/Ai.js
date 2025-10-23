const { keith } = require("../keizzah/keith");
//const ai = require('unlimited-ai');
const { repondre, sendMessage } = require('../keizzah/context');
const axios = require('axios');
const wiki = require('wikipedia');
const conf = require(__dirname + "/../set");
//========================================================================================================================
keith({
  nomCom: "technews",
  reaction: '📰',
  categorie: 'search'
}, async (dest, zk, context) => {
  const { ms } = context;

  try {
    // Fetching tech news from the API
    const response = await axios.get("https://fantox001-scrappy-api.vercel.app/technews/random");
    const data = response.data;
    const { thumbnail, news } = data;

    await sendMessage(zk, dest, ms, {
      text: news,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD TECH NEWS",
          body: "keep learning", 
          thumbnailUrl: thumbnail, 
          sourceUrl: conf.GURL, 
          mediaType: 1,
          showAdAttribution: true, 
        },
      },
    }, { quoted: ms });

  } catch (error) {
    console.error("Error fetching tech news:", error);
    await repondre(zk, dest, ms, "Sorry, there was an error retrieving the news. Please try again later.\n" + error.message);
  }
});
//========================================================================================================================
keith({
  nomCom: "bible",
  reaction: '🎎',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { arg, ms } = commandeOptions;
  const reference = arg.join(" ");
  
  if (!reference) {
    return repondre(zk, dest, ms, "Please specify the book, chapter, and verse you want to read. Example: bible john 3:16", {
      contextInfo: {
        externalAdReply: {
          title: "Bible Reference Required",
          body: "Please provide a book, chapter, and verse.",
          thumbnailUrl: "https://files.catbox.moe/zt9ie6.jpg", // Replace with a suitable thumbnail URL
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    });
  }
  
  try {
    const response = await axios.get(`https://bible-api.com/${reference}`);
    
    if (!response.data) {
      return repondre(zk, dest, ms, "Invalid reference. Example: bible john 3:16", {
        contextInfo: {
          externalAdReply: {
            title: "Invalid Bible Reference",
            body: "Please provide a valid book, chapter, and verse.",
            thumbnailUrl: "https://files.catbox.moe/zt9ie6.jpg", // Replace with a suitable thumbnail URL
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    }
    
    const data = response.data;
    const messageText = `
ᬑ *ALPHA HOLY BIBLE* ᬒ

⧭ *_WE'RE READING:_* ${data.reference}

⧭ *_NUMBER OF VERSES:_* ${data.verses.length}

⧭ *_NOW READ:_* ${data.text}

⧭ *_LANGUAGE:_* ${data.translation_name}
╭────────────────◆
│ *_Powered by ${conf.OWNER_NAME}*
╰─────────────────◆ `;
    
    await sendMessage(zk, dest, ms, {
      text: messageText,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD HOLY BIBLE",
          body: `We're reading: ${data.reference}`,
          mediaType: 1,
          thumbnailUrl: "https://files.catbox.moe/zt9ie6.jpg", 
          sourceUrl: conf.GURL,
          showAdAttribution: true, 
        },
      },
    });

  } catch (error) {
    console.error("Error fetching Bible passage:", error);
    await repondre(zk, dest, ms, "An error occurred while fetching the Bible passage. Please try again later.\n" + error.message);
  }
});
//========================================================================================================================


keith({
  nomCom: "dictionary",
  aliases: ["dict", "define", "meaning", "word"],
  categorie: "Search",
  reaction: "📚"
}, async (dest, zk, commandeOptions) => {
  const { ms, arg } = commandeOptions;

  // Validate input
  if (!arg || !arg[0]) {
    return repondre(zk, dest, ms, 'Please provide a word to define!\nExample: .dictionary hello');
  }

  const word = arg.join(' ').trim();
  
  try {
    // Fetch dictionary data and image in parallel
    const [dictResponse, imageResponse] = await Promise.all([
      axios.get(`https://apiskeith.vercel.app/education/dictionary?q=${encodeURIComponent(word)}`),
      axios.get(`https://apiskeith.vercel.app/search/images?query=${encodeURIComponent(word)}`)
    ]);

    const dictData = dictResponse.data;
    const imageData = imageResponse.data;

    if (!dictData.status || !dictData.result) {
      return repondre(zk, dest, ms, `No definitions found for "${word}"`);
    }

    const result = dictData.result;
    const phonetics = result.phonetics || [];
    const meanings = result.meanings || [];
    let imageUrl = 'https://i.imgur.com/DYJWpgI.jpeg'; // Default dictionary image

    // Use first image from search if available
    if (imageData.status && imageData.result && imageData.result.length > 0) {
      imageUrl = imageData.result[0].url;
    }

    // Prepare common contextInfo
    const commonContextInfo = {
      externalAdReply: {
        showAdAttribution: true,
        title: `${conf.BOT || 'Dictionary Bot'}`,
        body: `Definition of ${result.word}`,
        thumbnailUrl: imageUrl,
        sourceUrl: conf.GURL || '',
        mediaType: 1,
        renderLargerThumbnail: false
      }
    };

    // Build pronunciation section
    let pronunciationText = '';
    if (phonetics.length > 0) {
      pronunciationText += `*Pronunciations:*\n`;
      phonetics.forEach((ph, index) => {
        pronunciationText += `${index + 1}. ${ph.text || 'No phonetic'}\n`;
      });
      pronunciationText += `\n`;
    }

    // Build meanings section
    let meaningsText = '';
    meanings.forEach(meaning => {
      meaningsText += `*${meaning.partOfSpeech}*\n`;
      
      // Add definitions (limit to 5)
      const defs = meaning.definitions.slice(0, 5);
      defs.forEach((def, i) => {
        meaningsText += `  ${i + 1}. ${def.definition}\n`;
      });
      
      // Add synonyms if available
      if (meaning.synonyms.length > 0) {
        meaningsText += `  *Synonyms:* ${meaning.synonyms.slice(0, 5).join(', ')}\n`;
      }
      
      // Add antonyms if available
      if (meaning.antonyms.length > 0) {
        meaningsText += `  *Antonyms:* ${meaning.antonyms.slice(0, 5).join(', ')}\n`;
      }
      
      meaningsText += `\n`;
    });

    // Build source section
    let sourceText = '';
    if (result.sourceUrls && result.sourceUrls.length > 0) {
      sourceText += `*Source:* ${result.sourceUrls[0]}\n\n`;
    }

    // Prepare main caption
    const mainCaption = `
*📖 ${result.word.toUpperCase()} Dictionary 📖*
${pronunciationText}
${meaningsText}
${sourceText}
*Reply with:*
1️⃣ - For first pronunciation audio
2️⃣ - For second pronunciation audio
`.trim();

    // Send the initial message with image
    const message = await zk.sendMessage(dest, {
      image: { url: imageUrl },
      caption: mainCaption,
      contextInfo: commonContextInfo
    }, { quoted: ms });

    const messageId = message.key.id;

    // Set up reply handler for audio requests
    const replyHandler = async (update) => {
      try {
        const messageContent = update.messages[0];
        if (!messageContent.message) return;

        // Check if this is a reply to our initial message
        const isReply = messageContent.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;
        if (!isReply) return;

        const responseText = messageContent.message.conversation || 
                           messageContent.message.extendedTextMessage?.text;

        // Validate response
        if (!['1', '2', '1️⃣', '2️⃣'].includes(responseText)) {
          return await zk.sendMessage(dest, {
            text: "Invalid option. Please reply with 1 or 2 for pronunciation audio.",
            quoted: messageContent
          });
        }

        // Determine which audio to send
        const audioIndex = ['1', '1️⃣'].includes(responseText) ? 0 : 1;
        
        if (phonetics[audioIndex]?.audio) {
          await zk.sendMessage(dest, {
            audio: { url: phonetics[audioIndex].audio },
            mimetype: "audio/mpeg",
            contextInfo: commonContextInfo
          }, { quoted: messageContent });
        } else {
          await zk.sendMessage(dest, {
            text: "Sorry, the requested pronunciation audio is not available.",
            quoted: messageContent
          });
        }

      } catch (error) {
        console.error("Error handling reply:", error);
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
    console.error("Dictionary error:", error);
    repondre(zk, dest, ms, `Failed to fetch definition. Error: ${error.message}\nPlease try again later.`);
  }
});
//========================================================================================================================
keith({
  nomCom: "code",
  aliases: ["session", "pair", "paircode", "qrcode"],
  reaction: '🚀',
  categorie: 'system'
}, async (dest, zk, commandeOptions) => {
  const { arg, ms } = commandeOptions;

  if (!arg || arg.length === 0) {
    const replyText = "Example Usage: .code 2541111xxxxx.";
    return repondre(zk, dest, ms, replyText);
  }

  try {
    // Notify user that pairing is in progress
    const replyText = "*Wait Alpha Md is getting your pair code 💧✅...*";
    await repondre(zk, dest, ms, replyText);

    // Prepare the API request
    const encodedNumber = encodeURIComponent(arg.join(" "));
    const apiUrl = `https://alphapair2.onrender.com/code?number=${encodedNumber}`;

    // Fetch the pairing code from the API
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data && data.code) {
      const pairingCode = data.code;
      await sendMessage(zk, dest, ms, {
        text: pairingCode,
        contextInfo: {
          externalAdReply: {
            title: "ALPHA-MD PAIR CODE",
            body: "Here is your pairing code:",
            mediaType: 1,
            thumbnailUrl: conf.URL, 
            sourceUrl: conf.GURL,
            showAdAttribution: true, 
          },
        },
      });

      const secondReplyText = "Here is your pair code, copy and paste it to the notification above or link devices.";
      await repondre(zk, dest, ms, secondReplyText);
    } else {
      throw new Error("Invalid response from API.");
    }
  } catch (error) {
    console.error("Error getting API response:", error.message);
    const replyText = "Error getting response from API.";
    repondre(zk, dest, ms, replyText);
  }
});
//========================================================================================================================
keith({
  nomCom: "element",
  reaction: '📓',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { arg, ms } = commandeOptions;
  const elementQuery = arg.join(" ").trim();

  if (!elementQuery) {
    return repondre(zk, dest, ms, "Please provide an element symbol or name.");
  }

  try {
    const response = await axios.get(`https://api.popcat.xyz/periodic-table?element=${elementQuery}`);
    
    if (!response.data) {
      return repondre(zk, dest, ms, "Could not find information for the provided element. Please check the symbol or name.");
    }

    const data = response.data;
    const thumb = data.image; // Assuming the API returns an 'image' property for the element thumbnail

    const formattedMessage = `
*Alpha Md Element Information:*
🚀 *Name:* ${data.name}
🚀 *Symbol:* ${data.symbol}
🚀 *Atomic Number:* ${data.atomic_number}
🚀 *Atomic Mass:* ${data.atomic_mass}
🚀 *Period:* ${data.period}
🚀 *Phase:* ${data.phase}
🚀 *Discovered By:* ${data.discovered_by}
🚀 *Summary:* ${data.summary}
   
Regards ${conf.BOT} `;

    await sendMessage(zk, dest, ms, {
      text: formattedMessage,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD ELEMENT INFORMATION",
          body: "Here is the information you requested:",
          mediaType: 1,
          thumbnailUrl: thumb,
          sourceUrl: conf.GURL,
          showAdAttribution: true, 
        },
      },
    });

  } catch (error) {
    console.error("Error fetching the element data:", error);
    repondre(zk, dest, ms, "An error occurred while fetching the element data. Please try again later.");
  }
});
//========================================================================================================================
keith({
  nomCom: "github",
  aliases: ["git"],
  reaction: '💻',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { arg, ms } = commandeOptions;
  const githubUsername = arg.join(" ");

  if (!githubUsername) {
    return repondre(zk, dest, ms, "Give me a valid GitHub username like: github keithkeizzah");
  }

  try {
    const response = await axios.get(`https://api.github.com/users/${githubUsername}`);
    const data = response.data;

    if (data.message === "Not Found") {
      return repondre(zk, dest, ms, `User ${githubUsername} not found.`);
    }

    const thumb = data.avatar_url; // Using the avatar_url as the thumbnail

    const githubMessage = `
°GITHUB USER INFO°
🚩 Id: ${data.id}
🔖 Name: ${data.name}
🔖 Username: ${data.login}
✨ Bio: ${data.bio}
🏢 Company: ${data.company}
📍 Location: ${data.location}
📧 Email: ${data.email || "Not provided"}
📰 Blog: ${data.blog || "Not provided"}
🔓 Public Repos: ${data.public_repos}
🔐 Public Gists: ${data.public_gists}
👪 Followers: ${data.followers}
🫶 Following: ${data.following}
`;

    await sendMessage(zk, dest, ms, {
      text: githubMessage,
      contextInfo: {
        externalAdReply: {
          title: "ALPHA-MD GITHUB USER INFO",
          body: `Information about ${data.login}`,
          mediaType: 1,
          thumbnailUrl: thumb,
          sourceUrl: conf.GURL,
          showAdAttribution: true,
        },
      },
    });

  } catch (error) {
    console.error("Error fetching GitHub user data:", error);
    await repondre(zk, dest, ms, "An error occurred while fetching GitHub user data.");
  }
});
//========================================================================================================================
keith({
  nomCom: "tempmail",
  aliases: ['mail', 'temp'],
  reaction: '📧',
  categorie: "Utility"
}, async (dest, zk, context) => {
  const { prefix, ms } = context;

  try {
    const tempEmail = Math.random().toString(36).substring(2, 14) + "@1secmail.com";

    await sendMessage(zk, dest, ms, {
      text: `Your temporary email is: ${tempEmail}

You can use this email for temporary purposes. I will notify you if you receive any emails.`,
      contextInfo: {
        externalAdReply: {
          title: "Temporary Email Service",
          body: "Create temporary emails quickly and easily for privacy and security.",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });

    // Function to check for new emails
    const checkEmails = async () => {
      try {
        const response = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${tempEmail}&domain=1secmail.com`);
        const emails = response.data;

        if (emails.length > 0) {
          for (const email of emails) {
            const emailDetails = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${tempEmail}&domain=1secmail.com&id=${email.id}`);
            const emailData = emailDetails.data;
            const links = emailData.textBody.match(/(https?:\/\/[^\s]+)/g);
            const linksText = links ? links.join("\n") : "No links found in the email content.";

            await sendMessage(zk, dest, ms, {
              text: `You have received a new email!\n\nFrom: ${emailData.from}\nSubject: ${emailData.subject}\n\n${emailData.textBody}\nLinks found:\n${linksText}`,
              contextInfo: {
                externalAdReply: {
                  title: "Temporary Email Notification",
                  body: "You received a new email on your temporary inbox. Check it out now!",
                  thumbnailUrl: conf.URL,
                  sourceUrl: conf.GURL,
                  mediaType: 1,
                  showAdAttribution: true
                }
              }
            });
          }
        }
      } catch (error) {
        console.error("Error checking temporary email:", error.message);
      }
    };

    // Set an interval to check for new emails every 30 seconds
    const emailCheckInterval = setInterval(checkEmails, 30000);

    // End the email session after 10 minutes
    setTimeout(() => {
      clearInterval(emailCheckInterval);
      sendMessage(zk, dest, ms, {
        text: "Your temporary email session has ended. Please create a new temporary email if needed.",
        contextInfo: {
          externalAdReply: {
            title: "Temporary Email Session Ended",
            body: "Your temporary email session has ended. Need another one? Just ask!",
            thumbnailUrl: conf.URL,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }, 600000); // 10 minutes in milliseconds

  } catch (error) {
    console.error("Error generating temporary email:", error.message);
    await repondre(zk, dest, ms, "Error generating temporary email. Please try again later.", {
      contextInfo: {
        externalAdReply: {
          title: "Temporary Email Error",
          body: "There was an issue generating your temporary email. Please try again later.",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });
  }
});
//========================================================================================================================
  
keith({
  nomCom: "wiki",
  aliases: ["wikipedia", "wikipeda"],
  reaction: '⚔️',
  categorie: "search"
}, async (dest, zk, context) => {
  const { repondre, arg, ms } = context;

  // Ensure that the search term is provided
  const text = arg.join(" ").trim(); 

  try {
    if (!text) return repondre(zk, dest, ms, `Provide the term to search,\nE.g What is JavaScript!`);
    
    // Fetch summary from Wikipedia
    const con = await wiki.summary(text);
    
    // Format the reply message
    const texa = `
*📚 Wikipedia Summary 📚*

🔍 *Title*: _${con.title}_

📝 *Description*: _${con.description}_

💬 *Summary*: _${con.extract}_

🔗 *URL*: ${con.content_urls.mobile.page}

> Powered by Alpha
    `;

    await sendMessage(zk, dest, ms, {
      text: texa,
      contextInfo: {
        externalAdReply: {
          title: "Wikipedia Search",
          body: `Summary for: ${con.title}`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/Wikipedia-logo.png",
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });

  } catch (err) {
    console.error(err);
    await repondre(zk, dest, ms, "Got 404. I did not find anything!");
  }
});
//========================================================================================================================


keith({
  nomCom: "lyrics",
  aliases: ["mistari", "lyric"],
  reaction: '⚔️',
  categorie: "search"
}, async (dest, zk, context) => {
  const { arg, ms } = context;
  const text = arg.join(" ").trim();

  if (!text) {
    return repondre(zk, dest, ms, "Please provide a song name.");
  }

  try {
    // Fetch lyrics from the new API
    const response = await axios.get(`https://apiskeith.vercel.app/search/lyrics?query=${encodeURIComponent(text)}`);
    const data = response.data;

    if (!data.status || !data.result || data.result.length === 0) {
      return repondre(zk, dest, ms, "No lyrics found for this song.");
    }

    // Get the first result (most relevant)
    const song = data.result[0];
    const { song: title, artist, lyrics, thumbnail } = song;

    const caption = `🎵 *Title*: ${title}\n🎤 *Artist*: ${artist}\n\n📜 *Lyrics*:\n${lyrics}`;

    try {
      // Fetch the thumbnail image
      const imageResponse = await axios.get(thumbnail, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, 'binary');

      // Send message with image and lyrics
      await zk.sendMessage(dest, {
        image: imageBuffer,
        caption: caption,
        contextInfo: {
          externalAdReply: {
            title: "🎶 Lyrics Search",
            body: `${title} - ${artist}`,
            thumbnailUrl: thumbnail,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      }, { quoted: ms });

    } catch (imageError) {
      console.error('Error fetching image:', imageError);
      // Fallback to text-only if image fails
      await repondre(zk, dest, ms, caption);
    }

  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return repondre(zk, dest, ms, "Failed to retrieve lyrics. Please try again later.");
  }
});

//========================================================================================================================
