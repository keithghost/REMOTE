const { keith } = require('../keizzah/keith');
const { getAutoReactSettings, updateAutoReactSettings } = require('../database/autoreact');

keith({
    nomCom: 'autoreact',
    categorie: 'setting',
    reaction: '❤️'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const emojiList = arg.slice(1).filter(e => e.trim() !== '');

    if (!action) {
        const settings = await getAutoReactSettings();
        return repondre(
            `❤️ *AutoReact Settings*\n\n` +
            `Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Emojis: ${settings.emojis.join(' ')}\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}autoreact on/off - Toggle AutoReact\n` +
            `▸ ${prefixe}autoreact emojis 😊 🎉 ❤️ - Set custom emoji list`
        );
    }

    try {
        let response = '';
        const updates = {};

        if (action === 'on' || action === 'off') {
            updates.status = action;
            response = `✅ AutoReact is now *${action.toUpperCase()}*`;
        } 
        else if (action === 'emojis' && emojiList.length > 0) {
            updates.emojis = emojiList;
            response = `✅ Emoji list updated to: ${emojiList.join(' ')}`;
        } 
        else {
            return repondre(`❌ Invalid command. Use *${prefixe}autoreact* for help.`);
        }

        await updateAutoReactSettings(updates);
        return repondre(response);
    } catch (error) {
        console.error('AutoReact command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
