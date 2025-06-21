
const { keith } = require('../commandHandler');
const fetch = require('node-fetch');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { promisify } = require('util');
const gis = promisify(require('g-i-s'));


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

keith({
    pattern: "bible",
    alias: ["verse", "scripture"],
    desc: "Fetch a Bible verse by reference (e.g. John 3:16)",
    category: "Search",
    react: "📖",
    filename: __filename
}, async (context) => {
    try {
       // await ownerMiddleware(context, async () => {
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
        });
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
    pattern: "image",
    alias: ["img", "imgsearch"],
    desc: "Search for images using a search term",
    category: "Search",
    react: "🖼️",
    filename: __filename
}, async (context) => {
    try {
       // await ownerMiddleware(context, async () => {
            const { client, m, text, botname, sendReply, sendMediaMessage } = context;

            if (!text) {
                return await sendReply(client, m, `📸 Please provide a search term.\n*Example:* image sunset`);
            }

            const results = await gis(text);
            if (!results || results.length === 0) {
                return await sendReply(client, m, '🔍 No images found for your search.');
            }

            const maxImages = 5;
            const imageUrls = results
                .slice(0, maxImages)
                .map(res => res.url)
                .filter(Boolean);

            if (imageUrls.length === 0) {
                return await sendReply(client, m, '⚠️ Images found, but no valid URLs were extracted.');
            }

            for (const url of imageUrls) {
                await sendMediaMessage(client, m, {
                    image: { url },
                    caption: `📷 *Search Result*\n🔍 *Query:* ${text}\n🤖 Powered by ${botname}`
                });
            }
        });
    } catch (error) {
        console.error("Image Command Error:", error);
        context.reply(`❌ Failed to fetch images.\n_Error:_ ${error.message}`);
    }
});

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
        const apiUrl = `https://apis-keith.vercel.app/search/lyrics?query=${encodeURIComponent(text)}`;
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
