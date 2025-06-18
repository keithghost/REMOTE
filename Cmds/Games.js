
const { keith } = require('../commandHandler');

// Game state manager - handles multiple concurrent games across different chats
class TicTacToeManager {
  constructor() {
    this.games = new Map(); // Store all active games: Map<groupJID, Map<gameId, GameState>>
    this.gameTimeout = 5 * 60 * 1000; // 5 minutes timeout
    this.timeouts = new Map(); // Store timeout IDs
  }
  
  createGame(groupJid, player1, player2) {
    const gameId = `${player1}:${player2}`;
    
    if (!this.games.has(groupJid)) {
      this.games.set(groupJid, new Map());
    }
    
    const groupGames = this.games.get(groupJid);
    
    // Check if players are already in a game
    for (const [existingGameId, game] of groupGames.entries()) {
      if (game.players.includes(player1) || game.players.includes(player2)) {
        return {
          success: false,
          message: `One of the players is already in a game. Please finish that game first.`
        };
      }
    }
    
    const gameState = {
      players: [player1, player2],
      board: Array(9).fill(null),
      currentPlayer: player1,
      symbols: {
        [player1]: '❌',
        [player2]: '⭕'
      },
      startTime: Date.now(),
      lastMoveTime: Date.now()
    };
    
    groupGames.set(gameId, gameState);
    this.setGameTimeout(groupJid, gameId);
    
    return {
      success: true,
      message: `Game created between @${player1.split('@')[0]} (❌) and @${player2.split('@')[0]} (⭕)`,
      gameId,
      gameState
    };
  }
  
  makeMove(groupJid, playerId, position) {
    if (!this.games.has(groupJid)) {
      return {
        success: false,
        message: "No active games in this chat."
      };
    }
    
    const groupGames = this.games.get(groupJid);
    let gameId = null;
    let gameState = null;
    
    for (const [id, game] of groupGames.entries()) {
      if (game.players.includes(playerId)) {
        gameId = id;
        gameState = game;
        break;
      }
    }
    
    if (!gameState) {
      return {
        success: false,
        message: "You're not in an active game. Start one with *${prefix}tt*"
      };
    }
    
    if (gameState.currentPlayer !== playerId) {
      return {
        success: false,
        message: "It's not your turn!"
      };
    }
    
    if (position < 0 || position > 8 || !Number.isInteger(position)) {
      return {
        success: false,
        message: "Invalid position! Choose a number between 1-9."
      };
    }
    
    if (gameState.board[position] !== null) {
      return {
        success: false,
        message: "That position is already taken! Choose another."
      };
    }
    
    gameState.board[position] = gameState.symbols[playerId];
    gameState.lastMoveTime = Date.now();
    this.setGameTimeout(groupJid, gameId);
    
    const winner = this.checkWinner(gameState.board);
    let result = null;
    
    if (winner) {
      result = {
        status: 'win',
        winner: playerId,
        symbol: gameState.symbols[playerId]
      };
      groupGames.delete(gameId);
      this.clearTimeout(groupJid, gameId);
    } else if (!gameState.board.includes(null)) {
      result = {
        status: 'draw'
      };
      groupGames.delete(gameId);
      this.clearTimeout(groupJid, gameId);
    } else {
      gameState.currentPlayer = gameState.players[0] === playerId ? gameState.players[1] : gameState.players[0];
    }
    
    if (groupGames.size === 0) {
      this.games.delete(groupJid);
    }
    
    return {
      success: true,
      board: gameState.board,
      result,
      nextPlayer: gameState.currentPlayer
    };
  }
  
  getGameState(groupJid, playerId) {
    if (!this.games.has(groupJid)) return null;
    
    const groupGames = this.games.get(groupJid);
    
    for (const [gameId, game] of groupGames.entries()) {
      if (game.players.includes(playerId)) {
        return {
          gameId,
          gameState: game
        };
      }
    }
    
    return null;
  }
  
  formatBoard(board) {
    const horizontalLine = '┄┄┄┄┄┄┄┄┄┄┄';
    const verticalLine = '┃';
    const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    
    let formattedBoard = `${horizontalLine}\n`;
    
    for (let i = 0; i < 3; i++) {
      let row = `${verticalLine} `;
      for (let j = 0; j < 3; j++) {
        const pos = i * 3 + j;
        const cell = board[pos] || numberEmojis[pos];
        row += `${cell} `;
        if (j < 2) row += verticalLine + ' ';
      }
      row += `${verticalLine}`;
      formattedBoard += row + '\n';
      
      if (i < 2) {
        formattedBoard += `${horizontalLine}\n`;
      }
    }
    
    formattedBoard += `${horizontalLine}`;
    return formattedBoard;
  }
  
  checkWinner(board) {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    return null;
  }
  
  setGameTimeout(groupJid, gameId) {
    this.clearTimeout(groupJid, gameId);
    
    const timeoutId = setTimeout(() => {
      if (this.games.has(groupJid)) {
        const groupGames = this.games.get(groupJid);
        if (groupGames.has(gameId)) {
          groupGames.delete(gameId);
          if (groupGames.size === 0) {
            this.games.delete(groupJid);
          }
        }
      }
      this.timeouts.delete(`${groupJid}:${gameId}`);
    }, this.gameTimeout);
    
    this.timeouts.set(`${groupJid}:${gameId}`, timeoutId);
  }
  
  clearTimeout(groupJid, gameId) {
    if (this.timeouts.has(`${groupJid}:${gameId}`)) {
      clearTimeout(this.timeouts.get(`${groupJid}:${gameId}`));
      this.timeouts.delete(`${groupJid}:${gameId}`);
    }
  }
  
  endGame(groupJid, playerId) {
    if (!this.games.has(groupJid)) {
      return {
        success: false,
        message: "No active games in this chat."
      };
    }
    
    const groupGames = this.games.get(groupJid);
    let gameId = null;
    let gameState = null;
    
    for (const [id, game] of groupGames.entries()) {
      if (game.players.includes(playerId)) {
        gameId = id;
        gameState = game;
        break;
      }
    }
    
    if (!gameState) {
      return {
        success: false,
        message: "You're not in an active game."
      };
    }
    
    const opponent = gameState.players[0] === playerId ? gameState.players[1] : gameState.players[0];
    groupGames.delete(gameId);
    this.clearTimeout(groupJid, gameId);
    
    if (groupGames.size === 0) {
      this.games.delete(groupJid);
    }
    
    return {
      success: true,
      message: `Game ended by @${playerId.split('@')[0]}. @${opponent.split('@')[0]} wins by forfeit!`,
      opponent
    };
  }
}

const tictactoeManager = new TicTacToeManager();

// Start Game Command
keith({
  pattern: "tt",
  alias: ["tiktak", "tiktoe"],
  desc: "Start a TicTacToe game with another user",
  category: "Games",
  react: "👥",
  filename: __filename
}, async (context) => {
  const { reply, m, sender, isGroup, quoted, from } = context;
  
  try {
    if (!isGroup) return reply("TicTacToe can only be played in groups!");
    if (!quoted) return reply("Reply to someone to start a game with them!");
    if (quoted.sender === sender) return reply("You cannot play with yourself!");

    const result = tictactoeManager.createGame(from, sender, quoted.sender);
    if (!result.success) return reply(result.message);

    const formattedBoard = tictactoeManager.formatBoard(result.gameState.board);

    await reply(
      `🎮 *TIC-TAC-TOE* 🎮\n\n${result.message}\n\n${formattedBoard}\n\n@${result.gameState.currentPlayer.split('@')[0]}'s turn (❌)\n\nTo make a move, send a number (1-9).`,
      { mentions: [sender, quoted.sender] }
    );
  } catch (e) {
    console.error("TicTacToe Start Error:", e);
    reply("❌ Error starting the game. Try again.");
  }
});

// End Game Command
keith({
  pattern: "ttend",
  desc: "End your current TicTacToe game",
  category: "Games",
  react: "❌",
  filename: __filename
}, async (context) => {
  const { reply, sender, from } = context;
  
  try {
    const result = tictactoeManager.endGame(from, sender);
    if (!result.success) return reply(result.message);

    await reply(result.message, { mentions: [sender, result.opponent] });
  } catch (e) {
    console.error("TicTacToe End Error:", e);
    reply("❌ Error ending the game.");
  }
});

// Move Handler
keith({ on: "text" }, async (context) => {
  const { body, reply, sender, from } = context;
  
  try {
    if (!/^[1-9]$/.test(body.trim())) return;
    const position = parseInt(body.trim()) - 1;

    const gameInfo = tictactoeManager.getGameState(from, sender);
    if (!gameInfo) return;

    const moveResult = tictactoeManager.makeMove(from, sender, position);
    if (!moveResult.success) return reply(moveResult.message);

    const formattedBoard = tictactoeManager.formatBoard(moveResult.board);

    if (moveResult.result) {
      if (moveResult.result.status === 'win') {
        await reply(
          `🎉 @${sender.split('@')[0]} (${moveResult.result.symbol}) has won the game! 🎉`,
          { mentions: [sender, gameInfo.gameState.players.find(p => p !== sender)] }
        );
      } else if (moveResult.result.status === 'draw') {
        await reply(
          `🎮 *TIC-TAC-TOE* 🎮\n\n${formattedBoard}\n\n🤝 The game ended in a draw! 🤝`,
          { mentions: gameInfo.gameState.players }
        );
      }
    } else {
      const nextPlayerSymbol = gameInfo.gameState.symbols[moveResult.nextPlayer];
      await reply(
        `🎮 *TIC-TAC-TOE* 🎮\n\n${formattedBoard}\n\n@${moveResult.nextPlayer.split('@')[0]}'s turn (${nextPlayerSymbol})`,
        { mentions: [moveResult.nextPlayer] }
      );
    }
  } catch (e) {
    console.error("TicTacToe Move Error:", e);
  }
});
