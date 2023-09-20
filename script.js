const canvas = document.getElementById('darkSpaceCanvas');
const ctx = canvas.getContext('2d');
const reset_btn = document.querySelector('#reset_btn')
let auto_shoot = document.querySelector('#auto_shoot')
const bullets = [];
const enemyShips = [];
let score = 0;
let autoShoot = false;
let timerId;


let isGameOver = false;

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
    }

    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x + this.width / 4, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height / 1.4);
        ctx.lineTo(this.x - this.width / 4, this.y + this.height);
        ctx.lineTo(this.x - this.width / 2, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    moveTo(mouseX) {
        // Ensure the player stays within the canvas boundaries
        const newX = Math.max(this.width / 2, Math.min(canvas.width - this.width / 2, mouseX));
        this.x = newX;
    }

    shoot() {
        const bullet = new ShootBall(this.x, this.y);
        bullets.push(bullet);
    }
}

class ShootBall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 5;
        this.speed = 5;
        this.color = 'green';
    }

    move() {
        this.y -= this.speed;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

class EnemyShip {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
        this.alive = true;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move() {
        this.y += this.speed;
    }
}

const player = new Player(canvas.width / 2, canvas.height - 60);

function createDarkSpace() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function checkCollisions() {
    for (let i = 0; i < enemyShips.length; i++) {
        const enemyShip = enemyShips[i];
        if (enemyShip.alive && isCollision(player, enemyShip)) {
            gameOver();
        }
    }
}

function isCollision(objA, objB) {
    // Tolerance is the number of pixels that can overlap between the player's triangle and the enemy ship
    let tolerance = 2;

    // Calculate the vertices of the player's triangle
    const playerVertices = [
        { x: objA.x, y: objA.y + tolerance }, // Top vertex
        { x: objA.x + (objA.width / 2) - tolerance, y: objA.y + objA.height }, // Bottom right vertex
        { x: objA.x - (objA.width / 2) + tolerance, y: objA.y + objA.height } // Bottom left vertex
    ];

    // Calculate the edges of the player's triangle
    const playerEdges = [
        [playerVertices[0], playerVertices[1]],
        [playerVertices[1], playerVertices[2]],
        [playerVertices[2], playerVertices[0]]
    ];

    // Calculate the edges of the enemy ship (rectangle)
    const enemyEdges = [
        [
            { x: objB.x, y: objB.y },
            { x: objB.x + objB.width, y: objB.y }
        ],
        [
            { x: objB.x + objB.width, y: objB.y },
            { x: objB.x + objB.width, y: objB.y + objB.height }
        ],
        [
            { x: objB.x + objB.width, y: objB.y + objB.height },
            { x: objB.x, y: objB.y + objB.height }
        ],
        [
            { x: objB.x, y: objB.y + objB.height },
            { x: objB.x, y: objB.y }
        ]
    ];

    // Check for intersection between player's triangle edges and enemy ship edges
    for (const playerEdge of playerEdges) {
        for (const enemyEdge of enemyEdges) {
            if (doEdgesIntersect(playerEdge[0], playerEdge[1], enemyEdge[0], enemyEdge[1])) {
                return true;
            }
        }
    }

    return false;
}

function doEdgesIntersect(a, b, c, d) {
    const denominator = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
    const numerator1 = (a.y - c.y) * (d.x - c.x) - (a.x - c.x) * (d.y - c.y);
    const numerator2 = (a.y - c.y) * (b.x - a.x) - (a.x - c.x) * (b.y - a.y);

    // Check if edges are parallel or collinear
    if (denominator === 0) {
        return false;
    }

    const u1 = numerator1 / denominator;
    const u2 = numerator2 / denominator;

    // Check if the intersection point is within the bounds of both edges
    return u1 >= 0 && u1 <= 1 && u2 >= 0 && u2 <= 1;
}


function gameOver() {
    isGameOver = true;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2 - 20);

    ctx.fillStyle = 'red';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2 - 30, canvas.height / 2 + 20);


    // Add a click event listener to restart the game
}

reset_btn.addEventListener('click', () => {
    restartGame()
})

function restartGame() {
    isGameOver = false;
    score = 0;
    player.x = canvas.width / 2;
    bullets.length = 0;
    enemyShips.length = 0;
    gameLoop();
}

function updateEnemyShips() {
    for (let i = 0; i < enemyShips.length; i++) {
        const enemyShip = enemyShips[i];
        if (enemyShip.alive) {
            enemyShip.move();
            enemyShip.draw();

            for (let j = 0; j < bullets.length; j++) {
                const bullet = bullets[j];
                if (
                    bullet.x + bullet.radius > enemyShip.x &&
                    bullet.x - bullet.radius < enemyShip.x + enemyShip.width &&
                    bullet.y + bullet.radius > enemyShip.y &&
                    bullet.y - bullet.radius < enemyShip.y + enemyShip.height
                ) {
                    enemyShip.alive = false;
                    bullets.splice(j, 1);
                    j--;
                    score += 10;
                }
            }

            if (enemyShip.y > canvas.height) {
                enemyShips.splice(i, 1);
                i--;
            }
        }
    }
}

function updateGameArea() {
    createDarkSpace();
    player.draw();
    updateEnemyShips();

    for (let i = 0; i < bullets.length; i++) {
        bullets[i].move();
        bullets[i].draw();

        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

// Add a mousemove event listener to move the player based on the mouse position
document.addEventListener('mousemove', (event) => {
    player.moveTo(event.clientX - canvas.getBoundingClientRect().left);
});

// Add a mousedown event listener to shoot a bullet when the mouse is clicked
document.addEventListener('mousedown', () => {
    player.shoot();
});

// Add a touchmove event listener to move the player based on touch position
canvas.addEventListener('touchmove', (event) => {
    event.preventDefault(); // Prevent scrolling on touch devices
    const touchX = event.touches[0].clientX - canvas.getBoundingClientRect().left;
    player.moveTo(touchX);
});

// Add a touchstart event listener to shoot a bullet when the screen is touched
canvas.addEventListener('touchstart', () => {
    player.shoot();
});


setInterval(() => {
    auto_shoot.checked ? player.shoot() : false;
}, 300);

function gameLoop() {
    if (!isGameOver) {
        requestAnimationFrame(gameLoop);
        updateGameArea();
        checkCollisions();
    }
}

function spawnEnemyShip() {
    for (i = 0; i < 3; i++) {
        setTimeout(() => {
            const x = Math.random() * (canvas.width - 40);
            const y = Math.random() * (-canvas.height - 40);
            const enemyShip = new EnemyShip(x, y);
            enemyShips.push(enemyShip);
        }, 100)
    }
}

setInterval(spawnEnemyShip, 1000);

gameLoop();

//toggle auto shooting
auto_shoot.addEventListener('change', () => {
    this.checked = !this.checked
})

