
const { keith } = require('../commandHandler');
const fetch = require('node-fetch');

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
