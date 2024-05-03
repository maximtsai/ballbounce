let config = {
    type: Phaser.CANVAS,
    scale: {
        parent: 'spellwheel',
        width: 500,
        height: 500,
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
    // create() gets called by the game engine is called once the game has preloaded
    // Make sure the game actually fits the screen.
    resizeGame();
    PhaserScene = this;

    // Earlier I loaded two objects 'blackPixel' and 'ball' via loadFileList. 
    // 'blacPixel' is a 2x2 black square
    // 'ball' is a white circular ball
    // I draw blackPixel at the center of the screen and make it 1000 times bigger. Depth = -10 means it's always behind
    //      everything with a higher depth (depth defaults to 0)
    // The game's coordinates are (x, y) where (0, 0) puts something at the top left of the screen.
    globalObjects.background = PhaserScene.add.sprite(gameConsts.halfWidth, gameConsts.halfHeight, 'blackPixel').setScale(1000, 1000).setDepth(-10);
    globalObjects.ball = PhaserScene.add.sprite(100, gameConsts.halfHeight, 'ball');
    //globalObjects.ball2 = PhaserScene.add.sprite(100, gameConsts.halfHeight, 'ball');

    // Useful stuff to achieve the goals later.
    globalObjects.ball.velX = 10;
    globalObjects.ball.velY = 10;

    //globalObjects.ball2.velX = 0;
    //globalObjects.ball2.velY = 0;
    //globalObjects.ball2.x = 200;

    globalObjects.rect = PhaserScene.add.rectangle(300, 300, 100, 50, 0x4c7df3);

    radius = globalObjects.ball.width * 0.5;
    //radius2 = globalObjects.ball2.width * 0.5;

    globalObjects.ball.y = 400;

}

function myUpdate(time, delta) {
    let ball1 = globalObjects.ball;
    //let ball2 = globalObjects.ball2;
    let rect = globalObjects.rect;

    /*let distX = ball2.x - ball1.x;
    let distY = ball2.y - ball1.y;
    let distBetweenBalls = Math.sqrt(distX * distX + distY * distY);
    let collideDist = ball1.width*0.5 + ball2.width*0.5;
    
    /*if (distBetweenBalls < collideDist) {
        // Collided! First move balls apart

        ball2.x += (1 * (collideDist - distBetweenBalls) / distBetweenBalls) * distX;
        ball2.y += (1 * (collideDist - distBetweenBalls) / distBetweenBalls) * distY;
        distX = ball2.x - ball1.x;
        distY = ball2.y - ball1.y;

        // Now calculate ball vel differences and speed
        let diffVelX = ball2.velX - ball1.velX;
        let diffVelY = ball2.velY - ball1.velY;
        let diffSpeed = Math.sqrt(diffVelX*diffVelX + diffVelY*diffVelY);

        let distXUnit = distX / distBetweenBalls;
        let distYUnit = distY / distBetweenBalls;
        let diffVelXUnit = diffVelX / diffSpeed;
        let diffVelYUnit = diffVelY / diffSpeed;
        
        let dotProd = distXUnit * diffVelXUnit + distYUnit * diffVelYUnit;
        let forceTransferred = Math.abs(dotProd * diffSpeed);
        ball2.velX += distXUnit * forceTransferred * 0.91;
        ball2.velY += distYUnit * forceTransferred * 0.91;
        ball1.velX += -distXUnit * forceTransferred * 0.91;
        ball1.velY += -distYUnit  * forceTransferred * 0.91;

    }*/


    //come back later could cause error when ball is inside rectangle
    let dist_top = ball1.y-(rect.y-rect.height*0.5);
    let dist_bottom = ball1.y-(rect.y+rect.height*0.5);
    let dist_left = ball1.x-(rect.x-rect.width*0.5);
    let dist_right = ball1.x-(rect.x+rect.width*0.5);

    let min_distY = dist_top;
    let min_distX = dist_left;

    let closest_corner = 1;
    if (ball1.y < rect.y) {
        min_distY = dist_bottom;
        closest_corner += 2;
    }
    if (ball1.x > rect.x) {
        min_distX = dist_right;
        closest_corner++;
    }

    min_distX = Math.abs(min_distX);
    min_distY = Math.abs(min_distY);
    let min_dist = Math.sqrt(min_distX*min_distX+min_distY*min_distY);
    let ball1_vel = Math.sqrt(ball1.velX*ball1.velX+ball1.velY+ball1.velY);

    if (Math.abs(ball1.x-rect.x) < rect.width*0.5 && Math.abs(ball1.y-rect.y) < rect.height*0.5+ball1.width*0.5) {
        //top or bottom collision
        ball1.y = (ball1.velY > 0) ? rect.y-rect.height*0.5-ball1.width*0.5 : rect.y+rect.height*0.5+ball1.width*0.5;
        ball1.velY *= -1;
        
    } else if (Math.abs(ball1.y-rect.y) < rect.height*0.5 && Math.abs(ball1.x-rect.x) < rect.width*0.5+ball1.height*0.5) {
        //left or right collision
        ball1.x = (ball1.velX > 0) ? rect.x-rect.width*0.5-ball1.width*0.5 : rect.x+rect.width*0.5+ball1.width*0.5;
        ball1.velX *= -1;
    } /*else if (min_dist < ball1.width*0.5) {
        //corner collision
        console.log(min_dist);
        let forceX=0;
        let forceY=0;
        switch(closest_corner) {
            case 1:
                forceX = -1*min_distX;
                forceY = -1*min_distY;
                break;
            case 2:
                forceX = min_distX;
                forceY = -1*min_distY;
                break;
            case 3:
                forceX = -1*min_distX;
                forceY = min_distY;
                break;
            case 4:
                forceX = min_distX;
                forceY = min_distY;
                break;
        }
        let total_force = Math.sqrt(forceX*forceX+forceY*forceY);
        forceX/=total_force;
        forceY/=total_force;
        let dot_product = forceX*ball1.velX+forceY*ball1.velY;
        ball1.velX += 0.1 * forceX * dot_product;
        ball1.velY += 0.1 * forceY * dot_product;
        //ball1.x += forceX;
        //ball1.y += forceY;
    }*/

    



    ball1.velY += 0.25;
    ball1.x += ball1.velX;
    ball1.y += ball1.velY;

    //ball2.velY += 0.25;
    //ball2.x += ball2.velX;
    //ball2.y += ball2.velY;

    handleBounds(ball1);
    //handleBounds(ball2);
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

