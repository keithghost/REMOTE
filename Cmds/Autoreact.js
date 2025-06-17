const { keith } = require('../commandHandler');
const { getAntiBadSettings, updateAntiBadSettings } = require('../database/antibad');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');

const {
  addSudoNumber,
  getAllSudoNumbers,
  removeSudoNumber,
  isSudo
} = require('../database/sudo');

keith({
  pattern: "sudo",
  alias: ["sudos"],
  desc: "Add or remove sudo users",
  category: "Owner",
  filename: __filename,
  react: "👑"
}, async (context) => {
  try {
    const { client, m, text, reply, isOwner, args } = context;

    if (!isOwner) return reply('❌ This command is restricted to the bot owner');

    const action = args[0]?.toLowerCase();
    const targetJid =
      m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);

    if (!action || !targetJid) {
      return reply(
        `👑 *Sudo Management*\n\n` +
        `Usage:\n` +
        `▸ sudo add @user - Add sudo\n` +
        `▸ sudo remove @user - Remove sudo\n\n` +
        `Reply to a message or mention a user`
      );
    }

    if (action === "add") {
      const isAlready = await isSudo(targetJid);
      if (isAlready) {
        return reply(`❌ @${targetJid.split('@')[0]} is already a sudo`, {
          mentions: [targetJid],
        });
      }
      await addSudoNumber(targetJid);
      return reply(`✅ @${targetJid.split('@')[0]} added as sudo`, {
        mentions: [targetJid],
      });
    }

    if (["remove", "del"].includes(action)) {
      const exists = await isSudo(targetJid);
      if (!exists) {
        return reply(`❌ @${targetJid.split('@')[0]} is not a sudo`, {
          mentions: [targetJid],
        });
      }
      await removeSudoNumber(targetJid);
      return reply(`✅ @${targetJid.split('@')[0]} removed from sudo`, {
        mentions: [targetJid],
      });
    }

    return reply('❌ Invalid action. Use "add" or "remove"');
  } catch (error) {
    console.error("Sudo command error:", error);
    return reply("❌ An error occurred while managing sudo");
  }
});

keith({
  pattern: "getsudo",
  alias: ["listsudo"],
  desc: "Show list of sudo users",
  category: "Owner",
  filename: __filename,
  react: "📜"
}, async (context) => {
  const { reply } = context;
  try {
    const sudoUsers = await getAllSudoNumbers();
    if (sudoUsers.length === 0) {
      return reply("📜 *Sudo List*\n\nNo sudo users found");
    }
    const list = sudoUsers.map(jid => `• @${jid.split('@')[0]}`).join('\n');
    return reply(`📜 *Sudo Users*\n\n${list}`, { mentions: sudoUsers });
  } catch (error) {
    console.error("Error fetching sudo list:", error);
    return reply("❌ Could not retrieve sudo list");
  }
});

keith({
  pattern: "issudo",
  alias: ["checksudo"],
  desc: "Check if a user is sudo",
  category: "Owner",
  filename: __filename,
  react: "👑"
}, async (context) => {
  const { m, reply } = context;
  const targetJid =
    m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0]);

  if (!targetJid) {
    return reply("❌ Mention or reply to a user to check");
  }

  try {
    const sudo = await isSudo(targetJid);
    return reply(
      `👑 *Sudo Status*\n\n` +
      `User: @${targetJid.split('@')[0]}\n` +
      `Status: ${sudo ? "✅ Sudo User" : "❌ Not Sudo"}`,
      { mentions: [targetJid] }
    );
  } catch (err) {
    console.error("Error checking sudo:", err);
    return reply("❌ Failed to check sudo status");
  }
});


keith({
  pattern: "antibad",
  desc: "Anti-bad word manager",
  category: "Moderation",
  filename: __filename
  
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args, prefix, reply } = context;
    const subcommand = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();

    const settings = await getAntiBadSettings();

    if (!subcommand) {
      const status = settings.status ? '✅ ON' : '❌ OFF';
      const action = settings.groupAction.toUpperCase();
      const wordList = settings.forbiddenWords.slice(0, 5).join(', ') +
        (settings.forbiddenWords.length > 5 ? '...' : '');

      return await reply(
        `*Anti-Bad Word Settings*\n\n` +
        `🔹 Status: ${status}\n` +
        `🔹 Group Action: ${action}\n` +
        `🔹 Warn Limit: ${settings.warnLimit} warnings\n` +
        `🔹 Banned Words: ${settings.forbiddenWords.length} (${wordList})\n\n` +
        `*Usage:*\n` +
        `▸ ${prefix}antibad on/off\n` +
        `▸ ${prefix}antibad action <warn/remove>\n` +
        `▸ ${prefix}antibad warns <1-10>\n` +
        `▸ ${prefix}antibad add <word>\n` +
        `▸ ${prefix}antibad remove <word>\n` +
        `▸ ${prefix}antibad list\n\n` +
        `*Note:* Private chats always auto-block`
      );
    }

    switch (subcommand) {
      case 'on':
      case 'off':
        await updateAntiBadSettings({ status: subcommand === 'on' });
        return await reply(`Anti-bad words ${subcommand === 'on' ? 'enabled' : 'disabled'}.`);

      case 'action':
        if (!['warn', 'remove'].includes(value)) {
          return await reply('Invalid action. Use either "warn" or "remove"');
        }
        await updateAntiBadSettings({ groupAction: value });
        return await reply(`Group action set to: ${value.toUpperCase()}`);

      case 'warns':
        const warnLimit = parseInt(value);
        if (isNaN(warnLimit) || warnLimit < 1 || warnLimit > 10) {
          return await reply('Warning limit must be a number between 1 and 10');
        }
        await updateAntiBadSettings({ warnLimit });
        return await reply(`Warning limit set to: ${warnLimit}`);

      case 'add':
        const wordToAdd = args.slice(1).join(' ').toLowerCase();
        if (!wordToAdd || wordToAdd.length < 3) {
          return await reply('Word must be at least 3 characters long');
        }
        if (settings.forbiddenWords.includes(wordToAdd)) {
          return await reply(`"${wordToAdd}" is already in the banned list`);
        }
        await updateAntiBadSettings({ forbiddenWords: [...settings.forbiddenWords, wordToAdd] });
        return await reply(`✅ Added "${wordToAdd}" to banned words`);

      case 'remove':
        const wordToRemove = args.slice(1).join(' ').toLowerCase();
        if (!settings.forbiddenWords.includes(wordToRemove)) {
          return await reply(`"${wordToRemove}" not found in the banned list`);
        }
        await updateAntiBadSettings({
          forbiddenWords: settings.forbiddenWords.filter(w => w !== wordToRemove)
        });
        return await reply(`✅ Removed "${wordToRemove}" from banned words`);

      case 'list':
        if (settings.forbiddenWords.length === 0) {
          return await reply('The banned words list is currently empty');
        }
        const chunkSize = 20;
        const wordChunks = [];
        for (let i = 0; i < settings.forbiddenWords.length; i += chunkSize) {
          wordChunks.push(settings.forbiddenWords.slice(i, i + chunkSize));
        }

        for (let i = 0; i < wordChunks.length; i++) {
          await reply(
            `*Chunk ${i + 1}/${wordChunks.length}*\n\n` +
            wordChunks[i].map((w, j) => `${i * chunkSize + j + 1}. ${w}`).join('\n')
          );
        }
        return;

      default:
        return await reply(
          `Invalid command. Use ${prefix}antibad to see available options.\nExample: ${prefix}antibad add badword`
        );
    }
  });
});
