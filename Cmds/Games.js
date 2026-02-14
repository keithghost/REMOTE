/*const { keith } = require('../commandHandler');
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

// Game state storage
const triviaGameSessions = new Map();
const API_URL = 'https://apiskeith.top/fun/question';

//========================================================================================================================

// Tic Tac Toe Manager Class (Multiplayer with join system)
class TicTacToeManager {
  constructor() {
    this.gameSessions = new Map(); // chatId -> game session
    this.timeouts = new Map();
  }

  createGameSession(chatId, host) {
    const session = {
      host: host,
      players: [], // Array of player objects
      board: Array(9).fill(null),
      currentPlayerIndex: 0,
      symbols: ["❌", "⭕", "⭐", "🔷", "🔶", "🟢", "🟣", "🟡", "🔴"], // For up to 9 players
      gameActive: true,
      joinPhase: true,
      joinTimeout: null,
      moveTimeout: null,
      startedAt: Date.now(),
      lastMove: Date.now(),
      listener: null
    };
    
    this.gameSessions.set(chatId, session);
    return session;
  }

  joinGame(chatId, playerId) {
    if (!this.gameSessions.has(chatId)) return null;
    
    const session = this.gameSessions.get(chatId);
    
    // Check if already joined
    if (session.players.some(p => p.id === playerId)) {
      return { success: false, message: "Already joined!" };
    }
    
    // Add player
    session.players.push({
      id: playerId,
      name: playerId.split('@')[0],
      symbol: session.symbols[session.players.length % session.symbols.length]
    });
    
    return { success: true, players: session.players.length };
  }

  startGame(chatId) {
    if (!this.gameSessions.has(chatId)) return false;
    
    const session = this.gameSessions.get(chatId);
    
    if (session.players.length < 2) {
      return { success: false, message: "Need at least 2 players to start!" };
    }
    
    session.joinPhase = false;
    session.gameActive = true;
    session.currentPlayerIndex = 0;
    
    return { success: true, session: session };
  }

  makeMove(chatId, playerId, position) {
    if (!this.gameSessions.has(chatId)) {
      return { success: false, message: "No active game!" };
    }
    
    const session = this.gameSessions.get(chatId);
    
    // Check if it's this player's turn
    const currentPlayer = session.players[session.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id !== playerId) {
      return { success: false, message: "Not your turn!" };
    }
    
    // Check position validity
    if (position < 0 || position > 8 || session.board[position] !== null) {
      return { success: false, message: "Invalid move!" };
    }
    
    // Make the move
    session.board[position] = {
      symbol: currentPlayer.symbol,
      playerId: playerId,
      playerName: playerId.split('@')[0]
    };
    
    session.lastMove = Date.now();
    
    // Check for winner
    const winner = this.checkWinner(session.board);
    if (winner) {
      session.gameActive = false;
      return { 
        success: true, 
        win: true, 
        winner: winner,
        board: session.board 
      };
    }
    
    // Check for draw
    if (!session.board.includes(null)) {
      session.gameActive = false;
      return { success: true, draw: true, board: session.board };
    }
    
    // Move to next player
    session.currentPlayerIndex = (session.currentPlayerIndex + 1) % session.players.length;
    
    return { 
      success: true, 
      nextPlayer: session.players[session.currentPlayerIndex],
      board: session.board 
    };
  }

  checkWinner(board) {
    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    
    for (const line of winningLines) {
      const [a, b, c] = line;
      if (board[a] && board[b] && board[c] &&
          board[a].playerId === board[b].playerId &&
          board[a].playerId === board[c].playerId) {
        return board[a]; // Return the winning player info
      }
    }
    
    return null;
  }

  formatBoard(board) {
    const nums = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣"];
    let out = "┄┄┄┄┄┄┄┄┄┄\n";
    for (let i = 0; i < 3; i++) {
      out += "┃ ";
      for (let j = 0; j < 3; j++) {
        const p = i * 3 + j;
        if (board[p]) {
          out += board[p].symbol + " ┃ ";
        } else {
          out += nums[p] + " ┃ ";
        }
      }
      out += "\n";
      if (i < 2) out += "┄┄┄┄┄┄┄┄┄┄\n";
    }
    return out + "┄┄┄┄┄┄┄┄┄┄";
  }

  endGame(chatId) {
    if (this.gameSessions.has(chatId)) {
      const session = this.gameSessions.get(chatId);
      
      // Clear timeouts
      if (session.joinTimeout) clearTimeout(session.joinTimeout);
      if (session.moveTimeout) clearTimeout(session.moveTimeout);
      
      // Remove listener
      if (session.listener) {
        // Note: We'll remove it outside since we need the client reference
      }
      
      this.gameSessions.delete(chatId);
      return true;
    }
    return false;
  }

  getSession(chatId) {
    return this.gameSessions.get(chatId);
  }
}

const ttt = new TicTacToeManager();

//========================================================================================================================


// Game state storage
const mathGameSessions = new Map();
// Math problems will be fetched from URL
let mathProblems = [];

// Fetch math problems from JSON URL
async function fetchMathProblems() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/Keithkeizzah/INFO/refs/heads/main/games/maths.json');
    if (response.data && Array.isArray(response.data)) {
      mathProblems = response.data;
      console.log(`✅ Loaded ${mathProblems.length} math problems from JSON`);
      return true;
    } else {
      console.error('❌ Invalid JSON structure from URL');
      return false;
    }
  } catch (error) {
    console.error('❌ Error fetching math problems:', error.message);
    return false;
  }
}

// Fetch math problems when module loads
fetchMathProblems();

//========================================================================================================================
//========================================================================================================================
//========================================================================================================================

// Game state storage
const footballGameSessions = new Map();
// Football questions will be fetched from URL
let footballQuestions = [];

// Fetch football questions from JSON URL
async function fetchFootballQuestions() {
  try {
    const response = await axios.get('https://raw.githubusercontent.com/Keithkeizzah/INFO/refs/heads/main/games/football.json');
    if (response.data && Array.isArray(response.data)) {
      footballQuestions = response.data;
      console.log(`✅ Loaded ${footballQuestions.length} football questions from JSON`);
      return true;
    } else {
      console.error('❌ Invalid JSON structure from URL');
      return false;
    }
  } catch (error) {
    console.error('❌ Error fetching football questions:', error.message);
    return false;
  }
}

// Fetch football questions when module loads
fetchFootballQuestions();

//========================================================================================================================

keith({
  pattern: "football",
  aliases: ["footballquiz", "fpl", "premierleague"],
  description: "Start a football quiz game about Premier League teams",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply, isGroup, sender, senderName } = conText;
  
  if (!isGroup) return reply("❌ This game can only be played in groups!");
  
  if (footballGameSessions.has(from)) {
    return reply("⚠️ A football quiz is already running! Use `.endfootball` to stop it.");
  }
  
  // Ensure football questions are loaded
  if (footballQuestions.length === 0) {
    const loaded = await fetchFootballQuestions();
    if (!loaded || footballQuestions.length === 0) {
      return reply("❌ Failed to load football questions from server. Please try again later.");
    }
  }
  
  // Initialize game session
  const gameSession = {
    host: sender,
    hostName: senderName,
    players: [], // Array of player objects
    totalRounds: 8, // Fixed 8 rounds
    currentRound: 1, // Round counter starts at 1
    currentQuestion: null,
    currentOptions: [],
    gameActive: true,
    joinPhase: true,
    currentPlayerIndex: 0,
    scores: new Map(), // playerId -> score
    questionsUsed: [],
    roundTimeout: null,
    joinTimeout: null,
    listener: null,
    roundResults: [], // Store results per round
    playerRounds: new Map(), // Track rounds played per player
    currentTurn: 0, // Track total turns
    teams: ["Manchester United", "Chelsea", "Arsenal", "Manchester City", "Liverpool"], // Supported teams
    selectedTeam: null, // Current team for themed questions
    teamQuestions: new Map() // Track questions per team
  };
  
  footballGameSessions.set(from, gameSession);
  
  // Send game start message
  await client.sendMessage(from, {
    text: `⚽ *FOOTBALL PREMIER LEAGUE QUIZ* ⚽\n\n` +
          `👤 Host: @${sender.split('@')[0]}\n` +
          `🔄 Total Rounds: ${gameSession.totalRounds}\n` +
          `⏰ Join Time: 30 seconds\n\n` +
          `🏆 *FEATURED TEAMS:*\n` +
          `• Manchester United 🔴\n` +
          `• Chelsea 🔵\n` +
          `• Arsenal ❤️\n` +
          `• Manchester City 💙\n` +
          `• Liverpool 🔴\n\n` +
          `📝 *HOW TO PLAY:*\n` +
          `1. Type "join" to register\n` +
          `2. Each round focuses on a Premier League team\n` +
          `3. Choose from 4 options (1-4)\n` +
          `4. Points based on difficulty:\n` +
          `   • Easy: 10 points\n` +
          `   • Medium: 15 points\n` +
          `   • Hard: 20 points\n\n` +
          `🎯 Questions about players, managers, trophies & history!\n\n` +
          `Type *join* now! ⏳`
  }, { quoted: mek });
  
  // Set join timeout
  gameSession.joinTimeout = setTimeout(async () => {
    if (footballGameSessions.has(from)) {
      const session = footballGameSessions.get(from);
      if (session.joinPhase) {
        session.joinPhase = false;
        
        if (session.players.length < 2) {
          await client.sendMessage(from, {
            text: "❌ Need at least 2 players to start. Game cancelled."
          });
          footballGameSessions.delete(from);
          return;
        }
        
        // Initialize player rounds tracking
        session.players.forEach(player => {
          session.playerRounds.set(player.id, 0);
        });
        
        // Announce game start
        await client.sendMessage(from, {
          text: `🎯 *FOOTBALL QUIZ STARTING!* 🎯\n\n` +
                `👥 Players: ${session.players.length}\n` +
                `🔄 Total Rounds: ${session.totalRounds}\n` +
                `🎯 Round 1/${session.totalRounds}\n\n` +
                `Get ready for some football action! ⚽`
        });
        
        // Start the first round
        setTimeout(() => startNewFootballRound(from, client, session), 2000);
      }
    }
  }, 30000);
  
  // Setup game listener
  setupFootballGameListener(from, client);
});

//========================================================================================================================

keith({
  pattern: "endfootball",
  aliases: ["stopfootball", "endfpl"],
  description: "End the current football quiz",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup, sender } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = footballGameSessions.get(from);
  if (!gameSession) return reply("❌ No football quiz is currently running!");
  
  // Only host can end game
  if (gameSession.host !== sender) {
    return reply("❌ Only the game host can end the game!");
  }
  
  await endFootballGameWithResults(from, client, gameSession, true);
});

//========================================================================================================================

keith({
  pattern: "footballplayers",
  aliases: ["fplplayers"],
  description: "Show current football quiz players and scores",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = footballGameSessions.get(from);
  if (!gameSession) return reply("❌ No football quiz is currently running!");
  
  let playersMessage = `📊 *FOOTBALL QUIZ STATUS*\n\n`;
  playersMessage += `🔄 Round: ${gameSession.currentRound}/${gameSession.totalRounds}\n`;
  playersMessage += `👥 Players: ${gameSession.players.length}\n`;
  playersMessage += `🎯 Current Turn: ${gameSession.currentTurn + 1}/${gameSession.players.length}\n`;
  
  if (gameSession.selectedTeam) {
    playersMessage += `🏆 Current Team: ${gameSession.selectedTeam}\n`;
  }
  
  playersMessage += `\n🏆 *CURRENT SCORES:*\n`;
  
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
  
  if (gameSession.currentQuestion) {
    const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
    playersMessage += `\n🎯 *Current Turn:* @${currentPlayer?.id.split('@')[0]}`;
    mentions.push(currentPlayer?.id);
  }
  
  await client.sendMessage(from, {
    text: playersMessage,
    mentions
  });
});

// Get points based on difficulty
function getFootballPoints(difficulty) {
  switch(difficulty.toLowerCase()) {
    case 'hard': return 20;
    case 'medium': return 15;
    default: return 10; // Easy
  }
}

// Get team emoji
function getTeamEmoji(team) {
  switch(team) {
    case 'Manchester United': return '🔴';
    case 'Chelsea': return '🔵';
    case 'Arsenal': return '❤️';
    case 'Manchester City': return '💙';
    case 'Liverpool': return '🔴';
    default: return '⚽';
  }
}

// Get random team for round
function getRandomTeam(gameSession) {
  const availableTeams = gameSession.teams.filter(team => {
    const teamQuestions = gameSession.teamQuestions.get(team) || [];
    return teamQuestions.length < 3; // Max 3 questions per team
  });
  
  if (availableTeams.length === 0) {
    // Reset if all teams reached max
    gameSession.teamQuestions.clear();
    return gameSession.teams[Math.floor(Math.random() * gameSession.teams.length)];
  }
  
  return availableTeams[Math.floor(Math.random() * availableTeams.length)];
}

// Get question for specific team
function getQuestionForTeam(gameSession, team) {
  // Filter questions by team category
  let teamQuestions = footballQuestions.filter(q => 
    q.category.toLowerCase().includes(team.toLowerCase()) ||
    q.question.toLowerCase().includes(team.toLowerCase())
  );
  
  // If no team-specific questions, get general football questions
  if (teamQuestions.length === 0) {
    teamQuestions = footballQuestions;
  }
  
  // Filter out used questions
  const availableQuestions = teamQuestions.filter(q => 
    !gameSession.questionsUsed.includes(q.question)
  );
  
  if (availableQuestions.length === 0) {
    // Reset if all questions used
    gameSession.questionsUsed = [];
    return teamQuestions[Math.floor(Math.random() * teamQuestions.length)];
  }
  
  return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
}

// Setup football game listener
function setupFootballGameListener(groupId, client) {
  const listener = async (update) => {
    const msg = update.messages[0];
    if (!msg.message || msg.key.remoteJid !== groupId) return;
    
    const gameSession = footballGameSessions.get(groupId);
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
        text: `✅ @${sender.split('@')[0]} has joined the football quiz!\n` +
              `👥 Total players: ${gameSession.players.length}`,
        mentions: [sender]
      });
      return;
    }
    
    // Handle answers during active game
    if (!gameSession.joinPhase && gameSession.gameActive && gameSession.currentQuestion) {
      // Check if it's this player's turn
      const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.id !== sender) return;
      
      // Parse user input (can be number 1-4 or answer text)
      const userInput = text.trim();
      const selectedNumber = parseInt(userInput);
      
      let isCorrect = false;
      let selectedAnswer = "";
      
      // Check if input is a number 1-4
      if (!isNaN(selectedNumber) && selectedNumber >= 1 && selectedNumber <= 4) {
        // User selected option by number
        selectedAnswer = gameSession.currentOptions[selectedNumber - 1];
        isCorrect = selectedAnswer === gameSession.currentQuestion.answer;
      } else {
        // User typed answer (case insensitive)
        selectedAnswer = userInput;
        isCorrect = userInput.toLowerCase() === gameSession.currentQuestion.answer.toLowerCase();
      }
      
      if (isCorrect) {
        // Calculate points based on difficulty
        const points = getFootballPoints(gameSession.currentQuestion.difficulty);
        const currentScore = gameSession.scores.get(sender) || 0;
        gameSession.scores.set(sender, currentScore + points);
        
        // Update player rounds
        const roundsPlayed = gameSession.playerRounds.get(sender) || 0;
        gameSession.playerRounds.set(sender, roundsPlayed + 1);
        
        // Store round result
        gameSession.roundResults.push({
          round: gameSession.currentRound,
          playerId: sender,
          playerName: senderName,
          correct: true,
          points: points,
          question: gameSession.currentQuestion.question,
          correctAnswer: gameSession.currentQuestion.answer,
          difficulty: gameSession.currentQuestion.difficulty,
          category: gameSession.currentQuestion.category,
          selectedOption: selectedNumber ? `Option ${selectedNumber}: ${selectedAnswer}` : selectedAnswer
        });
        
        // Increment total turns
        gameSession.currentTurn++;
        
        await client.sendMessage(groupId, {
          text: `🎉 *GOAL! CORRECT ANSWER!* 🎉\n\n` +
                `✅ @${sender.split('@')[0]} scored!\n` +
                `💡 Correct answer: ${gameSession.currentQuestion.answer}\n` +
                `💰 +${points} points! Total: ${currentScore + points}\n` +
                `📊 Difficulty: ${gameSession.currentQuestion.difficulty.toUpperCase()}\n` +
                `🏆 Team: ${gameSession.currentQuestion.category}\n\n` +
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
          setTimeout(() => endFootballGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Start next round after delay
          setTimeout(() => startNewFootballRound(groupId, client, gameSession), 3000);
        }
        
      } else {
        // Wrong answer
        let userResponse = `❌ *MISS!* Wrong answer, @${sender.split('@')[0]}!\n`;
        
        if (selectedNumber && selectedNumber >= 1 && selectedNumber <= 4) {
          userResponse += `You selected: ${selectedAnswer}\n`;
        } else {
          userResponse += `You answered: ${userInput}\n`;
        }
        
        userResponse += `\n✅ The correct answer was: ${gameSession.currentQuestion.answer}\n` +
                       `📊 Difficulty: ${gameSession.currentQuestion.difficulty.toUpperCase()}\n` +
                       `🏆 Team: ${gameSession.currentQuestion.category}\n\n` +
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
          question: gameSession.currentQuestion.question,
          correctAnswer: gameSession.currentQuestion.answer,
          difficulty: gameSession.currentQuestion.difficulty,
          category: gameSession.currentQuestion.category,
          selectedOption: selectedNumber ? `Option ${selectedNumber}: ${selectedAnswer}` : selectedAnswer
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
          setTimeout(() => endFootballGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Start next round after delay
          setTimeout(() => startNewFootballRound(groupId, client, gameSession), 3000);
        }
      }
    }
  };
  
  // Store listener reference
  footballGameSessions.get(groupId).listener = listener;
  client.ev.on("messages.upsert", listener);
}

// Start a new football round
async function startNewFootballRound(groupId, client, gameSession) {
  if (!gameSession.gameActive) return;
  
  // Clear any existing timeout
  if (gameSession.roundTimeout) {
    clearTimeout(gameSession.roundTimeout);
  }
  
  // Select a random team for this round
  const team = getRandomTeam(gameSession);
  gameSession.selectedTeam = team;
  
  // Get question for this team
  const questionData = getQuestionForTeam(gameSession, team);
  if (!questionData) {
    await client.sendMessage(groupId, {
      text: "❌ Failed to load question. Ending game."
    });
    endFootballGameWithResults(groupId, client, gameSession, false);
    return;
  }
  
  // Store question
  gameSession.currentQuestion = questionData;
  gameSession.questionsUsed.push(questionData.question);
  
  // Update team questions count
  const teamQuestions = gameSession.teamQuestions.get(team) || [];
  teamQuestions.push(questionData.question);
  gameSession.teamQuestions.set(team, teamQuestions);
  
  // Use the options from JSON, shuffle them
  gameSession.currentOptions = [...questionData.options].sort(() => Math.random() - 0.5);
  
  // Move to next player for each round
  gameSession.currentPlayerIndex = (gameSession.currentPlayerIndex + 1) % gameSession.players.length;
  const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
  
  // Get points for this question
  const points = getFootballPoints(questionData.difficulty);
  
  // Get team emoji
  const teamEmoji = getTeamEmoji(team);
  
  // Announce new round
  await client.sendMessage(groupId, {
    text: `🔄 *ROUND ${gameSession.currentRound}/${gameSession.totalRounds}*\n\n` +
          `🎯 *Current Player:* @${currentPlayer.id.split('@')[0]}\n\n` +
          `${teamEmoji} *TEAM FOCUS:* ${team}\n` +
          `📊 *DIFFICULTY:* ${questionData.difficulty.toUpperCase()} (${points} points)\n\n` +
          `❓ *QUESTION:*\n${questionData.question}\n\n` +
          `📋 *OPTIONS:*\n` +
          `1. ${gameSession.currentOptions[0]}\n` +
          `2. ${gameSession.currentOptions[1]}\n` +
          `3. ${gameSession.currentOptions[2]}\n` +
          `4. ${gameSession.currentOptions[3]}\n\n` +
          `⏰ Time limit: ${questionData.timeLimit || 25} seconds\n` +
          `📝 Reply with number (1-4) OR type answer!`,
    mentions: [currentPlayer.id]
  });
  
  // Set timeout for this round
  gameSession.roundTimeout = setTimeout(async () => {
    if (footballGameSessions.has(groupId)) {
      const session = footballGameSessions.get(groupId);
      if (session.currentQuestion && session.currentQuestion.question === questionData.question) {
        // Time's up
        const currentPlayer = session.players[session.currentPlayerIndex];
        
        await client.sendMessage(groupId, {
          text: `⏰ *TIME'S UP!*\n\n` +
                `@${currentPlayer.id.split('@')[0]} took too long!\n` +
                `✅ Correct answer: ${questionData.answer}\n` +
                `📊 Difficulty: ${questionData.difficulty.toUpperCase()}\n` +
                `🏆 Team: ${questionData.category}\n\n` +
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
          question: questionData.question,
          correctAnswer: questionData.answer,
          difficulty: questionData.difficulty,
          category: questionData.category,
          timeout: true
        });
        
        // Update player rounds
        const roundsPlayed = session.playerRounds.get(currentPlayer.id) || 0;
        session.playerRounds.set(currentPlayer.id, roundsPlayed + 1);
        
        // Move to next round
        session.currentRound++;
        
        if (session.currentRound > session.totalRounds) {
          setTimeout(() => endFootballGameWithResults(groupId, client, session, false), 3000);
        } else {
          setTimeout(() => startNewFootballRound(groupId, client, session), 3000);
        }
      }
    }
  }, (questionData.timeLimit || 25) * 1000);
}

// End game and show results
async function endFootballGameWithResults(groupId, client, gameSession, forcedEnd = false) {
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
  
  let resultsMessage = `🏁 *FOOTBALL QUIZ ${forcedEnd ? 'ENDED EARLY' : 'FINISHED'}* 🏁\n\n`;
  resultsMessage += `🎯 Rounds Played: ${gameSession.currentRound - 1}/${gameSession.totalRounds}\n`;
  resultsMessage += `👥 Total Players: ${gameSession.players.length}\n`;
  
  // Calculate team stats
  const teamStats = {};
  gameSession.roundResults.forEach(result => {
    if (result.category) {
      const team = result.category;
      if (!teamStats[team]) teamStats[team] = { correct: 0, total: 0 };
      teamStats[team].total++;
      if (result.correct) teamStats[team].correct++;
    }
  });
  
  if (Object.keys(teamStats).length > 0) {
    resultsMessage += `\n🏆 *TEAM STATISTICS:*\n`;
    Object.entries(teamStats).forEach(([team, stats]) => {
      const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const emoji = getTeamEmoji(team);
      resultsMessage += `${emoji} ${team}: ${stats.correct}/${stats.total} correct (${percentage}%)\n`;
    });
  }
  
  resultsMessage += `\n`;
  
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
        resultsMessage += `⚽ @${winnerId.split('@')[0]} wins with ${winnerScore} points!\n`;
        resultsMessage += `🏆 The football expert!`;
      }
    } else if (scoresArray.length === 1) {
      // Only one player
      const [winnerId, winnerScore] = scoresArray[0];
      resultsMessage += `🎉 *CONGRATULATIONS!* 🎉\n`;
      resultsMessage += `⚽ @${winnerId.split('@')[0]} wins with ${winnerScore} points!\n`;
      resultsMessage += `🏆 The football expert!`;
    }
    
    await client.sendMessage(groupId, {
      text: resultsMessage,
      mentions
    });
  } else {
    await client.sendMessage(groupId, {
      text: `⚽ Football quiz ended with no scores recorded.`
    });
  }
  
  // Clean up
  footballGameSessions.delete(groupId);
}

//========================================================================================================================


//========================================================================================================================
keith({
  pattern: "mathgame",
  aliases: ["maths", "quickmath"],
  description: "Start a math challenge game in group",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply, isGroup, sender } = conText;
  
  if (!isGroup) return reply("❌ This game can only be played in groups!");
  
  if (mathGameSessions.has(from)) {
    return reply("⚠️ A math game is already running! Use `.endmath` to stop it.");
  }
  
  // Ensure math problems are loaded
  if (mathProblems.length === 0) {
    const loaded = await fetchMathProblems();
    if (!loaded || mathProblems.length === 0) {
      return reply("❌ Failed to load math problems from server. Please try again later.");
    }
  }
  
  // Initialize game session
  const gameSession = {
    host: sender,
    players: [], // Array of player objects
    totalRounds: 10, // Fixed 10 rounds
    currentRound: 1, // Round counter starts at 1
    currentProblem: null,
    gameActive: true,
    joinPhase: true,
    currentPlayerIndex: 0,
    scores: new Map(), // playerId -> score
    problemsUsed: [],
    roundTimeout: null,
    joinTimeout: null,
    listener: null,
    roundResults: [], // Store results per round
    playerRounds: new Map(), // Track rounds played per player
    currentTurn: 0 // Track total turns
  };
  
  mathGameSessions.set(from, gameSession);
  
  // Send game start message
  await client.sendMessage(from, {
    text: `🧮 *MATH CHALLENGE GAME* 🧮\n\n` +
          `👤 Host: @${sender.split('@')[0]}\n` +
          `🔄 Total Rounds: ${gameSession.totalRounds}\n` +
          `⏰ Join Time: 30 seconds\n\n` +
          `📝 *HOW TO PLAY:*\n` +
          `1. Type "join" to register\n` +
          `2. Players take turns solving problems\n` +
          `3. Points based on difficulty:\n` +
          `   • Easy: 15 points\n` +
          `   • Medium: 20 points\n` +
          `   • Hard: 25 points\n` +
          `   • Expert: 30 points\n\n` +
          `🏆 Fastest correct answer wins the round!\n\n` +
          `Type *join* now! ⏳`
  }, { quoted: mek });
  
  // Set join timeout
  gameSession.joinTimeout = setTimeout(async () => {
    if (mathGameSessions.has(from)) {
      const session = mathGameSessions.get(from);
      if (session.joinPhase) {
        session.joinPhase = false;
        
        if (session.players.length < 2) {
          await client.sendMessage(from, {
            text: "❌ Need at least 2 players to start. Game cancelled."
          });
          mathGameSessions.delete(from);
          return;
        }
        
        // Initialize player rounds tracking
        session.players.forEach(player => {
          session.playerRounds.set(player.id, 0);
        });
        
        // Announce game start
        await client.sendMessage(from, {
          text: `🎯 *MATH GAME STARTING!* 🎯\n\n` +
                `👥 Players: ${session.players.length}\n` +
                `🔄 Total Rounds: ${session.totalRounds}\n` +
                `🎯 Round 1/${session.totalRounds}\n\n` +
                `Sharpen your minds! 🧠`
        });
        
        // Start the first round
        setTimeout(() => startNewMathRound(from, client, session), 2000);
      }
    }
  }, 30000);
  
  // Setup game listener
  setupMathGameListener(from, client);
});

//========================================================================================================================

keith({
  pattern: "endmath",
  aliases: ["stopmath"],
  description: "End the current math game",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup, sender } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = mathGameSessions.get(from);
  if (!gameSession) return reply("❌ No math game is currently running!");
  
  // Only host can end game
  if (gameSession.host !== sender) {
    return reply("❌ Only the game host can end the game!");
  }
  
  await endMathGameWithResults(from, client, gameSession, true);
});

//========================================================================================================================

keith({
  pattern: "mathplayers",
  description: "Show current math game players and scores",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = mathGameSessions.get(from);
  if (!gameSession) return reply("❌ No math game is currently running!");
  
  let playersMessage = `📊 *MATH GAME STATUS*\n\n`;
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
  
  if (gameSession.currentProblem) {
    const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
    playersMessage += `\n🎯 *Current Turn:* @${currentPlayer?.id.split('@')[0]}`;
    mentions.push(currentPlayer?.id);
  }
  
  await client.sendMessage(from, {
    text: playersMessage,
    mentions
  });
});

// Get points based on difficulty
function getPointsForDifficulty(difficulty) {
  switch(difficulty.toLowerCase()) {
    case 'expert': return 30;
    case 'hard': return 25;
    case 'medium': return 20;
    default: return 15; // Easy
  }
}

// Setup math game listener
function setupMathGameListener(groupId, client) {
  const listener = async (update) => {
    const msg = update.messages[0];
    if (!msg.message || msg.key.remoteJid !== groupId) return;
    
    const gameSession = mathGameSessions.get(groupId);
    if (!gameSession) return;
    
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.participant || msg.key.remoteJid;
    
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
        name: sender.split('@')[0],
        joinedAt: Date.now()
      });
      
      gameSession.scores.set(sender, 0);
      
      await client.sendMessage(groupId, {
        text: `✅ @${sender.split('@')[0]} has joined the math game!\n` +
              `👥 Total players: ${gameSession.players.length}`,
        mentions: [sender]
      });
      return;
    }
    
    // Handle answers during active game
    if (!gameSession.joinPhase && gameSession.gameActive && gameSession.currentProblem) {
      // Check if it's this player's turn
      const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.id !== sender) return;
      
      // Check answer (allow numeric or text answers)
      const userAnswer = text.trim().replace(/,/g, ''); // Remove commas for numbers like 1,000
      const correctAnswer = gameSession.currentProblem.answer.toString();
      
      // Try to parse numbers
      const userNum = parseFloat(userAnswer);
      const correctNum = parseFloat(correctAnswer);
      
      const isCorrect = !isNaN(userNum) && !isNaN(correctNum) 
        ? Math.abs(userNum - correctNum) < 0.0001 // Allow floating point tolerance
        : userAnswer.toLowerCase() === correctAnswer.toLowerCase();
      
      if (isCorrect) {
        // Calculate points based on difficulty
        const points = getPointsForDifficulty(gameSession.currentProblem.difficulty);
        const currentScore = gameSession.scores.get(sender) || 0;
        gameSession.scores.set(sender, currentScore + points);
        
        // Update player rounds
        const roundsPlayed = gameSession.playerRounds.get(sender) || 0;
        gameSession.playerRounds.set(sender, roundsPlayed + 1);
        
        // Store round result
        gameSession.roundResults.push({
          round: gameSession.currentRound,
          playerId: sender,
          playerName: sender.split('@')[0],
          correct: true,
          points: points,
          problem: gameSession.currentProblem.problem,
          answer: gameSession.currentProblem.answer,
          difficulty: gameSession.currentProblem.difficulty,
          userAnswer: userAnswer
        });
        
        // Increment total turns
        gameSession.currentTurn++;
        
        await client.sendMessage(groupId, {
          text: `🎉 *CORRECT!* 🎉\n\n` +
                `✅ @${sender.split('@')[0]} solved it!\n` +
                `🧮 Problem: ${gameSession.currentProblem.problem}\n` +
                `✅ Answer: ${gameSession.currentProblem.answer}\n` +
                `💰 +${points} points! Total: ${currentScore + points}\n` +
                `📊 Difficulty: ${gameSession.currentProblem.difficulty.toUpperCase()}\n\n` +
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
          setTimeout(() => endMathGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Start next round after delay
          setTimeout(() => startNewMathRound(groupId, client, gameSession), 3000);
        }
        
      } else {
        // Wrong answer - move to next player
        await client.sendMessage(groupId, {
          text: `❌ Wrong answer, @${sender.split('@')[0]}!\n` +
                `↪️ Next player's turn...`,
          mentions: [sender]
        });
        
        // Update player rounds
        const roundsPlayed = gameSession.playerRounds.get(sender) || 0;
        gameSession.playerRounds.set(sender, roundsPlayed + 1);
        
        // Store round result
        gameSession.roundResults.push({
          round: gameSession.currentRound,
          playerId: sender,
          playerName: sender.split('@')[0],
          correct: false,
          points: 0,
          problem: gameSession.currentProblem.problem,
          answer: gameSession.currentProblem.answer,
          difficulty: gameSession.currentProblem.difficulty,
          userAnswer: userAnswer
        });
        
        // Increment total turns
        gameSession.currentTurn++;
        
        // Move to next player in same round
        moveToNextMathPlayer(groupId, client, gameSession);
      }
    }
  };
  
  // Store listener reference
  mathGameSessions.get(groupId).listener = listener;
  client.ev.on("messages.upsert", listener);
}

// Start a new math round
async function startNewMathRound(groupId, client, gameSession) {
  if (!gameSession.gameActive) return;
  
  // Clear any existing timeout
  if (gameSession.roundTimeout) {
    clearTimeout(gameSession.roundTimeout);
  }
  
  // Get current player
  const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
  
  // Get random problem that hasn't been used
  const availableProblems = mathProblems.filter(p => 
    !gameSession.problemsUsed.includes(p.problem)
  );
  
  if (availableProblems.length === 0) {
    // Reset if all problems used
    gameSession.problemsUsed = [];
  }
  
  const problem = availableProblems[Math.floor(Math.random() * availableProblems.length)];
  gameSession.problemsUsed.push(problem.problem);
  gameSession.currentProblem = problem;
  
  // Get points for this problem
  const points = getPointsForDifficulty(problem.difficulty);
  
  // Announce new round
  await client.sendMessage(groupId, {
    text: `🔄 *ROUND ${gameSession.currentRound}/${gameSession.totalRounds}*\n\n` +
          `🎯 *Current Player:* @${currentPlayer.id.split('@')[0]}\n\n` +
          `🧮 *MATH PROBLEM:*\n` +
          `**${problem.problem}**\n\n` +
          `📊 *DIFFICULTY:* ${problem.difficulty.toUpperCase()} (${points} points)\n` +
          `⏰ Time limit: ${problem.timeLimit} seconds\n\n` +
          `📝 Type your answer in chat!`,
    mentions: [currentPlayer.id]
  });
  
  // Set timeout for this turn
  gameSession.roundTimeout = setTimeout(async () => {
    if (mathGameSessions.has(groupId)) {
      const session = mathGameSessions.get(groupId);
      if (session.currentProblem && session.currentProblem.problem === problem.problem) {
        // Time's up
        const currentPlayer = session.players[session.currentPlayerIndex];
        
        await client.sendMessage(groupId, {
          text: `⏰ *TIME'S UP!*\n\n` +
                `@${currentPlayer.id.split('@')[0]} took too long!\n` +
                `✅ Correct answer: ${problem.answer}\n` +
                `🧮 Problem: ${problem.problem}\n\n` +
                `↪️ Round ${session.currentRound} completed\n` +
                `Moving to next round...`,
          mentions: [currentPlayer.id]
        });
        
        // Store round result
        session.roundResults.push({
          round: session.currentRound,
          playerId: currentPlayer.id,
          playerName: currentPlayer.id.split('@')[0],
          correct: false,
          points: 0,
          problem: problem.problem,
          answer: problem.answer,
          difficulty: problem.difficulty,
          timeout: true
        });
        
        // Update player rounds
        const roundsPlayed = session.playerRounds.get(currentPlayer.id) || 0;
        session.playerRounds.set(currentPlayer.id, roundsPlayed + 1);
        
        // Move to next round
        session.currentRound++;
        
        if (session.currentRound > session.totalRounds) {
          setTimeout(() => endMathGameWithResults(groupId, client, session, false), 3000);
        } else {
          // Move to next player for next round
          moveToNextMathPlayer(groupId, client, session);
          setTimeout(() => startNewMathRound(groupId, client, session), 3000);
        }
      }
    }
  }, problem.timeLimit * 1000);
}

// Move to next player
function moveToNextMathPlayer(groupId, client, gameSession) {
  // Move to next player index
  gameSession.currentPlayerIndex = (gameSession.currentPlayerIndex + 1) % gameSession.players.length;
  
  // Start next player's turn in same round
  setTimeout(() => startNewMathRound(groupId, client, gameSession), 2000);
}

// End game and show results
async function endMathGameWithResults(groupId, client, gameSession, forcedEnd = false) {
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
  
  let resultsMessage = `🏁 *MATH GAME ${forcedEnd ? 'ENDED EARLY' : 'FINISHED'}* 🏁\n\n`;
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
      text: `🧮 Math game ended with no scores recorded.`
    });
  }
  
  // Clean up
  mathGameSessions.delete(groupId);
}

//========================================================================================================================


//========================================================================================================================
//========================================================================================================================
keith({
  pattern: "tictactoe",
  aliases: ["ttt", "xoxo"],
  description: "Start Tic Tac Toe game with join system",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply, isGroup, sender } = conText;
  
  if (!isGroup) return reply("❌ This game can only be played in groups!");
  
  if (ttt.getSession(from)) {
    return reply("⚠️ A Tic Tac Toe game is already running! Use `.endttt` to stop it.");
  }
  
  // Create game session
  const session = ttt.createGameSession(from, sender);
  
  // Send game start message
  await client.sendMessage(from, {
    text: `🎮 *TIC TAC TOE GAME* 🎮\n\n` +
          `👤 Host: @${sender.split('@')[0]}\n` +
          `⏰ Join Time: 30 seconds\n\n` +
          `📝 *HOW TO PLAY:*\n` +
          `1. Type "join" to register\n` +
          `2. Players take turns placing symbols\n` +
          `3. Each player gets unique symbol\n` +
          `4. Get 3 in a row to win!\n` +
          `5. All players play on same board\n\n` +
          `🎯 Board Positions:\n` +
          `1️⃣ 2️⃣ 3️⃣\n` +
          `4️⃣ 5️⃣ 6️⃣\n` +
          `7️⃣ 8️⃣ 9️⃣\n\n` +
          `Type *join* now! ⏳`
  }, { quoted: mek });
  
  // Set join timeout
  session.joinTimeout = setTimeout(async () => {
    if (ttt.getSession(from)) {
      const session = ttt.getSession(from);
      if (session.joinPhase) {
        session.joinPhase = false;
        
        if (session.players.length < 2) {
          await client.sendMessage(from, {
            text: "❌ Need at least 2 players to start. Game cancelled."
          });
          ttt.endGame(from);
          return;
        }
        
        // Announce game start
        await client.sendMessage(from, {
          text: `🎯 *TIC TAC TOE STARTING!* 🎯\n\n` +
                `👥 Players: ${session.players.length}\n` +
                `🎯 First turn: @${session.players[0].id.split('@')[0]} ${session.players[0].symbol}\n\n` +
                `${ttt.formatBoard(session.board)}\n\n` +
                `📝 During your turn, send number (1-9) to place your symbol\n` +
                `Good luck everyone! 🍀`
        });
        
        // Setup game listener for number inputs
        setupTTTGameListener(from, client, session);
      }
    }
  }, 30000);
  
  // Setup join listener
  setupTTTJoinListener(from, client);
});

//========================================================================================================================

keith({
  pattern: "endttt",
  aliases: ["stopttt", "endtictactoe"],
  description: "End the current Tic Tac Toe game",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup, sender } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const session = ttt.getSession(from);
  if (!session) return reply("❌ No Tic Tac Toe game is currently running!");
  
  // Only host can end game
  if (session.host !== sender) {
    return reply("❌ Only the game host can end the game!");
  }
  
  await endTTTGameWithResults(from, client, session, true);
});

//========================================================================================================================

keith({
  pattern: "tttplayers",
  description: "Show current Tic Tac Toe players and status",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const session = ttt.getSession(from);
  if (!session) return reply("❌ No Tic Tac Toe game is currently running!");
  
  let playersMessage = `📊 *TIC TAC TOE STATUS*\n\n`;
  playersMessage += `🔄 Phase: ${session.joinPhase ? 'Join Phase' : 'Game Active'}\n`;
  playersMessage += `👥 Players: ${session.players.length}\n\n`;
  playersMessage += `🎮 *PLAYERS LIST:*\n`;
  
  const mentions = [];
  session.players.forEach((player, index) => {
    const mention = `@${player.id.split('@')[0]}`;
    mentions.push(player.id);
    
    const turnIndicator = !session.joinPhase && session.currentPlayerIndex === index ? "👈 (Your Turn)" : "";
    playersMessage += `${player.symbol} ${mention} ${turnIndicator}\n`;
  });
  
  if (!session.joinPhase) {
    const currentPlayer = session.players[session.currentPlayerIndex];
    playersMessage += `\n🎯 *Current Turn:* @${currentPlayer?.id.split('@')[0]} ${currentPlayer?.symbol}`;
    mentions.push(currentPlayer?.id);
    
    playersMessage += `\n\n${ttt.formatBoard(session.board)}`;
  }
  
  await client.sendMessage(from, {
    text: playersMessage,
    mentions
  });
});

// Setup join listener
function setupTTTJoinListener(groupId, client) {
  const listener = async (update) => {
    const msg = update.messages[0];
    if (!msg.message || msg.key.remoteJid !== groupId) return;
    
    const session = ttt.getSession(groupId);
    if (!session || !session.joinPhase) return;
    
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.participant || msg.key.remoteJid;
    
    if (text.toLowerCase().trim() === "join") {
      const result = ttt.joinGame(groupId, sender);
      
      if (!result.success) {
        await client.sendMessage(groupId, {
          text: result.message,
          mentions: [sender]
        });
        return;
      }
      
      await client.sendMessage(groupId, {
        text: `✅ @${sender.split('@')[0]} has joined the Tic Tac Toe game!\n` +
              `👥 Total players: ${result.players}`,
        mentions: [sender]
      });
    }
  };
  
  client.ev.on("messages.upsert", listener);
  
  // Store listener reference
  const session = ttt.getSession(groupId);
  if (session) {
    session.joinListener = listener;
  }
}

// Setup game listener for number inputs (1-9)
function setupTTTGameListener(groupId, client, session) {
  const listener = async (update) => {
    const msg = update.messages[0];
    if (!msg.message || msg.key.remoteJid !== groupId) return;
    
    const currentSession = ttt.getSession(groupId);
    if (!currentSession || currentSession.joinPhase || !currentSession.gameActive) return;
    
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const sender = msg.key.participant || msg.key.remoteJid;
    
    // Check if it's just a number 1-9
    const position = parseInt(text.trim());
    
    if (isNaN(position) || position < 1 || position > 9) {
      return; // Not a valid move number
    }
    
    // Convert to 0-8 index
    const movePosition = position - 1;
    
    const result = ttt.makeMove(groupId, sender, movePosition);
    
    if (!result.success) {
      // Not their turn or invalid move
      if (result.message === "Not your turn!") {
        // Silently ignore - not their turn
        return;
      }
      
      // Invalid move (position already taken)
      await client.sendMessage(groupId, {
        text: `❌ @${sender.split('@')[0]}, position ${position} is already taken!\n` +
              `Please choose another number (1-9).`,
        mentions: [sender]
      });
      return;
    }
    
    if (result.win) {
      // Someone won
      await client.sendMessage(groupId, {
        text: `🎉 *TIC TAC TOE - VICTORY!* 🎉\n\n` +
              `🏆 Winner: @${result.winner.playerName} ${result.winner.symbol}\n\n` +
              `${ttt.formatBoard(result.board)}\n\n` +
              `🎮 Game Over!`,
        mentions: [result.winner.playerId]
      });
      
      endTTTGameWithResults(groupId, client, currentSession, false);
      
    } else if (result.draw) {
      // It's a draw
      await client.sendMessage(groupId, {
        text: `🤝 *TIC TAC TOE - DRAW!* 🤝\n\n` +
              `The game ended in a draw!\n\n` +
              `${ttt.formatBoard(result.board)}\n\n` +
              `🎮 Game Over!`,
        mentions: currentSession.players.map(p => p.id)
      });
      
      endTTTGameWithResults(groupId, client, currentSession, false);
      
    } else {
      // Game continues
      const nextPlayer = result.nextPlayer;
      
      await client.sendMessage(groupId, {
        text: `✅ @${sender.split('@')[0]} placed ${currentSession.players.find(p => p.id === sender)?.symbol} at position ${position}\n\n` +
              `🎯 Next turn: @${nextPlayer.name} ${nextPlayer.symbol}\n\n` +
              `${ttt.formatBoard(result.board)}\n\n` +
              `📝 Send number (1-9) to place your symbol`,
        mentions: [sender, nextPlayer.id]
      });
    }
  };
  
  client.ev.on("messages.upsert", listener);
  
  // Store listener reference
  session.listener = listener;
}

// End game and show results
async function endTTTGameWithResults(groupId, client, session, forcedEnd = false) {
  if (!session.gameActive) return;
  
  session.gameActive = false;
  
  // Remove listeners
  if (session.joinListener) {
    client.ev.off("messages.upsert", session.joinListener);
  }
  if (session.listener) {
    client.ev.off("messages.upsert", session.listener);
  }
  
  // Clear timeouts
  if (session.joinTimeout) {
    clearTimeout(session.joinTimeout);
  }
  if (session.moveTimeout) {
    clearTimeout(session.moveTimeout);
  }
  
  // Get final board state
  const finalBoard = ttt.formatBoard(session.board);
  
  let resultsMessage = `🏁 *TIC TAC TOE ${forcedEnd ? 'ENDED EARLY' : 'FINISHED'}* 🏁\n\n`;
  resultsMessage += `👥 Total Players: ${session.players.length}\n\n`;
  resultsMessage += `🎮 *PLAYERS:*\n`;
  
  const mentions = [];
  session.players.forEach((player, index) => {
    const mention = `@${player.id.split('@')[0]}`;
    mentions.push(player.id);
    resultsMessage += `${player.symbol} ${mention}\n`;
  });
  
  resultsMessage += `\n${finalBoard}\n\n`;
  resultsMessage += `Thanks for playing! 🎮`;
  
  await client.sendMessage(groupId, {
    text: resultsMessage,
    mentions
  });
  
  // Clean up
  ttt.endGame(groupId);
}

//========================================================================================================================

keith({
  pattern: "ttthelp",
  aliases: ["tictactoehelp"],
  description: "Show Tic Tac Toe help",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply } = conText;
  
  await client.sendMessage(from, {
    text: `🎮 *TIC TAC TOE HELP* 🎮\n\n` +
          `📋 *COMMANDS:*\n` +
          `• .tictactoe - Start game (host only)\n` +
          `• Type "join" - Join the game\n` +
          `• .tttplayers - Show players & board\n` +
          `• .endttt - End game (host only)\n` +
          `• .ttthelp - Show this help\n\n` +
          `🎯 *HOW TO PLAY:*\n` +
          `1. Host starts with .tictactoe\n` +
          `2. Players type "join" to register\n` +
          `3. Wait 30 seconds for join phase\n` +
          `4. Players take turns\n` +
          `5. During your turn, send number 1-9:\n` +
          `   1️⃣ 2️⃣ 3️⃣\n` +
          `   4️⃣ 5️⃣ 6️⃣\n` +
          `   7️⃣ 8️⃣ 9️⃣\n` +
          `6. Get 3 in a row to win!\n\n` +
          `🎨 Each player gets unique symbol:\n` +
          `❌ ⭕ ⭐ 🔷 🔶 🟢 🟣 🟡 🔴\n\n` +
          `📝 *IMPORTANT:*\n` +
          `- Just send the number (1-9) during your turn\n` +
          `- Don't use .move command\n` +
          `- Invalid moves are ignored`
  });
});
//========================================================================================================================

keith({
  pattern: "trivia",
  aliases: ["quiz", "triviagame"],
  description: "Start a trivia quiz game in group",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { mek, reply, isGroup, sender, senderName } = conText;
  
  if (!isGroup) return reply("❌ This game can only be played in groups!");
  
  if (triviaGameSessions.has(from)) {
    return reply("⚠️ A trivia game is already running! Use `.endtrivia` to stop it.");
  }
  
  // Initialize game session
  const gameSession = {
    host: sender,
    hostName: senderName,
    players: [], // Array of player objects
    totalRounds: 10, // Fixed 10 rounds
    currentRound: 1, // Round counter starts at 1
    currentQuestion: null,
    currentOptions: [],
    gameActive: true,
    joinPhase: true,
    currentPlayerIndex: 0,
    scores: new Map(), // playerId -> score
    questionsUsed: [],
    roundTimeout: null,
    joinTimeout: null,
    listener: null,
    roundResults: [], // Store results per round
    playerRounds: new Map(), // Track rounds played per player
    currentTurn: 0 // Track total turns
  };
  
  triviaGameSessions.set(from, gameSession);
  
  // Send game start message
  await client.sendMessage(from, {
    text: `🧠 *TRIVIA QUIZ GAME* 🧠\n\n` +
          `👤 Host: @${sender.split('@')[0]}\n` +
          `🔄 Total Rounds: ${gameSession.totalRounds}\n` +
          `⏰ Join Time: 30 seconds\n\n` +
          `📝 *HOW TO PLAY:*\n` +
          `1. Type "join" to register\n` +
          `2. Each round shows a trivia question\n` +
          `3. Choose from 4 options (1-4)\n` +
          `4. Points based on difficulty:\n` +
          `   • Easy: 10 points\n` +
          `   • Medium: 15 points\n` +
          `   • Hard: 20 points\n\n` +
          `🏆 Winner gets special recognition!\n\n` +
          `Type *join* now! ⏳`
  }, { quoted: mek });
  
  // Set join timeout
  gameSession.joinTimeout = setTimeout(async () => {
    if (triviaGameSessions.has(from)) {
      const session = triviaGameSessions.get(from);
      if (session.joinPhase) {
        session.joinPhase = false;
        
        if (session.players.length < 2) {
          await client.sendMessage(from, {
            text: "❌ Need at least 2 players to start. Game cancelled."
          });
          triviaGameSessions.delete(from);
          return;
        }
        
        // Initialize player rounds tracking
        session.players.forEach(player => {
          session.playerRounds.set(player.id, 0);
        });
        
        // Announce game start
        await client.sendMessage(from, {
          text: `🎯 *TRIVIA GAME STARTING!* 🎯\n\n` +
                `👥 Players: ${session.players.length}\n` +
                `🔄 Total Rounds: ${session.totalRounds}\n` +
                `🎯 Round 1/${session.totalRounds}\n\n` +
                `Good luck everyone! 🍀`
        });
        
        // Start the first round
        setTimeout(() => startNewTriviaRound(from, client, session), 2000);
      }
    }
  }, 30000);
  
  // Setup game listener
  setupTriviaGameListener(from, client);
});

//========================================================================================================================

keith({
  pattern: "endtrivia",
  aliases: ["stoptrivia", "endquiz"],
  description: "End the current trivia game",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup, sender } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = triviaGameSessions.get(from);
  if (!gameSession) return reply("❌ No trivia game is currently running!");
  
  // Only host can end game
  if (gameSession.host !== sender) {
    return reply("❌ Only the game host can end the game!");
  }
  
  await endTriviaGameWithResults(from, client, gameSession, true);
});

//========================================================================================================================

keith({
  pattern: "triviaplayers",
  aliases: ["quizplayers"],
  description: "Show current trivia game players and scores",
  category: "games",
  filename: __filename
}, async (from, client, conText) => {
  const { reply, isGroup } = conText;
  
  if (!isGroup) return reply("❌ This command only works in groups!");
  
  const gameSession = triviaGameSessions.get(from);
  if (!gameSession) return reply("❌ No trivia game is currently running!");
  
  let playersMessage = `📊 *TRIVIA GAME STATUS*\n\n`;
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
  
  if (gameSession.currentQuestion) {
    const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
    playersMessage += `\n🎯 *Current Turn:* @${currentPlayer?.id.split('@')[0]}`;
    mentions.push(currentPlayer?.id);
  }
  
  await client.sendMessage(from, {
    text: playersMessage,
    mentions
  });
});

// Fetch question from API
async function fetchQuestion() {
  try {
    const response = await axios.get(API_URL);
    if (response.data && response.data.status && response.data.result) {
      const questionData = response.data.result;
      
      // Format the question (remove HTML entities)
      let question = questionData.question
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#039;/g, "'");
      
      return {
        question: question,
        correctAnswer: questionData.correctAnswer,
        incorrectAnswers: questionData.incorrectAnswers || [],
        allAnswers: questionData.allAnswers || [],
        category: questionData.category,
        difficulty: questionData.difficulty,
        type: questionData.type
      };
    } else {
      throw new Error('Invalid API response');
    }
  } catch (error) {
    console.error('❌ Error fetching trivia question:', error.message);
    return null;
  }
}

// Get points based on difficulty
function getPointsForDifficulty(difficulty) {
  switch(difficulty.toLowerCase()) {
    case 'hard': return 20;
    case 'medium': return 15;
    default: return 10; // Easy and any other
  }
}

// Setup trivia game listener
function setupTriviaGameListener(groupId, client) {
  const listener = async (update) => {
    const msg = update.messages[0];
    if (!msg.message || msg.key.remoteJid !== groupId) return;
    
    const gameSession = triviaGameSessions.get(groupId);
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
        text: `✅ @${sender.split('@')[0]} has joined the trivia game!\n` +
              `👥 Total players: ${gameSession.players.length}`,
        mentions: [sender]
      });
      return;
    }
    
    // Handle answers during active game
    if (!gameSession.joinPhase && gameSession.gameActive && gameSession.currentQuestion) {
      // Check if it's this player's turn
      const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
      if (!currentPlayer || currentPlayer.id !== sender) return;
      
      // Parse user input (can be number 1-4 or answer text)
      const userInput = text.trim();
      const selectedNumber = parseInt(userInput);
      
      let isCorrect = false;
      let selectedAnswer = "";
      
      // Check if input is a number 1-4
      if (!isNaN(selectedNumber) && selectedNumber >= 1 && selectedNumber <= 4) {
        // User selected option by number
        selectedAnswer = gameSession.currentOptions[selectedNumber - 1];
        isCorrect = selectedAnswer === gameSession.currentQuestion.correctAnswer;
      } else {
        // User typed answer (case insensitive)
        selectedAnswer = userInput;
        isCorrect = userInput.toLowerCase() === gameSession.currentQuestion.correctAnswer.toLowerCase();
      }
      
      if (isCorrect) {
        // Calculate points based on difficulty
        const points = getPointsForDifficulty(gameSession.currentQuestion.difficulty);
        const currentScore = gameSession.scores.get(sender) || 0;
        gameSession.scores.set(sender, currentScore + points);
        
        // Update player rounds
        const roundsPlayed = gameSession.playerRounds.get(sender) || 0;
        gameSession.playerRounds.set(sender, roundsPlayed + 1);
        
        // Store round result
        gameSession.roundResults.push({
          round: gameSession.currentRound,
          playerId: sender,
          playerName: senderName,
          correct: true,
          points: points,
          question: gameSession.currentQuestion.question,
          correctAnswer: gameSession.currentQuestion.correctAnswer,
          difficulty: gameSession.currentQuestion.difficulty,
          selectedOption: selectedNumber ? `Option ${selectedNumber}: ${selectedAnswer}` : selectedAnswer
        });
        
        // Increment total turns
        gameSession.currentTurn++;
        
        await client.sendMessage(groupId, {
          text: `🎉 *CORRECT!* 🎉\n\n` +
                `✅ @${sender.split('@')[0]} answered correctly!\n` +
                `💡 Correct answer: ${gameSession.currentQuestion.correctAnswer}\n` +
                `💰 +${points} points! Total: ${currentScore + points}\n` +
                `📊 Difficulty: ${gameSession.currentQuestion.difficulty.toUpperCase()}\n\n` +
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
          setTimeout(() => endTriviaGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Start next round after delay
          setTimeout(() => startNewTriviaRound(groupId, client, gameSession), 3000);
        }
        
      } else {
        // Wrong answer
        let userResponse = `❌ Wrong answer, @${sender.split('@')[0]}!\n`;
        
        if (selectedNumber && selectedNumber >= 1 && selectedNumber <= 4) {
          userResponse += `You selected: ${selectedAnswer}\n`;
        } else {
          userResponse += `You answered: ${userInput}\n`;
        }
        
        userResponse += `\n✅ The correct answer was: ${gameSession.currentQuestion.correctAnswer}\n` +
                       `📊 Difficulty: ${gameSession.currentQuestion.difficulty.toUpperCase()}\n` +
                       `📚 Category: ${gameSession.currentQuestion.category}\n\n` +
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
          question: gameSession.currentQuestion.question,
          correctAnswer: gameSession.currentQuestion.correctAnswer,
          difficulty: gameSession.currentQuestion.difficulty,
          selectedOption: selectedNumber ? `Option ${selectedNumber}: ${selectedAnswer}` : selectedAnswer
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
          setTimeout(() => endTriviaGameWithResults(groupId, client, gameSession, false), 3000);
        } else {
          // Start next round after delay
          setTimeout(() => startNewTriviaRound(groupId, client, gameSession), 3000);
        }
      }
    }
  };
  
  // Store listener reference
  triviaGameSessions.get(groupId).listener = listener;
  client.ev.on("messages.upsert", listener);
}

// Start a new trivia round
async function startNewTriviaRound(groupId, client, gameSession) {
  if (!gameSession.gameActive) return;
  
  // Clear any existing timeout
  if (gameSession.roundTimeout) {
    clearTimeout(gameSession.roundTimeout);
  }
  
  // Fetch new question from API
  const questionData = await fetchQuestion();
  if (!questionData) {
    await client.sendMessage(groupId, {
      text: "❌ Failed to fetch question. Ending game."
    });
    endTriviaGameWithResults(groupId, client, gameSession, false);
    return;
  }
  
  // Store question
  gameSession.currentQuestion = questionData;
  
  // Use the allAnswers array from API (should already be shuffled)
  gameSession.currentOptions = [...questionData.allAnswers];
  
  // Move to next player for each round
  gameSession.currentPlayerIndex = (gameSession.currentPlayerIndex + 1) % gameSession.players.length;
  const currentPlayer = gameSession.players[gameSession.currentPlayerIndex];
  
  // Get points for this question
  const points = getPointsForDifficulty(questionData.difficulty);
  
  // Announce new round
  await client.sendMessage(groupId, {
    text: `🔄 *ROUND ${gameSession.currentRound}/${gameSession.totalRounds}*\n\n` +
          `🎯 *Current Player:* @${currentPlayer.id.split('@')[0]}\n\n` +
          `📚 *CATEGORY:* ${questionData.category}\n` +
          `📊 *DIFFICULTY:* ${questionData.difficulty.toUpperCase()} (${points} points)\n\n` +
          `❓ *QUESTION:*\n${questionData.question}\n\n` +
          `📋 *OPTIONS:*\n` +
          `1. ${gameSession.currentOptions[0]}\n` +
          `2. ${gameSession.currentOptions[1]}\n` +
          `3. ${gameSession.currentOptions[2]}\n` +
          `4. ${gameSession.currentOptions[3]}\n\n` +
          `⏰ Time limit: 30 seconds\n` +
          `📝 Reply with number (1-4) OR type answer!`,
    mentions: [currentPlayer.id]
  });
  
  // Set timeout for this round
  gameSession.roundTimeout = setTimeout(async () => {
    if (triviaGameSessions.has(groupId)) {
      const session = triviaGameSessions.get(groupId);
      if (session.currentQuestion && session.currentQuestion.question === questionData.question) {
        // Time's up
        const currentPlayer = session.players[session.currentPlayerIndex];
        
        await client.sendMessage(groupId, {
          text: `⏰ *TIME'S UP!*\n\n` +
                `@${currentPlayer.id.split('@')[0]} took too long!\n` +
                `✅ Correct answer: ${questionData.correctAnswer}\n` +
                `📊 Difficulty: ${questionData.difficulty.toUpperCase()}\n` +
                `📚 Category: ${questionData.category}\n\n` +
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
          question: questionData.question,
          correctAnswer: questionData.correctAnswer,
          difficulty: questionData.difficulty,
          timeout: true
        });
        
        // Update player rounds
        const roundsPlayed = session.playerRounds.get(currentPlayer.id) || 0;
        session.playerRounds.set(currentPlayer.id, roundsPlayed + 1);
        
        // Move to next round
        session.currentRound++;
        
        if (session.currentRound > session.totalRounds) {
          setTimeout(() => endTriviaGameWithResults(groupId, client, session, false), 3000);
        } else {
          setTimeout(() => startNewTriviaRound(groupId, client, session), 3000);
        }
      }
    }
  }, 30000);
}

// End game and show results
async function endTriviaGameWithResults(groupId, client, gameSession, forcedEnd = false) {
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
  
  let resultsMessage = `🏁 *TRIVIA GAME ${forcedEnd ? 'ENDED EARLY' : 'FINISHED'}* 🏁\n\n`;
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
      text: `🧠 Trivia game ended with no scores recorded.`
    });
  }
  
  // Clean up
  triviaGameSessions.delete(groupId);
}

//========================================================================================================================

// Quick trivia quiz command


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
*/
//========================================================================================================================
