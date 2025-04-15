const { keith } = require('../keizzah/keith');
const { getAntiLinkSettings, updateAntiLinkSettings } = require('../database/antilink');
const { getWarnings, resetWarnings } = require('../database/warn');
const { getAntiBadWordSettings, updateAntiBadWordSettings } = require('../database/antibadword');
const { getAntiBotSettings, updateAntiBotSettings } = require('../database/antibot');

keith({
    nomCom: 'antibadword',
    categorie: 'setting',
    reaction: '🚫'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, verifGroupe, superUser, verifAdmin, auteurMsgRepondu } = commandeOptions;

    if (!verifGroupe) return repondre('*For groups only*');
    if (!superUser && !verifAdmin) return repondre('*Admin only command*');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();
    const word = arg[2];

    try {
        if (!action) {
            const { status, action: currentAction, wordlist } = await getAntiBadWordSettings(dest);
            return repondre(
                `🚫 *AntiBadWord Settings*\n\n` +
                `Status: ${status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
                `Action: ${currentAction.toUpperCase()}\n` +
                `Word Count: ${wordlist.length}\n\n` +
                `Usage:\n` +
                `▸ .antibadword on/off\n` +
                `▸ .antibadword action delete/warn/remove\n` +
                `▸ .antibadword addword [word]\n` +
                `▸ .antibadword delword [word]`
            );
        }

        switch (action) {
            case 'on':
            case 'off':
                await updateAntiBadWordSettings(dest, { status: action });
                return repondre(`✅ AntiBadWord is now ${action.toUpperCase()}`);
                
            case 'action':
                if (['delete', 'warn', 'remove'].includes(subAction)) {
                    await updateAntiBadWordSettings(dest, { action: subAction });
                    return repondre(`✅ Action set to ${subAction.toUpperCase()}`);
                }
                return repondre('❌ Invalid action. Use delete/warn/remove');
                
            case 'addword':
                if (!word) return repondre('❌ Provide a word to add');
                const { wordlist: currentList } = await getAntiBadWordSettings(dest);
                if (currentList.includes(word.toLowerCase())) {
                    return repondre(`❌ "${word}" already in list`);
                }
                await updateAntiBadWordSettings(dest, { 
                    wordlist: [...currentList, word.toLowerCase()] 
                });
                return repondre(`✅ Added "${word}" to bad words list`);
                
            case 'delword':
                if (!word) return repondre('❌ Provide a word to remove');
                const { wordlist: currentWords } = await getAntiBadWordSettings(dest);
                if (!currentWords.includes(word.toLowerCase())) {
                    return repondre(`❌ "${word}" not in list`);
                }
                await updateAntiBadWordSettings(dest, { 
                    wordlist: currentWords.filter(w => w !== word.toLowerCase()) 
                });
                return repondre(`✅ Removed "${word}" from list`);
                
            default:
                return repondre('❌ Invalid command');
        }
    } catch (error) {
        console.error('AntiBadWord command error:', error);
        return repondre('❌ Failed to process command');
    }
});
//const { keith } = require('../keizzah/keith');

keith({
    nomCom: 'antilink',
    categorie: 'setting',
    reaction: '🔗'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, verifGroupe, superUser, verifAdmin, auteurMsgRepondu } = commandeOptions;

    if (!verifGroupe) return repondre('*For groups only*');
    if (!superUser && !verifAdmin) return repondre('*Admin only command*');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();

    try {
        if (!action) {
            const { status, action: currentAction } = await getAntiLinkSettings(dest);
            return repondre(
                `🔗 *AntiLink Settings*\n\n` +
                `Status: ${status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
                `Action: ${currentAction.toUpperCase()}\n\n` +
                `Usage:\n` +
                `▸ .antilink on/off\n` +
                `▸ .antilink action delete/warn/remove\n` +
                `▸ .antilink warns @user\n` +
                `▸ .antilink reset @user`
            );
        }

        switch (action) {
            case 'on':
            case 'off':
                await updateAntiLinkSettings(dest, { status: action });
                return repondre(`✅ AntiLink is now ${action.toUpperCase()}`);

            case 'action':
                if (['delete', 'warn', 'remove'].includes(subAction)) {
                    await updateAntiLinkSettings(dest, { action: subAction });
                    return repondre(`✅ AntiLink action set to ${subAction.toUpperCase()}`);
                }
                return repondre('❌ Invalid action. Use delete/warn/remove');

            case 'warns':
                if (!auteurMsgRepondu) return repondre('❌ Mention a user');
                const warnCount = await getWarnings(auteurMsgRepondu, dest);
                return repondre(
                    `⚠️ @${auteurMsgRepondu.split('@')[0]} has ${warnCount} warning(s)`,
                    { mentions: [auteurMsgRepondu] }
                );

            case 'reset':
                if (!auteurMsgRepondu) return repondre('❌ Mention a user');
                await resetWarnings(auteurMsgRepondu, dest);
                return repondre(
                    `✅ Warnings reset for @${auteurMsgRepondu.split('@')[0]}`,
                    { mentions: [auteurMsgRepondu] }
                );

            default:
                return repondre('❌ Invalid command. Use .antilink for help');
        }
    } catch (error) {
        console.error('AntiLink command error:', error);
        return repondre('❌ Failed to process command');
    }
});
keith({
    nomCom: 'antibot',
    categorie: 'setting',
    reaction: '🤖'
}, async (dest, zk, commandeOptions) => {
    const { arg, repondre, verifGroupe, superUser, verifAdmin } = commandeOptions;

    if (!verifGroupe) return repondre('*For groups only*');
    if (!superUser && !verifAdmin) return repondre('*Admin only command*');

    const action = arg[0]?.toLowerCase();
    const subAction = arg[1]?.toLowerCase();

    try {
        if (!action) {
            const { status, action: currentAction } = await getAntiBotSettings(dest);
            return repondre(
                `🤖 *AntiBot Settings*\n\n` +
                `Status: ${status === 'on' ? '✅ ON' : '❌ OFF'}\n` +
                `Action: ${currentAction.toUpperCase()}\n\n` +
                `Usage:\n` +
                `▸ .antibot on/off\n` +
                `▸ .antibot action delete/warn/remove`
            );
        }

        if (action === 'on' || action === 'off') {
            await updateAntiBotSettings(dest, { status: action });
            return repondre(`✅ AntiBot is now ${action.toUpperCase()}`);
        }

        if (action === 'action' && ['delete', 'warn', 'remove'].includes(subAction)) {
            await updateAntiBotSettings(dest, { action: subAction });
            return repondre(`✅ AntiBot action set to ${subAction.toUpperCase()}`);
        }

        return repondre('❌ Invalid command. Use .antibot for help');
    } catch (error) {
        console.error('AntiBot command error:', error);
        return repondre('❌ Failed to update settings');
    }
});
