const { keith } = require('../keizzah/keith');
const { getAutoReactSettings, updateAutoReactSettings } = require('../database/autoreact');
const { getAutoLikeSettings, updateAutoLikeSettings } = require('../database/autolike');
const { getAutoBioSettings, updateAutoBioSettings } = require('../database/autobio');
const { updateAntiCallSettings, getAntiCallSettings } = require('../database/anticall');
keith({
    nomCom: 'autoreact',
    aliases: ['areact', 'autoreaction'],
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
//const { keith } = require('../keizzah/keith');
//const { getAutoLikeSettings, updateAutoLikeSettings } = require('../database/autolike');

keith({
    nomCom: 'autolike',
    aliases: ['autolikestatus', 'autoreactstatus'],
    categorie: 'setting',
    reaction: '❤️'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const param = arg[1]?.toLowerCase();
    const value = parseInt(arg[2]);

    if (!action) {
        const settings = await getAutoLikeSettings();
        return repondre(
            `❤️ *AutoLike Settings*\n\n` +
            `Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Throttle: ${settings.throttle_delay}ms\n` +
            `Reaction Delay: ${settings.reaction_delay}ms\n` +
            `Emojis: ${settings.emojis.slice(0, 5).join(' ')}...\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}autolike on/off\n` +
            `▸ ${prefixe}autolike throttle [ms]\n` +
            `▸ ${prefixe}autolike delay [ms]\n` +
            `▸ ${prefixe}autolike emojis 😀 👍 🎉`
        );
    }

    try {
        const updates = {};
        let response = '';

        if (action === 'on' || action === 'off') {
            updates.status = action;
            response = `✅ AutoLike ${action === 'on' ? 'ENABLED' : 'DISABLED'}`;
        } 
        else if (action === 'throttle' && !isNaN(value) && value > 0) {
            updates.throttle_delay = value;
            response = `✅ Throttle delay set to ${value}ms`;
        }
        else if (action === 'delay' && !isNaN(value) && value > 0) {
            updates.reaction_delay = value;
            response = `✅ Reaction delay set to ${value}ms`;
        }
        else if (action === 'emojis' && param) {
            const emojis = arg.slice(1).filter(e => e.trim());
            if (emojis.length > 0) {
                updates.emojis = emojis;
                response = `✅ Emoji list updated (${emojis.length} emojis)`;
            } else {
                return repondre('❌ Please provide at least one emoji');
            }
        }
        else {
            return repondre(`❌ Invalid command. Use ${prefixe}autolike for help`);
        }

        const success = await updateAutoLikeSettings(updates);
        return repondre(success ? response : '❌ Failed to update settings');
    } catch (error) {
        console.error('AutoLike command error:', error);
        return repondre('❌ An error occurred');
    }
});
//const { keith } = require('../keizzah/keith');

keith({
    nomCom: 'autobio',
    aliases: ['setbio', 'updatebio'],
    categorie: 'setting',
    reaction: '📝'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const newMessage = arg.slice(1).join(' ');

    if (!action) {
        const settings = await getAutoBioSettings();
        return repondre(
            `📝 *AutoBio Settings*\n\n` +
            `Status: ${settings.status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
            `Message: ${settings.message}\n` +
            `Timezone: ${settings.timezone}\n\n` +
            `Usage:\n` +
            `▸ ${prefixe}autobio on/off - Toggle AutoBio\n` +
            `▸ ${prefixe}autobio message [text] - Set custom message\n` +
            `▸ ${prefixe}autobio timezone [zone] - Set timezone (e.g., Africa/Nairobi)`
        );
    }

    try {
        let response = '';
        const updates = {};

        if (action === 'on' || action === 'off') {
            updates.status = action;
            response = `✅ AutoBio is now *${action.toUpperCase()}*`;
        } 
        else if (action === 'message' && newMessage) {
            updates.message = newMessage;
            response = `✅ AutoBio message updated!`;
        } 
        else if (action === 'timezone' && newMessage) {
            updates.timezone = newMessage;
            response = `✅ Timezone set to *${newMessage}*`;
        } 
        else {
            return repondre(`❌ Invalid command. Use *${prefixe}autobio* for help.`);
        }

        await updateAutoBioSettings(updates);
        return repondre(response);
    } catch (error) {
        console.error('AutoBio command error:', error);
        return repondre('❌ Failed to update AutoBio settings!');
    }
});


keith({
    nomCom: 'anticall',
    categorie: 'setting',
    reaction: '📵'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, prefixe, superUser } = commandeOptions;

    if (!superUser) return repondre('❌ Owner privileges required');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();

    if (!action) {
        const settings = await getAntiCallSettings();
        return repondre(
            `📵 *Anti-Call Settings*\n\n` +
            `Status: ${settings.status === 'yes' ? '✅ ON' : '❌ OFF'}\n` +
            `Action: ${settings.action}\n\n` +
            `Usage:\n` +
            `${prefixe}anticall on - Enable protection\n` +
            `${prefixe}anticall off - Disable protection\n` +
            `${prefixe}anticall block - Block callers\n` +
            `${prefixe}anticall decline - Just decline calls`
        );
    }

    try {
        let response = '';
        
        switch (action) {
            case 'on':
                await updateAntiCallSettings({ status: 'yes' });
                response = '✅ Anti-call protection ENABLED';
                break;
                
            case 'off':
                await updateAntiCallSettings({ status: 'no' });
                response = '✅ Anti-call protection DISABLED';
                break;
                
            case 'block':
                await updateAntiCallSettings({ action: 'block', status: 'yes' });
                response = '✅ Anti-call set to BLOCK callers';
                break;
                
            case 'decline':
                await updateAntiCallSettings({ action: 'decline', status: 'yes' });
                response = '✅ Anti-call set to DECLINE calls';
                break;
                
            default:
                return repondre(`❌ Invalid option. Use ${prefixe}anticall on/off/block/decline`);
        }

        return repondre(response);
    } catch (error) {
        console.error('Anti-call command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
