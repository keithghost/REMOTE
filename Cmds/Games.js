
const { keith } = require('../commandHandler');

class TicTacToeManager {
  constructor() {
    this.games = new Map();
    this.gameTimeout = 5 * 60 * 1000;
    this.timeouts = new Map();
  }

  createGame(chatJid, player1, player2) {
    if (!player1 || !player2 || typeof player1 !== 'string' || typeof player2 !== 'string') {
      console.error("Invalid player IDs:", { player1, player2 });
      return {
        success: false,
        message: "Players must be valid strings."
      };
    }

    const gameId = `${player1}:${player2}`;

    if (!this.games.has(chatJid)) {
      this.games.set(chatJid, new Map());
    }

    const chatGames = this.games.get(chatJid);

    for (const game of chatGames.values()) {
      if (game.players.includes(player1) || game.players.includes(player2)) {
        return {
          success: false,
          message: "One of the players is already in a game. Please finish that game first."
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

    chatGames.set(gameId, gameState);
    this.setGameTimeout(chatJid, gameId);

    const p1Name = player1.includes('@') ? player1.split('@')[0] : player1;
    const p2Name = player2.includes('@') ? player2.split('@')[0] : player2;

    return {
      success: true,
      message: `Game created between @${p1Name} (❌) and @${p2Name} (⭕)`,
      gameId,
      gameState
    };
  }

  makeMove(chatJid, playerId, position) {
    if (!this.games.has(chatJid)) return { success: false, message: "No active games in this chat." };

    const chatGames = this.games.get(chatJid);
    let gameId = null;
    let gameState = null;

    for (const [id, game] of chatGames.entries()) {
      if (game.players.includes(playerId)) {
        gameId = id;
        gameState = game;
        break;
      }
    }

    if (!gameState) {
      return { success: false, message: "You're not in an active game. Start one with *tt*" };
    }

    if (gameState.currentPlayer !== playerId) {
      return { success: false, message: "It's not your turn!" };
    }

    if (position < 0 || position > 8 || !Number.isInteger(position)) {
      return { success: false, message: "Invalid position! Choose a number between 1-9." };
    }

    if (gameState.board[position] !== null) {
      return { success: false, message: "That position is already taken! Choose another." };
    }

    gameState.board[position] = gameState.symbols[playerId];
    gameState.lastMoveTime = Date.now();
    this.setGameTimeout(chatJid, gameId);

    const winner = this.checkWinner(gameState.board);
    let result = null;

    if (winner) {
      result = {
        status: 'win',
        winner: playerId,
        symbol: gameState.symbols[playerId]
      };
      chatGames.delete(gameId);
      this.clearTimeout(chatJid, gameId);
    } else if (!gameState.board.includes(null)) {
      result = { status: 'draw' };
      chatGames.delete(gameId);
      this.clearTimeout(chatJid, gameId);
    } else {
      gameState.currentPlayer = gameState.players.find(p => p !== playerId);
    }

    if (chatGames.size === 0) {
      this.games.delete(chatJid);
    }

    return {
      success: true,
      board: gameState.board,
      result,
      nextPlayer: gameState.currentPlayer
    };
  }

  getGameState(chatJid, playerId) {
    if (!this.games.has(chatJid)) return null;

    const chatGames = this.games.get(chatJid);
    for (const [gameId, game] of chatGames.entries()) {
      if (game.players.includes(playerId)) {
        return { gameId, gameState: game };
      }
    }

    return null;
  }

  formatBoard(board) {
    const h = '┄┄┄┄┄┄┄┄┄┄┄';
    const v = '┃';
    const emoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];
    let str = `${h}\n`;

    for (let i = 0; i < 3; i++) {
      str += `${v} `;
      for (let j = 0; j < 3; j++) {
        const index = i * 3 + j;
        const cell = board[index] || emoji[index];
        str += `${cell} ${j < 2 ? v + ' ' : ''}`;
      }
      str += `${v}\n`;
      if (i < 2) str += `${h}\n`;
    }

    return str + h;
  }

  checkWinner(board) {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    for (const [a,b,c] of wins) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }

    return null;
  }

  setGameTimeout(chatJid, gameId) {
    this.clearTimeout(chatJid, gameId);
    const timeout = setTimeout(() => {
      if (this.games.has(chatJid)) {
        const chatGames = this.games.get(chatJid);
        chatGames.delete(gameId);
        if (!chatGames.size) this.games.delete(chatJid);
      }
      this.timeouts.delete(`${chatJid}:${gameId}`);
    }, this.gameTimeout);
    this.timeouts.set(`${chatJid}:${gameId}`, timeout);
  }

  clearTimeout(chatJid, gameId) {
    const key = `${chatJid}:${gameId}`;
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }

  endGame(chatJid, playerId) {
    if (!this.games.has(chatJid)) {
      return { success: false, message: "No active games in this chat." };
    }

    const chatGames = this.games.get(chatJid);
    let gameId = null;
    let gameState = null;

    for (const [id, game] of chatGames.entries()) {
      if (game.players.includes(playerId)) {
        gameId = id;
        gameState = game;
        break;
      }
    }

    if (!gameState) {
      return { success: false, message: "You're not in an active game." };
    }

    const opponent = gameState.players.find(p => p !== playerId);
    chatGames.delete(gameId);
    this.clearTimeout(chatJid, gameId);
    if (!chatGames.size) this.games.delete(chatJid);

    const name = playerId.includes('@') ? playerId.split('@')[0] : playerId;
    const oppName = opponent.includes('@') ? opponent.split('@')[0] : opponent;

    return {
      success: true,
      message: `Game ended by @${name}. @${oppName} wins by forfeit!`,
      opponent
    };
  }
}

const tictactoeManager = new TicTacToeManager();


// Start Game Command
keith({
  pattern: "tit",
  alias: ["tiktak", "tiktoe"],
  desc: "Start a TicTacToe game with another user",
  category: "Games",
  react: "👥",
  filename: __filename
}, async (context) => {
  const { reply, m, sender } = context;
  try {
    if (!m.quoted) return reply("Reply to someone to start a game with them!");
    if (m.quoted.fromMe) return reply("You cannot play with yourself!");

    const opponent = m.quoted.sender;
    const result = tictactoeManager.createGame(m.chat, sender, opponent);
    if (!result.success) return reply(result.message);

    const formattedBoard = tictactoeManager.formatBoard(result.gameState.board);

    // Safely extract current player name
    const currentPlayer = result.gameState.currentPlayer.includes('@') 
      ? result.gameState.currentPlayer.split('@')[0] 
      : result.gameState.currentPlayer;

    await reply(
      `🎮 *TIC-TAC-TOE* 🎮\n\n${result.message}\n\n${formattedBoard}\n\n@${currentPlayer}'s turn (❌)\n\nTo make a move, send a number (1-9).`,
      { mentions: [sender, opponent] }
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
  const { reply, m, sender } = context;
  try {
    const result = tictactoeManager.endGame(m.chat, sender);
    if (!result.success) return reply(result.message);

    await reply(result.message, { mentions: [sender, result.opponent] });
  } catch (e) {
    console.error("TicTacToe End Error:", e);
    reply("❌ Error ending the game.");
  }
});

// Move Handler
keith({ on: "text" }, async (context) => {
  const { body, reply, m, sender } = context;
  try {
    if (!/^[1-9]$/.test(body.trim())) return;
    const position = parseInt(body.trim()) - 1;

    const gameInfo = tictactoeManager.getGameState(m.chat, sender);
    if (!gameInfo) return;

    const moveResult = tictactoeManager.makeMove(m.chat, sender, position);
    if (!moveResult.success) return reply(moveResult.message);

    const formattedBoard = tictactoeManager.formatBoard(moveResult.board);

    if (moveResult.result) {
      const otherPlayer = gameInfo.gameState.players.find(p => p !== sender);
      if (moveResult.result.status === 'win') {
        // Safely extract winner name
        const winnerName = sender.includes('@') ? sender.split('@')[0] : sender;
        await reply(
          `🎉 @${winnerName} (${moveResult.result.symbol}) has won the game! 🎉`,
          { mentions: [sender, otherPlayer] }
        );
      } else if (moveResult.result.status === 'draw') {
        await reply(
          `🎮 *TIC-TAC-TOE* 🎮\n\n${formattedBoard}\n\n🤝 The game ended in a draw! 🤝`,
          { mentions: gameInfo.gameState.players }
        );
      }
    } else {
      // Safely extract next player name
      const nextPlayerName = moveResult.nextPlayer.includes('@') 
        ? moveResult.nextPlayer.split('@')[0] 
        : moveResult.nextPlayer;
      const nextPlayerSymbol = gameInfo.gameState.symbols[moveResult.nextPlayer];
      
      await reply(
        `🎮 *TIC-TAC-TOE* 🎮\n\n${formattedBoard}\n\n@${nextPlayerName}'s turn (${nextPlayerSymbol})`,
        { mentions: [moveResult.nextPlayer] }
      );
    }
  } catch (e) {
    console.error("TicTacToe Move Error:", e);
  }
});
