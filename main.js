

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

const P1_UP_BUTTON = "KeyW";
const P1_DOWN_BUTTON = "KeyS";
const P2_UP_BUTTON = "ArrowUp";
const P2_DOWN_BUTTON = "ArrowDown";

const UP_ACTION = "up";
const DOWN_ACTION = "down";
const STOP_ACTION = "stop";

const PAUSE_BUTTON = "KeyP";

let ballX = BALL_START_X;
let ballY = BALL_START_Y;
let ballVX = BALL_SPEED_VX;
let ballVY = BALL_SPEED_VY;
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
    drawBall(ballX, ballY, BALL_R);
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
    if(shouldBallBounceFromTopWall() || shouldBallBounceFromBottomWall()) bounceBallFromWall();
    if(shouldBallBounceFromLeftPaddle() || shouldBallBounceFromRightPaddle()) bounceBallFromPaddle();
    if(ballOutOnLeft() || ballOutOnRight()) moveBallToCentre();
    moveBallPosition();
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

function moveBallPosition(){
    ballX+=ballVX;
    ballY+=ballVY;
}
function moveBallToCentre(){
    ballX = BALL_START_X;
    ballY = BALL_START_Y;
}
function ballOutOnLeft(){
    if(ballX+BALL_R <= 0) {
        p2Points++;
        return true; 
    }
    return false;
}
function ballOutOnRight(){
    if(ballX - BALL_R >= CANVAS_WIDTH) {
        p1Points++;
        return true;
    }
    return false;
}
function bounceBallFromWall() {
    ballVY = -ballVY;
}
function bounceBallFromPaddle() {
    ballVX = -ballVX;
}
function shouldBallBounceFromTopWall() {
    return ballY - BALL_R <= 0 && ballVY < 0;
}
function shouldBallBounceFromBottomWall() {
    return ballY + BALL_R >= CANVAS_HEIGHT && ballVY > 0;
}
function isInPaddleRange(ballYPos, min, max){
    return ballYPos >= min && ballYPos <= max;
}
function isBallOnTheSameHeightAsPaddle(paddleY) {
    return isInPaddleRange(ballY, paddleY, paddleY+PADDLE_HEIGHT)
}
function shouldBallBounceFromLeftPaddle() {
    return ballVX < 0 && 
    isInPaddleRange(ballX-BALL_R, PADDLE_P1_X, PADDLE_P1_X+PADDLE_WIDTH) &&
    isBallOnTheSameHeightAsPaddle(p1PaddleY);
}
function shouldBallBounceFromRightPaddle() {
    return ballVX > 0 && 
    isInPaddleRange(ballX+BALL_R, PADDLE_P2_X, PADDLE_P2_X+PADDLE_WIDTH) &&
    isBallOnTheSameHeightAsPaddle(p2PaddleY);
}



clearButton.addEventListener("click", (event) => {
    console.log("Clear button clicked");
    clearCanvas();
});
    