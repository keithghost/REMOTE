module.exports = {
    config: {
        name: "hack",
        author: "keithkeizzah",
        description: "Prank hack simulation",
        category: "fun",
        usage: "hack",
        usePrefix: true
    },

    onStart: async function({ bot, msg }) {
        try {
            const chatId = msg.chat.id;
            const steps = [
                "```Injecting Malware```",
                "``` █ 10%```",
                "```█ █ 20%```",
                "```█ █ █ 30%```",
                "```█ █ █ █ 40%```",
                "```█ █ █ █ █ 50%```",
                "```█ █ █ █ █ █ 60%```",
                "```█ █ █ █ █ █ █ 70%```",
                "```█ █ █ █ █ █ █ █ 80%```",
                "```█ █ █ █ █ █ █ █ █ 90%```",
                "```█ █ █ █ █ █ █ █ █ █ 100%```",
                "```System hijacking on process..```\n```Connecting to Server error to find 404```",
                "```Device successfully connected...\nReceiving data...```",
                "```Data hijacked from device 100% completed\nKilling all evidence, killing all malwares...```",
                "```HACKING COMPLETED```",
                "```SENDING LOG DOCUMENTS...```",
                "```SUCCESSFULLY SENT DATA AND Connection disconnected```",
                "```BACKLOGS CLEARED```",
                "```POWERED BY KEITH MD```",
                "```By keithkeizzah```"
            ];

            // Send initial message to get a message we can edit
            let progressMessage = await bot.sendMessage(chatId, steps[0], { parse_mode: 'Markdown' });

            // Edit the same message for each step
            for (let i = 1; i < steps.length; i++) {
                await bot.editMessageText(steps[i], {
                    chat_id: chatId,
                    message_id: progressMessage.message_id,
                    parse_mode: 'Markdown'
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, 'An error occurred during the prank hack simulation.');
        }
    }
};