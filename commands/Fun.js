const { keith } = require('../keizzah/keith');
const axios = require('axios');
const conf = require(__dirname + "/../set");
const { dare, truth, random_question, amount_of_questions } = require('../database/truth-dare.js');
const { repondre, sendMessage } = require('../keizzah/context');

// Quran Command
keith({
  nomCom: "quran",
  aliases: ["surah", "qurann"],
  reaction: '🤲',
  categorie: "search"
}, async (dest, zk, commandeOptions) => {
  const { arg, ms } = commandeOptions;
  const reference = arg.join(" ");
  
  if (!reference) {
    return repondre(zk, dest, ms, "Please specify the surah number or name.", {
      contextInfo: {
        externalAdReply: {
          title: "Surah Reference Required",
          body: "Please specify the surah number or name.",
          thumbnailUrl: conf.URL, 
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    });
  }
  
  try {
    const response = await axios.get(`https://quran-endpoint.vercel.app/quran/${reference}`);
    
    if (response.data.status !== 200) {
      return repondre(zk, dest, ms, "Invalid surah reference. Please specify a valid surah number or name.", {
        contextInfo: {
          externalAdReply: {
            title: "Invalid Surah Reference",
            body: "Please specify a valid surah number or name.",
            thumbnailUrl: conf.URL,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true,
          },
        },
      });
    }
    
    const data = response.data.data;
    const messageText = `
ᬑ * QURAN SURAH* ᬒ

*🕌 Quran: The Holy Book*
📜 Surah ${data.number}: ${data.asma.ar.long} (${data.asma.en.long})
Type: ${data.type.en}
Number of verses: ${data.ayahCount}
🔮 *Explanation (Urdu):* ${data.tafsir.id}
🔮 *Explanation (English):* ${data.tafsir.en}
╭────────────────◆
│ *_Powered by ${conf.OWNER_NAME}*
╰─────────────────◆ `;
    
    await sendMessage(zk, dest, ms, {
      text: messageText,
      contextInfo: {
        externalAdReply: {
          title: " QURAN SURAH",
          body: `We're reading: ${data.asma.en.long}`,
          mediaType: 1,
          thumbnailUrl: conf.URL, 
          sourceUrl: conf.GURL,
          showAdAttribution: true, 
        },
      },
    });
    
  } catch (error) {
    console.error("Error fetching Quran passage:", error);
    await repondre(zk, dest, ms, "API request failed. Please try again later.", {
      contextInfo: {
        externalAdReply: {
          title: "Error Fetching Quran Passage",
          body: "Please try again later.",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true,
        },
      },
    });
  }
});

// Currency Command
keith({
  nomCom: "currency",
  aliases: ["💲", "💵"],
  categorie: "trade",
  reaction: '🛄',
}, async (dest, zk, context) => {
  const { arg, ms } = context;
  const text = arg.join(" ");

  // Check if the text is empty or invalid
  if (!text) {
    return repondre(zk, dest, ms, 'Example usage: currency 100 USD to EUR');
  }

  // Extract amount, fromCurrency, and toCurrency from the text
  const [amount, fromCurrency, toCurrency] = text.split(" ");

  if (!amount || !fromCurrency || !toCurrency) {
    return repondre(zk, dest, ms, 'Example usage: currency 100 USD to EUR');
  }

  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    try {
      // Build the request URL
      const url = `https://api.davidcyriltech.my.id/tools/convert?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`;

      // Fetch conversion data using axios
      const response = await axios.get(url);
      const data = response.data;

      // Check if the response is successful
      if (data && data.success) {
        return data.result;
      } else {
        throw new Error('Failed to retrieve conversion data.');
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      return 'Something went wrong. Unable to fetch conversion data.';
    }
  };

  // Convert the currency and send the result
  const result = await convertCurrency(amount, fromCurrency, toCurrency);
  await repondre(zk, dest, ms, result);
});

// Advice Command
keith({
  nomCom: "advice",
  aliases: ["wisdom", "wise"],
  reaction: "🗨️",
  desc: "to pass wisdom",
  categorie: "Fun"
}, async (dest, zk, context) => {
  const { ms } = context;
  try {
    // Get advice from the API using axios
    const response = await axios.get("https://api.adviceslip.com/advice");
    const advice = response.data.slip.advice;

    // Send the advice with ad reply
    await sendMessage(zk, dest, ms, {
      text: `Here is your advice: ${advice} 😊`,
      contextInfo: {
        externalAdReply: {
          title: "Daily Dose of Advice",
          body: "Here’s a little nugget of wisdom to brighten your day!",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });
  } catch (error) {
    console.error("Error fetching advice:", error.message || "An error occurred");
    await repondre(zk, dest, ms, "Oops, an error occurred while processing your request.");
  }
});

// Trivia Command
keith({
  nomCom: "trivia",
  reaction: '🤔',
  desc: 'to show trivia questions',
  categorie: 'Fun'
}, async (dest, zk, context) => {
  const { ms } = context;
  try {
    // Fetch trivia question using axios
    const response = await axios.get("https://opentdb.com/api.php?amount=1&type=multiple");
    if (response.status !== 200) {
      return repondre(zk, dest, ms, "Invalid response from the trivia API. Status code: " + response.status);
    }

    const trivia = response.data.results[0];
    const question = trivia.question;
    const correctAnswer = trivia.correct_answer;
    const answers = [...trivia.incorrect_answers, correctAnswer].sort();

    // Format answer choices
    const answerChoices = answers.map((answer, index) => `${index + 1}. ${answer}`).join("\n");

    // Send trivia question with answer choices
    await sendMessage(zk, dest, ms, {
      text: `Here's a trivia question for you: \n\n${question}\n\n${answerChoices}\n\nI will send the correct answer in 10 seconds...`,
      contextInfo: {
        externalAdReply: {
          title: "Trivia Time!",
          body: "Challenge yourself with this fun trivia question!",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });

    // Send the correct answer after 10 seconds
    setTimeout(async () => {
      await sendMessage(zk, dest, ms, {
        text: `The correct answer is: ${correctAnswer}`,
        contextInfo: {
          externalAdReply: {
            title: "Trivia Answer Revealed",
            body: "Did you get it right? Try another trivia question!",
            thumbnailUrl: conf.URL,
            sourceUrl: conf.GURL,
            mediaType: 1,
            showAdAttribution: true
          }
        }
      });
    }, 10000); // Delay for 10 seconds

  } catch (error) {
    console.error("Error getting trivia:", error.message);
    await repondre(zk, dest, ms, "Error getting trivia. Please try again later.");
  }
});

// Question Command
keith({
  nomCom: "question",
  categorie: "fun",
  desc: "to ask random questions",
  reaction: "👄"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  try {
    // Respond with a random question
    await sendMessage(zk, dest, ms, {
      text: random_question(),
      contextInfo: {
        externalAdReply: {
          title: "Random Question",
          body: "Here's a fun random question for you to ponder!",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });
  } catch (error) {
    console.error("Error while handling 'question' command:", error);
    await repondre(zk, dest, ms, "Sorry, something went wrong.");
  }
});

// Truth Command
keith({
  nomCom: "truth",
  categorie: "fun",
  desc: "this is a truth game",
  reaction: "👄"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  try {
    // Respond with a truth question
    await sendMessage(zk, dest, ms, {
      text: truth(),
      contextInfo: {
        externalAdReply: {
          title: "Truth Question",
          body: "Here's a truth question to test your honesty!",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });
  } catch (error) {
    console.error("Error while handling 'truth' command:", error);
    await repondre(zk, dest, ms, "Sorry, something went wrong.");
  }
});

// Dare Command
keith({
  nomCom: "dare",
  categorie: "fun",
  desc: "this is a dare game",
  reaction: "👄"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  try {
    // Respond with a dare
    await sendMessage(zk, dest, ms, {
      text: dare(),
      contextInfo: {
        externalAdReply: {
          title: "Dare Challenge",
          body: "Here's a dare to challenge your bravery!",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });
  } catch (error) {
    console.error("Error while handling 'dare' command:", error);
    await repondre(zk, dest, ms, "Sorry, something went wrong.");
  }
});

// Amount Quiz Command
keith({
  nomCom: "amountquiz",
  categorie: "fun",
  desc: "a game of amount quiz",
  reaction: "👄"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  try {
    // Call amount_of_questions with the desired type, defaulting to 0 (all questions)
    const totalQuestions = amount_of_questions(0);  // Change 0 to 1 or 2 depending on the desired category
    await sendMessage(zk, dest, ms, {
      text: `${totalQuestions}`,
      contextInfo: {
        externalAdReply: {
          title: "Question Count",
          body: "Here's the total number of questions available!",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });
  } catch (error) {
    console.error("Error while handling 'amountquiz' command:", error);
    await repondre(zk, dest, ms, "Sorry, something went wrong.");
  }
});

// Fact Command
keith({
  nomCom: "fact",
  reaction: '✌️',
  desc: "to show some random facts",
  categorie: "Fun"
}, async (dest, zk, context) => {
  const { ms } = context;

  try {
    const response = await axios.get("https://nekos.life/api/v2/fact");
    const data = response.data;
    const factMessage = `
┏━━━━ *ALPHA-FACT* ━━━━━◆                     
┃
┃   *◇* ${data.fact} 
┃
┃   *◇* Regards *ALPHA MD*
┃      
 ╭────────────────◆
 │ *_Powered by keithkeizzah._*
 ╰─────────────────◆
    `;

    await sendMessage(zk, dest, ms, {
      text: factMessage,
      contextInfo: {
        externalAdReply: {
          title: "Fun Fact",
          body: "Here's a fun fact to enlighten your day!",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });
  } catch (error) {
    console.error(error);
    await repondre(zk, dest, ms, "An error occurred while fetching the fact.");
  }
});

// Quotes Command
keith({
  nomCom: "quotes",
  reaction: '🗿',
  desc: "to show some random quotes",
  categorie: "Fun"
}, async (dest, zk, context) => {
  const { ms } = context;

  try {
    const response = await axios.get("https://favqs.com/api/qotd");
    const data = response.data;
    const quoteMessage = `
┏━━━━━QUOTE━━━━━━◆
┃   *◇* _${data.quote.body}_
┃  
┃   *◇* *AUTHOR:* ${data.quote.author}
┃      
┃    *◇*  *regards ALPHA MD*
┃    
╭────────────────◆
│ *_Powered by keithkeizzah._*
╰─────────────────◆
    `;

    await sendMessage(zk, dest, ms, {
      text: quoteMessage,
      contextInfo: {
        externalAdReply: {
          title: "Daily Quote",
          body: "Here's an inspiring quote to motivate you!",
          thumbnailUrl: conf.URL,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });
  } catch (error) {
    console.error(error);
    await repondre(zk, dest, ms, "An error occurred while fetching the quote.");
  }
});

// Hack Command
keith({
  nomCom: "hack",
  aliases: ["malware", "trojan"],
  desc: "a hack fun",
  reaction: "🪅",
  categorie: "Fun"
}, async (dest, zk, commandeOptions) => {
  try {
    const { ms } = commandeOptions;
    const mek = ms; // The message object for quoting

    // Define the steps of the prank
    const steps = [
      "```Injecting Malware```",
      "``` █ 10%```",
      "```█ █ 20%```",
      "```█ █ █ 30%```",
      "``` █ █ █ █ 40%```",
      "``` █ █ █ █ █ 50%```",
      "``` █ █ █ █ █ █ 60%```",
      "``` █ █ █ █ █ █ █ 70%```",
      "```█ █ █ █ █ █ █ █ 80%```",
      "```█ █ █ █ █ █ █ █ █ 90%```",
      "```█ █ █ █ █ █ █ █ █ █ 100%```",
      "```System hijacking on process..```",
      "```Connecting to Server error to find 404```",
      "```Device successfully connected...\nReceiving data...```",
      "```Data hijacked from device 100% completed\nKilling all evidence, killing all malwares...```",
      "```HACKING COMPLETED```",
      "```SENDING LOG DOCUMENTS...```",
      "```SUCCESSFULLY SENT DATA AND Connection disconnected```",
      "```BACKLOGS CLEARED```",
      "```POWERED BY ${conf.BOT}```",
      "```paralyzed by the mighty ${conf.OWNER_NAME}```"
    ];

    // Loop through all the steps and send them
    for (const line of steps) {
      await zk.sendMessage(dest, { text: line }, { quoted: mek });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for effect
    }

  } catch (error) {
    console.error('Error during prank:', error);
    // Send a more detailed error message
    await zk.sendMessage(dest, {
      text: `❌ *Error!* Something went wrong. Reason: ${error.message}. Please try again later.`
    });
  }
});


keith({
  nomCom: "happy",
  categorie: "fun",
  desc: "happy fun",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  
  try {
    const sentMessage = await zk.sendMessage(dest, { text: "✊🏻 *STARTED...* 💦" });
    const animations =  ['😃', '😄', '😁', '😊', '😎', '🥳', '😸', '😹', '🌞', '🌈', '😃', '😄', '😁', '😊', '😎', '🥳', '😸', '😹', '🌞', '🌈', '😃', '😄', '😁', '😊'];
    for (const animation of animations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await zk.relayMessage(dest, {
        protocolMessage: {
          key: sentMessage.key,
          type: 14, // Protocol message type for edited message
          editedMessage: {
            conversation: animation
          }
        }
      }, {});
    }
  } catch (error) {
    console.log(error);
    repondre("❌ *Error!* " + error.message);
  }
});
keith({
  nomCom: "hrt",
  aliases: ["moyo", "heart"],
  categorie: "fun",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  
  try {
    const sentMessage = await zk.sendMessage(dest, { text: "✊🏻 *STARTED...* 💦" });
    const animations =  ['💖', '💗', '💕', '❤️', '💛', '💚', '🫀', '💙', '💜', '🖤', '♥️', '🤍', '🤎', '💗', '💞', '💓', '💘', '💝', '♥️', '💟', '🫀', '❤️'];
    for (const animation of animations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await zk.relayMessage(dest, {
        protocolMessage: {
          key: sentMessage.key,
          type: 14, // Protocol message type for edited message
          editedMessage: {
            conversation: animation
          }
        }
      }, {});
    }
  } catch (error) {
    console.log(error);
    repondre("❌ *Error!* " + error.message);
  }
});
keith({
  nomCom: "angry",
  categorie: "fun",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  
  try {
    const sentMessage = await zk.sendMessage(dest, { text: "✊🏻 *STARTED...* 💦" });
    const animations =   ['😡', '😠', '🤬', '😤', '😾', '😡', '😠', '🤬', '😤', '😾'];
    for (const animation of animations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await zk.relayMessage(dest, {
        protocolMessage: {
          key: sentMessage.key,
          type: 14, // Protocol message type for edited message
          editedMessage: {
            conversation: animation
          }
        }
      }, {});
    }
  } catch (error) {
    console.log(error);
    repondre("❌ *Error!* " + error.message);
  }
});
keith({
  nomCom: "sad",
  aliases: ["heartbroken", "hrtbroken"],
  categorie: "fun",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  
  try {
    const sentMessage = await zk.sendMessage(dest, { text: "✊🏻 *STARTED...* 💦" });
    const animations =  ['🥺', '😟', '😕', '😖', '😫', '🙁', '😩', '😥', '😓', '😪', '😢', '😔', '😞', '😭', '💔', '😭', '😿'];
    for (const animation of animations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await zk.relayMessage(dest, {
        protocolMessage: {
          key: sentMessage.key,
          type: 14, // Protocol message type for edited message
          editedMessage: {
            conversation: animation
          }
        }
      }, {});
    }
  } catch (error) {
    console.log(error);
    repondre("❌ *Error!* " + error.message);
  }
});
keith({
  nomCom: "shy",
  aliases: ["shyoff", "shyy"],
  categorie: "fun",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  
  try {
    const sentMessage = await zk.sendMessage(dest, { text: "✊🏻 *STARTED...* 💦" });
    const animations =  ['😳', '😊', '😶', '🙈', '🙊', '😳', '😊', '😶', '🙈', '🙊'];
    for (const animation of animations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await zk.relayMessage(dest, {
        protocolMessage: {
          key: sentMessage.key,
          type: 14, // Protocol message type for edited message
          editedMessage: {
            conversation: animation
          }
        }
      }, {});
    }
  } catch (error) {
    console.log(error);
    repondre("❌ *Error!* " + error.message);
  }
});
keith({
  nomCom: "moon",
  aliases: ["mon", "crescent"],
  categorie: "fun",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  
  try {
    const sentMessage = await zk.sendMessage(dest, { text: "✊🏻 *STARTED...* 💦" });
    const animations =   ['🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', "🌚🌝"];
    for (const animation of animations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await zk.relayMessage(dest, {
        protocolMessage: {
          key: sentMessage.key,
          type: 14, // Protocol message type for edited message
          editedMessage: {
            conversation: animation
          }
        }
      }, {});
    }
  } catch (error) {
    console.log(error);
    repondre("❌ *Error!* " + error.message);
  }
});

keith({
  nomCom: "nikal",
  categorie: "fun",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;
  
  try {
    const sentMessage = await zk.sendMessage(dest, { text: "✊🏻 *STARTED...* 💦" });
    const animations = ["   ⣠⣶⡾⠏⠉⠙⠳⢦⡀   ⢠⠞⠉⠙⠲⡀ \n  ⣴⠿⠏          ⢳⡀ ⡏         ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀ ⣀⡀   ⣧ ⢸          ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Nikal   ⡇\n ⣟⣿⡭     ⢱        ⣿  ⢹           ⡇\n  ⠙⢿⣯⠄   __        ⡿  ⡇        ⡼\n   ⠹⣶⠆     ⡴⠃    ⠘⠤⣄⣠⠞ \n    ⢸⣷⡦⢤⡤⢤⣞⣁          \n ⢀⣤⣴⣿⣏⠁  ⠸⣏⢯⣷⣖⣦⡀      \n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿      \n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏    ⣄⢸      `", "   ⣠⣶⡾⠏⠉⠙⠳⢦⡀   ⢠⠞⠉⠙⠲⡀ \n  ⣴⠿⠏          ⢳⡀ ⡏         ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀ ⣀⡀   ⣧ ⢸          ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲     ⣿  ⣸   Lavde   ⡇\n ⣟⣿⡭     ⢱        ⣿  ⢹           ⡇\n  ⠙⢿⣯⠄  |__|     ⡿  ⡇        ⡼\n   ⠹⣶⠆     ⡴⠃    ⠘⠤⣄⣠⠞ \n    ⢸⣷⡦⢤⡤⢤⣞⣁          \n ⢀⣤⣴⣿⣏⠁  ⠸⣏⢯⣷⣖⣦⡀      \n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿      \n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏    ⣄⢸      `", "   ⣠⣶⡾⠏⠉⠙⠳⢦⡀   ⢠⠞⠉⠙⠲⡀ \n  ⣴⠿⠏           ⢳⡀ ⡏         ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀ ⣀⡀   ⣧ ⢸          ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸   Pehli   ⡇\n ⣟⣿⡭     ⢱       ⣿  ⢹            ⡇\n  ⠙⢿⣯⠄  (P)       ⡿  ⡇        ⡼\n   ⠹⣶⠆     ⡴⠃    ⠘⠤⣄⣠⠞ \n    ⢸⣷⡦⢤⡤⢤⣞⣁          \n ⢀⣤⣴⣿⣏⠁  ⠸⣏⢯⣷⣖⣦⡀      \n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿      \n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏    ⣄⢸      `", "   ⣠⣶⡾⠏⠉⠙⠳⢦⡀   ⢠⠞⠉⠙⠲⡀ \n  ⣴⠿⠏           ⢳⡀ ⡏         ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀ ⣀⡀   ⣧ ⢸          ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Fursat  ⡇\n ⣟⣿⡭     ⢱         ⣿  ⢹           ⡇\n  ⠙⢿⣯⠄   __        ⡿  ⡇        ⡼\n   ⠹⣶⠆     ⡴⠃    ⠘⠤⣄⣠⠞ \n    ⢸⣷⡦⢤⡤⢤⣞⣁          \n ⢀⣤⣴⣿⣏⠁  ⠸⣏⢯⣷⣖⣦⡀      \n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿      \n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏    ⣄⢸      `", "   ⣠⣶⡾⠏⠉⠙⠳⢦⡀   ⢠⠞⠉⠙⠲⡀ \n  ⣴⠿⠏           ⢳⡀ ⡏         ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀ ⣀⡀   ⣧ ⢸          ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲    ⣿  ⣸  Meeee   ⡇\n ⣟⣿⡭     ⢱         ⣿  ⢹           ⡇\n  ⠙⢿⣯⠄  |__|      ⡿  ⡇        ⡼\n   ⠹⣶⠆     ⡴⠃    ⠘⠤⣄⣠⠞ \n    ⢸⣷⡦⢤⡤⢤⣞⣁          \n ⢀⣤⣴⣿⣏⠁  ⠸⣏⢯⣷⣖⣦⡀      \n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿      \n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏    ⣄⢸      `", "   ⣠⣶⡾⠏⠉⠙⠳⢦⡀   ⢠⠞⠉⠙⠲⡀ \n  ⣴⠿⠏           ⢳⡀ ⡏         ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀ ⣀⡀   ⣧ ⢸           ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲   ⣿  ⣸   Nikal   ⡇\n ⣟⣿⡭     ⢱        ⣿  ⢹            ⡇\n  ⠙⢿⣯⠄  lodu     ⡿  ⡇       ⡼\n   ⠹⣶⠆       ⡴⠃    ⠘⠤⣄⣠⠞ \n    ⢸⣷⡦⢤⡤⢤⣞⣁          \n ⢀⣤⣴⣿⣏⠁  ⠸⣏⢯⣷⣖⣦⡀      \n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿      \n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏    ⣄⢸ "];

    for (const animation of animations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await zk.relayMessage(dest, {
        protocolMessage: {
          key: sentMessage.key,
          type: 14, // Protocol message type for edited message
          editedMessage: {
            conversation: animation
          }
        }
      }, {});
    }
  } catch (error) {
    console.log(error);
    repondre(zk, dest, ms, "❌ *Error!* " + error.message);
  }
});

keith({
  nomCom: "hand",
  categorie: "fun",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { repondre, ms } = commandeOptions;
  
  try {
    const sentMessage = await zk.sendMessage(dest, { text: "✊🏻 *STARTED...* 💦" });
    const animations = [
      '8✊️===D', '8=✊️==D', '8==✊️=D', '8===✊️D', '8==✊️=D', '8=✊️==D', 
      '8✊️===D', '8=✊️==D', '8==✊️=D', '8===✊️D', '8==✊️=D', '8=✊️==D', 
      '8✊️===D', '8=✊️==D', '8==✊️=D', '8===✊️D', '8==✊️=D', '8=✊️==D', 
      '8✊️===D', '8=✊️==D', '8==✊️=D', '8===✊️D 💦', '8==✊️=D💦 💦', '8=✊️==D 💦💦 💦'
    ];

    for (const animation of animations) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await zk.relayMessage(dest, {
        protocolMessage: {
          key: sentMessage.key,
          type: 14, // Protocol message type for edited message
          editedMessage: {
            conversation: animation
          }
        }
      }, {});
    }
  } catch (error) {
    console.log(error);
    repondre("❌ *Error!* " + error.message);
  }
});
keith({
  nomCom: "insult",
  aliases: ["abuse", "tusi"],
  categorie: "search",
  reaction: "📽️"
}, async (dest, zk, commandeOptions) => {
  const { ms } = commandeOptions;

  try {
    const response = await axios.get('https://evilinsult.com/generate_insult.php?lang=en&type=json');
    const data = response.data;

    if (!data || !data.insult) {
      return repondre(zk, dest, ms, 'Unable to retrieve an insult. Please try again later.');
    }

    const insult = data.insult;
    return repondre(zk, dest, ms, `*Insult:* ${insult}`);
  } catch (error) {
    repondre(zk, dest, ms, `Error: ${error.message || error}`);
  }
});
