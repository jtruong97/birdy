let config = {
    renderer: Phaser.AUTO,
    width: 900, //width of game in pixels
    height: 600, //height of game in pixels
    physics: {
        default: 'arcade',
        arcade: { // physics of game system is 'arcade'
        gravity: { y: 300 },
        debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config); // game is an instance of Phaser.Game to set up our game

function preload(){ // brings images for our application like background
    this.load.image('background', 'assets/background.png'); //loading background from assets folder
    this.load.image('road', 'assets/road.png');
    this.load.image('column', 'assets/column.png');
    this.load.spritesheet('bird', 'assets/bird.png', { frameWidth: 64, frameHeight: 96 });
}

let bird;
let hasLanded = false
let cursors;
let hasBumped = false
let isGameStarted = false;
let messageToPlayer;

function create(){ // generate elements to appear in our game like images from our preload
    const background = this.add.image(0, 0, 'background').setOrigin(0, 0); // set origin puts our background in the upper left corner (0,0)

    //Create Roads
    const roads = this.physics.add.staticGroup(); // calls Arcade Physics system in phaser which allows us to apply simulation to the roads we create
    const road = roads.create(400, 568, 'road').setScale(2).refreshBody(); // static road variable making it 2x bigger than original size. Since we change size, need to call refreshBody()

    //Create Columns
    const topColumns = this.physics.add.staticGroup({ //top columns are static like our road
        key: 'column',
        repeat: 1,
        setXY: { x: 200, y: 0, stepX: 300 }
    });
    const bottomColumns = this.physics.add.staticGroup({
        key: 'column',
        repeat: 1,
        setXY: { x: 350, y: 400, stepX: 300 },
    });

    //Create Bird
    bird = this.physics.add.sprite(0, 50, 'bird').setScale(2); //sprite: has dynamic body and has gravity setting(falling to bottom of screen)
    bird.setBounce(0.2); //bird will bounce slighly if it collides with something
    bird.setCollideWorldBounds(true); // bird will bump into edges of screen but not go through


    this.physics.add.overlap(bird, road, () => hasLanded = true, null, this); //if bird touches the road, hasLanded is set to true
    this.physics.add.collider(bird, road); //this makes sure the bird lands on top of the road and not through it

    //Moving bird upward
    cursors = this.input.keyboard.createCursorKeys(); // creates and returns an obj containing 4 hotkeys for up down left right space and shfit


    // if bird touches any columns, set hasBumped to true
    this.physics.add.overlap(bird, topColumns, ()=>hasBumped=true,null, this);
    this.physics.add.overlap(bird, bottomColumns, ()=>hasBumped=true,null, this);
    this.physics.add.collider(bird, topColumns); //bird will not pass thru columns
    this.physics.add.collider(bird, bottomColumns); //bird will not pass thru columns

    //Create game instructions
    messageToPlayer = this.add.text(0,0, 'Instructions: Press space bar to start', {fontSize: '20px', backgroundColor: 'grey'})
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, -100, 50) // moves msg to bottom on the screen

    //reset game
    this.input.keyboard.on('keydown-R', resetGame, this)
}

function update() {

    if (!hasLanded) { // if the bird hasnt touched the floor yet, keep it moving the right
        bird.body.velocity.x = 50;
    }
    if (hasLanded) { //stop bird from moving once it touches the floor
        bird.body.velocity.x = 0;
    }

    if (cursors.up.isDown && !hasLanded && !hasBumped) {
        bird.setVelocityY(-160);
    }

    if(!hasLanded || !hasBumped) {
        bird.body.velocity.x = 50;
    } else {
        bird.body.velocity.x = 0;
    }

    if(hasLanded || hasBumped || !isGameStarted){ //if the game hasnt started yet, dont move the bird
        bird.body.velocity.x = 0;
    }

    if (cursors.space.isDown && !isGameStarted) { //if user presses space key and the game hasnt started, set the game to started
        isGameStarted = true;
    }

    if (!isGameStarted) { //if the game hasnt been started yet, prevent bird from falling
        bird.setVelocityY(-160);
    }

    if (cursors.space.isDown && isGameStarted){
        isGameStarted = true;
        messageToPlayer.text = 'Instructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or the ground'
    }

    if(hasLanded || hasBumped){
        messageToPlayer.text = 'Oh no! You crashed!\n Press "r" to play again'
    }

    if(bird.x > 750){
        bird.setVelocityY(40)
        messageToPlayer.text = 'Congrats! You won!'
    }
}

function resetGame(){
    hasLanded = false
    hasBumped = false
    isGameStarted = false;
    this.scene.restart()
}
