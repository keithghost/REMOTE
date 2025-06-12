
const { keith } = require('../commandHandler');
const { getAutoBioSettings, updateAutoBioSettings } = require('../database/autobio');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');

keith({
    pattern: "autobio",
    alias: ["bio", "setbio"],
    desc: "Manage auto-bio settings",
    category: "Settings",
    react: "📜",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { m, args, prefix, reply } = context;
        const subcommand = args[0]?.toLowerCase();
        const value = args[1]?.toLowerCase();

        const settings = await getAutoBioSettings();

        if (!subcommand) {
            // Show current settings
            const status = settings.status ? '✅ ON' : '❌ OFF';
            const messagePreview = settings.message || '*No message set*';

            return await reply(
                `*⏳ Auto-Bio Settings*\n\n` +
                `🔹 *Status:* ${status}\n` +
                `🔹 *Message:* ${messagePreview}\n` +
                `🔹 *Interval:* ${settings.interval} seconds\n\n` +
                `*📝 Usage Instructions:*\n` +
                `▸ *${prefix}autobio on/off* - Toggle auto-bio\n` +
                `▸ *${prefix}autobio message <text>* - Set bio message\n` +
                `▸ *${prefix}autobio interval <seconds>* - Set update interval (min 5s)`
            );
        }

        switch (subcommand) {
            case 'on':
            case 'off': {
                const newStatus = subcommand === 'on';
                if (settings.status === newStatus) {
                    return await reply(`⚠️ Auto-bio is already ${newStatus ? 'enabled' : 'disabled'}.`);
                }
                await updateAutoBioSettings({ status: newStatus });
                return await reply(`✅ Auto-bio has been ${newStatus ? 'enabled' : 'disabled'}.`);
            }

            case 'message': {
                if (!args[1]) return await reply('❌ Please provide a message for your auto-bio.');
                const newMessage = args.slice(1).join(' ');
                if (newMessage.length > 140) {
                    return await reply('❌ Bio message too long (max 140 characters).');
                }
                await updateAutoBioSettings({ message: newMessage });
                return await reply(`✅ Auto-bio message updated successfully:\n\n"${newMessage}"`);
            }

            case 'interval': {
                if (!value) return await reply('❌ Please provide an interval in seconds.');
                const interval = parseInt(value);
                if (isNaN(interval)) return await reply('❌ Please provide a valid number for interval.');
                if (interval < 5) return await reply('❌ Minimum interval is 5 seconds.');
                await updateAutoBioSettings({ interval });
                return await reply(`✅ Auto-bio interval updated to ${interval} seconds.`);
            }

            default:
                return await reply(
                    '❌ Invalid command. Available subcommands:\n\n' +
                    `▸ *${prefix}autobio on/off*\n` +
                    `▸ *${prefix}autobio message <text>*\n` +
                    `▸ *${prefix}autobio interval <seconds>*`
                );
        }
    });
});
