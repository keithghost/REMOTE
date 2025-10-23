
const { keith } = require('../commandHandler');
const fetch = require('node-fetch');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { promisify } = require('util');
const gis = promisify(require('g-i-s'));
const axios = require('axios');
const translatte = require('translatte');
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const wiki = require('wikipedia');
const yts = require('yt-search');
//========================================================================================================================

const { generateWAMessageContent, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

keith({
    pattern: "image",
    alias: ["image2", "img"],
    desc: "Search and download images",
    category: "Download",
    react: "🐦",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;
        
        if (!text) return reply("Please provide a search term (e.g., .image4 dog)");

        // Fetch images from API
        const apiUrl = `https://apiskeith.vercel.app/search/images?query=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            return await reply(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.status || !data.result || data.result.length === 0) {
            return await reply("No images found for your search term");
        }

        // Limit to 8 images
        const images = data.result.slice(0, 8);
        let picked = [];

        // Download each image
        for (const image of images) {
            try {
                const res = await fetch(image.url);
                if (!res.ok) continue;
                const buffer = await res.buffer();
                picked.push({ buffer, directLink: image.url });
            } catch (e) {
                console.error(`Failed to download image: ${image.url}`, e);
            }
        }

        if (picked.length === 0) {
            return await reply("Failed to download any images. Please try again.");
        }

        // Generate carousel cards
        const carouselCards = await Promise.all(picked.map(async (item, index) => ({
            header: {
                title: `📸 Image ${index + 1}`,
                hasMediaAttachment: true,
                imageMessage: (await generateWAMessageContent({
                    image: item.buffer
                }, {
                    upload: client.waUploadToServer
                })).imageMessage
            },
            body: {
                text: `🔍 Search: ${text}`
            },
            footer: {
                text: "🔹 Scroll to see more images"
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "🌐 View Original",
                            url: item.directLink
                        })
                    }
                ]
            }
        })));

        // Generate the carousel message
        const carouselMessage = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        body: {
                            text: `🔍 Search Results for: ${text}`
                        },
                        footer: {
                            text: `📂 Found ${picked.length} images`
                        },
                        carouselMessage: {
                            cards: carouselCards
                        }
                    }
                }
            }
        }, {
            quoted: m
        });

        // Send the message
        await client.relayMessage(m.chat, carouselMessage.message, {
            messageId: carouselMessage.key.id
        });

    } catch (error) {
        console.error('Command error:', error);
        await context.reply('❌ An error occurred while processing your request!');
    }
});


//========================================================================================================================


keith({
    pattern: "ytsearch",
    alias: ["yts", "youtube"],
    desc: "Search YouTube videos using a query",
    category: "Search",
    react: "🔎",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, botname, reply } = context;

        if (!text) {
            return reply("📺 Please provide a media title to search.\n*Example:* ytsearch imagine dragons");
        }

        const { videos } = await yts(text);

        if (!videos?.length) {
            return reply("❌ No results found.");
        }

        let resultText = `🔍 *YouTube Search Results*\n\n`;
        videos.slice(0, 10).forEach((v, i) => {
            resultText += `${i + 1}. *${v.title}*\n⏱️ ${v.timestamp}\n🔗 ${v.url}\n\n`;
        });

        resultText += `*Powered by ${botname}*`;

        await client.sendMessage(m.chat, {
            image: { url: videos[0].thumbnail },
            caption: resultText
        }, { quoted: m });

    } catch (error) {
        console.error("YouTube Search Error:", error);
        context.reply(`❌ An error occurred while searching:\n${error.message}`);
    }
});




//========================================================================================================================


keith({
    pattern: "wiki",
    alias: ["wikipedia", "wikifind"],
    desc: "Fetch a Wikipedia summary for the given term",
    category: "Search",
    react: "📚",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        if (!text) {
            return reply("📝 Provide the term to search.\n*Example:* `wiki JavaScript`");
        }

        const result = await wiki.summary(text);

        if (!result?.extract) {
            return reply("📭 No matching article found. Try a simpler term.");
        }

        const message = `🌐 *Wikipedia Summary*\n\n` +
            `*📌 Title:* ${result.title || 'N/A'}\n` +
            `*📝 Description:* ${result.description || 'No short description'}\n\n` +
            `📖 *Summary:*\n${result.extract.trim()}\n\n` +
            `🔗 *URL:* ${result.content_urls?.mobile?.page}`;

        reply(message);

    } catch (err) {
        console.error("Wikipedia command error:", err);
        context.reply("❌ Could not fetch the article. Please try another topic.");
    }
});


//========================================================================================================================


keith({
    pattern: "stickersearch",
    alias: ["ssticker", "stickersrch"],
    desc: "Search for stickers and deliver them to the user's inbox",
    category: "Search",
    react: "💠",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, botname, reply } = context;

        if (!text) {
            return reply("🖼️ Provide a search term for the sticker!\n*Example:* `stickersearch happy cat`");
        }

        const tenorApiKey = "AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c";

        if (m.isGroup) {
            await reply("📥 To avoid group spam, I’ll send the stickers to your inbox.");
        }

        const tenorUrl = `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(text)}&key=${tenorApiKey}&client_key=my_project&limit=8&media_filter=gif`;
        const gifResponse = await axios.get(tenorUrl);
        const gifs = gifResponse.data.results;

        if (!gifs || gifs.length === 0) {
            return client.sendMessage(m.sender, { text: "❌ No results found for that keyword." });
        }

        for (const gifObj of gifs) {
            const gifUrl = gifObj.media_formats.gif.url;

            const sticker = new Sticker(gifUrl, {
                pack: botname,
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: "keith-sticker",
                quality: 70,
                background: "transparent"
            });

            const buffer = await sticker.toBuffer();
            await client.sendMessage(m.sender, { sticker: buffer }, { quoted: m });
        }

    } catch (error) {
        console.error("Sticker search error:", error);
        context.reply("❌ An error occurred while fetching stickers. Please try again.");
    }
});


//========================================================================================================================



keith({
    pattern: "quran",
    alias: ["surah", "tafsir"],
    desc: "Get a Surah summary and its tafsir in English",
    category: "Islamic",
    react: "🕌",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        if (!text) {
            return reply("❌ Please specify the surah number or name.\n*Example:* `quran 36` or `quran yasin`");
        }

        const apiUrl = `https://quran-endpoint.vercel.app/quran/${encodeURIComponent(text.trim())}`;
        const response = await axios.get(apiUrl);
        const data = response.data.data;

        if (!data?.asma) {
            return reply("⚠️ Surah not found. Please use a valid name or number.");
        }

        const tafsirTranslated = await translatte(data.tafsir.id, { to: 'en' });
        const translatedText = tafsirTranslated?.text || 'Translation unavailable.';

        const messageText = `
📖 *Qur'an Insight*
━━━━━━━━━━━━━━━━━━━
🕌 *Surah ${data.number}*: ${data.asma.ar.long} (${data.asma.en.long})
🔠 *Type:* ${data.type.en}
🔢 *Ayahs:* ${data.ayahCount}

📝 *Tafsir (Urdu):*
${data.tafsir.id}

🌐 *Tafsir (English):*
${translatedText}

🔍 Example: \`quran 112\` or \`quran ikhlas\`
        `.trim();

        reply(messageText);

    } catch (error) {
        console.error("Qur'an command error:", error);
        context.reply("❌ Unable to fetch Surah data. Try again later or check the Surah reference.");
    }
});


//========================================================================================================================


keith({
    pattern: "langcode",
    alias: ["languages", "langlist"],
    desc: "Provides a full list of language codes and their language names",
    category: "Reference",
    react: "🈶",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, sendMediaMessage } = context;

        const caption = `
🌍 *Language Code Reference*

en - English    es - Spanish    fr - French    de - German  
it - Italian    pt - Portuguese   ru - Russian    zh - Chinese  
ja - Japanese  ar - Arabic     ko - Korean     hi - Hindi  
bn - Bengali   pl - Polish      nl - Dutch     tr - Turkish  
sv - Swedish  no - Norwegian   fi - Finnish    da - Danish  
el - Greek    cs - Czech      ro - Romanian   hu - Hungarian  
he - Hebrew   th - Thai       vi - Vietnamese  id - Indonesian  
ms - Malay    ta - Tamil       te - Telugu    uk - Ukrainian  
sr - Serbian   hr - Croatian    sk - Slovak    lt - Lithuanian  
lv - Latvian   et - Estonian    sl - Slovenian   mk - Macedonian  
bg - Bulgarian is - Icelandic   mt - Maltese    af - Afrikaans  
sw - Swahili   ka - Georgian    am - Amharic    mr - Marathi  
pa - Punjabi   ur - Urdu       gu - Gujarati    ne - Nepali  
si - Sinhala   ky - Kyrgyz      mn - Mongolian   hy - Armenian  
sq - Albanian  bs - Bosnian     tl - Tagalog    la - Latin  
eo - Esperanto ga - Irish       cy - Welsh     qu - Quechua  
mi - Maori    zu - Zulu       xh - Xhosa     jw - Javanese  
kn - Kannada   ml - Malayalam   or - Odia     as - Assamese  
my - Burmese   lo - Lao        km - Khmer     ps - Pashto  
fa - Persian   yi - Yiddish

✨ *Tip:* Use this code in translation commands like \`translate en sw Hello\`

*Regards,* keithkeizzah
        `;

        await sendMediaMessage(client, m, {
            image: { url: "https://files.catbox.moe/yldsxj.jpg" },
            caption
        });

    } catch (error) {
        console.error("Langcode command error:", error);
        context.reply("❌ Failed to display the language code list. Please try again later.");
    }
});


//========================================================================================================================

keith({
    pattern: "imdb",
    alias: ["movie", "series"],
    desc: "Search for movie or TV show details from IMDb",
    category: "Search",
    react: "🎬",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, reply } = context;

        if (!text) {
            return reply("🎥 Provide a movie or series name.\n*Example:* imdb Interstellar");
        }

        const apiUrl = `http://www.omdbapi.com/?apikey=742b2d09&t=${encodeURIComponent(text)}&plot=full`;
        const { data } = await axios.get(apiUrl);

        if (!data?.Title) {
            return reply("❌ Could not find that title. Please check spelling.");
        }

        const imdbText =
`🎞️ *IMDB MOVIE SEARCH*

🎬 *Title:* ${data.Title}
📅 *Year:* ${data.Year}
⭐ *Rated:* ${data.Rated}
📆 *Released:* ${data.Released}
⏳ *Runtime:* ${data.Runtime}
🌀 *Genre:* ${data.Genre}
🎬 *Director:* ${data.Director}
✍️ *Writer:* ${data.Writer}
👥 *Actors:* ${data.Actors}
📃 *Plot:* ${data.Plot}
🌐 *Language:* ${data.Language}
🌍 *Country:* ${data.Country}
🏆 *Awards:* ${data.Awards}
💰 *Box Office:* ${data.BoxOffice || 'N/A'}
🏙️ *Production:* ${data.Production}
🌟 *IMDb Rating:* ${data.imdbRating}
📊 *IMDb Votes:* ${data.imdbVotes}`;

        await client.sendMessage(
            m.chat,
            {
                image: { url: data.Poster },
                caption: imdbText
            },
            { quoted: m }
        );

    } catch (error) {
        console.error("IMDb command error:", error);
        context.reply("❌ I couldn’t fetch that info. Please try again later.");
    }
});

//========================================================================================================================
keith({
    pattern: "elementlist",
    alias: ["elements", "ptable"],
    desc: "Display a complete list of chemical elements",
    category: "Search",
    react: "🔬",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, botname, author, sendReply, sendMediaMessage } = context;

        const image = {
            url: "https://files.catbox.moe/yldsxj.jpg"
        };

        const caption = `
${botname} 𝐄𝐋𝐄𝐌𝐄𝐍𝐓 𝐋𝐈𝐒𝐓

1. Hydrogen (H)        2. Helium (He)          3. Lithium (Li)
4. Beryllium (Be)      5. Boron (B)            6. Carbon (C)
7. Nitrogen (N)        8. Oxygen (O)           9. Fluorine (F)
10. Neon (Ne)         11. Sodium (Na)         12. Magnesium (Mg)
... up to 118. Oganesson (Og)

*Tip:* Use \`element gold\` or \`element Au\` for detailed atomic info.
*Regards,* ${author}
        `;

        await sendMediaMessage(client, m, {
            image,
            caption
        });

    } catch (error) {
        console.error("Element list command error:", error);
        await sendReply(client, m, '❌ Failed to load element list. Please try again later.');
    }
});


//========================================================================================================================

keith({
    pattern: "element",
    alias: ["chemical", "atom"],
    desc: "Search for a chemical element by name or symbol",
    category: "Search",
    react: "🧪",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply, sendMediaMessage, botname } = context;

        if (!text) {
            return sendReply(client, m, '🔬 Please provide an element name.\n*Example:* `element sodium`\n\nType *elementlist* to view all elements.');
        }

        const apiUrl = `https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error('Element not found');

        const data = await response.json();

        if (!data?.name) {
            return sendReply(client, m, '❌ Element not found. Try using its symbol or type *elementlist*.');
        }

        const {
            name, symbol, atomic_number,
            atomic_mass, period, phase,
            summary, image
        } = data;

        const caption = `⚛️ *${botname} ELEMENT DATA*\n\n` +
            `*Name:* ${name}\n` +
            `*Symbol:* ${symbol}\n` +
            `*Atomic Number:* ${atomic_number}\n` +
            `*Atomic Mass:* ${atomic_mass}\n` +
            `*Period:* ${period}\n` +
            `*Phase:* ${phase}\n\n` +
            `📝 *Summary:*\n${summary.trim()}\n\n` +
            `🔎 Type *elementlist* to see all elements.`;

        await sendMediaMessage(client, m, {
            image: { url: image },
            caption
        });

    } catch (error) {
        console.error("Element command error:", error);
        const message = error.message.includes('not found')
            ? '🔍 Element not found. Check the spelling or try using its chemical symbol.'
            : '⚠️ An error occurred while fetching element data.';
        context.reply(message);
    }
});

//========================================================================================================================


keith({
    pattern: "biblelist",
    alias: ["bbooks", "scripturebooks"],
    desc: "Get a list of all Bible books (Old & New Testament)",
    category: "Search",
    react: "📚",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, botname, author, sendMediaMessage } = context;

        const image = {
            url: "https://files.catbox.moe/yldsxj.jpg"
        };

        const caption = `
${botname} 𝐁𝐈𝐁𝐋𝐄 𝐁𝐎𝐎𝐊 𝐋𝐈𝐒𝐓

*Old Testament:*
1. Genesis     2. Exodus       3. Leviticus     4. Numbers      5. Deuteronomy
6. Joshua      7. Judges       8. Ruth          9. 1 Samuel     10. 2 Samuel
11. 1 Kings    12. 2 Kings     13. 1 Chronicles 14. 2 Chronicles 15. Ezra
16. Nehemiah   17. Esther      18. Job          19. Psalms      20. Proverbs
21. Ecclesiastes 22. Song of Solomon 23. Isaiah   24. Jeremiah   25. Lamentations
26. Ezekiel    27. Daniel      28. Hosea        29. Joel        30. Amos
31. Obadiah    32. Jonah       33. Micah        34. Nahum       35. Habakkuk
36. Zephaniah  37. Haggai      38. Zechariah    39. Malachi

*New Testament:*
1. Matthew     2. Mark         3. Luke          4. John         5. Acts
6. Romans      7. 1 Corinthians 8. 2 Corinthians 9. Galatians   10. Ephesians
11. Philippians 12. Colossians 13. 1 Thessalonians 14. 2 Thessalonians 15. 1 Timothy
16. 2 Timothy  17. Titus       18. Philemon     19. Hebrews     20. James
21. 1 Peter    22. 2 Peter     23. 1 John       24. 2 John      25. 3 John
26. Jude       27. Revelation

*✍️ Regards:* ${author}
        `;

        await sendMediaMessage(client, m, {
            image,
            caption
        });

    } catch (error) {
        console.error("Bible list command error:", error);
        context.reply("❌ Unable to fetch Bible book list. Please try again later.");
    }
});

//========================================================================================================================



//========================================================================================================================



keith({
    pattern: "bible",
    alias: ["verse", "scripture"],
    desc: "Fetch a Bible verse by reference (e.g. John 3:16)",
    category: "Search",
    react: "📖",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, sendReply, sendMediaMessage, botname } = context;

        if (!text) {
            return sendReply(client, m, '📖 Please specify the book, chapter, and verse.\n*Example:* bible john 3:16');
        }

        const reference = encodeURIComponent(text);
        const apiUrl = `https://bible-api.com/${reference}?translation=kjv`;

        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        if (!data?.reference || !data?.text) {
            throw new Error('Invalid scripture reference');
        }

        const bibleText = `📖 *${botname} Bible Engine*\n\n` +
            `📚 *Reference:* ${data.reference}\n` +
            `🗒️ *Verses:* ${data.verses?.length || '?'}\n` +
            `📘 *Translation:* ${data.translation_name || 'KJV'}\n\n` +
            `${data.text.trim()}`;

        await sendMediaMessage(client, m, { text: bibleText });
    } catch (error) {
        console.error("Bible command error:", error);
        const message = error.message.includes('Invalid')
            ? '❌ Invalid scripture reference. Try something like `bible John 3:16`'
            : '⛔ Error fetching Bible text. Please try again later.';
        context.reply(message);
    }
});

//========================================================================================================================
keith({
  pattern: "pair",
  alias: ["code", "linkcode"],
  desc: "Check if phone number is on WhatsApp and fetch pairing code",
  category: "Search",
  react: "🔗",
  filename: __filename
}, async (context) => {
  const { client, m: message, text: phoneNumber, sendReply } = context;

  try {
    if (!phoneNumber) {
      return sendReply(client, message, "❌ Please provide a valid phone number.");
    }

    const id = phoneNumber.includes('@s.whatsapp.net') ? phoneNumber : `${phoneNumber.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
    const [result] = await client.onWhatsApp(id);

    if (!result || !result.exists) {
      return sendReply(client, message, `❌ The number *${phoneNumber}* does not exist on WhatsApp.`);
    }

    const encodedPhoneNumber = encodeURIComponent(phoneNumber);
    const response = await fetch(`https://keithpair2.onrender.com/code?number=${encodedPhoneNumber}`);

    if (!response.ok) {
      return sendReply(client, message, "⚠️ Error fetching data from the API. Please try again later.");
    }

    const data = await response.json();
    if (!data || !data.code) {
      return sendReply(client, message, "❌ No pairing code found for this number.");
    }

    return sendReply(client, message, `\n\n\`${data.code}\``);

  } catch (error) {
    console.error("Error in pair command:", error);
    return sendReply(client, message, `❌ An unexpected error occurred:\n${error.message}`);
  }
});

keith({
    pattern: "lyrics",
    alias: ["lyric", "songtext"],
    desc: "Fetch lyrics for a song",
    category: "Search",
    react: "🎵",
    filename: __filename
}, async (context) => {
    try {
        const { client, m, text, botname, sendReply, sendMediaMessage } = context;

        if (!text) {
            return sendReply(client, m, "Please specify a song to search lyrics for. Example: *lyrics faded*");
        }

        // Fetch lyrics from API
        const apiUrl = `https://apiskeith.vercel.app/search/lyrics?query=${encodeURIComponent(text)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result || data.result.length === 0) {
            return sendReply(client, m, "No lyrics found for this song. Try a different query.");
        }

        // Select the first result (most relevant)
        const song = data.result[0];
        
        // Format the lyrics response
        const formattedLyrics = `
╭════════════════════⊷
║ *${song.song}* - ${song.artist}
╰════════════════════⊷

${song.lyrics}

╭════════════════════⊷
║ *Powered by ${botname}*
╰════════════════════⊷`;

        // Send thumbnail if available
        if (song.thumbnail) {
            await sendMediaMessage(client, m, {
                image: { url: song.thumbnail },
                caption: `*${song.song}* - ${song.artist}\n\nLyrics displayed below...`
            });
        }

        // Send lyrics as a message
        // Split long messages to avoid WhatsApp limits
        const maxLength = 1500;
        if (formattedLyrics.length > maxLength) {
            const parts = [];
            let currentPart = '';
            
            for (const line of formattedLyrics.split('\n')) {
                if (currentPart.length + line.length > maxLength) {
                    parts.push(currentPart);
                    currentPart = line + '\n';
                } else {
                    currentPart += line + '\n';
                }
            }
            
            if (currentPart) parts.push(currentPart);
            
            for (const part of parts) {
                await sendReply(client, m, part);
            }
        } else {
            await sendReply(client, m, formattedLyrics);
        }

    } catch (error) {
        console.error('Lyrics command error:', error);
        await sendReply(client, m, `An error occurred while fetching lyrics. Please try again later.`);
    }
});
