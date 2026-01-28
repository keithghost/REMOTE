
//========================================================================================================================
const { keith } = require('../commandHandler');
const axios = require('axios');
const { 
    saveConversation, 
    getConversationHistory, 
    clearConversationHistory,
    getLastConversation 
} = require('../database/gpt');
const fs = require("fs");
const FormData = require("form-data");
const { fileTypeFromBuffer } = require("file-type");
//========================================================================================================================


const API = "https://www.nanobana.net/api";
const COOKIE = "__Host-authjs.csrf-token=30520470455c3e13eaed1f36a6d404badce7ea465230c2c98e0471bb72646a4e%7C3e869582574ac97763adf0b3d383e68275475d375f1926fd551aa712e4adbd24; __Secure-authjs.callback-url=https%3A%2F%2Fwww.nanobana.net%2F%23generator; g_state={\"i_l\":0,\"i_ll\":1769401024886,\"i_b\":\"VKxqLQ5eJ0B2gQmnduZzPCwsZ1q418d0cjhhXWlbxTU\",\"i_e\":{\"enable_itp_optimization\":0}}; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiSWRmbEhwMk0teEF1V3l6Nkg1bHZrRHdOc0ZiM3BBOHVvMjNjaXhaZ1MxT1hHWUFNUUc0MGY0bW5XZnFtdWZyWnFYbHM2SFZILUZncDlvaUk5dTdIbHcifQ..lasLfR5B2_Rf2Q_F3K6fgw.Tro9GauoZdTk0Dtt_Dt6HJK5eG_OZoP66i6LKgtDzaj6v42BIhO-Hre144rB3wYfFQovDVKXyxAGG8WyP5FW_H3WTJP-it5Sm8xfmj7WWSbAzXGXPOcw-782yVRqLAK4cxuNNGVYCNJhOxLnKEAh_3bRBUHpkDmDfsnC8z5FmTtURhA32n-KiMW5zcPKKhY6haApLrOfJ3Y31NxjzVRDa-T-1vjTITsyFBsZW_WaFY8OHRz7giNl-rKbfm-OKEd_nvU0NqdnEUS_LBYN-5b7u5f1buYMdIt8M2g6YIaYwhdXIGZ-x9HpJz2API7NrhKN5tTwaN6UMPFq4ZSfEdYEWipfmUMacv5oGfW7AmaAWMoVvYs5tudzI00D_M0GE3A5F20fLFRMRgDOsI3cs5-e0TzGOTobv3D7UGau8XCrxX5exf5L6Q1C15A6xwtPpRJu1cOg1BlnOXf0gueF4sAAcg._Bl87onRhLiZFFuzC-e1_udKFzuUFVAfhW4FfmtUufE";

const HEADERS = {
  "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
  "origin": "https://www.nanobana.net",
  "referer": "https://www.nanobana.net/",
  "cookie": COOKIE
};

async function upload(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || { ext: "jpg", mime: "image/jpeg" };
  const form = new FormData();
  form.append("file", buffer, { filename: `image.${ext}`, contentType: mime });

  const res = await axios.post(`${API}/upload/image`, form, {
    headers: { ...HEADERS, ...form.getHeaders() }
  });
  if (!res.data.url) throw new Error("❌ Upload failed");
  return res.data.url;
}

async function generate(prompt, imageUrl) {
  const res = await axios.post(`${API}/sora2/image-to-video/generate`, {
    prompt,
    image_urls: [imageUrl],
    aspect_ratio: "portrait",
    n_frames: "10",
    remove_watermark: true
  }, { headers: HEADERS });

  if (!res.data.taskId) throw new Error("❌ Failed to create task");
  return res.data.taskId;
}

async function waitTask(taskId, prompt) {
  for (let i = 0; i < 120; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const res = await axios.get(
      `${API}/sora2/image-to-video/task/${taskId}?save=1&prompt=${encodeURIComponent(prompt)}`,
      { headers: HEADERS }
    );
    if (res.data.status === "completed") return res.data.saved?.[0]?.url;
    if (res.data.status === "failed") throw new Error(res.data.provider_raw?.data?.failMsg || "❌ Generation failed");
  }
  throw new Error("⏳ Timeout waiting for video");
}

keith({
  pattern: "image2video",
  aliases: ["imagetovideo", "i2v", "img2vid"],
  category: "Ai",
  description: "Convert quoted image to video using Sora 2",
  filename: __filename
}, async (from, client, conText) => {
  const { q, mek, quoted, quotedMsg, reply } = conText;

  if (!q || !quotedMsg?.imageMessage) {
    return reply("📌 Reply to an image with:\n`sora2 <prompt>`");
  }

  reply("> Generating video...");

  try {
    // Download quoted image
    const filePath = await client.downloadAndSaveMediaMessage(quoted.imageMessage);
    const buffer = fs.readFileSync(filePath);

    // Upload image
    const imageUrl = await upload(buffer);

    // Generate task
    const taskId = await generate(q, imageUrl);

    // Wait for result
    const videoUrl = await waitTask(taskId, q);

    // Send video back
    await client.sendMessage(from, {
      video: { url: videoUrl },
      caption: `✅ Video created successfully!\n📝 Prompt: ${q}\n🎬 Model: Sora 2 Image to Video`
    }, { quoted: mek });

    fs.unlinkSync(filePath); // cleanup temp file
  } catch (e) {
    console.error("sora2 error:", e);
    await reply(`❌ Error: ${e.message}`);
  }
});
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//======================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//========================================================================================================================

keith({
  pattern: "gpt",
  aliases: ['ai', 'ask'],
  //react: "🤖",
  category: "gpt",
  description: "Chat with GPT AI",
}, async (from, client, conText) => {
  const { mek, reply, react, arg, sender, pushName } = conText;

  if (!arg || arg.length === 0) {
    await react("❓");
    return reply(`🤖 *Keith GPT AI*\n\nAsk me anything!\n\nExample: gpt What is JavaScript?`);
  }

  try {
    await react("⏳");
    
    const question = arg.join(' ');
    
    // Get last conversation for context
    const lastConv = await getLastConversation(sender);
    let context = '';
    
    if (lastConv) {
      context = `Previous conversation:\nYou: ${lastConv.user}\nAI: ${lastConv.ai}\n\nCurrent question: ${question}`;
    }

    // Call GPT API
    const apiUrl = `https://apiskeith.vercel.app/ai/gpt?q=${encodeURIComponent(context || question)}`;
    const response = await axios.get(apiUrl);
    
    if (response.data.status && response.data.result) {
      const aiResponse = response.data.result;
      
      // Save conversation to database
      await saveConversation(sender, question, aiResponse);
      
      await react("✅");
      await reply(`${aiResponse}`);
    } else {
      await react("❌");
      await reply("❌ Sorry, I couldn't process your request at the moment.");
    }

  } catch (error) {
    console.error("gpt error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "gpthistory",
  aliases: ['aihistory', 'chathistory'],
  //react: "📚",
  category: "gpt",
  description: "View GPT conversation history",
}, async (from, client, conText) => {
  const { reply, react, sender, pushName } = conText;

  try {
    await react("📚");
    
    const history = await getConversationHistory(sender, 5); // Last 5 conversations
    
    if (!history.length) {
      return reply(`📚 *Chat History*\n\nNo previous conversations found. Start chatting with *gpt <question>*`);
    }

    let historyMsg = `📚 *Chat History for ${pushName}*\n\n`;
    
    history.forEach((conv, index) => {
      const shortUser = conv.user.length > 30 ? conv.user.substring(0, 30) + '...' : conv.user;
      const shortAI = conv.ai.length > 30 ? conv.ai.substring(0, 30) + '...' : conv.ai;
      
      historyMsg += `*${index + 1}. You:* ${shortUser}\n   *AI:* ${shortAI}\n\n`;
    });

    historyMsg += `_Total conversations: ${history.length}_`;
    
    await reply(historyMsg);

  } catch (error) {
    console.error("gpt history error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================
keith({
  pattern: "lastchat",
  aliases: ['last conversation', 'previous chat'],
  react: "🕒",
  category: "gpt",
  description: "Get last GPT conversation",
}, async (from, client, conText) => {
  const { reply, react, sender, pushName } = conText;

  try {
  //  await react("🕒");
    
    const lastConv = await getLastConversation(sender);
    
    if (!lastConv) {
      return reply(`🕒 *Last Conversation*\n\nNo previous conversation found. Start chatting with *gpt <question>*`);
    }

    const lastChatMsg = `🕒 *Last Conversation*\n\n💬 *You:* ${lastConv.user}\n\n🤖 *AI:* ${lastConv.ai}`;
    
    await reply(lastChatMsg);

  } catch (error) {
    console.error("lastchat error:", error);
  //  await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});
//========================================================================================================================

keith({
  pattern: "clearai",
  aliases: ['cleargpt', 'clearchat', 'deletehistory'],
  //react: "🗑️",
  category: "gpt",
  description: "Clear GPT conversation history",
}, async (from, client, conText) => {
  const { reply, react, sender, pushName } = conText;

  try {
    await react("🗑️");
    
    const cleared = await clearConversationHistory(sender);
    
    if (cleared) {
      await reply(`🗑️ *Chat History Cleared*\n\nAll your conversation history with GPT has been deleted successfully.`);
    } else {
      await reply(`ℹ️ *No History Found*\n\nYou don't have any conversation history to clear.`);
    }

  } catch (error) {
    console.error("clearai error:", error);
    await react("❌");
    await reply(`❌ Error: ${error.message}`);
  }
});

//========================================================================================================================
