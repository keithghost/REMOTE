const {keith} = require('../keizzah/keith');
const fs = require("fs");
const { exec } = require("child_process");
const { repondre, sendMessage } = require('../keizzah/context');
const filename = `${Math.random().toString(36)}`;
keith({
  nomCom: 'blown',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = "-af acrusher=.1:1:64:0:log";
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'earrape',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = "-af volume=12";
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'fat',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = '-filter:a "atempo=1.6,asetrate=22100"';
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'robot',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'tupai',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = '-filter:a "atempo=0.5,asetrate=65100"';
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'deep',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = "-af atempo=4/4,asetrate=44500*2/3";
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'bass',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = "-af equalizer=f=18:width_type=o:width=2:g=14";
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'reverse',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = '-filter_complex "areverse"';
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'slow',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = '-filter:a "atempo=0.8,asetrate=44100"';
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'smooth',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'tempo',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = '-filter:a "atempo=0.9,asetrate=65100"';
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
keith({
  nomCom: 'nightcore',
  categorie: 'Audio-Edit',
}, async (dest, zk, commandeOptions) => {
  const { ms, msgRepondu } = commandeOptions;

  if (msgRepondu) {
    if (msgRepondu.audioMessage) {
      const media = await zk.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
      const set = '-filter:a "atempo=1.07,asetrate=44100*1.20"';
      const ran = `${filename}.mp3`;

      try {
        exec(`ffmpeg -i ${media} ${set} ${ran}`, (err, stderr, stdout) => {
          fs.unlinkSync(media);
          if (err) return repondre(zk, dest, ms, "Error during the procedure: " + err);

          const buff = fs.readFileSync(ran);
          sendMessage(zk, dest, ms, { audio: buff, mimetype: "audio/mpeg" });
          fs.unlinkSync(ran);
        });
      } catch (e) {
        repondre(zk, dest, ms, "Error: " + e);
      }
    } else {
      repondre(zk, dest, ms, "The command only works with audio messages.");
    }
  } else {
    repondre(zk, dest, ms, "Please mention an audio message.");
  }
});
