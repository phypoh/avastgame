// Main game script
var config = {
    type: Phaser.AUTO,
    width: 1200,
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
var cone_size = 0;
var kill_enemy = false;             // Set to true only when an enemy is killed
var kill_enemy_player = false;      // Set to true only when an enemy is killed

var test_text;

var game = new Phaser.Game(config);

function preload ()
{

    // Download all visual effects and sprites
    this.load.image('background', 'assets/VFX/background.png');
    this.load.image('ground', 'assets/VFX/platform.png');
    this.load.image('end_screen', 'assets/VFX/end_screen.png');
    this.load.image('computer', 'assets/VFX/computer.png');

    this.load.spritesheet('player', 'assets/VFX/player/player.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('trojan', 'assets/VFX/trojan/trojan.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('phish', 'assets/VFX/phish/phish.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('adware', 'assets/VFX/adware/adware.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('botnet', 'assets/VFX/botnet/botnet.png', { frameWidth: 100, frameHeight: 100 });   // Trojan horse spritesheet
    this.load.spritesheet('ransom', 'assets/VFX/ransom/ransom.png', { frameWidth: 100, frameHeight: 100 });   // Ransomware spritesheet
    
    this.load.spritesheet('splat', 'assets/VFX/splat/splat.png', { frameWidth: 100, frameHeight: 100 });     // Virus death spritesheet
    this.load.spritesheet('playerhit', 'assets/VFX/playerhit/playerhit.png', { frameWidth: 300, frameHeight: 200 });
    this.load.spritesheet('playerhitjet', 'assets/VFX/playerhitjet/playerhitjet.png', { frameWidth: 300, frameHeight: 200 });
}

function create ()
{
    // Create background
    bg = this.physics.add.staticGroup();
    bg.create(600, 300, 'background').setScale(1.3).refreshBody();
    
    // Create ending screen
    end_screen = this.add.image(600, 300, 'end_screen');
    end_screen.visible = false;

    <!-- Create Platform -->
    // Note to self: to clean up
    platforms = this.physics.add.staticGroup();
    platforms.create(600, 600, 'ground').setScale(3).refreshBody();

    <!-- Create Player -->
    player = this.physics.add.sprite(220, 450, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    <!-- Create Computer -->
    //comp = this.physics.add.sprite(30, 525, 'end_screen');
    comp = this.physics.add.staticGroup();
    comp.create(70, 300, 'computer');

    <!-- Create Enemy -->
    enemies = this.physics.add.group({allowGravity: false});
    splats = this.physics.add.group({allowGravity: false});
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

    // Create sprites animation 
    this.anims.create({
        key: 'up',           
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'up_stall',           
        frames: [ { key: 'player', frame: 4 } ],
        frameRate: 10,
    });

    this.anims.create({
        key: 'move',           
        frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
    });



    this.anims.create({
        key: 'trojan_move',           
        frames: this.anims.generateFrameNumbers('trojan', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'ransom_move',           
        frames: this.anims.generateFrameNumbers('ransom', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'botnet_move',           
        frames: this.anims.generateFrameNumbers('botnet', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'adware_move',           
        frames: this.anims.generateFrameNumbers('adware', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'phish_move',           
        frames: this.anims.generateFrameNumbers('phish', { start: 0, end: 1 }),
        frameRate: 5,
        repeat: -1
    });

    this.anims.create({
        key: 'enemy_dead',           
        frames: this.anims.generateFrameNumbers('splat', { start: 0, end: 5 }),
        frameRate: 15,
    });

    this.anims.create({
        key: 'hammer_ground',           
        frames: this.anims.generateFrameNumbers('playerhit', { start: 0, end: 6 }),
        frameRate: 15,
    });

    this.anims.create({
        key: 'hammer_jet',           
        frames: this.anims.generateFrameNumbers('playerhitjet', { start: 0, end: 6 }),
        frameRate: 15,
    });
        //

}

function update ()
{
    // Enemy movement animation
    if (gameOver == false && kill_enemy == false)
            enemies.children.iterate(child => 
            {
                if (child.name == 'trojan')
                {
                    child.anims.play('trojan_move', true)
                }
                else if (child.name == 'ransom')
                {
                    child.anims.play('ransom_move', true)
                }
                else if (child.name == 'botnet')
                {
                    child.anims.play('botnet_move', true)
                }
                else if (child.name == 'adware')
                {
                    child.anims.play('adware_move', true)
                }
                else if (child.name == 'phish')
                {
                    child.anims.play('phish_move', true)
                }
            });




    <!-- Player Movement -->
    // Increase gravity by increasing score
    player.body.gravity.y = Math.min(1200, (player_speed_incre + 600));
    // Jump up
    if (kill_enemy_player == false)
        if (cursors.up.isDown) 
        {
            // Increase velocity with score
            player.setVelocityY(Math.max(-600, (-250 - player_speed_incre)));
            player.anims.play('up', true); 
        }
        else if (player.body.touching.down)
        {
            player.anims.play('move', true);
        }
        else
        {
            player.anims.play('up_stall', true);
        }

    // Calculate cone within which the n+1 enemy should spawn
    cone_size = Math.abs(counter * Math.max(-600, (-250 - player_speed_incre))/70);




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
    
    
    // Score and lives display
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
    enemy_type = getRandomInt(1, 4);
    
    if (enemy_type == 1)
    {
        var enemy = enemies.create(900, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(525, prev_enemy_height + cone_size)) , 'trojan');
        enemy.name = 'trojan';
    }
    else if (enemy_type == 2)
    {
        var enemy = enemies.create(900, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(525, prev_enemy_height + cone_size)) , 'ransom');
        enemy.name = 'ransom';
    }
    else if (enemy_type == 3)
    {
        var enemy = enemies.create(900, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(525, prev_enemy_height + cone_size)) , 'botnet');
        enemy.name = 'botnet';
    }
    else if (enemy_type == 4)
    {
        var enemy = enemies.create(900, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(525, prev_enemy_height + cone_size)) , 'adware');
        enemy.name = 'adware';
    }
    else if (enemy_type == 5)
    {
        var enemy = enemies.create(900, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(525, prev_enemy_height + cone_size)) , 'phish');
        enemy.name = 'phish';
    }
    prev_enemy_height = enemy.y;

    enemy.setBounce(0);
    enemy.setCollideWorldBounds(true);
    enemy.setVelocityX(Math.max(-400, (-200 - enemy_speed_incre)));
    enemy.body.AllowGravity = false;
    
}


function killEnemy (player, enemy)
{
    // enemy.disableBody(true, true);
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
    player_speed_incre = Math.floor(score / 10);
    test_text = enemy.name;


    kill_enemy = true;
	kill_enemy_player = true;
	enemy.setVelocity(0,0);
	player.setVelocity(0,0);

	if (player.y > 450 && kill_enemy_player)
	    player.anims.play('hammer_ground', true);
	else
		player.anims.play('hammer_jet', true);
	player.once('animationcomplete',() => {
		console.log('animationcomplete')


		kill_enemy_player = false;
		enemy.disableBody(true, true);


		var splat = splats.create(enemy.x, enemy.y, 'splat');
		splat.setBounce(0);
		splat.setCollideWorldBounds(true);
		splat.setVelocity(0, 0);
		splat.body.AllowGravity = false;

		splat.anims.play('enemy_dead', true);
		splat.once('animationcomplete',() => {
			console.log('animationcomplete')
			splat.disableBody(true, true);
			kill_enemy = false;
				
			//enemy.destroy()
		})
	})
}

function wipeEnemy (bg, enemy)
{
    if (gameOver == true)
    {
        enemy.disableBody(true, true);
    }
}

function getRandomInt(min, max) 
{
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
