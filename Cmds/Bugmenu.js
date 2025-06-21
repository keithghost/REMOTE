const { keith } = require('../commandHandler');
const ownerMiddleware = require('../utility/botUtil/Ownermiddleware');
const { getAntiDeleteSettings, updateAntiDeleteSettings } = require('../database/antidelete');
 
keith({
    pattern: "antidl",
    alias: ["deleteset", "antidel"],
    desc: "Manage anti-delete settings",
    category: "Settings",
    react: "👿",
    filename: __filename
}, async (context) => {
    await ownerMiddleware(context, async () => {
        const { args, prefix, reply } = context;
        const [subcommand, ...valueParts] = args;
        const value = valueParts.join(" ");

        const settings = await getAntiDeleteSettings();

        if (!subcommand) {
            const statusText = (setting, name) => `${setting ? '✅ ON' : '❌ OFF'} - *${name}*`;
            
            return await reply(
                `*👿 Anti-Delete Settings*\n\n` +
                `${statusText(settings.status, 'Status')}\n` +
                `${statusText(settings.sendToOwner, 'Send to Owner')}\n` +
                `${statusText(settings.includeGroupInfo, 'Group Info')}\n` +
                `${statusText(settings.includeMedia, 'Media Capture')}\n\n` +
                `🔹 *Notification Text:*\n${settings.notification}\n\n` +
                `*🛠 Usage Instructions:*\n` +
                `▸ *${prefix}antidelete on/off* - Toggle anti-delete\n` +
                `▸ *${prefix}antidelete owner on/off* - Toggle send to owner\n` +
                `▸ *${prefix}antidelete notification <text>* - Set notification\n` +
                `▸ *${prefix}antidelete groupinfo on/off* - Toggle group info\n` +
                `▸ *${prefix}antidelete media on/off* - Toggle media capture`
            );
        }

        const toggleSetting = async (field, name) => {
            if (!['on', 'off'].includes(value.toLowerCase())) {
                return await reply(`❌ Please specify "on" or "off" for ${name}`);
            }
            const newValue = value === 'on';
            if (settings[field] === newValue) {
                return await reply(`⚠️ ${name} is already ${newValue ? 'enabled' : 'disabled'}`);
            }
            await updateAntiDeleteSettings({ [field]: newValue });
            return await reply(`✅ ${name} ${newValue ? 'enabled' : 'disabled'}`);
        };

        switch (subcommand.toLowerCase()) {
            case 'on':
            case 'off':
                await updateAntiDeleteSettings({ status: subcommand === 'on' });
                return await reply(`✅ Anti-delete ${subcommand === 'on' ? 'enabled' : 'disabled'}`);

            case 'owner':
                return await toggleSetting('sendToOwner', 'Send to Owner mode');

            case 'notification':
                if (!value) return await reply('❌ Please provide notification text');
                await updateAntiDeleteSettings({ notification: value });
                return await reply(`✅ Notification text updated:\n\n"${value}"`);

            case 'groupinfo':
                return await toggleSetting('includeGroupInfo', 'Group info inclusion');

            case 'media':
                return await toggleSetting('includeMedia', 'Media capture');

            default:
                return await reply('❌ Invalid command. Use without arguments to see usage.');
        }
    });
});
