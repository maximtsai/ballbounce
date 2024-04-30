class Rect {
    constructor(x, y, w, h, rotation = 0) {
        this.rect = PhaserScene.add.rectangle(x, y, w, h, 0x4c7df3);
        // TODO: Fix these
        this.circle1 = PhaserScene.add.sprite(x - 25, y + 10, 'ball_hit_box').setScale(0.2);
        this.circle2 = PhaserScene.add.sprite(x + 25, y - 30, 'ball_hit_box').setScale(0.2);

        this.rect.rotation = rotation;
    }

    handleCollisionWithBall(ball1) {
        let rect = this.rect;

        //come back later could cause error when ball is inside rectangle
        let dist_top = ball1.y-(rect.y-rect.height*0.5);
        let dist_bottom = ball1.y-(rect.y+rect.height*0.5);
        let dist_left = ball1.x-(rect.x-rect.width*0.5);
        let dist_right = ball1.x-(rect.x+rect.width*0.5);

        let min_distY = dist_top;
        let min_distX = dist_left;

        min_distX = Math.abs(min_distX);
        min_distY = Math.abs(min_distY);
        let min_dist = Math.sqrt(min_distX*min_distX+min_distY*min_distY);
        let ball1_vel = Math.sqrt(ball1.velX*ball1.velX+ball1.velY+ball1.velY);

        let xCollisionDist = rect.width*0.5 + ball1.width*0.5;
        let yCollisionDist = rect.height*0.5 + ball1.width*0.5;

        if (Math.abs(ball1.x-rect.x) < xCollisionDist && Math.abs(ball1.y-rect.y) < yCollisionDist) {
            // Ball probably collided with box
            if (ball1.velX === 0) {
                ball1.velX = 0.0001;
            }
            let rectLeftmost = rect.x - rect.width * 0.5;
            let rectRightmost = rect.x + rect.width * 0.5;
            let rectTopmost = rect.y - rect.height * 0.5;
            let rectBotmost = rect.y + rect.height * 0.5;
            let slope = ball1.velY / ball1.velX;
            if (ball1.velY > 0) {
                // Ball is moving downwards
                if (ball1.velX > 0) {
                    // Ball is moving downwards and to the right
                    // may potentially collide with left "corner"
                    let distToLeftCorner = rectLeftmost - ball1.x;
                    let ball1YPosAtLeftCorner = ball1.y + distToLeftCorner * slope;
                    if (ball1.x <= rectLeftmost || ball1YPosAtLeftCorner >= rectTopmost - ball1.height * 0.5 ) {
                        // Ball hit left circle
                        let staticLeftBall = {
                            x: rectLeftmost,
                            y: rect.y,
                            width: rect.height,
                            height: rect.height
                        }
                        collideBallWithStaticBall(ball1, staticLeftBall);
                    } else if (ball1.x >= rectRightmost) {
                        // ball hit Right circle 
                        let staticRightBall = {
                            x: rectRightmost,
                            y: rect.y,
                            width: rect.height,
                            height: rect.height
                        }
                        collideBallWithStaticBall(ball1, staticRightBall);
                    } else {
                        // Easy case, ball actually hit top side of wall
                        let newBallY = rectTopmost - ball1.width*0.5;
                        let yDistMoved = newBallY - ball1.y;
                        ball1.y = newBallY;
                        ball1.x += yDistMoved / slope;
                        ball1.velY *= -1;
                    }
                } else {
                    // Ball is moving downwards and to the left
                    // may potentially collide with right "corner"
                    let distToRightCorner = rectRightmost - ball1.x;
                    let ball1YPosAtRightCorner = ball1.y + distToRightCorner * slope;
                    if (ball1.x >= rectRightmost || ball1YPosAtRightCorner >= rectTopmost - ball1.height * 0.5) {
                        // Ball hit right circle
                        let staticRightBall = {
                            x: rectRightmost,
                            y: rect.y,
                            width: rect.height,
                            height: rect.height
                        }
                        collideBallWithStaticBall(ball1, staticRightBall);
                    } else if (ball1.x <= rectLeftmost) {
                        // ball hit left circle 
                        let staticBall = {
                            x: rectLeftmost,
                            y: rect.y,
                            width: rect.height,
                            height: rect.height
                        }
                        collideBallWithStaticBall(ball1, staticBall);
                    } else {
                        // Easy case, ball actually hit top side of wall
                        let newBallY = rect.y-rect.height*0.5-ball1.width*0.5;
                        let yDistMoved = newBallY - ball1.y;
                        ball1.y = newBallY;
                        ball1.x += yDistMoved / slope;
                        ball1.velY *= -1;
                    }
                }
            } else {
                // Ball is moving upwards
                if (ball1.velX > 0) {
                    // Ball is moving upwards and to the right
                    // may potentially collide with left "corner"
                    let distToLeftCorner = rectLeftmost - ball1.x;
                    let ball1YPosAtLeftCorner = ball1.y + distToLeftCorner * slope;
                    if (ball1.x <= rectLeftmost || ball1YPosAtLeftCorner <= rectBotmost + ball1.height * 0.5 ) {
                        // Ball hit left circle
                        let staticBall = {
                            x: rectLeftmost,
                            y: rect.y,
                            width: rect.height,
                            height: rect.height
                        }
                        collideBallWithStaticBall(ball1, staticBall);
                    } else if (ball1.x >= rectRightmost) {
                        // ball hit left circle 
                        let staticRightBall = {
                            x: rectRightmost,
                            y: rect.y,
                            width: rect.height,
                            height: rect.height
                        }
                        collideBallWithStaticBall(ball1, staticRightBall);
                    } else {
                        // Easy case, ball actually hit top side of wall
                        let newBallY = rect.y + rect.height*0.5 + ball1.width*0.5;
                        let yDistMoved = newBallY - ball1.y;
                        ball1.y = newBallY;
                        ball1.x += yDistMoved / slope;
                        ball1.velY *= -1;
                    }
                } else {
                    // Ball is moving upwards and to the left

                }
            }
        }
    }

    // This function assumes 2 circular objects have collided
    // and that the second object is static and non-moving
    function collideBallWithStaticBall(ball, staticBall) {
        let distX = ball.x - staticBall.x;
        let distY = ball.y - staticBall.y;
        let distBetweenBalls = Math.sqrt(distX * distX + distY * distY);
        let collideDist = staticBall.width*0.5 + ball.width*0.5;
        if (distBetweenBalls < collideDist) {
            // Collided! First move ball1 back
            ball.x += (1 * (collideDist - distBetweenBalls) / distBetweenBalls) * distX;
            ball.y += (1 * (collideDist - distBetweenBalls) / distBetweenBalls) * distY;
            distX = ball.x - staticBall.x;
            distY = ball.y - staticBall.y;

            let ballSpeed = Math.sqrt(ball.velX*ball.velX + ball.velY*ball.velY);
            let distXUnit = distX / distBetweenBalls;
            let distYUnit = distY / distBetweenBalls;
            let diffVelXUnit = ball.velX / ballSpeed;
            let diffVelYUnit = ball.velY / ballSpeed;

            let dotProd = distXUnit * diffVelXUnit + distYUnit * diffVelYUnit;
            let forceTransferred = Math.abs(dotProd * ballSpeed);

            ball.velX += distXUnit * forceTransferred * 2;
            ball.velY += distYUnit * forceTransferred * 2;
        }

    }
}