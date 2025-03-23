const axios = require("axios");
const {keith} = require("../keizzah/keith");
const traduire = require("../keizzah/traduction");
const { repondre, sendMessage } = require('../keizzah/context');
const {Sticker ,StickerTypes}= require('wa-sticker-formatter');
keith({
  nomCom: "google",
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms } = commandeOptions;

  if (!arg[0] || arg === "") {
    return repondre(zk, dest, ms, "Give me a query.\n*Example: .google What is a bot.*");
  }

  const google = require('google-it');
  try {
    const results = await google({ query: arg.join(" ") });
    let msg = `*Google search for*: ${arg}\n\n`;

    for (let result of results) {
      msg += `➣ *Title*: ${result.title}\n`;
      msg += `➣ *Description*: ${result.snippet}\n`;
      msg += `➣ *Link*: ${result.link}\n\n────────────────────────\n\n`;
    }

    await sendMessage(zk, dest, ms, {
      text: msg,
      contextInfo: {
        externalAdReply: {
          title: "Google Search",
          body: `Results for: ${arg.join(" ")}`,
          thumbnailUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });

  } catch (error) {
    console.error("Error during Google search:", error);
    await repondre(zk, dest, ms, "An error occurred during Google search.");
  }
});

keith({
  nomCom: "movie",
  categorie: "Search"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms } = commandeOptions;

  if (!arg[0] || arg === "") {
    return repondre(zk, dest, ms, "Give the name of a series or film.");
  }

  try {
    const response = await axios.get(`http://www.omdbapi.com/?apikey=742b2d09&t=${arg}&plot=full`);
    const imdbData = response.data;

    let imdbInfo = "⚍⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚍\n";
    imdbInfo += " ``` 𝕀𝕄𝔻𝔹 𝕊𝔼𝔸ℝℂℍ```\n";
    imdbInfo += "⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎⚎\n";
    imdbInfo += "🎬 *Title*: " + imdbData.Title + "\n";
    imdbInfo += "📅 *Year*: " + imdbData.Year + "\n";
    imdbInfo += "⭐ *Assessment*: " + imdbData.Rated + "\n";
    imdbInfo += "📆 *Release*: " + imdbData.Released + "\n";
    imdbInfo += "⏳ *Runtime*: " + imdbData.Runtime + "\n";
    imdbInfo += "🌀 *Genre*: " + imdbData.Genre + "\n";
    imdbInfo += "👨🏻‍💻 *Director*: " + imdbData.Director + "\n";
    imdbInfo += "✍ *Writers*: " + imdbData.Writer + "\n";
    imdbInfo += "👨 *Actors*: " + imdbData.Actors + "\n";
    imdbInfo += "📃 *Synopsis*: " + imdbData.Plot + "\n";
    imdbInfo += "🌐 *Language*: " + imdbData.Language + "\n";
    imdbInfo += "🌍 *Country*: " + imdbData.Country + "\n";
    imdbInfo += "🎖️ *Awards*: " + imdbData.Awards + "\n";
    imdbInfo += "📦 *BoxOffice*: " + imdbData.BoxOffice + "\n";
    imdbInfo += "🏙️ *Production*: " + imdbData.Production + "\n";
    imdbInfo += "🌟 *Score*: " + imdbData.imdbRating + "\n";
    imdbInfo += "❎ *IMDb Votes*: " + imdbData.imdbVotes + "";

    await sendMessage(zk, dest, ms, {
      image: { url: imdbData.Poster },
      caption: imdbInfo,
      contextInfo: {
        externalAdReply: {
          title: "IMDb Search",
          body: `Movie: ${imdbData.Title}`,
          thumbnailUrl: imdbData.Poster,
          sourceUrl: conf.GURL,
          mediaType: 1,
          showAdAttribution: true
        }
      }
    });

  } catch (error) {
    console.error("Error searching IMDb:", error);
    await repondre(zk, dest, ms, "An error occurred while searching IMDb.");
  }
});
keith({
  nomCom: "emomix",
  categorie: "Conversion"
}, async (dest, zk, commandeOptions) => {
  const { arg, repondre, ms } = commandeOptions;

  if (!arg[0] || arg.length !== 1) {
    return repondre(zk, dest, ms, "Incorrect use. Example: .emojimix 😀;🥰");
  }

  // Split the string into two emojis using a semicolon as the separator
  const emojis = arg.join(' ').split(';');

  if (emojis.length !== 2) {
    return repondre(zk, dest, ms, "Please specify two emojis using a ';' as a separator.");
  }

  const emoji1 = emojis[0].trim();
  const emoji2 = emojis[1].trim();

  try {
    const response = await axios.get(`https://levanter.onrender.com/emix?q=${emoji1}${emoji2}`);

    if (response.data.status === true) {
      // If the request is successful, send the resulting image as a sticker
      const stickerMess = new Sticker(response.data.result, {
        pack: "ALPHA-MD",
        type: StickerTypes.CROPPED,
        categories: ["🤩", "🎉"],
        id: "12345",
        quality: 70,
        background: "transparent",
      });
      const stickerBuffer2 = await stickerMess.toBuffer();
      await sendMessage(zk, dest, ms, { sticker: stickerBuffer2 });

    } else {
      await repondre(zk, dest, ms, "Unable to create emoji mix.");
    }
  } catch (error) {
    console.error("Error creating emoji mix:", error);
    await repondre(zk, dest, ms, "An error occurred while creating the emoji mix.");
  }
});
