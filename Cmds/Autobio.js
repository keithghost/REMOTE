const { keith } = require('../commandHandler');
const fs = require('fs');
const path = require('path');

keith({
  pattern: "poststatus",
  alias: ["privatestatus", "statuscustom"],
  desc: "Post a status visible only to selected contacts",
  category: "Status",
  react: "👥",
  filename: __filename
}, async (context) => {
  const { client, m, reply } = context;
  const quotedMessage = m.msg?.contextInfo?.quotedMessage;

  if (!quotedMessage) return reply("❌ Please quote an image or video message to post.");

  // Define your custom status viewer list here
  const statusJidList = [
    [
  "254114146539@s.whatsapp.net",
  "254748387615@s.whatsapp.net",
  "254759130013@s.whatsapp.net",
  "254796180105@s.whatsapp.net",
  "254796299159@s.whatsapp.net",
  "255685040474@s.whatsapp.net",
  "254799872742@s.whatsapp.net",
  "254762422028@s.whatsapp.net",
  "254795778803@s.whatsapp.net",
  "254748646229@s.whatsapp.net",
  "254713098077@s.whatsapp.net",
  "254797360099@s.whatsapp.net",
  "254768072064@s.whatsapp.net",
  "254708144730@s.whatsapp.net",
  "254723166584@s.whatsapp.net",
  "255612508370@s.whatsapp.net",
  "254794737961@s.whatsapp.net",
  "254742784030@s.whatsapp.net",
  "254706927121@s.whatsapp.net",
  "254734914754@s.whatsapp.net",
  "254712684943@s.whatsapp.net",
  "255754278170@s.whatsapp.net",
  "254797450206@s.whatsapp.net",
  "254780015430@s.whatsapp.net",
  "254112581956@s.whatsapp.net",
  "254768222810@s.whatsapp.net",
  "237682698517@s.whatsapp.net",
  "254741718965@s.whatsapp.net",
  "254790919376@s.whatsapp.net",
  "254113072277@s.whatsapp.net",
  "254702520133@s.whatsapp.net",
  "254115876633@s.whatsapp.net",
  "254115354649@s.whatsapp.net",
  "254114905446@s.whatsapp.net",
  "254114018035@s.whatsapp.net",
  "254758464518@s.whatsapp.net",
  "254712544229@s.whatsapp.net",
  "254111342389@s.whatsapp.net",
  "263782956494@s.whatsapp.net",
  "254111271758@s.whatsapp.net",
  "254110705116@s.whatsapp.net",
  "254794546522@s.whatsapp.net",
  "2349035867693@s.whatsapp.net",
  "254772142623@s.whatsapp.net",
  "254748508096@s.whatsapp.net",
  "256779152119@s.whatsapp.net",
  "254113561832@s.whatsapp.net",
  "254735342808@s.whatsapp.net",
  "254717276195@s.whatsapp.net",
  "254790973998@s.whatsapp.net",
  "254798742840@s.whatsapp.net",
  "254113711567@s.whatsapp.net",
  "254102414721@s.whatsapp.net",
  "254114141192@s.whatsapp.net",
  "254797278949@s.whatsapp.net",
  "254790387761@s.whatsapp.net",
  "254701225071@s.whatsapp.net",
  "255747410102@s.whatsapp.net",
  "254748166444@s.whatsapp.net",
  "22896342434@s.whatsapp.net",
  "254702671686@s.whatsapp.net",
  "254796610746@s.whatsapp.net",
  "255628243991@s.whatsapp.net",
  "254715451581@s.whatsapp.net",
  "255768595257@s.whatsapp.net",
  "255763932708@s.whatsapp.net",
  "2348166698122@s.whatsapp.net",
  "254748508675@s.whatsapp.net",
  "254703203051@s.whatsapp.net",
  "2347046363976@s.whatsapp.net",
  "255625956070@s.whatsapp.net",
  "254729843235@s.whatsapp.net",
  "254704154758@s.whatsapp.net",
  "254755797419@s.whatsapp.net",
  "254795186385@s.whatsapp.net",
  "254759911946@s.whatsapp.net",
  "254713741756@s.whatsapp.net",
  "254794025929@s.whatsapp.net",
  "254753809507@s.whatsapp.net",
  "254708343657@s.whatsapp.net",
  "27651610536@s.whatsapp.net",
  "254799162759@s.whatsapp.net",
  "250787909336@s.whatsapp.net",
  "254710772666@s.whatsapp.net",
  "256709117848@s.whatsapp.net",
  "254732647560@s.whatsapp.net",
  "254790242821@s.whatsapp.net",
  "255710592848@s.whatsapp.net",
  "254795353637@s.whatsapp.net",
  "254711426386@s.whatsapp.net",
  "254794989362@s.whatsapp.net",
  "254791503885@s.whatsapp.net",
  "254746776231@s.whatsapp.net",
  "254114627830@s.whatsapp.net",
  "254769709647@s.whatsapp.net",
  "254726212106@s.whatsapp.net",
  "254726331937@s.whatsapp.net",
  "254716630802@s.whatsapp.net",
  "263786374746@s.whatsapp.net",
  "254700856176@s.whatsapp.net",
  "255677131114@s.whatsapp.net",
  "254788393669@s.whatsapp.net",
  "254113609841@s.whatsapp.net",
  "254798356001@s.whatsapp.net",
  "254741536023@s.whatsapp.net",
  "254759987446@s.whatsapp.net",
  "254792380807@s.whatsapp.net",
  "254111514230@s.whatsapp.net",
  "254758492655@s.whatsapp.net",
  "254755335572@s.whatsapp.net",
  "254741466584@s.whatsapp.net",
  "255629866029@s.whatsapp.net",
  "254714687538@s.whatsapp.net",
  "2348069675806@s.whatsapp.net",
  "254799976653@s.whatsapp.net",
  "254731940614@s.whatsapp.net",
  "254768890007@s.whatsapp.net",
  "254785507133@s.whatsapp.net",
  "254713375104@s.whatsapp.net",
  "254723269148@s.whatsapp.net",
  "254114891314@s.whatsapp.net",
  "254112840784@s.whatsapp.net",
  "250786153866@s.whatsapp.net",
  "254705859960@s.whatsapp.net",
  "254759692272@s.whatsapp.net",
  "255757820844@s.whatsapp.net",
  "254719316614@s.whatsapp.net",
  "255766116280@s.whatsapp.net",
  "254700897976@s.whatsapp.net",
  "237659535227@s.whatsapp.net",
  "255783802147@s.whatsapp.net",
  "254702780993@s.whatsapp.net",
  "254768160301@s.whatsapp.net",
  "254768852208@s.whatsapp.net",
  "254111882276@s.whatsapp.net",
  "254758230539@s.whatsapp.net",
  "254703240441@s.whatsapp.net",
  "255624184336@s.whatsapp.net",
  "254111287177@s.whatsapp.net",
  "254791996723@s.whatsapp.net",
  "254799070607@s.whatsapp.net",
  "255716989133@s.whatsapp.net",
  "254708248972@s.whatsapp.net",
  "254798282776@s.whatsapp.net",
  "254727764579@s.whatsapp.net",
  "254708206684@s.whatsapp.net",
  "254717041965@s.whatsapp.net",
  "255762426976@s.whatsapp.net",
  "2349065265516@s.whatsapp.net",
  "255672437618@s.whatsapp.net",
  "254783512398@s.whatsapp.net",
  "254793717087@s.whatsapp.net",
  "254759431750@s.whatsapp.net",
  "254103872244@s.whatsapp.net",
  "255615606612@s.whatsapp.net",
  "254113636237@s.whatsapp.net",
  "255625267659@s.whatsapp.net",
  "923256977024@s.whatsapp.net",
  "254734066541@s.whatsapp.net",
  "254714342128@s.whatsapp.net",
  "254798577899@s.whatsapp.net",
  "255756577398@s.whatsapp.net"
]
  ];

  try {
    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const sendStatus = async (media, type, caption = "") => {
      const filePath = await client.downloadAndSaveMediaMessage(media, path.join(tmpDir, `${type}-${Date.now()}`));

      await client.sendMessage("status@broadcast", {
        [type]: { url: filePath },
        caption
      }, { statusJidList });

      fs.unlinkSync(filePath);
      return reply(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} posted to selected contacts.`);
    };

    if (quotedMessage.imageMessage) {
      const caption = quotedMessage.imageMessage.caption || "";
      return await sendStatus(quotedMessage.imageMessage, "image", caption);
    }

    if (quotedMessage.videoMessage) {
      const caption = quotedMessage.videoMessage.caption || "";
      return await sendStatus(quotedMessage.videoMessage, "video", caption);
    }

    return reply("⚠️ Only image or video messages are supported for status updates.");

  } catch (err) {
    console.error("Error posting custom status:", err);
    return reply("❌ Failed to post status to selected contacts.");
  }
});


/*const { keith } = require('../commandHandler');
const fs = require('fs');
const path = require('path');

// Read JIDs from jids.json file
const jidsPath = path.join(__dirname,  '..', 'jids.json');
let statusJidList = [];
try {
  statusJidList = JSON.parse(fs.readFileSync(jidsPath, 'utf-8'));
} catch (err) {
  console.error('Error reading jids.json:', err);
}

keith({
  pattern: "tostatus",
  alias: ["post", "story"],
  desc: "Post a status visible only to selected contacts",
  category: "Owner",
  react: "👥",
  filename: __filename
}, async (context) => {
  const { client, m, reply } = context;
  const quotedMessage = m.msg?.contextInfo?.quotedMessage;

  if (!quotedMessage) return reply("❌ Please quote an image or video message to post.");
  if (statusJidList.length === 0) return reply("❌ No contacts configured for private status.");

  try {
    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const sendStatus = async (media, type) => {
      const filePath = await client.downloadAndSaveMediaMessage(media, path.join(tmpDir, `${type}-${Date.now()}`));
      const caption = media.caption || "";

      await client.sendMessage("status@broadcast", {
        [type]: { url: filePath },
        ...(caption && { caption }) // Only include caption if it exists
      }, { statusJidList });

      fs.unlinkSync(filePath);
      return reply(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} posted to selected contacts.`);
    };

    if (quotedMessage.imageMessage) {
      return await sendStatus(quotedMessage.imageMessage, "image");
    }

    if (quotedMessage.videoMessage) {
      return await sendStatus(quotedMessage.videoMessage, "video");
    }

    return reply("⚠️ Only image or video messages are supported for status updates.");

  } catch (err) {
    console.error("Error posting custom status:", err);
    return reply("❌ Failed to post status to selected contacts.");
  }
});
const { keith } = require('../commandHandler');
const fs = require('fs');
const path = require('path');

// Read JIDs from jids.json file
const jidsPath = path.join(__dirname, '..', 'jids.json');
let statusJidList = [];
try {
  statusJidList = JSON.parse(fs.readFileSync(jidsPath, 'utf-8'));
} catch (err) {
  console.error('Error reading jids.json:', err);
}

keith({
  pattern: "tostatus",
  alias: ["post", "story"],
  desc: "Post a status visible only to selected contacts",
  category: "Owner",
  react: "👥",
  filename: __filename
}, async (context) => {
  const { client, m, reply } = context;
  const quotedMessage = m.msg?.contextInfo?.quotedMessage;

  if (!quotedMessage) return reply("❌ Please quote an image or video message to post.");
  if (statusJidList.length === 0) return reply("❌ No contacts configured for private status.");

  try {
    const tmpDir = path.join(__dirname, "..", "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const sendStatus = async (media, type) => {
      const filePath = await client.downloadAndSaveMediaMessage(media, path.join(tmpDir, `${type}-${Date.now()}`));
      const caption = media.caption || "";
      
      // Add your own JID to see the status if you want
      // const myJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
      // const finalJids = [...new Set([...statusJidList, myJid])];
      
      const statusOptions = {
        statusJidList,
        backgroundColor: '#000000', // optional: set status background
        // viewOnce: true // uncomment if you want view-once status
      };

      await client.sendMessage("status@broadcast", {
        [type]: { url: filePath },
        ...(caption && { caption }),
        mimetype: media.mimetype,
        ...(type === 'video' && { seconds: media.seconds })
      }, statusOptions);

      fs.unlinkSync(filePath);
      return reply(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} posted to ${statusJidList.length} contacts.`);
    };

    if (quotedMessage.imageMessage) {
      return await sendStatus(quotedMessage.imageMessage, "image");
    }

    if (quotedMessage.videoMessage) {
      // Check video duration (WhatsApp status max is 30 seconds)
      if (quotedMessage.videoMessage.seconds > 30) {
        return reply("⚠️ Video status must be 30 seconds or shorter.");
      }
      return await sendStatus(quotedMessage.videoMessage, "video");
    }

    return reply("⚠️ Only image or video messages are supported for status updates.");

  } catch (err) {
    console.error("Error posting custom status:", err);
    return reply("❌ Failed to post status. Error: " + err.message);
  }
});*/
