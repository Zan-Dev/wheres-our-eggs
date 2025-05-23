// SKIN //
export class Skins {
    constructor(name, src, x, y, frameWidth, frameHeight, scaleWidth, scaleHeight, frameCount, frameInterval, flip = false) {
        this.name = name;
        this.image = new Image();
        this.image.src = src;
        this.x = x;
        this.y = y;
        
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.scaleWidth = scaleWidth;
        this.scaleHeight = scaleHeight;
        this.frameCount = frameCount;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.frameInterval = frameInterval;
        this.flip = flip;
    }

    update(deltaTime) {
        this.frameTimer += deltaTime;
        if (this.frameTimer >= this.frameInterval) {
          this.frameTimer = 0;
          this.frameIndex = (this.frameIndex + 1) % this.frameCount;    
        }
    }
    
    draw(ctx) {
        if (this.flip) {
            ctx.save();            
            ctx.drawImage(
                this.image,
                this.frameIndex * this.frameWidth,
                0,
                this.frameWidth,
                this.frameHeight,
                0,
                0,
                this.scaleWidth,
                this.scaleHeight
            );
            ctx.restore();
        } else {
            ctx.drawImage(
                this.image,
                this.frameIndex * this.frameWidth,
                0,
                this.frameWidth,
                this.frameHeight,
                this.x,
                this.y,
                this.scaleWidth,
                this.scaleHeight
            );
        }
    }
}

export const playerSkin = [
    {
        name: "player1",
        index: 0,
        animating: false,
        animationDir: null,
        animStart: 0,
        x: 300,
        skins: [
            // 1:name, 2:src, 3:x, 4:y, 5:frameWidth, 6:frameHeight, 7:scaleWidth, 8:scaleHeight 8:frame, 9:100ms/frame, 10:flip            
            new Skins("mono", "assets/images/mono/idle.png", 200, 200, 24, 24, 200, 200, 3, 100, false),    
            new Skins("mono", "assets/images/mono/idle2.png", 200, 200, 24, 24, 200, 200, 3, 100, false),  
        ]   
    },
    {
        name: "player2",
        index: 0,
        animating: false,
        animationDir: null,
        animStart: 0,
        x: 1000,
        skins: [
            // 1:name, 2:src, 3:x, 4:y, 5:frameWidth, 6:frameHeight, 7:scaleWidth, 8:scaleHeight 8:frame, 9:100ms/frame, 10:flip
            new Skins("vita", "assets/images/vita/idle.png", 900, 200, 24, 24, 200, 200, 3, 100, true),             
            new Skins("vita", "assets/images/vita/idle2.png", 900, 200, 24, 24, 200, 200, 3, 100, true),   
        ]   
    }
]  

// PLAYERS // PROBLEM DI LOGICAL DOUBLE JUMP TANDA ???
export class Players {
    constructor(x, y, speed, animations) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.animations = animations;
        this.currentAnim = 'idle';
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.facing = 'right';
        this.width = 64;
        this.height = 64;

        this.vy = 0;
        this.gravity = 0.5;
        this.jumpStrength = -10;
        this.isJumping = false;
        this.onGround = true;
        this.jumpCount = 0;
        this.maxJump = 2;
        this.jumpPressed = this.false;
        this.idle = true;

        this.bite = false;
        this.biteTimer = 0;
        this.biteDuration = 200; 

        this.kick = false;
        this.kickTimer = 0;
        this.kickDuration = 200; 
            
    }

    update(player,keysLeft, keysRight, keysJump, keysBite, keysSkill1, keysSkill2, deltaTime) {                           
        if (keysSkill1) {
            if (player === "player1") {
                this.kickTimer = 0;
                this.kick = true;
                this.idle = false;
            } else {                           
                if (keysRight) {                    
                    this.x += this.speed;
                    this.facing = 'right';
                    this.setAnimation('crouch');
                } else if (keysLeft) {
                    this.x -= this.speed;
                    this.facing = 'left';
                    this.setAnimation('crouch');
                } else {
                    this.setAnimation('crouchIdle');
                }
            }
        }        
        else if (keysBite) {
            this.biteTimer = 0;
            this.bite = true;
            this.idle = false;
        }        
        else if (keysLeft) {
            this.x -= this.speed;
            this.facing = 'left';
            this.setAnimation('walk');
        }
        else if (keysRight) {
            this.x += this.speed;
            this.facing = 'right';
            this.setAnimation('walk');
        }        
        else if (this.idle) {
            this.setAnimation('idle');
        }

        // KICK
        if (this.kick){
            this.kickTimer += deltaTime;
            this.setAnimation('kick');

            if (this.kickTimer >= this.kickDuration) {
                this.kick = false;
                this.idle = true;
                this.kickTimer = 0;                
            } 
        }
        // END KICK

        // BITE
        if (this.bite) {
            this.biteTimer += deltaTime;
            this.setAnimation('bite');

            if (this.biteTimer >= this.biteDuration) {
                this.bite = false;
                this.idle = true;
                this.biteTimer = 0;
            }
        }
        //END BITE

        // JUMP
        if (keysJump && this.onGround) {
            this.vy = this.jumpStrength;
            this.onGround = false;
            this.setAnimation('jump');
        }
                
        if (keysJump) {
            if (!this.jumpPressed && this.jumpCount < this.maxJump && player === "player1") {
                this.vy = this.jumpStrength;
                this.jumpCount++;
                this.onGround = false;
                this.setAnimation('jump');
                this.jumpPressed = true;
            }
        } else {
            this.jumpPressed = false;
        }

        this.vy += this.gravity;
        this.y += this.vy;                                      
              
        if (this.y >= 400) {
            this.y = 400;
            this.vy = 0;
            this.jumpCount = 0;
            this.onGround = true;
        }
        // END JUMP

        // Update frame animasi
        const anim = this.animations[this.currentAnim];
        const frameInterval = 100; // kecepatan animasi (frame per detik)       
        this.frameTimer += deltaTime;
        if (this.frameTimer >= frameInterval) {
          this.frameTimer = 0;
          this.frameIndex = (this.frameIndex + 1) % anim.frameCount;                 
        }
    }

    setAnimation(animName) {        
        if (this.currentAnim !== animName) {
            this.currentAnim = animName;
            this.frameIndex = 0;
            this.frameTimer = 0;
        }
    }

    draw(ctx) {
        const anim = this.animations[this.currentAnim];
        const frameWidth = anim.image.width / anim.frameCount;

        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.translate(this.x + (this.facing === 'left' ? frameWidth + 64 : 0), this.y);
        ctx.scale(this.facing === 'left' ? -1 : 1, 1);
        ctx.drawImage(
            anim.image,
            this.frameIndex * frameWidth,
            0,
            frameWidth,
            anim.image.height,
            0,
            0,
            100,
            100
        );
        ctx.restore();
    }

    getCenterX() {
        return this.x + this.width / 2;
    }
}

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

function createAnimations(basePath, actions) {
    const anim = {};
    for (const action of actions) {
        anim[action.name] = {
            image: loadImage(`${basePath}/${action.file}`),
            frameCount: action.frames
        };
    }
    return anim;
}

const monoAnimations = createAnimations("./assets/images/mono", [
    { name: "idle", file: "idle.png", frames: 3 },
    { name: "walk", file: "move.png", frames: 6 },
    { name: "bite", file: "bite.png", frames: 3 },
    { name: "jump", file: "jump.png", frames: 4 },
    { name: "kick", file: "kick.png", frames: 3 },
]);

const vitaAnimations = createAnimations("./assets/images/vita", [
    { name: "idle", file: "idle.png", frames: 3 },
    { name: "walk", file: "move.png", frames: 6 },
    { name: "bite", file: "bite.png", frames: 3 },
    { name: "jump", file: "jump.png", frames: 4 },
    { name: "crouch", file: "crouch.png", frames: 6 },
    { name: "crouchIdle", file: "crouchIdle.png", frames: 1 },
]);

export const Player1 = new Players(200, 400, 5, monoAnimations);
export const Player2 = new Players(300, 400, 5, vitaAnimations);

// BUTTONS //
export class Buttons{
    constructor(imageSrc, x, y, width, height, scale, onClick=null, active = null){
        this.image = new Image();
        this.image.src = imageSrc;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;

        this.hovered = false;
        this.clicked = false;
        this.active = active;

        this.onClick = onClick;    
        
        if (!imageSrc) {
            console.error("imageSrc tidak didefinisikan untuk Button!");
        }
    }

    isMouseOver(mouseX, mouseY) {
        return (
            mouseX >= this.x &&
            mouseX <= this.x + this.width * this.scale &&
            mouseY >= this.y &&
            mouseY <= this.y + this.height * this.scale
        );
    }

    update(mouseX, mouseY, isMouseDown) {
        if (!this.active) {
            this.hovered = false;
            this.clicked = false;
            return;
        }

        this.hovered = this.isMouseOver(mouseX, mouseY);
        this.clicked = this.hovered && isMouseDown;

        if (this.clicked && this.onClick) {
            // console.log("Clicked");
        }
    }

    draw(ctx) {
        ctx.save();

        let scaleFactor = this.hovered ? this.scale * 1.2 : this.scale;
        
        if (this.hovered) {
            ctx.globalAlpha = 0.9;
            ctx.shadowColor = 'yellow';
            ctx.shadowBlur = 15;            
        }
     

        ctx.drawImage(
            this.image,
            this.x - (this.width * (scaleFactor - this.scale)) / 2,
            this.y - (this.height * (scaleFactor - this.scale)) / 2,
            this.width * scaleFactor,
            this.height * scaleFactor
        );

        ctx.restore();
    }
}

export const buttons = {
    // 1:src, 2:x, 3:y, 4:scale, 5:onClick 6:active
    buttonNext: new Buttons("assets/images/buttons/button-next.png", 627, 540, 100, 40, 1, true, true),
    buttonA: new Buttons("assets/images/buttons/arrow-a.png", 190, 400, 125, 164, 0.5, true, true),
    buttonD: new Buttons("assets/images/buttons/arrow-d.png", 350, 400, 125, 164, 0.5, true, true),    
    buttonLeft: new Buttons("assets/images/buttons/arrow-left.png", 890, 400, 125, 164, 0.5, true, true),    
    buttonRight: new Buttons("assets/images/buttons/arrow-right.png", 1050, 400, 125, 164, 0.5, true, true),    
    buttonLevels: []    
};
    
export function getButtons(name) {
    return buttons[name];
}

for (let i=1; i<9; i++){   
    buttons.buttonLevels.push(        
        new Buttons(
            `assets/images/buttons/levels/${i}.png`,
            400 + ((i - 1) % 4) * 150,
            200 + Math.floor((i - 1) / 4) * 150,
            141,
            132,
            0.5,
            () => console.log("Button 1"),
            true
        )
    )
}