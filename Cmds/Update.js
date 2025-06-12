
const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { getAntiDeleteSettings, updateAntiDeleteSettings } = require('../database/antidelete');

keith({
    pattern: "antidelete",
    alias: ["deleteset", "antideletesetting"],
    desc: "Manage anti-delete settings",
    category: "Settings",
    react: "👿",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const subcommand = args[0]?.toLowerCase();
        const value = args.slice(1).join(" ");

        const settings = await getAntiDeleteSettings();

        if (!subcommand) {
            // Show current settings
            const status = settings.status ? '✅ ON' : '❌ OFF';
            const groupInfo = settings.includeGroupInfo ? '✅ ON' : '❌ OFF';
            const media = settings.includeMedia ? '✅ ON' : '❌ OFF';

            return await reply(
                `*👿 Anti-Delete Settings*\n\n` +
                `🔹 *Status:* ${status}\n` +
                `🔹 *Notification Text:* ${settings.notification}\n` +
                `🔹 *Include Group Info:* ${groupInfo}\n` +
                `🔹 *Include Media Content:* ${media}\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}antidelete on/off* - Toggle anti-delete\n` +
                `▸ *${prefix}antidelete notification <text>* - Set notification text\n` +
                `▸ *${prefix}antidelete groupinfo on/off* - Toggle group info inclusion\n` +
                `▸ *${prefix}antidelete media on/off* - Toggle media content inclusion`
            );
        }

        switch (subcommand) {
            case 'on':
            case 'off': {
                const newStatus = subcommand === 'on';
                if (settings.status === newStatus) {
                    return await reply(`⚠️ Anti-delete is already ${newStatus ? 'enabled' : 'disabled'}.`);
                }
                await updateAntiDeleteSettings({ status: newStatus });
                return await reply(`✅ Anti-delete has been ${newStatus ? 'enabled' : 'disabled'}.`);
            }

            case 'notification': {
                if (!value) return await reply('❌ Please provide a notification text.');
                await updateAntiDeleteSettings({ notification: value });
                return await reply(`✅ Anti-delete notification updated successfully:\n\n"${value}"`);
            }

            case 'groupinfo': {
                if (!value || !['on', 'off'].includes(value.toLowerCase())) {
                    return await reply('❌ Invalid value. Use "on" or "off".');
                }
                const newValue = value === 'on';
                if (settings.includeGroupInfo === newValue) {
                    return await reply(`⚠️ Group info inclusion is already ${newValue ? 'enabled' : 'disabled'}.`);
                }
                await updateAntiDeleteSettings({ includeGroupInfo: newValue });
                return await reply(`✅ Group info inclusion ${newValue ? 'enabled' : 'disabled'}.`);
            }

            case 'media': {
                if (!value || !['on', 'off'].includes(value.toLowerCase())) {
                    return await reply('❌ Invalid value. Use "on" or "off".');
                }
                const newValue = value === 'on';
                if (settings.includeMedia === newValue) {
                    return await reply(`⚠️ Media content inclusion is already ${newValue ? 'enabled' : 'disabled'}.`);
                }
                await updateAntiDeleteSettings({ includeMedia: newValue });
                return await reply(`✅ Media content inclusion ${newValue ? 'enabled' : 'disabled'}.`);
            }

            default:
                return await reply(
                    '❌ Invalid subcommand. Available options:\n\n' +
                    `▸ *${prefix}antidelete on/off*\n` +
                    `▸ *${prefix}antidelete notification <text>*\n` +
                    `▸ *${prefix}antidelete groupinfo on/off*\n` +
                    `▸ *${prefix}antidelete media on/off*`
                );
        }
    });
});
