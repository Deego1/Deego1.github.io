const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state initialization
const gameState = {
    player1: { x: 50, y: 350, width: 50, height: 50, color: 'blue', dx: 0, dy: 0, speed: 7 },
    player2: { x: 1100, y: 350, width: 50, height: 50, color: 'red', dx: 0, dy: 0, speed: 7 },
    ball: { x: 600, y: 400, radius: 55, dx: 0, dy: 0, color: 'black', speed: 0, friction: 0.99 }, // Increased radius
    goals: { player1: { x: 0, y: 250, width: 30, height: 300 }, player2: { x: 1170, y: 250, width: 30, height: 300 } },
    scores: { blue: 0, red: 0 },
    isResetting: false
};

function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = gameState.ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawGoals() {
    ctx.fillStyle = 'white';
    ctx.fillRect(gameState.goals.player1.x, gameState.goals.player1.y, gameState.goals.player1.width, gameState.goals.player1.height);
    ctx.fillRect(gameState.goals.player2.x, gameState.goals.player2.y, gameState.goals.player2.width, gameState.goals.player2.height);
}

function drawScoreboard() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`DIEGO SCORE: ${gameState.scores.blue}`, 10, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`JONAH SCORE: ${gameState.scores.red}`, canvas.width - 10, 30);
}

function updatePositions() {
    // Player movement and boundary checks
    function updatePlayer(player) {
        player.x += player.dx;
        player.y += player.dy;

        // Prevent players from going out of bounds
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

        // Prevent players from phasing through goals
        if (player.x < gameState.goals.player1.x + gameState.goals.player1.width &&
            player.y < gameState.goals.player1.y + gameState.goals.player1.height &&
            player.y + player.height > gameState.goals.player1.y) {
            player.x = gameState.goals.player1.x + gameState.goals.player1.width;
        }
        if (player.x + player.width > gameState.goals.player2.x &&
            player.y < gameState.goals.player2.y + gameState.goals.player2.height &&
            player.y + player.height > gameState.goals.player2.y) {
            player.x = gameState.goals.player2.x - player.width;
        }
    }

    updatePlayer(gameState.player1);
    updatePlayer(gameState.player2);

    // Ball movement
    if (gameState.ball.dx !== 0 || gameState.ball.dy !== 0) {
        gameState.ball.dx *= gameState.ball.friction;
        gameState.ball.dy *= gameState.ball.friction;
        gameState.ball.x += gameState.ball.dx;
        gameState.ball.y += gameState.ball.dy;

        // Ensure ball stays within bounds
        if (gameState.ball.x + gameState.ball.radius > canvas.width) {
            gameState.ball.x = canvas.width - gameState.ball.radius;
            gameState.ball.dx = -gameState.ball.dx;
        } else if (gameState.ball.x - gameState.ball.radius < 0) {
            gameState.ball.x = gameState.ball.radius;
            gameState.ball.dx = -gameState.ball.dx;
        }
        if (gameState.ball.y + gameState.ball.radius > canvas.height) {
            gameState.ball.y = canvas.height - gameState.ball.radius;
            gameState.ball.dy = -gameState.ball.dy;
        } else if (gameState.ball.y - gameState.ball.radius < 0) {
            gameState.ball.y = gameState.ball.radius;
            gameState.ball.dy = -gameState.ball.dy;
        }
    }

    // Ball collision with players
    function collisionDetection(player) {
        if (gameState.ball.x + gameState.ball.radius > player.x && gameState.ball.x - gameState.ball.radius < player.x + player.width &&
            gameState.ball.y + gameState.ball.radius > player.y && gameState.ball.y - gameState.ball.radius < player.y + player.height) {
            const angle = Math.atan2(gameState.ball.y - (player.y + player.height / 2), gameState.ball.x - (player.x + player.width / 2));
            const speed = Math.sqrt(gameState.ball.dx ** 2 + gameState.ball.dy ** 2);
            const newSpeed = Math.max(speed, 10); // Stronger kick
            gameState.ball.dx = Math.cos(angle) * newSpeed;
            gameState.ball.dy = Math.sin(angle) * newSpeed;
        }
    }
    collisionDetection(gameState.player1);
    collisionDetection(gameState.player2);

    // Ball collision with goals
    function checkGoal() {
        if (gameState.ball.x - gameState.ball.radius < gameState.goals.player1.x + gameState.goals.player1.width &&
            gameState.ball.y > gameState.goals.player1.y && gameState.ball.y < gameState.goals.player1.y + gameState.goals.player1.height) {
            gameState.scores.red++;
            gameState.isResetting = true;
        } else if (gameState.ball.x + gameState.ball.radius > gameState.goals.player2.x &&
            gameState.ball.y > gameState.goals.player2.y && gameState.ball.y < gameState.goals.player2.y + gameState.goals.player2.height) {
            gameState.scores.blue++;
            gameState.isResetting = true;
        }
    }
    checkGoal();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGoals();
    drawPlayer(gameState.player1);
    drawPlayer(gameState.player2);
    drawBall();
    drawScoreboard();
    updatePositions();
    if (!gameState.isResetting) {
        requestAnimationFrame(draw);
    } else {
        resetGame();
    }
}

function resetGame() {
    gameState.player1.x = 50;
    gameState.player1.y = 350;
    gameState.player2.x = 1100;
    gameState.player2.y = 350;
    gameState.ball.x = canvas.width / 2;
    gameState.ball.y = canvas.height / 2;
    gameState.ball.dx = 0;
    gameState.ball.dy = 0;
    gameState.ball.speed = 0;
    gameState.isResetting = false;
    // After resetting, continue the game loop
    requestAnimationFrame(draw);
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w':
            gameState.player1.dy = -gameState.player1.speed;
            break;
        case 's':
            gameState.player1.dy = gameState.player1.speed;
            break;
        case 'a':
            gameState.player1.dx = -gameState.player1.speed;
            break;
        case 'd':
            gameState.player1.dx = gameState.player1.speed;
            break;
        case 'ArrowUp':
            gameState.player2.dy = -gameState.player2.speed;
            break;
        case 'ArrowDown':
            gameState.player2.dy = gameState.player2.speed;
            break;
        case 'ArrowLeft':
            gameState.player2.dx = -gameState.player2.speed;
            break;
        case 'ArrowRight':
            gameState.player2.dx = gameState.player2.speed;
            break;
        case 'r':
            gameState.isResetting = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'w':
        case 's':
            gameState.player1.dy = 0;
            break;
        case 'a':
        case 'd':
            gameState.player1.dx = 0;
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            gameState.player2.dy = 0;
            break;
        case 'ArrowLeft':
        case 'ArrowRight':
            gameState.player2.dx = 0;
            break;
    }
});

draw();
