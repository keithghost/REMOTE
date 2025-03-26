
const { keith } = require('../keizzah/keith');
const Heroku = require('heroku-client');
const googleTTS = require('google-tts-api');
const s = require("../set");
const axios = require("axios");
const speed = require("performance-now");
const { exec } = require("child_process");
const conf = require(__dirname + "/../set");

// Function for delay simulation
function delay(ms) {
  console.log(`⏱️ delay for ${ms}ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format the uptime into a human-readable string
function runtime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsLeft = Math.floor(seconds % 60);
  return `${hours}h ${minutes}m ${secondsLeft}s`;
}

// Loading animation
async function loading(dest, zk) {
  const lod = [
    "⬛⬛⬜⬜⬜⬜⬛⬛꧁20%꧂",
    "⬛⬛⬛⬛⬜⬜⬜⬜꧁40%꧂",
    "⬜⬜⬛⬛⬛⬛⬜⬜꧁60%꧂",
    "⬜⬜⬜⬜⬛⬛⬛⬛꧁80%꧂",
    "⬛⬛⬜⬜⬜⬜⬛⬛꧁100%꧂",
    "*L҉O҉A҉D҉I҉N҉G҉ D҉O҉N҉E҉ ᵗʱᵃᵑᵏᵧₒᵤ ⚔️🗡️*"
  ];

  let { key } = await zk.sendMessage(dest, { text: 'Loading Please Wait' });

  for (let i = 0; i < lod.length; i++) {
    await zk.sendMessage(dest, { text: lod[i], edit: key });
    await delay(500);
  }
}

keith(
  {
    nomCom: 'ping2',
    aliases: ['speed', 'latency'],
    desc: 'To check bot response time',
    categorie: 'system',
    reaction: '⚡',
    fromMe: true,
  },
  async (dest, zk, msg) => {
    // Call loading animation
    const loadingPromise = loading(dest, zk);

    // Generate 3 ping results
    const pingResults = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10000 + 1000));
    
    // Create spoken ping message
    const spokenMessage = pingResults.map(ping => 
      `${conf.BOT} speed ${ping} meters per second`
    ).join(', ');

    // Generate Google TTS audio URL
    const url = googleTTS.getAudioUrl(spokenMessage, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    });

    // Send as audio message
    await zk.sendMessage(dest, { 
      audio: { url: url }, 
      mimetype: 'audio/mp4',
      ptt: true 
    }, { quoted: msg });

    console.log("Ping results sent as audio successfully!");
    
    // Ensure loading animation completes
    await loadingPromise;
  }
);

// React function if needed
function react(dest, zk, msg, reaction) {
  zk.sendMessage(dest, { react: { text: reaction, key: msg.key } });
}
