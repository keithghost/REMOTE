
const { keith } = require('../commandHandler');
const fetch = require('node-fetch');


keith({
  pattern: "pair",
  alias: ["code", "linkcode"],
  desc: "Check if phone number is on WhatsApp and fetch pairing code",
  category: "Owner",
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
