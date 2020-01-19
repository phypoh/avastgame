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
var health = 1;
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
var spawn_counter = 0;
var restart_text = '';

var test_text;

var game = new Phaser.Game(config);

function preload ()
{

    // Download all visual effects and sprites
    this.load.image('background', 'assets/VFX/background1.png');
    
    this.load.image('ground', 'assets/VFX/platform.png');
    //this.load.image('end_screen', 'assets/VFX/end_screen.png');
    this.load.image('computer', 'assets/VFX/computer.png');
    this.load.spritesheet('player', 'assets/VFX/player/player.png', { frameWidth: 100, frameHeight: 100 });

    this.load.spritesheet('trojan', 'assets/VFX/trojan/trojan.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('phish', 'assets/VFX/phish/phish.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('adware', 'assets/VFX/adware/adware.png', { frameWidth: 100, frameHeight: 100 });
    this.load.spritesheet('botnet', 'assets/VFX/botnet/botnet.png', { frameWidth: 50, frameHeight: 50 });   // Trojan horse spritesheet
    this.load.spritesheet('ransom', 'assets/VFX/ransom/ransom.png', { frameWidth: 100, frameHeight: 100 }); 

    this.load.spritesheet('splat', 'assets/VFX/splat/splat150.png', { frameWidth: 150, frameHeight: 150 });     // Virus death spritesheet
    this.load.spritesheet('playerhit', 'assets/VFX/playerhit/playerhit.png', { frameWidth: 300, frameHeight: 200 });
    this.load.spritesheet('playerhitjet', 'assets/VFX/playerhitjet/playerhitjet.png', { frameWidth: 300, frameHeight: 200 });

    this.load.image('trojan_es', 'assets/VFX/end_screens/trojan_info.png');
    this.load.image('phish_es', 'assets/VFX/end_screens/phish_info.png');
    this.load.image('adware_es', 'assets/VFX/end_screens/adware_info.png');
    this.load.image('botnet_es', 'assets/VFX/end_screens/botnet_info.png');
    this.load.image('ransom_es', 'assets/VFX/end_screens/ransom_info.png');

    // Load SFX
    this.load.audio('bgm', 'assets/SFX/untitled_chaos.mp3');
    this.load.audio('end_screen_music', 'assets/SFX/end_screen.mp3');
    this.load.audio('jetpack', 'assets/SFX/aerosol+spray.wav');
    this.load.audio('hammer', 'assets/SFX/hammer.mp3');
    this.load.audio('trojan_sound', 'assets/SFX/Virus/trojan/horse_neigh.mp3');
}

function create ()
{
    // Create background
    
    bg = this.physics.add.staticGroup();
    bg.create(770, 300, 'background').setScale(1.5).refreshBody();

    this.background1 = this.add.tileSprite(600,300,1200,600, 'background')
    

    <!-- Create Platform -->
    // Note to self: to clean up
    platforms = this.physics.add.staticGroup();
    platforms.create(600, 600, 'ground').setScale(3).refreshBody();

    <!-- Create Player -->
    player = this.physics.add.sprite(250, 450, 'player');
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
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    //healthText = this.add.text(950, 8, 'Lives: '+ health, { fontSize: '32px', fill: '#FFF' });
    restartText = this.add.text(400, 500, restart_text, { fontSize: '32px', fill: '#FFF' });
    scoreText = this.add.text(950, 32, 'Score: '+ score, { fontSize: '32px', fill: '#FFF' });
    
    //var jump = this.sound.add('jump');

    // Create sprites animation 
    this.anims.create({
        key: 'up',           
        frames: this.anims.generateFrameNumbers('player', { start: 5, end: 6 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player_lose',           
        frames: [ { key: 'player', frame: 7 } ],
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
    
    // Create ending screen
    thresy = -50;
    trojan_es = this.add.image(500, 300+thresy, 'trojan_es');
    phish_es = this.add.image(500, 300+thresy, 'phish_es');
    adware_es = this.add.image(500, 300+thresy, 'adware_es');
    botnet_es = this.add.image(500, 300+thresy, 'botnet_es');
    ransom_es = this.add.image(500, 300+thresy, 'ransom_es');
    trojan_es.visible = false;
    phish_es.visible = false;
    adware_es.visible = false;
    botnet_es.visible = false;
    ransom_es.visible = false;

    // Load sounds
    trojan_sound = this.sound.add('trojan_sound');
    jetpack = this.sound.add('jetpack', {volume: 2});
    hammer = this.sound.add('hammer',{volume: 4})
    this.bgm = this.sound.add('bgm');
    //this.end_screen_music = this.sound.add('end_screen_music');
    var bgmConfig = {
        mute: false,
        volume: 2,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: true,
        delay: 0,
    }
    // var esmConfig = {
    //     mute: false,
    //     volume: 1,
    //     rate: 1,
    //     detune: 0,
    //     seek: 0,
    //     loop: false,
    //     delay: 0,
    // }
    this.bgm.play(bgmConfig);


}

function update ()
{
    this.background1.tilePositionX += 1;


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
            if (Phaser.Input.Keyboard.JustDown(this.up))
            {
                jetpack.play();
            }
        }
        else if (player.body.touching.down)
        {
            player.anims.play('move', true);
            jetpack.stop();
        }
        else
        {
            player.anims.play('up_stall', true);
            jetpack.stop();
        }

        
    if (gameOver == true)
    {    
        player.anims.play('player_lose',true);
    }
    // Calculate cone within which the n+1 enemy should spawn
    cone_size = Math.abs(counter * Math.max(-600, (-250 - player_speed_incre))/70);




    <!-- Random Enemy Spawn -->
    counter = counter + 1;
    if (counter >= spawnTime && !gameOver)
    {
        spawn_counter ++;
        score = (spawn_counter + health - 1) * 10;
        spawnEnemy(counter, prev_enemy_height);
        if (350 <= score % 500 && score % 500 <= 490)
        {
            spawnTime = getRandomInt(35, Math.max(40, 70 - spawnrate_incre));
        }
        else
        {
            spawnTime = getRandomInt(60, Math.max(70, 200 - spawnrate_incre));
        }
        counter = 0;

    }
    
    
    // Score and lives display
    scoreText.setText('Score: ' + score);
    restartText.setText(restart_text);

    if (gameOver && Phaser.Input.Keyboard.JustDown(this.spacebar))
    {
        health = 1;
        restart_text = '';
        gameOver = false;
        end_screen.visible = false;
        spawnTime = 1;
        score = 0;
        spawn_counter = 0;
        this.physics.resume();
        comp.children.iterate(child => 
            { child.clearTint()
            })
    }
    
}


function spawnEnemy ()
{
    enemy_type = getRandomInt(1, 5);

    spawn_dist = 1150;
    if (enemy_type == 1)
    {

        var enemy = enemies.create(spawn_dist, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(500, prev_enemy_height + cone_size)) , 'trojan');
        enemy.name = 'trojan';

        
    }
    else if (enemy_type == 2)
    {
        var enemy = enemies.create(spawn_dist, 505 , 'ransom');
        enemy.name = 'ransom';
    }
    else if (enemy_type == 3)
    {
        var enemy = enemies.create(spawn_dist, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(300, prev_enemy_height + cone_size)) , 'botnet');
        enemy.name = 'botnet';
    }
    else if (enemy_type == 4)
    {
        var enemy = enemies.create(spawn_dist, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(400, prev_enemy_height + cone_size)) , 'adware');
        enemy.name = 'adware';
    }
    else if (enemy_type == 5)
    {
        var enemy = enemies.create(spawn_dist, getRandomInt(Math.max(100, prev_enemy_height - cone_size), 
            Math.min(500, prev_enemy_height + cone_size)) , 'phish');
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
        kill_enemy = false;
        
        jetpack.stop();
        hammer.play();

		var splat = splats.create(enemy.x, enemy.y, 'splat');
		splat.setBounce(0);
		splat.setCollideWorldBounds(true);
		splat.setVelocity(0, 0);
		splat.body.AllowGravity = false;

		splat.anims.play('enemy_dead', true);
		splat.once('animationcomplete',() => {
			console.log('animationcomplete')
			splat.disableBody(true, true);
			
				
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
    
    comp.setTint(0xff0000);

    if (health <= 0){
        restart_text = 'Press [SPACE] to restart.';
        this.physics.pause();       

        gameOver = true;
        if (enemy.name == 'trojan')
        {
            end_screen = trojan_es;
        }
        else if (enemy.name == 'adware')
        {
            end_screen = adware_es;
        }
        else if (enemy.name == 'ransom')
        {
            end_screen = ransom_es;
        }
        else if (enemy.name == 'botnet')
        {
            end_screen = botnet_es;
        }
        else if (enemy.name == 'phish')
        {
            end_screen = phish_es;
        }
        end_screen.visible = true;

        
    }

    
    
}
