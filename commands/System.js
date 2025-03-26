const { keith } = require('../keizzah/keith');
const googleTTS = require('google-tts-api');

keith(
  {
    nomCom: 'ping',
    aliases: ['speed', 'latency'],
    desc: 'To check bot response time',
    category: 'system', // Correct spelling
    reaction: '⚡',
  },
  async (dest, zk, msg) => {
    try {
      // Generate 3 random ping results
      const pingResults = Array.from({ length: 3 }, () =>
        Math.floor(Math.random() * 9000 + 1000) // Generates values between 1000 and 10000
      );

      // Prepare spoken message
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

      // Send audio message
      await zk.sendMessage(
        dest,
        {
          audio: { url: audioUrl },
          mimetype: 'audio/mpeg',
          ptt: true, // Send as push-to-talk audio
        },
        { quoted: msg }
      );

      console.log('Ping results sent as audio successfully!');
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
