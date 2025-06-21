
const { keith } = require('../commandHandler');
const { getAntiLinkSettings, updateAntiLinkSettings } = require('../database/antilink');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
//const { keith } = require('../commandHandler');
const { getAntiMentionSettings, updateAntiMentionSettings } = require('../database/antimention');
//const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');

keith({
  pattern: "antimention",
  desc: "Anti-status mention manager",
  category: "Moderation",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args, prefix, reply } = context;
    const subcommand = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();

    const settings = await getAntiMentionSettings();

    if (!subcommand) {
      const status = settings.status ? '✅ ON' : '❌ OFF';
      const groupAction = settings.groupAction.toUpperCase();
      const privateAction = settings.privateAction.toUpperCase();

      return await reply(
        `*Anti-Status Mention Settings*\n\n` +
        `🔹 Status: ${status}\n` +
        `🔹 Group Action: ${groupAction}\n` +
        `🔹 Private Action: ${privateAction}\n\n` +
        `*Usage:*\n` +
        `▸ ${prefix}antimention on/off\n` +
        `▸ ${prefix}antimention group <delete/remove>\n` +
        `▸ ${prefix}antimention private <warn/block>\n\n` +
        `*Note:* Detects both group and private status mentions`
      );
    }

    switch (subcommand) {
      case 'on':
      case 'off':
        await updateAntiMentionSettings({ status: subcommand === 'on' });
        return await reply(`Anti-status mention ${subcommand === 'on' ? 'enabled' : 'disabled'}.`);

      case 'group':
        if (!['delete', 'remove'].includes(value)) {
          return await reply('Invalid group action. Use either "delete" or "remove"');
        }
        await updateAntiMentionSettings({ groupAction: value });
        return await reply(`Group action set to: ${value.toUpperCase()}`);

      case 'private':
        if (!['warn', 'block'].includes(value)) {
          return await reply('Invalid private action. Use either "warn" or "block"');
        }
        await updateAntiMentionSettings({ privateAction: value });
        return await reply(`Private action set to: ${value.toUpperCase()}`);

      default:
        return await reply(
          `Invalid command. Use ${prefix}antimention to see available options.\nExample: ${prefix}antimention group remove`
        );
    }
  });
});
keith({
  pattern: "antilink",
  desc: "Anti-link manager",
  category: "Moderation",
  filename: __filename
}, async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args, prefix, reply } = context;
    const subcommand = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();

    const settings = await getAntiLinkSettings();

    if (!subcommand) {
      const status = settings.status ? '✅ ON' : '❌ OFF';
      const action = settings.groupAction.toUpperCase();
      const domainList = settings.allowedDomains.slice(0, 5).join(', ') +
        (settings.allowedDomains.length > 5 ? '...' : '');

      return await reply(
        `*Anti-Link Settings*\n\n` +
        `🔹 Status: ${status}\n` +
        `🔹 Group Action: ${action}\n` +
        `🔹 Allowed Domains: ${settings.allowedDomains.length} (${domainList})\n\n` +
        `*Usage:*\n` +
        `▸ ${prefix}antilink on/off\n` +
        `▸ ${prefix}antilink action <delete/remove>\n` +
        `▸ ${prefix}antilink add <domain>\n` +
        `▸ ${prefix}antilink remove <domain>\n` +
        `▸ ${prefix}antilink list\n\n` +
        `*Note:* Private chats will auto-block users who send links`
      );
    }

    switch (subcommand) {
      case 'on':
      case 'off':
        await updateAntiLinkSettings({ status: subcommand === 'on' });
        return await reply(`Anti-link ${subcommand === 'on' ? 'enabled' : 'disabled'}.`);

      case 'action':
        if (!['delete', 'remove'].includes(value)) {
          return await reply('Invalid action. Use either "delete" or "remove"');
        }
        await updateAntiLinkSettings({ groupAction: value });
        return await reply(`Group action set to: ${value.toUpperCase()}`);

      case 'add':
        const domainToAdd = args[1]?.toLowerCase();
        if (!domainToAdd || domainToAdd.length < 3) {
          return await reply('Domain must be at least 3 characters long');
        }
        if (settings.allowedDomains.includes(domainToAdd)) {
          return await reply(`"${domainToAdd}" is already in the allowed list`);
        }
        await updateAntiLinkSettings({ 
            allowedDomains: [...settings.allowedDomains, domainToAdd] 
        });
        return await reply(`✅ Added "${domainToAdd}" to allowed domains`);

      case 'remove':
        const domainToRemove = args[1]?.toLowerCase();
        if (!settings.allowedDomains.includes(domainToRemove)) {
          return await reply(`"${domainToRemove}" not found in the allowed list`);
        }
        await updateAntiLinkSettings({
            allowedDomains: settings.allowedDomains.filter(d => d !== domainToRemove)
        });
        return await reply(`✅ Removed "${domainToRemove}" from allowed domains`);

      case 'list':
        if (settings.allowedDomains.length === 0) {
          return await reply('The allowed domains list is currently empty');
        }
        const chunkSize = 20;
        const domainChunks = [];
        for (let i = 0; i < settings.allowedDomains.length; i += chunkSize) {
          domainChunks.push(settings.allowedDomains.slice(i, i + chunkSize));
        }

        for (let i = 0; i < domainChunks.length; i++) {
          await reply(
            `*Allowed Domains (Chunk ${i + 1}/${domainChunks.length})*\n\n` +
            domainChunks[i].map((d, j) => `${i * chunkSize + j + 1}. ${d}`).join('\n')
          );
        }
        return;

      default:
        return await reply(
          `Invalid command. Use ${prefix}antilink to see available options.\nExample: ${prefix}antilink add example.com`
        );
    }
  });
});
