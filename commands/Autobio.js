const { keith } = require('../keizzah/keith');
const { getAutoBioSettings, updateAutoBioSettings } = require('../database/autobio');
const { updateAntiCallSettings, getAntiCallSettings } = require('../database/anticall');
keith({
    nomCom: 'autobio',
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
