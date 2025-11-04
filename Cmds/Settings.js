//========================================================================================================================
//========================================================================================================================

//
const { keith } = require('../commandHandler');
const { getAntiDeleteSettings, updateAntiDeleteSettings } = require('../database/antidelete');
const { getAntiLinkSettings, updateAntiLinkSettings, clearAllWarns } = require('../database/antilink');
const { getAntiStatusMentionSettings, updateAntiStatusMentionSettings, clearAllStatusWarns } = require('../database/antistatusmention');
const { getAutoBioSettings, updateAutoBioSettings } = require('../database/autobio');
//const { getAutoStatusSettings, updateAutoStatusSettings } = require('../database/autostatus');
const { getAutoReadSettings, updateAutoReadSettings } = require('../database/autoread');
const { getAutoStatusSettings, updateAutoStatusSettings } = require('../database/autostatus');
//const { getAutoStatusSettings, updateAutoStatusSettings } = require('../database/autostatus');
const { getChatbotSettings, updateChatbotSettings, clearConversationHistory, getConversationHistory, availableVoices } = require('../database/chatbot');
const axios = require('axios');
const { getGreetSettings, updateGreetSettings, clearRepliedContacts } = require('../database/greet');
const { getPresenceSettings, updatePresenceSettings } = require('../database/presence');
const { updateSettings, getSettings } = require('../database/settings');
const { getGroupEventsSettings, updateGroupEventsSettings } = require('../database/groupevents');
const { getAntiCallSettings, updateAntiCallSettings } = require('../database/anticall');

//========================================================================================================================
//========================================================================================================================
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "anticall",
  aliases: ["callset", "anticallsetting"],
  description: "Manage anti-call settings",
  category: "Settings",
  filename: __filename
}, async (from, client, conText) => {
  const { q, prefix, reply, isSuperUser } = conText;

  if (!isSuperUser) {
    return reply("❌ You need superuser privileges to manage anti-call settings.");
  }

  const args = q?.trim().split(/\s+/) || [];
  const subcommand = args[0]?.toLowerCase();
  const value = args.slice(1).join(" ");
  const settings = await getAntiCallSettings();

  if (!subcommand) {
    const status = settings.status ? '✅ ON' : '❌ OFF';
    const action = settings.action === 'block' ? 'Block caller' : 'Reject call';
    const actionEmoji = settings.action === 'block' ? '🚫' : '❌';

    return reply(
      `*📜 Anti-Call Settings*\n\n` +
      `🔹 *Status:* ${status}\n` +
      `🔹 *Action:* ${actionEmoji} ${action}\n` +
      `🔹 *Message:* ${settings.message || '*No message set*'}\n\n` +
      `*🛠 Usage Instructions:*\n` +
      `▸ *${prefix}anticall on/off* - Toggle anti-call\n` +
      `▸ *${prefix}anticall message <text>* - Set rejection message\n` +
      `▸ *${prefix}anticall action reject/block* - Set call action\n\n` +
      `*💡 Action Differences:*\n` +
      `✔️ Reject: Declines call but allows future calls\n` +
      `🚫 Block: Declines and blocks the caller`
    );
  }

  switch (subcommand) {
    case 'on':
    case 'off': {
      const newStatus = subcommand === 'on';
      if (settings.status === newStatus) {
        return reply(`⚠️ Anti-call is already ${newStatus ? 'enabled' : 'disabled'}.`);
      }
      await updateAntiCallSettings({ status: newStatus });
      return reply(`✅ Anti-call has been ${newStatus ? 'enabled' : 'disabled'}.`);
    }

    case 'message': {
      if (!value) return reply('❌ Please provide a message for anti-call rejection.');
      await updateAntiCallSettings({ message: value });
      return reply(`✅ Anti-call message updated successfully:\n\n"${value}"`);
    }

    case 'action': {
      const action = value.toLowerCase();
      if (!['reject', 'block'].includes(action)) {
        return reply(
          '❌ Invalid action. Use "reject" or "block".\n\n' +
          '*Reject:* Declines call but allows future calls\n' +
          '*Block:* Declines and permanently blocks the caller'
        );
      }
      if (settings.action === action) {
        return reply(`⚠️ Action is already set to "${action}".`);
      }
      await updateAntiCallSettings({ action });
      return reply(
        `🔹 Call action changed to: *${action}*\n\n` +
        (action === 'block'
          ? '🚫 Now blocking callers who try to call.'
          : '✔️ Calls will now be rejected without blocking.')
      );
    }

    default:
      return reply(
        '❌ Invalid subcommand. Available options:\n\n' +
        `▸ *${prefix}anticall on/off*\n` +
        `▸ *${prefix}anticall message <text>*\n` +
        `▸ *${prefix}anticall action reject/block*`
      );
  }
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "events",
  aliases: ["gevents", "groupevents"],
  category: "owner",
  description: "Manage group welcome/leave events"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const action = args[0]?.toLowerCase();
  const value = args.slice(1).join(" ");

  const settings = await getGroupEventsSettings();

  if (!action) {
    return reply(
      `*🎉 Group Events Settings*\n\n` +
      `🔹 *Status:* ${settings.enabled ? '✅ ON' : '❌ OFF'}\n` +
      `🔹 *Promotions:* ${settings.showPromotions ? '✅ ON' : '❌ OFF'}\n\n` +
      `*Welcome Message:*\n${settings.welcomeMessage}\n\n` +
      `*Goodbye Message:*\n${settings.goodbyeMessage}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ events on/off\n` +
      `▸ events promote on/off\n` +
      `▸ events welcome <message>\n` +
      `▸ events goodbye <message>\n\n` +
      `*Placeholders:*\n` +
      `@user - Mention new member\n` +
      `{group} - Group name\n` +
      `{count} - Member count\n` +
      `{time} - Join time\n` +
      `{desc} - Group description`
    );
  }

  switch (action) {
    case 'on':
      await updateGroupEventsSettings({ enabled: true });
      return reply("✅ Group events enabled.");

    case 'off':
      await updateGroupEventsSettings({ enabled: false });
      return reply("✅ Group events disabled.");

    case 'promote':
      if (!['on', 'off'].includes(value)) return reply("❌ Use 'on' or 'off'.");
      await updateGroupEventsSettings({ showPromotions: value === 'on' });
      return reply(`✅ Promotion notices ${value === 'on' ? 'enabled' : 'disabled'}.`);

    case 'welcome':
      if (!value) return reply("❌ Provide a welcome message.");
      await updateGroupEventsSettings({ welcomeMessage: value });
      return reply("✅ Welcome message updated.");

    case 'goodbye':
      if (!value) return reply("❌ Provide a goodbye message.");
      await updateGroupEventsSettings({ goodbyeMessage: value });
      return reply("✅ Goodbye message updated.");

    default:
      return reply(
        "❌ Invalid subcommand. Options:\n\n" +
        `▸ events on/off\n` +
        `▸ events promote on/off\n` +
        `▸ events welcome <message>\n` +
        `▸ events goodbye <message>`
      );
  }
});
//========================================================================================================================
keith({
  pattern: "settings",
  aliases: ["config", "botconfig"],
  category: "Settings",
  description: "Manage all bot settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser, prefix } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const action = args[0]?.toLowerCase();
  const key = args[1]?.toLowerCase();
  const value = args.slice(2).join(" ");

  const settings = await getSettings();

  if (!action) {
    return reply(
      `*⚙️ Bot Settings*\n\n` +
      `🔹 *Prefix:* \`${settings.prefix}\`\n` +
      `🔹 *Mode:* ${settings.mode.toUpperCase()}\n` +
      `🔹 *Bot Name:* ${settings.botname}\n` +
      `🔹 *Author:* ${settings.author}\n` +
      `🔹 *Packname:* ${settings.packname}\n` +
      `🔹 *Timezone:* ${settings.timezone}\n` +
      `🔹 *URL:* ${settings.url || '❌ Not Set'}\n` +
      `🔹 *GitHub:* ${settings.gurl || '❌ Not Set'}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ ${settings.prefix}settings list\n` +
      `▸ ${settings.prefix}settings set <key> <value>\n` +
      `▸ ${settings.prefix}settings reset`
    );
  }

  switch (action) {
    case 'list':
      return reply(
        `*📋 Available Settings:*\n\n` +
        `▸ prefix - Bot command prefix\n` +
        `▸ mode - Bot mode (public/private)\n` +
        `▸ botname - Bot display name\n` +
        `▸ author - Bot author name\n` +
        `▸ packname - Sticker pack name\n` +
        `▸ timezone - Timezone for bot\n` +
        `▸ url - Bot profile picture URL\n` +
        `▸ gurl - GitHub/Repo URL`
      );

    case 'set':
      if (!key || !value) {
        return reply("❌ Usage: settings set <key> <value>");
      }

      const validKeys = ['prefix', 'mode', 'botname', 'author', 'packname', 'timezone', 'url', 'gurl'];
      if (!validKeys.includes(key)) {
        return reply(`❌ Invalid setting! Available: ${validKeys.join(', ')}`);
      }

      // Validation for specific keys
      if (key === 'prefix' && value.length > 3) {
        return reply("❌ Prefix must be 1-3 characters long!");
      }

      if (key === 'mode' && !['public', 'private'].includes(value.toLowerCase())) {
        return reply("❌ Mode must be 'public' or 'private'!");
      }

      try {
        const updateData = { [key]: value };
        await updateSettings(updateData);
        // Update the botSettings in context
        conText.botSettings[key] = value;
        return reply(`✅ Setting *${key}* updated to:\n${value}`);
      } catch (error) {
        return reply("❌ Failed to update setting!");
      }
      break;

    case 'reset':
      try {
        const defaultSettings = {
          prefix: ".",
          author: "Keith",
          url: "https://files.catbox.moe/07dmp1.jpg",
          gurl: "https://github.com/Keithkeizzah/KEITH-MD",
          timezone: "Africa/Nairobi",
          botname: "Keith-Md",
          packname: "Keith-Md",
          mode: "public"
        };
        await updateSettings(defaultSettings);
        // Update all settings in context
        Object.assign(conText.botSettings, defaultSettings);
        return reply("✅ All settings reset to default values!");
      } catch (error) {
        return reply("❌ Failed to reset settings!");
      }
      break;

    default:
      return reply(
        "❌ Invalid subcommand. Options:\n\n" +
        `▸ ${settings.prefix}settings list\n` +
        `▸ ${settings.prefix}settings set <key> <value>\n` +
        `▸ ${settings.prefix}settings reset`
      );
  }
});
//========================================================================================================================
keith({
  pattern: "mode",
  aliases: ["setmode"],
  category: "Settings",
  description: "Change bot mode (public/private)"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const newMode = q?.trim().toLowerCase();

  if (!newMode) {
    const settings = await getSettings();
    return reply(
      `*🤖 Bot Mode*\n\n` +
      `🔹 *Current Mode:* ${settings.mode.toUpperCase()}\n\n` +
      `*Available Modes:*\n` +
      `▸ public - Everyone can use commands\n` +
      `▸ private - Only owner/sudo can use commands\n\n` +
      `*Usage:* \`${settings.prefix}mode <public/private>\``
    );
  }

  if (!['public', 'private'].includes(newMode)) {
    return reply("❌ Invalid mode! Use: public or private");
  }

  try {
    await updateSettings({ mode: newMode });
    // Update the botSettings in context
    conText.botSettings.mode = newMode;
    return reply(`✅ Bot mode changed to: *${newMode.toUpperCase()}*`);
  } catch (error) {
    return reply("❌ Failed to update mode!");
  }
});
//========================================================================================================================

keith({
  pattern: "prefix",
  aliases: ["setprefix"],
  category: "Settings",
  description: "Change bot prefix"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const newPrefix = q?.trim();

  if (!newPrefix) {
    const settings = await getSettings();
    return reply(`*🔧 Current Prefix:* \`${settings.prefix}\`\n\n*Usage:* \`${settings.prefix}prefix <new_prefix>\``);
  }

  if (newPrefix.length > 3) {
    return reply("❌ Prefix must be 1-3 characters long!");
  }

  try {
    await updateSettings({ prefix: newPrefix });
    // Update the botSettings in context
    conText.botSettings.prefix = newPrefix;
    return reply(`✅ Prefix changed to: \`${newPrefix}\``);
  } catch (error) {
    return reply("❌ Failed to update prefix!");
  }
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "presence",
  aliases: ["setpresence", "mypresence"],
  category: "Settings",
  description: "Manage your presence settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const type = args[0]?.toLowerCase();
  const status = args[1]?.toLowerCase();

  const settings = await getPresenceSettings();

  if (!type) {
    const format = (s) => s === 'off' ? '❌ OFF' : `✅ ${s.toUpperCase()}`;
    return reply(
      `*🔄 Presence Settings*\n\n` +
      `🔹 *Private Chats:* ${format(settings.privateChat)}\n` +
      `🔹 *Group Chats:* ${format(settings.groupChat)}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ presence private [off/online/typing/recording]\n` +
      `▸ presence group [off/online/typing/recording]`
    );
  }

  if (!['private', 'group'].includes(type)) {
    return reply(
      "❌ Invalid type. Use:\n\n" +
      `▸ presence private [status]\n` +
      `▸ presence group [status]`
    );
  }

  if (!['off', 'online', 'typing', 'recording'].includes(status)) {
    return reply(
      "❌ Invalid status. Options:\n\n" +
      `▸ off - No presence\n` +
      `▸ online - Show as online\n` +
      `▸ typing - Show typing indicator\n` +
      `▸ recording - Show recording indicator`
    );
  }

  await updatePresenceSettings({ [type === 'private' ? 'privateChat' : 'groupChat']: status });
  reply(`✅ ${type === 'private' ? 'Private chat' : 'Group chat'} presence set to *${status}*`);
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "greet",
  aliases: ["autoreply"],
  category: "Settings",
  description: "Manage private chat greeting settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const action = args[0]?.toLowerCase();
  const message = args.slice(1).join(" ");

  const settings = await getGreetSettings();

  if (!action) {
    return reply(
      `*👋 Greeting Settings*\n\n` +
      `🔹 *Status:* ${settings.enabled ? '✅ ON' : '❌ OFF'}\n` +
      `🔹 *Message:* ${settings.message}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ greet on/off\n` +
      `▸ greet set <message>\n` +
      `▸ greet clear`
    );
  }

  switch (action) {
    case 'on':
      await updateGreetSettings({ enabled: true });
      return reply("✅ Private chat greetings enabled.");

    case 'off':
      await updateGreetSettings({ enabled: false });
      return reply("✅ Private chat greetings disabled.");

    case 'set':
      if (!message) return reply("❌ Provide a greeting message.");
      await updateGreetSettings({ message });
      return reply(`✅ Greet message updated:\n"${message}"`);

    case 'clear':
      clearRepliedContacts();
      return reply("✅ Replied contacts memory cleared.");

    default:
      return reply(
        "❌ Invalid subcommand. Options:\n\n" +
        `▸ greet on/off\n` +
        `▸ greet set <message>\n` +
        `▸ greet clear`
      );
  }
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

// Helper functions for media download
async function downloadMedia(mediaUrl) {
    try {
        const response = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Error downloading media:', error);
        return null;
    }
}

keith({
  pattern: "chatbot",
  aliases: ["chatai"],
  category: "Settings",
  description: "Manage chatbot settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const subcommand = args[0]?.toLowerCase();
  const value = args.slice(1).join(" ");

  const settings = await getChatbotSettings();

  if (!subcommand) {
    const statusMap = {
      'on': '✅ ON',
      'off': '❌ OFF'
    };

    const modeMap = {
      'private': '🔒 Private Only',
      'group': '👥 Group Only', 
      'both': '🌐 Both'
    };

    const triggerMap = {
      'dm': '📨 DM Trigger',
      'all': '🔊 All Messages'
    };

    const responseMap = {
      'text': '📝 Text',
      'audio': '🎵 Audio'
    };

    return reply(
      `*🤖 Chatbot Settings*\n\n` +
      `🔹 *Status:* ${statusMap[settings.status]}\n` +
      `🔹 *Mode:* ${modeMap[settings.mode]}\n` +
      `🔹 *Trigger:* ${triggerMap[settings.trigger]}\n` +
      `🔹 *Default Response:* ${responseMap[settings.default_response]}\n` +
      `🔹 *Voice:* ${settings.voice}\n\n` +
      `*🎯 Response Types:*\n` +
      `▸ *Text* - Normal AI conversation\n` +
      `▸ *Audio* - Add "audio" to get voice response\n` +
      `▸ *Video* - Add "video" to generate videos\n` +
      `▸ *Image* - Add "image" to generate images\n` +
      `▸ *Vision* - Send image + "analyze this"\n\n` +
      `*Usage Examples:*\n` +
      `▸ @bot hello how are you? (Text)\n` +
      `▸ @bot audio tell me a story (Audio response)\n` +
      `▸ @bot video a cat running (Video generation)\n` +
      `▸ @bot image a beautiful sunset (Image generation)\n` +
      `▸ [Send image] "analyze this" (Vision analysis)\n\n` +
      `*Commands:*\n` +
      `▸ chatbot on/off\n` +
      `▸ chatbot mode private/group/both\n` +
      `▸ chatbot trigger dm/all\n` +
      `▸ chatbot response text/audio\n` +
      `▸ chatbot voice <name>\n` +
      `▸ chatbot voices\n` +
      `▸ chatbot clear\n` +
      `▸ chatbot status\n` +
      `▸ chatbot test <type> <message>`
    );
  }

  switch (subcommand) {
    case 'on':
    case 'off':
      await updateChatbotSettings({ status: subcommand });
      return reply(`✅ Chatbot: *${subcommand.toUpperCase()}*`);

    case 'mode':
      if (!['private', 'group', 'both'].includes(value)) {
        return reply("❌ Invalid mode! Use: private, group, or both");
      }
      await updateChatbotSettings({ mode: value });
      return reply(`✅ Chatbot mode: *${value.toUpperCase()}*`);

    case 'trigger':
      if (!['dm', 'all'].includes(value)) {
        return reply("❌ Invalid trigger! Use: dm or all");
      }
      await updateChatbotSettings({ trigger: value });
      return reply(`✅ Chatbot trigger: *${value.toUpperCase()}*`);

    case 'response':
      if (!['text', 'audio'].includes(value)) {
        return reply("❌ Invalid response type! Use: text or audio");
      }
      await updateChatbotSettings({ default_response: value });
      return reply(`✅ Default response: *${value.toUpperCase()}*`);

    case 'voice':
      if (!availableVoices.includes(value)) {
        return reply(`❌ Invalid voice! Available voices:\n${availableVoices.join(', ')}`);
      }
      await updateChatbotSettings({ voice: value });
      return reply(`✅ Voice set to: *${value}*`);

    case 'voices':
      return reply(`*🎙️ Available Voices:*\n\n${availableVoices.join(', ')}`);

    case 'clear':
      const cleared = await clearConversationHistory(from);
      if (cleared) {
        return reply("✅ Chatbot conversation history cleared!");
      } else {
        return reply("❌ No conversation history to clear!");
      }

    case 'status':
      const history = await getConversationHistory(from, 5);
      if (history.length === 0) {
        return reply("📝 No recent conversations found.");
      }
      
      let historyText = `*📚 Recent Conversations (${history.length})*\n\n`;
      history.forEach((conv, index) => {
        const typeIcon = getTypeIcon(conv.type);
        historyText += `*${index + 1}. ${typeIcon} You:* ${conv.user}\n`;
        historyText += `   *AI:* ${conv.type === 'audio' ? '[Voice Message]' : conv.ai}\n\n`;
      });
      
      return reply(historyText);

    case 'test':
      const testArgs = value.split(' ');
      const testType = testArgs[0]?.toLowerCase();
      const testMessage = testArgs.slice(1).join(' ') || "Hello, this is a test message";
      
      try {
        await reply(`🧪 Testing ${testType || 'text'} with: "${testMessage}"`);
        
        if (testType === 'audio') {
          // Test audio: Get AI response first, then convert to audio
          const textResponse = await axios.get(`https://apiskeith.vercel.app/keithai?q=${encodeURIComponent(testMessage)}`);
          if (textResponse.data.status) {
            const audioResponse = await axios.get(`https://apiskeith.vercel.app/ai/text2speech?q=${encodeURIComponent(textResponse.data.result)}&voice=${settings.voice}`);
            if (audioResponse.data.status && audioResponse.data.result.URL) {
              const audioBuffer = await downloadMedia(audioResponse.data.result.URL);
              if (audioBuffer) {
                await client.sendMessage(from, {
                  audio: audioBuffer,
                  ptt: true,
                  mimetype: 'audio/mpeg'
                });
              }
            }
          }
        } else if (testType === 'video') {
          const videoResponse = await axios.get(`https://apiskeith.vercel.app/text2video?q=${encodeURIComponent(testMessage)}`);
          if (videoResponse.data.success && videoResponse.data.results) {
            const videoBuffer = await downloadMedia(videoResponse.data.results);
            if (videoBuffer) {
              await client.sendMessage(from, {
                video: videoBuffer,
                caption: `🎥 Test video: ${testMessage}`
              });
            }
          }
        } else if (testType === 'image') {
          const imageBuffer = await downloadMedia(`https://apiskeith.vercel.app/ai/flux?q=${encodeURIComponent(testMessage)}`);
          if (imageBuffer) {
            await client.sendMessage(from, {
              image: imageBuffer,
              caption: `🖼️ Test image: ${testMessage}`
            });
          }
        } else {
          // Text test
          const textResponse = await axios.get(`https://apiskeith.vercel.app/keithai?q=${encodeURIComponent(testMessage)}`);
          if (textResponse.data.status) {
            await reply(`📝 Text Response: ${textResponse.data.result}`);
          }
        }
        
        return reply("✅ Test completed!");
      } catch (error) {
        return reply("❌ Test failed!");
      }

    default:
      return reply(
        "❌ Invalid command!\n\n" +
        `▸ chatbot on/off\n` +
        `▸ chatbot mode private/group/both\n` +
        `▸ chatbot trigger dm/all\n` +
        `▸ chatbot response text/audio\n` +
        `▸ chatbot voice <name>\n` +
        `▸ chatbot voices\n` +
        `▸ chatbot clear\n` +
        `▸ chatbot status\n` +
        `▸ chatbot test <text/audio/video/image> <message>`
      );
  }
});

function getTypeIcon(type) {
  const icons = {
    'text': '📝',
    'audio': '🎵',
    'video': '🎥',
    'image': '🖼️',
    'vision': '🔍'
  };
  return icons[type] || '📝';
}
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "autoviewstatus",
  aliases: ["viewstatus"],
  category: "Settings",
  description: "Configure auto-view for incoming statuses"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;
  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const arg = q?.trim().toLowerCase();
  const settings = await getAutoStatusSettings();

  if (!arg || arg === 'status') {
    return reply(
      `*👁️ Auto View Status*\n\n` +
      `🔹 *Enabled:* ${settings.autoviewStatus}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ autoviewstatus true/false\n` +
      `▸ autoviewstatus status`
    );
  }

  if (['true', 'false'].includes(arg)) {
    await updateAutoStatusSettings({ autoviewStatus: arg });
    return reply(`✅ Auto-view status set to *${arg}*`);
  }

  reply("❌ Invalid input. Use `.autoviewstatus status` to view usage.");
});
//========================================================================================================================


//const { keith } = require('../commandHandler');

keith({
  pattern: "autoreplystatus",
  aliases: ["replystatus"],
  category: "Settings",
  description: "Configure auto-reply for viewed statuses"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;
  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const sub = args[0]?.toLowerCase();
  const settings = await getAutoStatusSettings();

  if (!sub || sub === 'status') {
    return reply(
      `*💬 Auto Reply Status*\n\n` +
      `🔹 *Enabled:* ${settings.autoReplyStatus}\n` +
      `🔹 *Reply Text:* ${settings.statusReplyText}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ autoreplystatus true/false\n` +
      `▸ autoreplystatus text [your message]\n` +
      `▸ autoreplystatus status`
    );
  }

  if (sub === 'text') {
    const newText = args.slice(1).join(' ');
    if (!newText) return reply("❌ Provide reply text after 'text'");
    await updateAutoStatusSettings({ statusReplyText: newText });
    return reply("✅ Auto-reply text updated.");
  }

  if (['true', 'false'].includes(sub)) {
    await updateAutoStatusSettings({ autoReplyStatus: sub });
    return reply(`✅ Auto-reply status set to *${sub}*`);
  }

  reply("❌ Invalid input. Use `.autoreplystatus status` to view usage.");
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "autoread",
  aliases: ["readmessages", "setread"],
  category: "Settings",
  description: "Manage auto-read settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const subcommand = args[0]?.toLowerCase();
  const value = args.slice(1).join(" ");

  const settings = await getAutoReadSettings();

  if (!subcommand) {
    const status = settings.status ? '✅ ON' : '❌ OFF';
    const types = settings.chatTypes.length > 0 ? settings.chatTypes.join(', ') : '*No types set*';

    return reply(
      `*👓 Auto-Read Settings*\n\n` +
      `🔹 *Status:* ${status}\n` +
      `🔹 *Chat Types:* ${types}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ autoread on/off\n` +
      `▸ autoread types <private/group/both>\n` +
      `▸ autoread addtype <type>\n` +
      `▸ autoread removetype <type>`
    );
  }

  switch (subcommand) {
    case 'on':
    case 'off': {
      const newStatus = subcommand === 'on';
      await updateAutoReadSettings({ status: newStatus });
      return reply(`✅ Auto-read has been ${newStatus ? 'enabled' : 'disabled'}.`);
    }

    case 'types': {
      if (!['private', 'group', 'both'].includes(value)) {
        return reply('❌ Use "private", "group", or "both".');
      }
      const types = value === 'both' ? ['private', 'group'] : [value];
      await updateAutoReadSettings({ chatTypes: types });
      return reply(`✅ Auto-read set for: ${types.join(', ')}`);
    }

    case 'addtype': {
      if (!['private', 'group'].includes(value)) {
        return reply('❌ Use "private" or "group".');
      }
      if (settings.chatTypes.includes(value)) {
        return reply(`⚠️ Type ${value} is already included.`);
      }
      const updated = [...settings.chatTypes, value];
      await updateAutoReadSettings({ chatTypes: updated });
      return reply(`✅ Added ${value} to auto-read types.`);
    }

    case 'removetype': {
      if (!['private', 'group'].includes(value)) {
        return reply('❌ Use "private" or "group".');
      }
      if (!settings.chatTypes.includes(value)) {
        return reply(`⚠️ Type ${value} is not currently included.`);
      }
      const updated = settings.chatTypes.filter(t => t !== value);
      await updateAutoReadSettings({ chatTypes: updated });
      return reply(`✅ Removed ${value} from auto-read types.`);
    }

    default:
      return reply(
        "❌ Invalid subcommand. Options:\n\n" +
        `▸ autoread on/off\n` +
        `▸ autoread types <private/group/both>\n` +
        `▸ autoread addtype <type>\n` +
        `▸ autoread removetype <type>`
      );
  }
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "autolikestatus",
  aliases: ["likestatus"],
  category: "Settings",
  description: "Configure auto-like for viewed statuses"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;
  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const sub = args[0]?.toLowerCase();

  const settings = await getAutoStatusSettings();

  if (!sub || sub === 'status') {
    const currentEmojis = settings.statusLikeEmojis || '💛,❤️,💜,🤍,💙';
    return reply(
      `*💖 Auto Like Status*\n\n` +
      `🔹 *Enabled:* ${settings.autoLikeStatus}\n` +
      `🔹 *Emojis:* ${currentEmojis}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ autolikestatus true/false\n` +
      `▸ autolikestatus emojis 💚 💔 💥\n` +
      `▸ autolikestatus status`
    );
  }

  if (sub === 'emojis') {
    const emojiList = args.slice(1).join(' ').trim();
    if (!emojiList) return reply("❌ Provide emojis after 'emojis'");
    
    // Clean and validate emojis - remove any commas and extra spaces
    const cleanedEmojis = emojiList
      .replace(/,/g, ' ') // Replace commas with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .split(' ') // Split by space to get individual emojis
      .filter(emoji => emoji.trim().length > 0) // Remove empty strings
      .join(','); // Join with commas for storage
    
    if (!cleanedEmojis) return reply("❌ No valid emojis provided");
    
    await updateAutoStatusSettings({ statusLikeEmojis: cleanedEmojis });
    return reply(`✅ Auto-like emojis updated to: ${cleanedEmojis.split(',').join(' ')}`);
  }

  if (['true', 'false'].includes(sub)) {
    await updateAutoStatusSettings({ autoLikeStatus: sub });
    return reply(`✅ Auto-like status set to *${sub}*`);
  }

  reply("❌ Invalid input. Use `.autolikestatus status` to view usage.");
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "autobio",
  aliases: ["bio", "setbio"],
  category: "Settings",
  description: "Manage auto-bio settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser, botSettings } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const subcommand = args[0]?.toLowerCase();
  const message = args.slice(1).join(" ");

  const settings = await getAutoBioSettings();

  if (!subcommand) {
    const status = settings.status === 'on' ? '✅ ON' : '❌ OFF';
    const currentBotName = botSettings.botname || 'Keith-MD';
    const currentTimezone = botSettings.timezone || 'Africa/Nairobi';

    return reply(
      `*📝 Auto-Bio Settings*\n\n` +
      `🔹 *Status:* ${status}\n` +
      `🔹 *Bot Name:* ${currentBotName}\n` +
      `🔹 *Timezone:* ${currentTimezone}\n` +
      `🔹 *Message:* ${settings.message}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ autobio on/off\n` +
      `▸ autobio set <message>\n` +
      `▸ autobio reset\n\n` +
      `*💡 Note:* Uses bot name and timezone from settings`
    );
  }

  switch (subcommand) {
    case 'on':
    case 'off': {
      const newStatus = subcommand;
      if (settings.status === newStatus) {
        return reply(`⚠️ Auto-bio is already ${newStatus === 'on' ? 'enabled' : 'disabled'}.`);
      }
      await updateAutoBioSettings({ status: newStatus });
      
      // Restart auto-bio if enabled
      if (newStatus === 'on') {
        const { startAutoBio } = require('../index');
        startAutoBio();
      }
      
      return reply(`✅ Auto-bio has been ${newStatus === 'on' ? 'enabled' : 'disabled'}.`);
    }

    case 'set': {
      if (!message) return reply("❌ Provide a bio message.");
      if (message.length > 100) return reply("❌ Bio message too long (max 100 characters).");
      
      await updateAutoBioSettings({ message });
      return reply(`✅ Bio message updated to:\n"${message}"`);
    }

    case 'reset': {
      const defaultMessage = '🌟 Always active!';
      await updateAutoBioSettings({ message: defaultMessage });
      return reply(`✅ Bio message reset to default:\n"${defaultMessage}"`);
    }

    default:
      return reply(
        "❌ Invalid subcommand. Options:\n\n" +
        `▸ autobio on/off\n` +
        `▸ autobio set <message>\n` +
        `▸ autobio reset`
      );
  }
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "antistatusmention",
  aliases: ["antistatus", "statusguard"],
  category: "Settings",
  description: "Manage anti-status-mention settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser, isBotAdmin, isGroup } = conText;

  if (!isGroup) return reply("❌ Group command only!");
  if (!isBotAdmin) return reply("❌ Need admin role!");
  if (!isSuperUser) return reply("❌ Admin only command!");

  const args = q?.trim().split(/\s+/) || [];
  const subcommand = args[0]?.toLowerCase();
  const value = args[1];

  const settings = await getAntiStatusMentionSettings();

  if (!subcommand) {
    const statusMap = {
      'off': '❌ OFF',
      'warn': '⚠️ WARN', 
      'delete': '🗑️ DELETE',
      'remove': '🚫 REMOVE'
    };

    return reply(
      `*🛡️ Anti-Status-Mention Settings*\n\n` +
      `🔹 *Status:* ${statusMap[settings.status]}\n` +
      `🔹 *Warn Limit:* ${settings.warn_limit}\n\n` +
      `*Blocks:* Status mention messages in groups\n\n` +
      `*Actions:*\n` +
      `▸ warn - Warn users (remove after ${settings.warn_limit} warnings)\n` +
      `▸ delete - Delete status mentions + warn\n` +
      `▸ remove - Delete status mentions + remove immediately\n\n` +
      `*Usage:*\n` +
      `▸ antistatusmention off/warn/delete/remove\n` +
      `▸ antistatusmention limit <1-10>\n` +
      `▸ antistatusmention resetwarns`
    );
  }

  switch (subcommand) {
    case 'off':
    case 'warn':
    case 'delete':
    case 'remove':
      await updateAntiStatusMentionSettings({ status: subcommand, action: subcommand });
      return reply(`✅ Anti-status-mention: *${subcommand.toUpperCase()}*`);

    case 'limit':
      const limit = parseInt(value);
      if (isNaN(limit) || limit < 1 || limit > 10) {
        return reply("❌ Limit must be 1-10");
      }
      await updateAntiStatusMentionSettings({ warn_limit: limit });
      return reply(`✅ Warn limit: *${limit}*`);

    case 'resetwarns':
      clearAllStatusWarns();
      return reply("✅ Status mention warning counts reset!");

    default:
      return reply(
        "❌ Invalid command!\n\n" +
        `▸ antistatusmention off/warn/delete/remove\n` +
        `▸ antistatusmention limit <1-10>\n` +
        `▸ antistatusmention resetwarns`
      );
  }
});
//========================================================================================================================
//const { keith } = require('../commandHandler');

keith({
  pattern: "antilink",
  aliases: ["linkguard"],
  category: "Settings",
  description: "Manage anti-link settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser, isBotAdmin, isGroup } = conText;

  if (!isGroup) return reply("❌ Group command only!");
  if (!isBotAdmin) return reply("❌ Need admin role!");
  if (!isSuperUser) return reply("❌ Admin only command!");

  const args = q?.trim().split(/\s+/) || [];
  const subcommand = args[0]?.toLowerCase();
  const value = args[1];

  const settings = await getAntiLinkSettings();

  if (!subcommand) {
    const statusMap = {
      'off': '❌ OFF',
      'warn': '⚠️ WARN', 
      'delete': '🗑️ DELETE',
      'remove': '🚫 REMOVE'
    };

    return reply(
      `*🛡️ Anti-Link Settings*\n\n` +
      `🔹 *Status:* ${statusMap[settings.status]}\n` +
      `🔹 *Warn Limit:* ${settings.warn_limit}\n\n` +
      `*Actions:*\n` +
      `▸ warn - Warn users (remove after ${settings.warn_limit} warnings)\n` +
      `▸ delete - Delete links + warn\n` +
      `▸ remove - Delete links + remove immediately\n\n` +
      `*Usage:*\n` +
      `▸ antilink off/warn/delete/remove\n` +
      `▸ antilink limit <1-10>\n` +
      `▸ antilink resetwarns`
    );
  }

  switch (subcommand) {
    case 'off':
    case 'warn':
    case 'delete':
    case 'remove':
      await updateAntiLinkSettings({ status: subcommand, action: subcommand });
      return reply(`✅ Anti-link: *${subcommand.toUpperCase()}*`);

    case 'limit':
      const limit = parseInt(value);
      if (isNaN(limit) || limit < 1 || limit > 10) {
        return reply("❌ Limit must be 1-10");
      }
      await updateAntiLinkSettings({ warn_limit: limit });
      return reply(`✅ Warn limit: *${limit}*`);

    case 'resetwarns':
      clearAllWarns();
      return reply("✅ Warning counts reset!");

    default:
      return reply(
        "❌ Invalid command!\n\n" +
        `▸ antilink off/warn/delete/remove\n` +
        `▸ antilink limit <1-10>\n` +
        `▸ antilink resetwarns`
      );
  }
});
//========================================================================================================================

keith({
  pattern: "antidelete",
  aliases: ["deleteset", "antideletesetting"],
  category: "Settings",
  description: "Manage anti-delete settings"
},
async (from, client, conText) => {
  const { reply, q, isSuperUser } = conText;

  if (!isSuperUser) return reply("❌ Owner Only Command!");

  const args = q?.trim().split(/\s+/) || [];
  const subcommand = args[0]?.toLowerCase();
  const value = args.slice(1).join(" ");

  const settings = await getAntiDeleteSettings();

  if (!subcommand) {
    const status = settings.status ? '✅ ON' : '❌ OFF';
    const groupInfo = settings.includeGroupInfo ? '✅ ON' : '❌ OFF';
    const media = settings.includeMedia ? '✅ ON' : '❌ OFF';
    const toOwner = settings.sendToOwner ? '✅ ON' : '❌ OFF';

    return reply(
      `*👿 Anti-Delete Settings*\n\n` +
      `🔹 *Status:* ${status}\n` +
      `🔹 *Notification Text:* ${settings.notification}\n` +
      `🔹 *Include Group Info:* ${groupInfo}\n` +
      `🔹 *Include Media Content:* ${media}\n` +
      `🔹 *Send to Owner Inbox:* ${toOwner}\n\n` +
      `*🛠 Usage:*\n` +
      `▸ antidelete on/off\n` +
      `▸ antidelete notification <text>\n` +
      `▸ antidelete groupinfo on/off\n` +
      `▸ antidelete media on/off\n` +
      `▸ antidelete inbox on/off`
    );
  }

  switch (subcommand) {
    case 'on':
    case 'off': {
      const newStatus = subcommand === 'on';
      if (settings.status === newStatus) {
        return reply(`⚠️ Anti-delete is already ${newStatus ? 'enabled' : 'disabled'}.`);
      }
      await updateAntiDeleteSettings({ status: newStatus });
      return reply(`✅ Anti-delete has been ${newStatus ? 'enabled' : 'disabled'}.`);
    }

    case 'notification': {
      if (!value) return reply('❌ Provide a notification text.');
      await updateAntiDeleteSettings({ notification: value });
      return reply(`✅ Notification updated:\n\n"${value}"`);
    }

    case 'groupinfo': {
      if (!['on', 'off'].includes(value)) return reply('❌ Use "on" or "off".');
      const newValue = value === 'on';
      if (settings.includeGroupInfo === newValue) {
        return reply(`⚠️ Group info inclusion is already ${newValue ? 'enabled' : 'disabled'}.`);
      }
      await updateAntiDeleteSettings({ includeGroupInfo: newValue });
      return reply(`✅ Group info inclusion ${newValue ? 'enabled' : 'disabled'}.`);
    }

    case 'media': {
      if (!['on', 'off'].includes(value)) return reply('❌ Use "on" or "off".');
      const newValue = value === 'on';
      if (settings.includeMedia === newValue) {
        return reply(`⚠️ Media content inclusion is already ${newValue ? 'enabled' : 'disabled'}.`);
      }
      await updateAntiDeleteSettings({ includeMedia: newValue });
      return reply(`✅ Media content inclusion ${newValue ? 'enabled' : 'disabled'}.`);
    }

    case 'inbox': {
      if (!['on', 'off'].includes(value)) return reply('❌ Use "on" or "off".');
      const newValue = value === 'on';
      if (settings.sendToOwner === newValue) {
        return reply(`⚠️ Send to owner inbox is already ${newValue ? 'enabled' : 'disabled'}.`);
      }
      await updateAntiDeleteSettings({ sendToOwner: newValue });
      return reply(`✅ Send to owner inbox ${newValue ? 'enabled' : 'disabled'}.`);
    }

    default:
      return reply(
        '❌ Invalid subcommand. Options:\n\n' +
        `▸ antidelete on/off\n` +
        `▸ antidelete notification <text>\n` +
        `▸ antidelete groupinfo on/off\n` +
        `▸ antidelete media on/off\n` +
        `▸ antidelete inbox on/off`
      );
  }
});
//========================================================================================================================
//========================================================================================================================

                                                
