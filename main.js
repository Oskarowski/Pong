console.log("main.js loaded");

const canvas = document.getElementById("gameCanvas");
const pauseButton = document.getElementById("pauseButton");
const resetGameBtn = document.getElementById("resetGame");
const scoreBtn = document.getElementById("scoreBtn");
const loadBtn = document.getElementById("loadBtn");

const ctx = canvas.getContext("2d");
ctx.fillStyle = "#158f28";
ctx.font = "30px Arial";

const STATE_CHANGE_INTERVAL = 7;

const CANVAS_HEIGHT = canvas.height;
const CANVAS_WIDTH = canvas.width;

const BOARD_Y = 30;
const BOARD_P1 = 250;
const BOARD_P2 = 500;

const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;
const PADDLE_STEP = 4;
const PADDLE_P1_X = 10;
const PADDLE_P2_X = 770;
const PADDLE_START_Y = (CANVAS_HEIGHT-PADDLE_HEIGHT) / 2;

const BALL_R = 15;
const BALL_START_X = CANVAS_WIDTH / 2;
const BALL_START_Y = CANVAS_HEIGHT / 2;
const BALL_SPEED_VX = 4.5;
const BALL_SPEED_VY = 1.5;
const SPEED_MODIFIER = 1.1;

const P1_UP_BUTTON = "KeyW";
const P1_DOWN_BUTTON = "KeyS";
const P2_UP_BUTTON = "ArrowUp";
const P2_DOWN_BUTTON = "ArrowDown";

const UP_ACTION = "up";
const DOWN_ACTION = "down";
const STOP_ACTION = "stop";

const PAUSE_BUTTON = "KeyP";
const RESET_BUTTON = "KeyR";
const SAVE_SCORE_BUTTON = "KeyZ";
const LOAD_SCORE_BUTTON = "KeyL";

setInterval(updateAndChangeState, STATE_CHANGE_INTERVAL);

class Ball {
    constructor(){
        this.r = BALL_R;
        this.x = BALL_START_X;
        this.y = BALL_START_Y;
        this.randomizeInicialSpeedVector();
        // this.vx = BALL_SPEED_VX;
        // this.vy = BALL_SPEED_VY;
        this.speedModifier = SPEED_MODIFIER;
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;
    }
    moveToCentre() {
        this.x = BALL_START_X;
        this.y = BALL_START_Y;
        this.randomizeInicialSpeedVector();
    }
    increseSpeed(){
        this.vx *= 1.1;
        this.vy *= 1.1;
    }
    resetSpeed(){
        this.vx = BALL_SPEED_VX;
        this.vy = BALL_SPEED_VY;
    }
    outOnLeft() {
        if(this.x + BALL_R <= 0) {
            p2.points++;
            this.resetSpeed();
            return true; 
        }
        return false;
    }
    outOnRight() {
        if(this.x - BALL_R >= CANVAS_WIDTH) {
            p1.points++;
            this.resetSpeed();
            return true;
        }
        return false;
    }
    bounceFromWall() {
        this.vy = -this.vy;
    }
    bounceFromPaddle() {
        this.vx = -this.vx;
        this.increseSpeed();
    }
    shouldBounceFromTopWall() {
        return this.y - BALL_R <= 0 && this.vy < 0;
    }
    shouldBounceFromBottomWall() {
        return this.y + BALL_R >= CANVAS_HEIGHT && this.vy > 0;
    }
    isOnTheSameHeightAsPaddle(paddleY) {
        return isInPaddleRange(this.y, paddleY, paddleY + PADDLE_HEIGHT)
    }
    shouldBounceFromLeftPaddle() {
        return this.vx < 0 && 
        isInPaddleRange(this.x - BALL_R, PADDLE_P1_X, PADDLE_P1_X + PADDLE_WIDTH) &&
        ball.isOnTheSameHeightAsPaddle(p1.paddle.y);
    }
    shouldBounceFromRightPaddle() {
        return this.vx > 0 && 
        isInPaddleRange(this.x + BALL_R, PADDLE_P2_X, PADDLE_P2_X + PADDLE_WIDTH) &&
        ball.isOnTheSameHeightAsPaddle(p2.paddle.y);
    }
    drawYourself(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
    getValueFromRange(max, min){
        return Math.random() * (max - min) + min;
    }
    randomizeInicialSpeedVector(){
        const randomToDirection = [Math.random(), Math.random()];

        let randomVX;
        if(randomToDirection[0] >= 0.5){
            const max = 5, min = 4;
            randomVX = this.getValueFromRange(max, min);
        }
        else if(randomToDirection[0] < 0.5){
            const max = -5, min = -4;
            randomVX = this.getValueFromRange(max, min);
        }

        let randomVY;
        if(randomToDirection[1] >= 0.5){
            const max = 2.5, min = 1.25
            randomVY = this.getValueFromRange(max, min);
        }
        else if(randomToDirection[1] < 0.5){
            const max = -2.5, min = -1.25;
            randomVY = this.getValueFromRange(max, min);
        }

        this.vx = randomVX;
        this.vy = randomVY;

    }
}

class Paddle {
    constructor(paddleX){
        this.x = paddleX;
        this.y = PADDLE_START_Y;
    }
    setY(newY){
        const min = 0;
        const max = CANVAS_HEIGHT - PADDLE_HEIGHT;
        
        this.y = inRange(newY, min, max); 
    }
    moveDown() {
        this.setY(this.y + PADDLE_STEP);
    }
    moveUp() {
        this.setY(this.y - PADDLE_STEP);
    }
    drawYourself(){
        ctx.fillRect(this.x, this.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }
}

class Player {
    constructor(paddleX, boardX){
        this.points = 0;
        this.board = boardX;
        this.action = STOP_ACTION;
        this.paddle = new Paddle(paddleX);
    }
    moveAction(){
        if(this.action === UP_ACTION){
            // console.log("this.paddle.moveUp()");
            this.paddle.moveUp();
        }
        else if(this.action === DOWN_ACTION){
            // console.log("this.paddle.moveDown()");
            this.paddle.moveDown();
        }
    }
}

const ball = new Ball();
const p1 = new Player(PADDLE_P1_X, BOARD_P1);
const p2 = new Player(PADDLE_P2_X, BOARD_P2);

let isPaused = false;

function drawPoints(text, x, y) {
    if(typeof(y)===undefined) y=10;
    ctx.fillText(text,x,y);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawState() {
    clearCanvas();
    drawPoints(p1.points.toString(), p1.board, BOARD_Y);
    drawPoints(p2.points.toString(), p2.board, BOARD_Y);
    ball.drawYourself();
    p1.paddle.drawYourself();
    p2.paddle.drawYourself();
}

function moveBall() {
    if(ball.shouldBounceFromTopWall() || ball.shouldBounceFromBottomWall()) ball.bounceFromWall();
    if(ball.shouldBounceFromLeftPaddle() || ball.shouldBounceFromRightPaddle()) ball.bounceFromPaddle();
    if(ball.outOnLeft() || ball.outOnRight()) ball.moveToCentre();
    ball.move();
}

function updateState() {
    p1.moveAction();
    p2.moveAction();
    moveBall();    
}

function updateAndChangeState() {
    if(isPaused) return;
    drawState();
    updateState();
}



window.addEventListener("keydown", event => {
    const code = event.code;
    // console.log("keydown " + code);
    if(code === P1_UP_BUTTON){
        p1.action = UP_ACTION;
    }
    if(code === P1_DOWN_BUTTON){
        p1.action = DOWN_ACTION;
    }
    
    if(code === P2_UP_BUTTON){
        p2.action = UP_ACTION;
    }
    if(code === P2_DOWN_BUTTON){
        p2.action = DOWN_ACTION;
    }
});

window.addEventListener("keyup", event => {
    const code = event.code;
    if(code === P1_UP_BUTTON && p1.action === UP_ACTION || code === P1_DOWN_BUTTON && p1.action === DOWN_ACTION) { p1.action = STOP_ACTION; }
    if(code === P2_UP_BUTTON && p2.action === UP_ACTION || code === P2_DOWN_BUTTON && p2.action === DOWN_ACTION) { p2.action = STOP_ACTION; }
});

window.addEventListener("keydown", event => {
    const code = event.code;
    if(code === PAUSE_BUTTON){ isPaused = !isPaused; }
    if(code === RESET_BUTTON) { resetGame(); }
    if(code === SAVE_SCORE_BUTTON) { savePlayerScore(); }
    if(code === LOAD_SCORE_BUTTON) {loadPlayerScore(); }
});

function inRange(value, min, max){
    if (value <= min) { return min; }
    else if (value >= max) {return max; }
    return value;
}

function isInPaddleRange(yPos, min, max){
    return yPos >= min && yPos <= max;
}

pauseButton.addEventListener("click", (event) => {
    console.log("PAUSE button clicked");
    isPaused = !isPaused;
});

function resetGame(){
    console.log("RESET game btn clicked");
    p1.points = 0;
    p2.points = 0;
    p1.paddle.y=PADDLE_START_Y;
    p2.paddle.y=PADDLE_START_Y;
    ball.moveToCentre();
}

resetGameBtn.addEventListener("click",  (event) => {
    resetGame()
});


function savePlayerScore(){
    playerScores = {score: [p1.points, p2.points]};
    localStorage.setItem("PlayersScores", JSON.stringify(playerScores));
}
function loadPlayerScore(){
    playerScores = {score: [p1.points, p2.points]};
    let savedScoreWeb = localStorage.getItem("PlayersScores");
    if(typeof savedScoreWeb!=="string") return;
    let savedScoreParsed = JSON.parse(savedScoreWeb);
    p1.points = savedScoreParsed.score[0];
    p2.points = savedScoreParsed.score[1];
}

scoreBtn.addEventListener("click", (event) => {
    savePlayerScore();
});
loadBtn.addEventListener("click", (event) => {
    loadPlayerScore();
});

