console.log("main.js loaded");

const canvas = document.getElementById("gameCanvas");
const clearButton = document.getElementById("clearButton");

const ctx = canvas.getContext("2d");
ctx.font = "30px Arial";

const STATE_CHANGE_INTERVAL = 10;

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;

const BOARD_Y = 30;
const BOARD_P1 = 250;
const BOARD_P2 = 500;

const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const PADDLE_STEP = 3;
const PADDLE_P1_X = 10;
const PADDLE_P2_X = 770;
const PADDLE_START_Y = (CANVAS_HEIGHT-PADDLE_HEIGHT) / 2;

const BALL_R = 15;
const BALL_START_X = CANVAS_WIDTH / 2;
const BALL_START_Y = CANVAS_HEIGHT / 2;
const BALL_SPEED_VX = 4.5;
const BALL_SPEED_VY = 1.5;

const ball = {
    r: BALL_R,
    x: BALL_START_X,
    y: BALL_START_Y,
    vx: BALL_SPEED_VX,
    vy: BALL_SPEED_VY,

    move: function() {
        this.x += this.vx;
        this.y += this.vy;
    },
    moveToCentre: function() {
        this.x = BALL_START_X;
        this.y = BALL_START_Y;
    },
    outOnLeft: function() {
        if(this.x + BALL_R <= 0) {
            p2Points++;
            return true; 
        }
        return false;
    },
    outOnRight: function() {
        if(this.x - BALL_R >= CANVAS_WIDTH) {
            p1Points++;
            return true;
        }
        return false;
    },
    bounceFromWall: function() {
        this.vy = -this.vy;
    },
    bounceFromPaddle: function() {
        this.vx = -this.vx;
    },
    shouldBounceFromTopWall: function() {
        return this.y - BALL_R <= 0 && this.vy < 0;
    },
    shouldBounceFromBottomWall: function() {
        return this.y + BALL_R >= CANVAS_HEIGHT && this.vy > 0;
    },
    isOnTheSameHeightAsPaddle: function(paddleY) {
        return isInPaddleRange(this.y, paddleY, paddleY + PADDLE_HEIGHT)
    },
    shouldBounceFromLeftPaddle: function() {
        return this.vx < 0 && 
        isInPaddleRange(this.x - BALL_R, PADDLE_P1_X, PADDLE_P1_X + PADDLE_WIDTH) &&
        ball.isOnTheSameHeightAsPaddle(p1PaddleY);
    },
    shouldBounceFromRightPaddle: function() {
        return this.vx > 0 && 
        isInPaddleRange(this.x + BALL_R, PADDLE_P2_X, PADDLE_P2_X + PADDLE_WIDTH) &&
        ball.isOnTheSameHeightAsPaddle(p2PaddleY);
    },
}

const P1_UP_BUTTON = "KeyW";
const P1_DOWN_BUTTON = "KeyS";
const P2_UP_BUTTON = "ArrowUp";
const P2_DOWN_BUTTON = "ArrowDown";

const UP_ACTION = "up";
const DOWN_ACTION = "down";
const STOP_ACTION = "stop";

const PAUSE_BUTTON = "KeyP";

let p1PaddleY  = PADDLE_START_Y;
let p2PaddleY = PADDLE_START_Y;
let p1Points = 0;
let p2Points = 0;

let p1Action = STOP_ACTION;
let p2Action = STOP_ACTION;

let isPaused = false;

function drawState() {
    clearCanvas();
    drawPoints(p1Points.toString(), BOARD_P1, BOARD_Y);
    drawPoints(p2Points.toString(), BOARD_P2, BOARD_Y);
    drawBall(ball.x, ball.y, ball.r);
    drawPaddle(PADDLE_P1_X, p1PaddleY);
    drawPaddle(PADDLE_P2_X, p2PaddleY);
}

function drawPaddle(x,y) {
    ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
}
function drawPoints(text, x, y) {
    if(typeof(y)===undefined) y=10;
    ctx.fillText(text,x,y);
}
function drawBall(x,y,r) {
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function clearCanvas() {
    ctx.clearRect(0,0,canvas.width, canvas.height);
}


function updateAndChangeState() {
    if(isPaused) return;
    updateState();
    drawState();
}

function updateState() {
    movePaddles();
    moveBall();    
}

function moveBall() {
    if(ball.shouldBounceFromTopWall() || ball.shouldBounceFromBottomWall()) ball.bounceFromWall();
    if(ball.shouldBounceFromLeftPaddle() || ball.shouldBounceFromRightPaddle()) ball.bounceFromPaddle();
    if(ball.outOnLeft() || ball.outOnRight()) ball.moveToCentre();
    ball.move();
}

setInterval(updateAndChangeState, STATE_CHANGE_INTERVAL);

window.addEventListener("keydown", event => {
    const code = event.code;
    console.log("keydown " + code);
    if(code === P1_UP_BUTTON){
        p1Action = UP_ACTION;
    }
    if(code === P1_DOWN_BUTTON){
        p1Action = DOWN_ACTION;
    }

    if(code === P2_UP_BUTTON){
        p2Action = UP_ACTION;
    }
    if(code === P2_DOWN_BUTTON){
        p2Action = DOWN_ACTION;
    }
});
window.addEventListener("keyup", event => {
    const code = event.code;
    console.log("keyup " + code);
    if(code === P1_UP_BUTTON && p1Action === UP_ACTION || code === P1_DOWN_BUTTON && p1Action === DOWN_ACTION) { p1Action = STOP_ACTION; }
    if(code === P2_UP_BUTTON && p2Action === UP_ACTION || code === P2_DOWN_BUTTON && p2Action === DOWN_ACTION) { p2Action = STOP_ACTION; }
});
window.addEventListener("keydown", event => {
    const code = event.code;
    if(code === PAUSE_BUTTON){ isPaused = !isPaused; }
});

function movePaddles(){
    if(p1Action === UP_ACTION && p1PaddleY >= 0){
        p1PaddleY -= PADDLE_STEP;
    }
    else if(p1Action === DOWN_ACTION && p1PaddleY <= CANVAS_HEIGHT-PADDLE_HEIGHT){
        p1PaddleY += PADDLE_STEP;
    }

    if(p2Action === UP_ACTION && p2PaddleY >= 0){
        p2PaddleY -= PADDLE_STEP;
    }
    else if(p2Action === DOWN_ACTION && p2PaddleY <= CANVAS_HEIGHT-PADDLE_HEIGHT){
        p2PaddleY += PADDLE_STEP;
    }
}

function isInPaddleRange(yPos, min, max){
    return yPos >= min && yPos <= max;
}

clearButton.addEventListener("click", (event) => {
    console.log("Clear button clicked");
    clearCanvas();
});
    