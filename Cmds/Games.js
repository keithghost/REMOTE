const { keith } = require('../commandHandler');
const axios = require('axios');
//========================================================================================================================
//========================================================================================================================

// Game state storage
const gameSessions = new Map();
// Riddle data will be fetched from URL
let riddles = [];

// Fetch riddles from JSON URL
async function fetchRiddles() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/Keithkeizzah/INFO/refs/heads/main/games/riddle.json');
    if (response.data && Array.isArray(response.data)) {
      riddles = response.data;
      console.log(`✅ Loaded ${riddles.length} riddles from JSON`);
      return true;
    } else {
      console.error('❌ Invalid JSON structure from URL');
      return false;
    }
  } catch (error) {
    console.error('❌ Error fetching riddles:', error.message);
    return false;
  }
}

// Fetch riddles when module loads
fetchRiddles();

//========================================================================================================================
//========================================================================================================================

// Game state storage
const flagGameSessions = new Map();
// Flag data will be fetched from URL
let flags = [];

// Fetch flag data from JSON URL
async function fetchFlags() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/Keithkeizzah/INFO/refs/heads/main/games/flag.json');
    if (response.data && Array.isArray(response.data)) {
      flags = response.data;
      console.log(`✅ Loaded ${flags.length} flags from JSON`);
      return true;
    } else {
      console.error('❌ Invalid JSON structure from URL');
      return false;
    }
  } catch (error) {
    console.error('❌ Error fetching flags:', error.message);
    return false;
  }
}

// Fetch flags when module loads
fetchFlags();
//========================================================================================================================

//========================================================================================================================

keith({
  pattern: "flaggame",
  aliases: ["guessflag", "countrygame"],
  description: "Start a flag guessing game in group",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply, isGroup, sender, senderName } = conText;
  
  if (!isGroup) return reply("❌ This game can only be played in groups!");
  
  if (flagGameSessions.has(from)) {
    return reply("⚠️ A flag game is already running! Use `.endflag` to stop it.");
  }
  
  // Ensure flags are loaded
  if (flags.length === 0) {
    const loaded = await fetchFlags();
    if (!loaded || flags.length === 0) {
      return reply("❌ Failed to load flag data from server. Please try again later.");
    }
  }
  
  // Initialize game session
  const gameSession = {
    host: sender,
    hostName: senderName,
    players: [], // Array of player objects
    totalRounds: 5, // Fixed 5 rounds
    currentRound: 1, // Round counter starts at 1
    currentFlag: null,
    currentOptions: [],
    gameActive: true,
    joinPhase: true,
    currentPlayerIndex: 0,
    scores: new Map(), // playerId -> score
    flagsUsed: [],
    roundTimeout: null,
    joinTimeout: null,
    listener: null,
    roundResults: [], // Store results per round
    playerRounds: new Map(), // Track rounds played per player: playerId -> roundsPlayed
    currentTurn: 0 // Track total turns
  };
  
  flagGameSessions.set(from, gameSession);
  
  // Send game start message
  await client.sendMessage(from, {
    text: `🏳️ *FLAG GUESSING GAME* 🏳️\n\n` +
          `👤 Host: @${sender.split('@')[0]}\n` +
          `🔄 Total Rounds: ${gameSession.totalRounds}\n` +
          `⏰ Join Time: 30 seconds\n\n` +
          `📝 *HOW TO PLAY:*\n` +
          `1. Type "join" to register\n` +
          `2. Each round shows a flag emoji\n` +
          `3. Choose from 4 options (1-4)\n` +
          `4. Each correct answer = 15 points\n` +
          `5. Game ends after ${gameSession.totalRounds} rounds\n\n` +
          `🏆 Winner gets special recognition!\n\n` +
          `Type *join* now! ⏳`
  }, { quoted: mek });
  
  // Set join timeout
  gameSession.joinTimeout = setTimeout(async () => {
    if (flagGameSessions.has(from)) {
      const session = flagGameSessions.get(from);
      if (session.joinPhase) {
        session.joinPhase = false;
        
        if (session.players.length < 2) {
          await client.sendMessage(from, {
            text: "❌ Need at least 2 players to start. Game cancelled."
          });
          flagGameSessions.delete(from);
          return;
        }
        
        // Initialize player rounds tracking
        session.players.forEach(player => {
          session.playerRounds.set(player.id, 0);
        });
        
        // Announce game start
        await client.sendMessage(from, {
          text: `🎯 *FLAG GAME STARTING!* 🎯\n\n` +
                `👥 Players: ${session.players.length}\n` +
                `🔄 Total Rounds: ${session.totalRounds}\n` +
                `🎯 Round 1/${session.totalRounds}\n\n` +
                `Good luck everyone! 🍀`
        });
        
        // Start the first round
        setTimeout(() => startNewFlagRound(from, client, session), 2000);
      }
    }
  }, 30000);
  
  // Setup game listener
  setupFlagGameListener(from, client);
});

//========================================================================================================================

keith({
  pattern: "endflag",
  aliases: ["stopflag"],
  description: "End the current flag game",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup, sender } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = flagGameSessions.get(from);
  if (!gameSession) return reply("❌ No flag game is currently running!");
  
  // Only host can end game
  if (gameSession.host !== sender) {
    return reply("❌ Only the game host can end the game!");
  }
  
  await endFlagGameWithResults(from, client, gameSession, true);
});

//========================================================================================================================

keith({
  pattern: "flagplayers",
  description: "Show current flag game players and scores",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = flagGameSessions.get(from);
  if (!gameSession) return reply("❌ No flag game is currently running!");
  
  let playersMessage = `📊 *FLAG GAME STATUS*\n\n`;
  playersMessage += `🔄 Round: ${gameSession.currentRound}/${gameSession.totalRounds}\n`;
  playersMessage += `👥 Players: ${gameSession.players.length}\n`;
  playersMessage += `🎯 Current Turn: ${gameSession.currentTurn + 1}/${gameSession.players.length}\n\n`;
  playersMessage += `🏆 *CURRENT SCORES:*\n`;
  
  // Sort by score
  const sortedPlayers = Array.from(gameSession.scores.entries())
    .sort(([, a], [, b]) => b - a);
  
  const mentions = [];
  sortedPlayers.forEach(([playerId, score], index) => {
    const player = gameSession.players.find(p => p.id === playerId);
    const mention = `@${playerId.split('@')[0]}`;
    mentions.push(playerId);
    
    const turnIndicator = gameSession.players[gameSession.currentPlayerIndex]?.id === playerId ? "👈 (Your Turn)" : "";
    const roundsPlayed = gameSession.playerRounds.get(playerId) || 0;
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
    playersMessage += `${medal} ${mention}: ${score} points ${turnIndicator}\n`;
  });
  
  if (gameSession.currentFlag) {
    const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
    playersMessage += `\n🎯 *Current Turn:* @${currentPlayer?.id.split('@')[0]}`;
    mentions.push(currentPlayer?.id);
  }
  
  await client.sendMessage(from, {
    text: playersMessage,
    mentions
  });
});

// Setup flag game listener
function setupFlagGameListener(groupId, client) {
  const listener = async (update) => {
    const msg = update.messages[0];
    if (!msg.message || msg.key.remoteJid !== groupId) return;
    
    const gameSession = flagGameSessions.get(groupId);
    if (!gameSession) return;
    
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderName = msg.pushName || "Player";
    
    // Handle join messages during join phase
    if (gameSession.joinPhase && text.toLowerCase().trim() === "join") {
      // Check if already joined
      if (gameSession.players.some(p => p.id === sender)) {
        await client.sendMessage(groupId, {
          text: `❌ @${sender.split('@')[0]} is already registered!`,
          mentions: [sender]
        });
        return;
      }
      
      // Add player
      gameSession.players.push({
        id: sender,
        name: senderName,
        joinedAt: Date.now()
      });
      
      gameSession.scores.set(sender, 0);
      
      await client.sendMessage(groupId, {
        text: `✅ @${sender.split('@')[0]} has joined the flag game!\n` +
              `👥 Total players: ${gameSession.players.length}`,
        mentions: [sender]
      });
      return;
    }
    
    // Handle answers during active game
    if (!gameSession.joinPhase && gameSession.gameActive && gameSession.currentFlag) {
      // Check if it's this player's turn
      const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.id !== sender) return;
      
      // Parse user input (can be number 1-4 or country name)
      const userInput = text.trim();
      const selectedNumber = parseInt(userInput);
      
      let isCorrect = false;
      let selectedCountry = "";
      
      // Check if input is a number 1-4
      if (!isNaN(selectedNumber) && selectedNumber >= 1 && selectedNumber <= 4) {
        // User selected option by number
        selectedCountry = gameSession.currentOptions[selectedNumber - 1];
        isCorrect = selectedCountry === gameSession.currentFlag.country;
      } else {
        // User typed country name (case insensitive)
        selectedCountry = userInput;
        isCorrect = userInput.toLowerCase() === gameSession.currentFlag.country.toLowerCase();
      }
      
      if (isCorrect) {
        // Correct answer - add score
        const currentScore = gameSession.scores.get(sender) || 0;
        gameSession.scores.set(sender, currentScore + 15);
        
        // Update player rounds
        const roundsPlayed = gameSession.playerRounds.get(sender) || 0;
        gameSession.playerRounds.set(sender, roundsPlayed + 1);
        
        // Store round result
        gameSession.roundResults.push({
          round: gameSession.currentRound,
          playerId: sender,
          playerName: senderName,
          correct: true,
          points: 15,
          flag: gameSession.currentFlag.flag,
          country: gameSession.currentFlag.country,
          selectedOption: selectedNumber ? `Option ${selectedNumber}: ${selectedCountry}` : selectedCountry
        });
        
        // Increment total turns
        gameSession.currentTurn++;
        
        await client.sendMessage(groupId, {
          text: `🎉 *CORRECT!* 🎉\n\n` +
                `✅ @${sender.split('@')[0]} guessed correctly!\n` +
                `🏁 Country: ${gameSession.currentFlag.country}\n` +
                `💰 +15 points! Total: ${currentScore + 15}\n\n` +
                `🎯 Round ${gameSession.currentRound} completed!\n` +
                `Moving to next round...`,
          mentions: [sender]
        });
        
        // Clear timeout
        if (gameSession.roundTimeout) {
          clearTimeout(gameSession.roundTimeout);
          gameSession.roundTimeout = null;
        }
        
        // Move to next round
        gameSession.currentRound++;
        
        // Check if game is over
        if (gameSession.currentRound > gameSession.totalRounds) {
          setTimeout(() => endFlagGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Start next round after delay
          setTimeout(() => startNewFlagRound(groupId, client, gameSession), 3000);
        }
        
      } else {
        // Wrong answer - show correct answer and move to next round
        let userResponse = `❌ Wrong answer, @${sender.split('@')[0]}!\n`;
        
        if (selectedNumber && selectedNumber >= 1 && selectedNumber <= 4) {
          userResponse += `You selected: ${selectedCountry}\n`;
        } else {
          userResponse += `You answered: ${userInput}\n`;
        }
        
        userResponse += `\n✅ The correct answer was: ${gameSession.currentFlag.country}\n` +
                       `📍 Capital: ${gameSession.currentFlag.capital}\n` +
                       `🌍 Continent: ${gameSession.currentFlag.continent}\n\n` +
                       `🎯 Round ${gameSession.currentRound} completed!\n` +
                       `Moving to next round...`;
        
        await client.sendMessage(groupId, {
          text: userResponse,
          mentions: [sender]
        });
        
        // Update player rounds
        const roundsPlayed = gameSession.playerRounds.get(sender) || 0;
        gameSession.playerRounds.set(sender, roundsPlayed + 1);
        
        // Store round result
        gameSession.roundResults.push({
          round: gameSession.currentRound,
          playerId: sender,
          playerName: senderName,
          correct: false,
          points: 0,
          flag: gameSession.currentFlag.flag,
          country: gameSession.currentFlag.country,
          selectedOption: selectedNumber ? `Option ${selectedNumber}: ${selectedCountry}` : selectedCountry
        });
        
        // Increment total turns
        gameSession.currentTurn++;
        
        // Clear timeout
        if (gameSession.roundTimeout) {
          clearTimeout(gameSession.roundTimeout);
          gameSession.roundTimeout = null;
        }
        
        // Move to next round
        gameSession.currentRound++;
        
        if (gameSession.currentRound > gameSession.totalRounds) {
          setTimeout(() => endFlagGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Start next round after delay
          setTimeout(() => startNewFlagRound(groupId, client, gameSession), 3000);
        }
      }
    }
  };
  
  // Store listener reference
  flagGameSessions.get(groupId).listener = listener;
  client.ev.on("messages.upsert", listener);
}

// Start a new flag round
async function startNewFlagRound(groupId, client, gameSession) {
  if (!gameSession.gameActive) return;
  
  // Clear any existing timeout
  if (gameSession.roundTimeout) {
    clearTimeout(gameSession.roundTimeout);
  }
  
  // Get random flag that hasn't been used
  const availableFlags = flags.filter(f => 
    !gameSession.flagsUsed.includes(f.country)
  );
  
  if (availableFlags.length === 0) {
    // Reset if all flags used
    gameSession.flagsUsed = [];
  }
  
  const flag = availableFlags[Math.floor(Math.random() * availableFlags.length)];
  gameSession.flagsUsed.push(flag.country);
  gameSession.currentFlag = flag;
  
  // Use the options from JSON, shuffle them
  gameSession.currentOptions = [...flag.options].sort(() => Math.random() - 0.5);
  
  // Move to next player for each round
  gameSession.currentPlayerIndex = (gameSession.currentPlayerIndex + 1) % gameSession.players.length;
  const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
  
  // Announce new round
  await client.sendMessage(groupId, {
    text: `🔄 *ROUND ${gameSession.currentRound}/${gameSession.totalRounds}*\n\n` +
          `🎯 *Current Player:* @${currentPlayer.id.split('@')[0]}\n\n` +
          `🏳️ *GUESS THE COUNTRY:*\n` +
          `${flag.flag} ${flag.flag} ${flag.flag}\n\n` +
          `📋 *OPTIONS:*\n` +
          `1. ${gameSession.currentOptions[0]}\n` +
          `2. ${gameSession.currentOptions[1]}\n` +
          `3. ${gameSession.currentOptions[2]}\n` +
          `4. ${gameSession.currentOptions[3]}\n\n` +
          `💡 *HINT:* Capital city is ${flag.capital}\n` +
          `📍 Continent: ${flag.continent}\n\n` +
          `⏰ Time limit: 25 seconds\n` +
          `📝 Reply with number (1-4) OR type country name!`,
    mentions: [currentPlayer.id]
  });
  
  // Set timeout for this round
  gameSession.roundTimeout = setTimeout(async () => {
    if (flagGameSessions.has(groupId)) {
      const session = flagGameSessions.get(groupId);
      if (session.currentFlag && session.currentFlag.country === flag.country) {
        // Time's up
        const currentPlayer = session.players[session.currentPlayerIndex];
        
        await client.sendMessage(groupId, {
          text: `⏰ *TIME'S UP!*\n\n` +
                `@${currentPlayer.id.split('@')[0]} took too long!\n` +
                `✅ Correct answer: ${flag.country}\n` +
                `📍 Capital: ${flag.capital}\n` +
                `🌍 Continent: ${flag.continent}\n\n` +
                `🎯 Round ${session.currentRound} completed\n` +
                `Moving to next round...`,
          mentions: [currentPlayer.id]
        });
        
        // Store round result
        session.roundResults.push({
          round: session.currentRound,
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          correct: false,
          points: 0,
          flag: flag.flag,
          country: flag.country,
          timeout: true
        });
        
        // Update player rounds
        const roundsPlayed = session.playerRounds.get(currentPlayer.id) || 0;
        session.playerRounds.set(currentPlayer.id, roundsPlayed + 1);
        
        // Move to next round
        session.currentRound++;
        
        if (session.currentRound > session.totalRounds) {
          setTimeout(() => endFlagGameWithResults(groupId, client, session, false), 3000);
        } else {
          setTimeout(() => startNewFlagRound(groupId, client, session), 3000);
        }
      }
    }
  }, 25000);
}

// End game and show results
async function endFlagGameWithResults(groupId, client, gameSession, forcedEnd = false) {
  if (!gameSession.gameActive) return;
  
  gameSession.gameActive = false;
  
  // Clear timeouts
  if (gameSession.roundTimeout) {
    clearTimeout(gameSession.roundTimeout);
  }
  if (gameSession.joinTimeout) {
    clearTimeout(gameSession.joinTimeout);
  }
  
  // Remove listener
  if (gameSession.listener) {
    client.ev.off("messages.upsert", gameSession.listener);
  }
  
  // Prepare final results
  const scoresArray = Array.from(gameSession.scores.entries())
    .sort(([, a], [, b]) => b - a);
  
  let resultsMessage = `🏁 *FLAG GAME ${forcedEnd ? 'ENDED EARLY' : 'FINISHED'}* 🏁\n\n`;
  resultsMessage += `🎯 Rounds Played: ${gameSession.currentRound - 1}/${gameSession.totalRounds}\n`;
  resultsMessage += `👥 Total Players: ${gameSession.players.length}\n\n`;
  
  if (scoresArray.length > 0) {
    resultsMessage += `🏆 *FINAL LEADERBOARD* 🏆\n\n`;
    
    const mentions = [];
    scoresArray.forEach(([playerId, score], index) => {
      const mention = `@${playerId.split('@')[0]}`;
      mentions.push(playerId);
      
      const medal = index === 0 ? "🥇 *GOLD*" : 
                    index === 1 ? "🥈 *SILVER*" : 
                    index === 2 ? "🥉 *BRONZE*" : "   ";
      resultsMessage += `${medal}\n${mention}: ${score} points\n\n`;
    });
    
    // Check for draw (multiple players with same highest score)
    if (scoresArray.length > 1) {
      const highestScore = scoresArray[0][1];
      const playersWithHighestScore = scoresArray.filter(([_, score]) => score === highestScore);
      
      if (playersWithHighestScore.length > 1) {
        // It's a draw
        resultsMessage += `🤝 *IT'S A DRAW!* 🤝\n`;
        resultsMessage += `Multiple players tied with ${highestScore} points!\n\n`;
        
        const drawMentions = playersWithHighestScore.map(([playerId]) => `@${playerId.split('@')[0]}`).join(", ");
        resultsMessage += `🏆 ${drawMentions}`;
      } else {
        // Single winner
        const [winnerId, winnerScore] = scoresArray[0];
        resultsMessage += `🎉 *CONGRATULATIONS!* 🎉\n`;
        resultsMessage += `🏆 @${winnerId.split('@')[0]} wins with ${winnerScore} points!`;
      }
    } else if (scoresArray.length === 1) {
      // Only one player
      const [winnerId, winnerScore] = scoresArray[0];
      resultsMessage += `🎉 *CONGRATULATIONS!* 🎉\n`;
      resultsMessage += `🏆 @${winnerId.split('@')[0]} wins with ${winnerScore} points!`;
    }
    
    await client.sendMessage(groupId, {
      text: resultsMessage,
      mentions
    });
  } else {
    await client.sendMessage(groupId, {
      text: `🏳️ Flag game ended with no scores recorded.`
    });
  }
  
  // Clean up
  flagGameSessions.delete(groupId);
}

//========================================================================================================================
//========================================================================================================================

keith({
  pattern: "riddle",
  aliases: ["riddlegame"],
  description: "Start a turn-based guess game in group",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply, isGroup, sender, senderName } = conText;
  
  if (!isGroup) return reply("❌ This game can only be played in groups!");
  
  if (gameSessions.has(from)) {
    return reply("⚠️ A game is already running! Use `.endgame` to stop it.");
  }
  
  // Ensure riddles are loaded
  if (riddles.length === 0) {
    const loaded = await fetchRiddles();
    if (!loaded || riddles.length === 0) {
      return reply("❌ Failed to load riddles from server. Please try again later.");
    }
  }
  
  // Initialize game session
  const gameSession = {
    host: sender,
    hostName: senderName,
    players: [], // Array of player objects
    totalRounds: 3, // Fixed 3 rounds
    currentRound: 1, // Round counter starts at 1
    currentRiddle: null,
    gameActive: true,
    joinPhase: true,
    currentPlayerIndex: 0,
    scores: new Map(), // playerId -> score
    riddlesUsed: [],
    roundTimeout: null,
    joinTimeout: null,
    listener: null,
    roundResults: [], // Store results per round
    playerRounds: new Map(), // Track rounds played per player: playerId -> roundsPlayed
    currentTurn: 0 // Track total turns to ensure everyone plays 3 rounds
  };
  
  gameSessions.set(from, gameSession);
  
  // Send game start message
  await client.sendMessage(from, {
    text: `🎮 *TURN-BASED GUESS GAME* 🎮\n\n` +
          `👤 Host: @${sender.split('@')[0]}\n` +
          `🔄 Total Rounds: ${gameSession.totalRounds} (3 rounds per player)\n` +
          `⏰ Join Time: 30 seconds\n\n` +
          `📝 *HOW TO PLAY:*\n` +
          `1. Type "join" to register\n` +
          `2. Each player gets 3 rounds\n` +
          `3. Each correct answer = 10 points\n` +
          `4. Game ends after all rounds completed\n\n` +
          `💡 Hints will be provided with each riddle!\n\n` +
          `Type *join* now! ⏳`
  }, { quoted: mek });
  
  // Set join timeout
  gameSession.joinTimeout = setTimeout(async () => {
    if (gameSessions.has(from)) {
      const session = gameSessions.get(from);
      if (session.joinPhase) {
        session.joinPhase = false;
        
        if (session.players.length < 2) {
          await client.sendMessage(from, {
            text: "❌ Need at least 2 players to start. Game cancelled."
          });
          gameSessions.delete(from);
          return;
        }
        
        // Initialize player rounds tracking
        session.players.forEach(player => {
          session.playerRounds.set(player.id, 0);
        });
        
        // Announce game start
        await client.sendMessage(from, {
          text: `🎯 *GAME STARTING!* 🎯\n\n` +
                `👥 Players: ${session.players.length}\n` +
                `🔄 Rounds per Player: ${session.totalRounds}\n` +
                `🎯 Total Turns: ${session.players.length * session.totalRounds}\n` +
                `🏁 Round 1 begins soon...\n\n` +
                `Good luck everyone! 🍀`
        });
        
        // Start the first round
        setTimeout(() => startNewRound(from, client, session), 2000);
      }
    }
  }, 30000);
  
  // Setup game listener
  setupGameListener(from, client);
});

//========================================================================================================================

keith({
  pattern: "endriddle",
  aliases: ["stopgame"],
  description: "End the current game",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup, sender } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = gameSessions.get(from);
  if (!gameSession) return reply("❌ No game is currently running!");
  
  // Only host can end game
  if (gameSession.host !== sender) {
    return reply("❌ Only the game host can end the game!");
  }
  
  await endGameWithResults(from, client, gameSession, true);
});

//========================================================================================================================

keith({
  pattern: "riddleplayers",
  description: "Show current game players and scores",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = gameSessions.get(from);
  if (!gameSession) return reply("❌ No game is currently running!");
  
  let playersMessage = `📊 *GAME STATUS*\n\n`;
  playersMessage += `🔄 Current Round: ${gameSession.currentRound}/${gameSession.totalRounds}\n`;
  playersMessage += `👥 Players: ${gameSession.players.length}\n`;
  playersMessage += `🎯 Current Turn: ${gameSession.currentTurn + 1}/${gameSession.players.length * gameSession.totalRounds}\n\n`;
  playersMessage += `🏆 *CURRENT SCORES:*\n`;
  
  // Sort by score
  const sortedPlayers = Array.from(gameSession.scores.entries())
    .sort(([, a], [, b]) => b - a);
  
  const mentions = [];
  sortedPlayers.forEach(([playerId, score], index) => {
    const player = gameSession.players.find(p => p.id === playerId);
    const mention = `@${playerId.split('@')[0]}`;
    mentions.push(playerId);
    
    const turnIndicator = gameSession.players[gameSession.currentPlayerIndex]?.id === playerId ? "👈 (Your Turn)" : "";
    const roundsPlayed = gameSession.playerRounds.get(playerId) || 0;
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
    playersMessage += `${medal} ${mention}: ${score} points (${roundsPlayed}/3 rounds) ${turnIndicator}\n`;
  });
  
  if (gameSession.currentRiddle) {
    const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
    playersMessage += `\n🎯 *Current Turn:* @${currentPlayer?.id.split('@')[0]}`;
    mentions.push(currentPlayer?.id);
  }
  
  await client.sendMessage(from, {
    text: playersMessage,
    mentions
  });
});

// Setup game listener
function setupGameListener(groupId, client) {
  const listener = async (update) => {
    const msg = update.messages[0];
    if (!msg.message || msg.key.remoteJid !== groupId) return;
    
    const gameSession = gameSessions.get(groupId);
    if (!gameSession) return;
    
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderName = msg.pushName || "Player";
    
    // Handle join messages during join phase
    if (gameSession.joinPhase && text.toLowerCase().trim() === "join") {
      // Check if already joined
      if (gameSession.players.some(p => p.id === sender)) {
        await client.sendMessage(groupId, {
          text: `❌ @${sender.split('@')[0]} is already registered!`,
          mentions: [sender]
        });
        return;
      }
      
      // Add player
      gameSession.players.push({
        id: sender,
        name: senderName,
        joinedAt: Date.now()
      });
      
      gameSession.scores.set(sender, 0);
      
      await client.sendMessage(groupId, {
        text: `✅ @${sender.split('@')[0]} has joined the game!\n` +
              `👥 Total players: ${gameSession.players.length}`,
        mentions: [sender]
      });
      return;
    }
    
    // Handle answers during active game
    if (!gameSession.joinPhase && gameSession.gameActive && gameSession.currentRiddle) {
      // Check if it's this player's turn
      const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.id !== sender) return;
      
      // Check answer
      const userAnswer = text.toLowerCase().trim();
      const correctAnswer = gameSession.currentRiddle.answer.toLowerCase();
      
      if (userAnswer === correctAnswer) {
        // Correct answer - add score
        const currentScore = gameSession.scores.get(sender) || 0;
        gameSession.scores.set(sender, currentScore + 10);
        
        // Update player rounds
        const roundsPlayed = gameSession.playerRounds.get(sender) || 0;
        gameSession.playerRounds.set(sender, roundsPlayed + 1);
        
        // Store round result
        gameSession.roundResults.push({
          round: gameSession.currentRound,
          playerId: sender,
          playerName: senderName,
          correct: true,
          points: 10
        });
        
        // Increment total turns
        gameSession.currentTurn++;
        
        await client.sendMessage(groupId, {
          text: `🎉 *CORRECT ANSWER!* 🎉\n\n` +
                `✅ @${sender.split('@')[0]} got it right!\n` +
                `💡 Answer: ${gameSession.currentRiddle.answer}\n` +
                `💰 +10 points! Total: ${currentScore + 10}\n` +
                `🔄 Rounds completed: ${roundsPlayed + 1}/3\n\n` +
                `⏳ Round completed!\n` +
                `Moving to next player...`,
          mentions: [sender]
        });
        
        // Clear timeout
        if (gameSession.roundTimeout) {
          clearTimeout(gameSession.roundTimeout);
          gameSession.roundTimeout = null;
        }
        
        // Check if all rounds are completed for this player
        if (roundsPlayed + 1 >= gameSession.totalRounds) {
          // This player has completed all rounds
          await client.sendMessage(groupId, {
            text: `✅ @${sender.split('@')[0]} has completed all 3 rounds!`,
            mentions: [sender]
          });
        }
        
        // Check if game should end
        if (shouldEndGame(gameSession)) {
          setTimeout(() => endGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Move to next player
          moveToNextPlayer(groupId, client, gameSession);
        }
        
      } else {
        // Wrong answer - show correct answer
        await client.sendMessage(groupId, {
          text: `❌ Wrong answer, @${sender.split('@')[0]}!\n` +
                `✅ The correct answer was: ${gameSession.currentRiddle.answer}\n` +
                `↪️ Next player's turn...`,
          mentions: [sender]
        });
        
        // Update player rounds even for wrong answer
        const roundsPlayed = gameSession.playerRounds.get(sender) || 0;
        gameSession.playerRounds.set(sender, roundsPlayed + 1);
        
        // Store round result
        gameSession.roundResults.push({
          round: gameSession.currentRound,
          playerId: sender,
          playerName: senderName,
          correct: false,
          points: 0
        });
        
        // Increment total turns
        gameSession.currentTurn++;
        
        // Check if all rounds are completed for this player
        if (roundsPlayed + 1 >= gameSession.totalRounds) {
          await client.sendMessage(groupId, {
            text: `✅ @${sender.split('@')[0]} has completed all 3 rounds!`,
            mentions: [sender]
          });
        }
        
        // Check if game should end
        if (shouldEndGame(gameSession)) {
          setTimeout(() => endGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Move to next player
          moveToNextPlayer(groupId, client, gameSession);
        }
      }
    }
  };
  
  // Store listener reference
  gameSessions.get(groupId).listener = listener;
  client.ev.on("messages.upsert", listener);
}

// Check if game should end (all players played 3 rounds)
function shouldEndGame(gameSession) {
  const totalRoundsNeeded = gameSession.players.length * gameSession.totalRounds;
  return gameSession.currentTurn >= totalRoundsNeeded;
}

// Start a new round
async function startNewRound(groupId, client, gameSession) {
  if (!gameSession.gameActive || shouldEndGame(gameSession)) return;
  
  // Clear any existing timeout
  if (gameSession.roundTimeout) {
    clearTimeout(gameSession.roundTimeout);
  }
  
  // Get current player
  const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
  const roundsPlayed = gameSession.playerRounds.get(currentPlayer.id) || 0;
  
  // Check if this player still has rounds to play
  if (roundsPlayed >= gameSession.totalRounds) {
    // This player already completed all rounds, move to next
    moveToNextPlayer(groupId, client, gameSession);
    return;
  }
  
  // Get random riddle that hasn't been used
  const availableRiddles = riddles.filter(r => 
    !gameSession.riddlesUsed.includes(r.answer)
  );
  
  if (availableRiddles.length === 0) {
    // Reset if all riddles used
    gameSession.riddlesUsed = [];
  }
  
  const riddle = availableRiddles[Math.floor(Math.random() * availableRiddles.length)];
  gameSession.riddlesUsed.push(riddle.answer);
  gameSession.currentRiddle = riddle;
  
  // Update current round for this player
  gameSession.currentRound = roundsPlayed + 1;
  
  // Get a random hint from the riddle's hints array
  const randomHint = riddle.hints && riddle.hints.length > 0 
    ? riddle.hints[Math.floor(Math.random() * riddle.hints.length)]
    : "No hint available";
  
  // Announce new round
  await client.sendMessage(groupId, {
    text: `🔄 *ROUND ${gameSession.currentRound}/3*\n\n` +
          `🎯 *Current Player:* @${currentPlayer.id.split('@')[0]}\n` +
          `📊 Rounds Played: ${roundsPlayed}/3\n\n` +
          `❓ *RIDDLE:*\n${riddle.question}\n\n` +
          `💡 *HINT:* ${randomHint}\n\n` +
          `⏰ Time limit: 30 seconds\n` +
          `📝 Type your answer in chat!`,
    mentions: [currentPlayer.id]
  });
  
  // Set timeout for this turn
  gameSession.roundTimeout = setTimeout(async () => {
    if (gameSessions.has(groupId)) {
      const session = gameSessions.get(groupId);
      if (session.currentRiddle && session.currentRiddle.answer === riddle.answer) {
        // Time's up
        const currentPlayer = session.players[session.currentPlayerIndex];
        const roundsPlayed = session.playerRounds.get(currentPlayer.id) || 0;
        
        await client.sendMessage(groupId, {
          text: `⏰ *TIME'S UP!*\n\n` +
                `@${currentPlayer.id.split('@')[0]} took too long!\n` +
                `✅ Correct answer: ${riddle.answer}\n` +
                `🔄 Rounds completed: ${roundsPlayed + 1}/3\n\n` +
                `↪️ Moving to next player...`,
          mentions: [currentPlayer.id]
        });
        
        // Update player rounds
        session.playerRounds.set(currentPlayer.id, roundsPlayed + 1);
        
        // Store round result
        session.roundResults.push({
          round: session.currentRound,
          playerId: currentPlayer.id,
          playerName: currentPlayer.name,
          correct: false,
          points: 0,
          timeout: true
        });
        
        // Increment total turns
        session.currentTurn++;
        
        // Check if game should end
        if (shouldEndGame(session)) {
          setTimeout(() => endGameWithResults(groupId, client, session, false), 3000);
        } else {
          // Move to next player
          moveToNextPlayer(groupId, client, session);
        }
      }
    }
  }, 30000);
}

// Move to next player
function moveToNextPlayer(groupId, client, gameSession) {
  if (shouldEndGame(gameSession)) return;
  
  // Find next player who hasn't completed all rounds
  let attempts = 0;
  do {
    // Move to next player index
    gameSession.currentPlayerIndex = (gameSession.currentPlayerIndex + 1) % gameSession.players.length;
    attempts++;
    
    // Safety check to prevent infinite loop
    if (attempts > gameSession.players.length * 2) {
      console.error('Error: Could not find next player with remaining rounds');
      endGameWithResults(groupId, client, gameSession, false);
      return;
    }
  } while ((gameSession.playerRounds.get(gameSession.players[gameSession.currentPlayerIndex]?.id) || 0) >= gameSession.totalRounds);
  
  // Start next player's turn
  setTimeout(() => startNewRound(groupId, client, gameSession), 2000);
}

// End game and show results
async function endGameWithResults(groupId, client, gameSession, forcedEnd = false) {
  if (!gameSession.gameActive) return;
  
  gameSession.gameActive = false;
  
  // Clear timeouts
  if (gameSession.roundTimeout) {
    clearTimeout(gameSession.roundTimeout);
  }
  if (gameSession.joinTimeout) {
    clearTimeout(gameSession.joinTimeout);
  }
  
  // Remove listener
  if (gameSession.listener) {
    client.ev.off("messages.upsert", gameSession.listener);
  }
  
  // Prepare final results
  const scoresArray = Array.from(gameSession.scores.entries())
    .sort(([, a], [, b]) => b - a);
  
  let resultsMessage = `🏁 *GAME ${forcedEnd ? 'ENDED EARLY' : 'FINISHED'}* 🏁\n\n`;
  resultsMessage += `🎯 Total Turns: ${gameSession.currentTurn}\n`;
  resultsMessage += `👥 Total Players: ${gameSession.players.length}\n`;
  resultsMessage += `🔄 Rounds per Player: ${gameSession.totalRounds}\n\n`;
  
  if (scoresArray.length > 0) {
    resultsMessage += `🏆 *FINAL LEADERBOARD* 🏆\n\n`;
    
    const mentions = [];
    scoresArray.forEach(([playerId, score], index) => {
      const player = gameSession.players.find(p => p.id === playerId);
      const mention = `@${playerId.split('@')[0]}`;
      mentions.push(playerId);
      
      const roundsPlayed = gameSession.playerRounds.get(playerId) || 0;
      const medal = index === 0 ? "🥇 *GOLD*" : 
                    index === 1 ? "🥈 *SILVER*" : 
                    index === 2 ? "🥉 *BRONZE*" : "   ";
      resultsMessage += `${medal}\n${mention}: ${score} points (${roundsPlayed}/3 rounds)\n\n`;
    });
    
    // Check for draw (multiple players with same highest score)
    if (scoresArray.length > 1) {
      const highestScore = scoresArray[0][1];
      const playersWithHighestScore = scoresArray.filter(([_, score]) => score === highestScore);
      
      if (playersWithHighestScore.length > 1) {
        // It's a draw
        resultsMessage += `🤝 *IT'S A DRAW!* 🤝\n`;
        resultsMessage += `Multiple players tied with ${highestScore} points!\n\n`;
        
        const drawMentions = playersWithHighestScore.map(([playerId]) => `@${playerId.split('@')[0]}`).join(", ");
        resultsMessage += `🏆 ${drawMentions}`;
      } else {
        // Single winner
        const [winnerId, winnerScore] = scoresArray[0];
        resultsMessage += `🎉 *CONGRATULATIONS!* 🎉\n`;
        resultsMessage += `🏆 @${winnerId.split('@')[0]} wins with ${winnerScore} points!`;
      }
    } else if (scoresArray.length === 1) {
      // Only one player
      const [winnerId, winnerScore] = scoresArray[0];
      resultsMessage += `🎉 *CONGRATULATIONS!* 🎉\n`;
      resultsMessage += `🏆 @${winnerId.split('@')[0]} wins with ${winnerScore} points!`;
    }
    
    await client.sendMessage(groupId, {
      text: resultsMessage,
      mentions
    });
  } else {
    await client.sendMessage(groupId, {
      text: `🎮 Game ended with no scores recorded.`
    });
  }
  
  // Clean up
  gameSessions.delete(groupId);
}

//========================================================================================================================
