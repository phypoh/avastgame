// Main game script
var config = {
    type: Phaser.AUTO,
    width: 1000,
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
var health = 500;
var healthText;
var counter = 0;
var spawnTime = 100;
var gameOver = false;
var score = 0;
var scoreText;
var enemy_type = 0;
var spawnrate_incre = 0;
var enemy_speed_incre = 0;
var player_speed_incre = 0;
var prev_enemy_height = 300;

var test_text;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('sky', 'assets/VFX/black_bg.jpg');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });

    this.load.image('bot0', 'assets/VFX/botnet0.png');
    this.load.image('ransom0', 'assets/VFX/ransom0.png');
    this.load.image('trojan0', 'assets/VFX/trojan0.png');

    //this.load.audio('jump', 'assets/SFX/Jump/jump.mp3');
}

function create ()
{
    bg = this.physics.add.staticGroup();
    bg.create(500, 300, 'sky');
    
    end_screen = this.add.image(500, 300, 'star');
    end_screen.visible = false;

    <!-- Create Platform -->
    // Note to self: to clean up
    platforms = this.physics.add.staticGroup();
    platforms.create(500, 568, 'ground').setScale(2.5).refreshBody();

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
    healthText = this.add.text(16, 8, 'Lives: '+ health, { fontSize: '32px', fill: '#FFF' });
    //scoreText = this.add.text(16, 32, 'Score: '+ score, { fontSize: '32px', fill: '#000' });
    scoreText = this.add.text(16, 32, 'Score: '+ score, { fontSize: '32px', fill: '#FFF' });
    
    //var jump = this.sound.add('jump');

}

function update ()
{
    <!-- Player Movement -->

        player.body.gravity.y = Math.min(1200, (player_speed_incre/5 + 800));
    

    if (cursors.up.isDown) //player.body.touching.down
    {
        player.setVelocityY(Math.max(-600, (-250 - player_speed_incre/5)));
        //jump.play();
    }


    <!-- Random Enemy Spawn -->
    counter = counter + 1;
    if (counter >= spawnTime && !gameOver)
    {
        
        spawnEnemy(counter, prev_enemy_height);
        if (350 <= score % 500 && score % 500 <= 490)
        {
            spawnTime = getRandomInt(20, Math.max(30, 60 - spawnrate_incre));
        }
        else
        {
            spawnTime = getRandomInt(60, Math.max(70, 200 - spawnrate_incre));
        }
        counter = 0;
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


function spawnEnemy (counter, prev_enemy_height)
{
    enemy_type = getRandomInt(1, 4);
    if (enemy_type == 1)
    {
        var enemy = enemies.create(900, getRandomInt(100, 525), 'bomb');
        enemy.name = 'bomb';
    }
    else if (enemy_type == 2)
    {
        var enemy = enemies.create(900, getRandomInt(100, 525), 'bot0').setScale(0.15, 0.15);
        enemy.name = 'bot';
    }
    else if (enemy_type == 3)
    {
        var enemy = enemies.create(900, getRandomInt(100, 525), 'ransom0').setScale(0.1, 0.1);
        enemy.name = 'ransom';
    }
    else if (enemy_type == 4)
    {
        var enemy = enemies.create(900, getRandomInt(100, 525), 'trojan0').setScale(0.1, 0.1);
        enemy.name = 'trojan';
    }
    prev_enemy_height = enemy.y;
    enemy.setBounce(0);
    enemy.setCollideWorldBounds(true);
    enemy.setVelocityX(Math.max(-400, (-200 - enemy_speed_incre)));
    enemy.body.AllowGravity = false;
    
}


function killEnemy (player, enemy)
{
    enemy.disableBody(true, true);
    if (enemy.name == 'bomb')
    {
        score += 10;
    }
    else
    {
        score += 10;
    }
    enemy_speed_incre = Math.floor(score * 2);
    spawnrate_incre = Math.floor(score / 1);
    player_speed_incre = Math.floor(score * 2);
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
