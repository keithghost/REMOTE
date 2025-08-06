module.exports = {
    config: {
        name: "shell",
        author: "keithkeizzah",
        description: "Access the shell (admin only)",
        category: "utility",
        usage: "shell <command>",
        usePrefix: true,
        role: 0
    },
    onStart: async function ({ bot, chatId, userId, args }) {
        const command = args.join(' ');

        if (!command) {
            return bot.sendMessage(chatId, `Please provide a command. Usage: /shell <command>`);
        }

        try {
            const { exec } = require('child_process');
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing command: ${error.message}`);
                    return bot.sendMessage(chatId, `Error: ${error.message}`);
                }
                if (stderr) {
                    console.error(`Command stderr: ${stderr}`);
                    return bot.sendMessage(chatId, `Error: ${stderr}`);
                }
                
                // Truncate very long output to prevent flooding
                const output = stdout || 'Command executed successfully (no output)';
                const truncatedOutput = output.length > 2000 
                    ? output.substring(0, 2000) + '... [output truncated]' 
                    : output;
                
                console.log(`Command output: ${output}`);
                bot.sendMessage(chatId, `Output:\n${truncatedOutput}`);
            });
        } catch (error) {
            console.error('[ERROR]', error);
            bot.sendMessage(chatId, `An error occurred: ${error.message}`);
        }
    }
};