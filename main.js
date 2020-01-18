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
var enemy_type = 0;

var test_text;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });

    this.load.image('bot0', 'assets/VFX/botnet0.png');
    this.load.image('ransom0', 'assets/VFX/ransom0.png');
    this.load.image('trojan0', 'assets/VFX/trojan0.png');
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
    //scoreText = this.add.text(16, 32, 'Score: '+ score, { fontSize: '32px', fill: '#000' });
    scoreText = this.add.text(16, 32, 'Score: '+ test_text, { fontSize: '32px', fill: '#000' });
    


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
    scoreText.setText('Score: ' + test_text);

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
    enemy_type = getRandomInt(1, 4);
    if (enemy_type == 1)
    {
        var enemy = enemies.create(700, getRandomInt(100, 525), 'bomb');
        enemy.name = 'bomb';
    }
    else if (enemy_type == 2)
    {
        var enemy = enemies.create(700, getRandomInt(100, 525), 'bot0').setScale(0.1, 0.1);
        enemy.name = 'bot';
    }
    else if (enemy_type == 3)
    {
        var enemy = enemies.create(700, getRandomInt(100, 525), 'ransom0').setScale(0.1, 0.1);
        enemy.name = 'ransom';
    }
    else if (enemy_type == 4)
    {
        var enemy = enemies.create(700, getRandomInt(100, 525), 'trojan0').setScale(0.1, 0.1);
        enemy.name = 'trojan';
    }
    enemy.setBounce(0);
    enemy.setCollideWorldBounds(true);
    enemy.setVelocity(-200, 0);
    enemy.body.AllowGravity = false;
    
}


function killEnemy (player, enemy)
{
    enemy.disableBody(true, true);
    if (enemy.name == 'bomb')
    {
        score += 1;
    }
    else
    {
        score += 10;
    }
    
    test_text = enemy.name;
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
