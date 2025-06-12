
const { keith } = require('../commandHandler');
const { getAutoBioSettings, updateAutoBioSettings } = require('../database/autobio');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { getAntiCallSettings, updateAntiCallSettings } = require('../database/anticall');
//========================================================================================================================
//========================================================================================================================
keith({
    pattern: "anticall",
    alias: ["callset", "anticallsetting"],
    desc: "Manage anti-call settings",
    category: "Settings",
    react: "📜",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const subcommand = args[0]?.toLowerCase();
        const value = args.slice(1).join(" ");

        const settings = await getAntiCallSettings();

        if (!subcommand) {
            // Show current settings
            const status = settings.status ? '✅ ON' : '❌ OFF';
            const action = settings.action === 'block' ? 'Block caller' : 'Reject call';
            const actionEmoji = settings.action === 'block' ? '🚫' : '❌';

            return await reply(
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
                    return await reply(`⚠️ Anti-call is already ${newStatus ? 'enabled' : 'disabled'}.`);
                }
                await updateAntiCallSettings({ status: newStatus });
                return await reply(`✅ Anti-call has been ${newStatus ? 'enabled' : 'disabled'}.`);
            }

            case 'message': {
                if (!value) return await reply('❌ Please provide a message for anti-call rejection.');
                await updateAntiCallSettings({ message: value });
                return await reply(`✅ Anti-call message updated successfully:\n\n"${value}"`);
            }

            case 'action': {
                if (!value || !['reject', 'block'].includes(value.toLowerCase())) {
                    return await reply(
                        '❌ Invalid action. Use "reject" or "block".\n\n' +
                        '*Reject:* Declines call but allows future calls\n' +
                        '*Block:* Declines and permanently blocks the caller'
                    );
                }
                if (settings.action === value) {
                    return await reply(`⚠️ Action is already set to "${value}".`);
                }
                await updateAntiCallSettings({ action: value.toLowerCase() });
                return await reply(`🔹 Call action changed to: *${value}*\n\n` +
                    (value === 'block' ? 
                        '🚫 Now blocking callers who try to call.' : 
                        '✔️ Calls will now be rejected without blocking.'));
            }

            default:
                return await reply(
                    '❌ Invalid subcommand. Available options:\n\n' +
                    `▸ *${prefix}anticall on/off*\n` +
                    `▸ *${prefix}anticall message <text>*\n` +
                    `▸ *${prefix}anticall action reject/block*`
                );
        }
    });
});
//========================================================================================================================
//========================================================================================================================
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
