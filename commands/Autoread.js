const { keith } = require('../keizzah/keith');
const { default: axios } = require('axios');

keith({
  nomCom: "apk",
  categorie: "Download"
}, async (dest, zk, commandeOptions) => {
  const { ms, repondre, arg, prefixe } = commandeOptions;
  const query = arg.join(' ');

  if (!query) {
    return repondre(`Please specify an app name\nExample: ${prefixe}apk whatsapp`);
  }

  try {
    // Show searching message
    await zk.sendMessage(dest, { 
      text: `🔍 Searching APKs for *${query}*...` 
    }, { quoted: ms });

    // Search APKs
    const searchUrl = `https://apis-keith.vercel.app/search/apkfab?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(searchUrl);

    if (!data.status || !data.result.length) {
      return repondre(`No APKs found for *${query}*`);
    }

    const apks = data.result.slice(0, 5); // Get first 5 results

    // Prepare buttons
    const buttons = apks.map((apk, i) => ({
      buttonId: `${prefixe}apk_dl ${apk.link}`,
      buttonText: { displayText: `${i+1}. ${apk.title}` },
      type: 1
    }));

    // Add cancel button
    buttons.push({
      buttonId: `${prefixe}apk_cancel`,
      buttonText: { displayText: "❌ Cancel" },
      type: 1
    });

    // Format result message
    let resultMsg = `*📦 APK Search Results for "${query}"*\n\n`;
    apks.forEach((apk, i) => {
      resultMsg += `*${i+1}. ${apk.title}*\n` +
                  `⭐ Rating: ${apk.rating || 'N/A'} | 📝 Reviews: ${apk.review || 'N/A'}\n\n`;
    });
    resultMsg += `_Select an APK to download_`;

    // Send interactive message
    await zk.sendMessage(dest, {
      text: resultMsg,
      footer: "Powered by KEITH-TECH",
      buttons: buttons,
      headerType: 1
    }, { quoted: ms });

  } catch (error) {
    console.error("APK search error:", error);
    repondre("❌ Error searching for APKs");
  }
});

// Handle APK download button clicks
keith({
  on: 'text',
  fromMe: false,
  pattern: new RegExp(`^${prefixe}apk_dl (.+)$`)
}, async (dest, zk, msg) => {
  const apkUrl = msg.match[1];
  
  try {
    const downloadUrl = `https://apis-keith.vercel.app/download/apkfab?url=${encodeURIComponent(apkUrl)}`;
    const { data } = await axios.get(downloadUrl);

    if (!data.status || !data.result.link) {
      return zk.sendMessage(dest, { 
        text: "⚠️ Failed to get download link" 
      }, { quoted: msg });
    }

    // Get APK info
    const { title, size, link } = data.result;

    // Send downloading status
    await zk.sendMessage(dest, {
      text: `⬇️ Downloading *${title}*...\n📦 Size: ${size || 'Unknown'}`
    }, { quoted: msg });

    // Send the APK file
    await zk.sendMessage(dest, {
      document: { url: link },
      fileName: `${title}.apk`,
      caption: `*${title}*\nDownloaded via KEITH-TECH APK Downloader`,
      mimetype: 'application/vnd.android.package-archive'
    }, { quoted: msg });

  } catch (error) {
    console.error("APK download error:", error);
    zk.sendMessage(dest, { 
      text: "❌ Failed to download the APK" 
    }, { quoted: msg });
  }
});

// Handle cancel button
keith({
  on: 'text',
  fromMe: false,
  pattern: new RegExp(`^${prefixe}apk_cancel$`)
}, async (dest, zk, msg) => {
  await zk.sendMessage(dest, { 
    text: "🚫 APK download cancelled" 
  }, { quoted: msg });
});
