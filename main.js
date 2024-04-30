let config = {
    type: Phaser.CANVAS,
    scale: {
        parent: 'spellwheel',
        width: 2000,
        height: 2000,
        autoRound: true,
        mode: Phaser.Scale.FIT,

    },
    render: {
        // Leave on to prevent pixelated graphics
        antialias: true,
        roundPixels: true,
    },
    transparent: true,
    expandParent: true,
    clearBeforeRender: false,
    parent: 'spellwheel',
    loader: {
        baseURL: '' // Where we begin looking for files
    },
    scene: {
        preload: myPreload,
        create: myCreate,
        update: myUpdate
    },
    dom: {
        createContainer: true,
    },
};


let gameConsts = {
    width: config.scale.width,
    halfWidth: config.scale.width * 0.5,
    height: config.scale.height,
    halfHeight: config.scale.height * 0.5,
    SDK: null
};
let gameVars = {
    gameConstructed: false,
    mousedown: false,
    mouseJustDowned: false,
    mouseposx: 0,
    mouseposy: 0,
    lastmousedown: {x: 0, y: 0},
    timeSlowRatio: 1,
    gameScale: 1,
    canvasXOffset: 0,
    canvasYOffset: 0
};
let globalObjects = {};
let updateFunctions = {};
let PhaserScene = null;
let game;

function onloadFunc() {
    game = new Phaser.Game(config); // var canvas = game.canvas;
}


function myPreload ()
{
    // This function is called at the very very beginning of the game before anything has actually loaded.

    // Gets rid of the "Please enable javascript" message I added in index.html
    let gameDiv = document.getElementById('preload-notice');
    gameDiv.innerHTML = "";

    // Actually calls files to start loading. loadFileList is a function I wrote in the file 'imageFiles.js'
    // imageFilesPreload is a global constant in 'imageFiles.js'
    loadFileList(this, imageFilesPreload, 'image');
    // Note that this code is messy by industry standards. But it works and that's all I care about.
}

function myCreate ()
{
    resizeGame();
    PhaserScene = this;

    globalObjects.background = PhaserScene.add.sprite(gameConsts.halfWidth, gameConsts.halfHeight, 'blackPixel').setScale(1000, 1000).setDepth(-10);
    globalObjects.ball = PhaserScene.add.sprite(150, 300, 'ball');

    // Useful stuff to achieve the goals later.
    globalObjects.ball.lastX = globalObjects.ball.x;
    globalObjects.ball.lastY = globalObjects.ball.y;
    globalObjects.ball.velX = 1;
    globalObjects.ball.velY = 0;


    // rect.js, turn this into a proper class
    //create 4 rings of rectangles
    for (let i = 0; i < 64; i++) {
        let angle = Math.PI*2*i/64;
        globalObjects.rect = new Rect(gameConsts.width*0.5 + 1000*Math.cos(angle), 1000 + 1000*Math.sin(angle), 95, 10, angle+Math.PI*0.5, 0x4c7df3);
    }
    for (let i = 0; i < 64; i++) {
        let angle = Math.PI*2*i/64;
        globalObjects.rect = new Rect(1000 + 750*Math.cos(angle), 1000 + 750*Math.sin(angle), 75, 10, angle+Math.PI*0.5, 0xf8766d);
    }
    for (let i = 0; i < 64; i++) {
        let angle = Math.PI*2*i/64;
        globalObjects.rect = new Rect(1000 + 500*Math.cos(angle), 1000 + 500*Math.sin(angle), 50, 10, angle+Math.PI*0.5, 0xebc157);
    }
    for (let i = 0; i < 64; i++) {
        let angle = Math.PI*2*i/64;
        globalObjects.rect = new Rect(1000 + 250*Math.cos(angle), 1000 + 250*Math.sin(angle), 25, 10, angle+Math.PI*0.5, 0xe8f964);
    }


    radius = globalObjects.ball.width * 0.5;
}

let delayTick = 8;

function myUpdate(time, delta) {
    /*if (delayTick > 0) {
        delayTick--;
        return;
    } else {
        delayTick = 8;
    }*/

    let ball1 = globalObjects.ball;
    ball1.lastX = ball1.x;
    ball1.lastY = ball1.y;
    ball1.x += ball1.velX;
    ball1.y += ball1.velY;
    ball1.velY += 0.25;

    // If ball is closer than this distance to rect,
    globalObjects.rect.handleCollisionWithBall(ball1);

    // ball2.velY += 0.25;
    // ball2.x += ball2.velX;
    // ball2.y += ball2.velY;

    handleBounds(ball1);
    // handleBounds(ball2);
}

function handleBounds(ball) {
    if (ball.y > gameConsts.height - ball.width * 0.5) {
        ball.y = gameConsts.height - ball.width * 0.5;
        ball.velY *= -1;
    }

    if (ball.x > gameConsts.width - ball.width * 0.5) {
        ball.x = gameConsts.width - ball.width * 0.5;
        ball.velX *= -1;
    } else if (ball.x < ball.width * 0.5) {
        ball.x = ball.width * 0.5;
        ball.velX *= -1;
    }
}

function resizeGame() {
    // Complicated bunch of code getting the game to resize correctly to fill in the screen
    // Might have bugs on certain devices.
    if (!game || !game.canvas) {
        return;
    }
    var canvas = game.canvas; //document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    var gameScale = 1;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = windowWidth / gameRatio + "px";
        gameScale = windowWidth / game.config.width;
        gameVars.canvasXOffset = 0;
        gameVars.canvasYOffset = (windowHeight - game.config.height * gameScale) * 0.5;
    } else {
        canvas.style.width = windowHeight * gameRatio + "px";
        canvas.style.height = windowHeight + "px";
        gameScale = windowHeight / game.config.height;
        gameVars.canvasYOffset = 0;
        gameVars.canvasXOffset = (windowWidth - game.config.width * gameScale) * 0.5;
    }
    gameVars.gameScale = gameScale;
}

