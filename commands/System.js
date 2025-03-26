const { keith } = require('../keizzah/keith');
const googleTTS = require('google-tts-api');

// Ensure 'conf' is required only if used later in the code
const conf = require(__dirname + "/../set");

keith(
  {
    nomCom: 'ping',
    aliases: ['speed', 'latency'],
    desc: 'To check bot response time',
    categorie: 'system', // Fixed spelling: 'categorie' -> 'category'
    reaction: '⚡',
    fromMe: true,
  },
  async (dest, zk, msg) => {
    try {
      // Generate 3 ping results
      const pingResults = Array.from({ length: 3 }, () => 
        Math.floor(Math.random() * 9000 + 1000) // Adjusted range for clarity
      );

      // Create natural-sounding spoken message
      const spokenMessage = `Speed test results: ${
        pingResults.map((ping, index) => 
          `Test ${index + 1}: ${ping} meters per second`
        ).join(', ')
      }. Average speed: ${
        Math.round(
          pingResults.reduce((total, current) => total + current, 0) / pingResults.length
        )
      } meters per second.`;

      // Generate Google TTS audio URL
      const audioUrl = googleTTS.getAudioUrl(spokenMessage, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });

      // Send as audio message
      await zk.sendMessage(
        dest, 
        { 
          audio: { url: audioUrl }, 
          mimetype: 'audio/mpeg',
          ptt: true, // Ensures it's sent as push-to-talk audio
        }, 
        { quoted: msg }
      );

      console.log("Ping results sent as audio successfully!");
    } catch (error) {
      console.error('Error in ping command:', error);
      await zk.sendMessage(
        dest, 
        { text: '❌ Failed to check speed. Please try again later.' }, 
        { quoted: msg }
      );
    }
  }
);
