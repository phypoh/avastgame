// Main game script
var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var comp;
var enemy;
var platforms;
var cursors;
var key1;
var health = 5;
var healthText;
var counter = 0;
var spawnTime = 100;
var gameOver = false;
var score = 0;
var scoreText;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create ()
{
    bg = this.physics.add.staticGroup();
    bg.create(400, 300, 'sky');
    
    end_screen = this.add.image(400, 300, 'star');
    end_screen.visible = false;

    <!-- Create Platform -->
    // Note to self: to clean up
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    <!-- Create Player -->
    player = this.physics.add.sprite(150, 450, 'dude');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    <!-- Create Computer -->
    //comp = this.physics.add.sprite(30, 525, 'star');
    comp = this.physics.add.staticGroup();
    comp.create(10, 300, 'ground').setScale(0.1, 20).refreshBody();

    <!-- Create Enemy -->
    enemies = this.physics.add.group({allowGravity: false});
    spawnEnemy();

    <!-- Collisions -->
    this.physics.add.collider(player, platforms);
    //this.physics.add.collider(comp, platforms);
    this.physics.add.collider(enemies, platforms);

    this.physics.add.overlap(player, enemies, killEnemy, null, this);
    this.physics.add.overlap(comp, enemies, compAttacked, null, this);
    this.physics.add.overlap(bg, enemies, wipeEnemy, null, this);
    
        
    

    <!-- Miscellaneous -->
    cursors = this.input.keyboard.createCursorKeys();
    healthText = this.add.text(16, 8, 'Lives: '+ health, { fontSize: '32px', fill: '#000' });
    scoreText = this.add.text(16, 32, 'Score: '+ score, { fontSize: '32px', fill: '#000' });
    


}

function update ()
{
    <!-- Player Movement -->
    if (cursors.up.isDown) //player.body.touching.down
    {
        player.setVelocityY(-200);
    }


    <!-- Random Enemy Spawn -->
    counter = counter + 1;
    if (counter >= spawnTime && !gameOver)
    {
        counter = 0;
        spawnEnemy();
        spawnTime = getRandomInt(50, 200);
    }
    
    

    healthText.setText('Lives: ' + health);
    scoreText.setText('Score: ' + score);

    if (gameOver && cursors.up.isDown)
    {
        health = 5;
        gameOver = false;
        end_screen.visible = false;
        spawnTime = 1;
        score = 0;
        this.physics.resume();

        
    }
    
}


function spawnEnemy ()
{
    var enemy = enemies.create(700, getRandomInt(100, 525), 'bomb');
    enemy.setBounce(0);
    enemy.setCollideWorldBounds(true);
    enemy.setVelocity(-200, 0);
    enemy.body.AllowGravity = false;
}


function killEnemy (player, enemy)
{
    enemy.disableBody(true, true);
    score += 10;
}

function wipeEnemy (bg, enemy)
{
    if (gameOver == true)
    {
        enemy.disableBody(true, true);
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function compAttacked (comp, enemy)
{
    
    health -= 1;
    enemy.disableBody(true, true);
    if (health <= 0){
        this.physics.pause();
        
        gameOver = true;
        end_screen.visible = true;
        
    }

    
    
}
