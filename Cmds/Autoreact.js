const { keith } = require('../commandHandler');
const { getAntiBadSettings, updateAntiBadSettings } = require('../database/antibad');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');


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
