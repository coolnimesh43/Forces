;(function(){
	var game=new Phaser.Game(600,400,Phaser.AUTO);
	var totalScore=0;
	//start of game from home state
	var homeState={
		preload : function(){
			game.load.image('start','images/sunflower.jpg');
			game.load.audio('startTrack','audio/happy.mp3');
			game.load.image('startButton','images/start.png');
			game.load.image('howToButton','images/how-to.png');
			game.load.image('highScoreButton','images/highscore.png');
			game.load.image('cross','images/cross.png');
		},
		create : function(){
			this.bg=game.add.image(game.world.centerX, game.world.centerY,'start');
			this.bg.anchor.setTo(0.5);
			this.bg.scale.setTo(0.73,0.6);
			game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;

			var sound=game.add.audio('startTrack');
			sound.loop=true;
			sound.volume=1;
			sound.play();

			this.startButton=game.add.button(game.world.centerX-100,game.world.centerY-200,'startButton',this.startGame,this);
			this.startButton.inputEnabled=true;
			this.startButton.onInputOver.add(this.imageOver,this);
			this.startButton.onInputOut.add(this.imageOut,this);

			this.highScoreButton=game.add.button(game.world.centerX-170,game.world.centerY-80,'highScoreButton',this.showHighScore,this);
			this.highScoreButton.inputEnabled=true;
			this.highScoreButton.onInputOver.add(this.imageOver,this);
			this.highScoreButton.onInputOut.add(this.imageOut,this);

			this.howToPlayButton=game.add.button(game.world.centerX-200,game.world.centerY+40,'howToButton',this.showInstruction,this);
			this.howToPlayButton.inputEnabled=true;
			this.howToPlayButton.onInputOver.add(this.imageOver,this);
			this.howToPlayButton.onInputOut.add(this.imageOut,this);

			this.crossButton=game.add.button(game.world.width-100,20,'cross',this.exitGame,this);
			this.crossButton.inputEnabled=true;
			this.crossButton.onInputOver.add(this.imageOver,this);
			this.crossButton.onInputOut.add(this.imageOut,this);
		},
		update : function(){
		},
		startGame:function(){
			game.state.add('playState',playState);
			game.state.start('playState');
		},
		imageOver:function(button){
			button.scale.setTo(1.1);
		},
		imageOut:function(button){
			button.scale.setTo(1);
		},
		showHighScore:function(){
			console.log("show highscores");
		},
		showInstruction:function(){
			console.log("how to play");
		},
		exitGame:function(){
			game.destroy();
		}
	};
	game.state.add("homeState",homeState);
	game.state.start("homeState");


	//start of game play from playstate
	var playState={
		preload : function(){
			game.load.image('game-bg','images/game-bg-1.png');
			game.load.image('bee-1','images/bee-4.png');
			game.load.image('flower','images/flower.png');
			game.load.image('hornet','images/angry-hornet.png');
			game.load.image('bullet','images/bullet-4.png');
			game.load.image('power-1','images/power-1.png');
			game.load.audio('buzz','audio/bee.mp3');
			game.load.audio('wasp-buzz','audio/wasp.mp3');
		},
		create : function(){
			this.BEE_LAUNCH_INTERVAL=500;
			this.HORNET_LAUNCH_INTERVAL=600;
			this.BEE_LAUNCH_TIME=0;
			this.HORNET_LAUNCH_TIME=0;
			this.BEE_POPULATION=0;
			this.TOTAL_POWER=5;
			this.HORNET_POPULATION=0;
			this.HORNET_MOTION_UPDATE_INTERVAL=1500;
			this.NEXT_BULLET_INTERVAL=500;
			this.SHOOT_BULLET_TIME=0;
			this.score=0;
			this.BEE_POPULATION_LIMIT=10;
			this.HORNET_POPULATION_LIMIT=10;
			this.checkPowerCollision=false;
			this.checkBulletBeeCollision=true;
			this.bulletScale=0.1;
			this.bulletType=1;

			game.world.setBounds(0,0,game.world.width,game.world.height);
			game.physics.startSystem(Phaser.Physics.ARCADE);

  			this.bg=game.add.image(0,0,'game-bg');
  			this.bg.scale.setTo(0.75,0.55);


  			this.flower=game.add.sprite(game.world.centerX,game.world.centerY+180,'flower');
  			this.flower.scale.setTo(0.1);
  			this.flower.anchor.setTo(0.5,0.75);
  			game.physics.arcade.enable(this.flower);
  			this.flower.body.gravity.y=350;
  			this.flower.body.collideWorldBounds=true;

  			this.upKey=game.input.keyboard.addKey(Phaser.Keyboard.W);
			this.leftKey=game.input.keyboard.addKey(Phaser.Keyboard.A);
			this.rightKey=game.input.keyboard.addKey(Phaser.Keyboard.D);
			this.downKey=game.input.keyboard.addKey(Phaser.Keyboard.S);

  			//create bee group
  			this.beeGroup=game.add.group();
  			this.beeGroup.enableBody=true;
  			//create hornet group
  			this.hornetGroup=game.add.group();
  			this.hornetGroup.enableBody=true;

  			this.bulletGroup=game.add.group();
  			this.bulletGroup.enableBody=true;
  			this.bulletGroup.setAll('checkWorldBounds',true);
  			this.bulletGroup.setAll('outOfBoundsKill',true);

  			this.updateHornetGenerator=game.time.events.loop(Phaser.Timer.SECOND/4,this.updateHornetMotion,this);
  			this.updateHornetGenerator.timer.start();

  			this.gamePlayTime=game.time.events.loop(Phaser.Timer.SECOND*10,this.checkAndUpdateGamePlay,this);
			this.gamePlayTime.timer.start();
			game.time.reset();
		},
		render:function(){
			game.debug.text('Score: '+this.score ,50,20,'#7C0A02','24px digital');
			game.debug.text('Bullets: '+this.TOTAL_POWER ,200,20,'#7C0A02','24px digital');
			game.debug.text('Time: '+game.time.totalElapsedSeconds() ,350,20,'#7C0A02','24px digital');
		},
		jump:function(){
			this.flower.body.velocity.y=-100;
			this.flower.body.acceleration.y=-20;
		},
		update : function(){

			this.checkCollision();
			//move flower to left/right
			if(this.leftKey.isDown){
				this.flower.x-=10;
			}
			if(this.rightKey.isDown){
				this.flower.x+=10;
			}
			//jump 
			if(this.upKey.isDown){
				this.flower.body.velocity.y=-250;
			}
			//escalate
			if(this.downKey.isDown){
				this.flower.body.velocity.y=50;
				this.flower.y+=20;
			}

			if(game.input.activePointer.isDown){
				this.shootBullets();
			}

			if(game.time.now > this.BEE_LAUNCH_TIME+this.BEE_LAUNCH_INTERVAL && this.BEE_POPULATION <=this.BEE_POPULATION_LIMIT){
				this.launchBee();
				this.BEE_LAUNCH_TIME=game.time.now+this.BEE_LAUNCH_INTERVAL;
			}
			if(game.time.now > this.HORNET_LAUNCH_TIME+this.HORNET_LAUNCH_INTERVAL && this.HORNET_POPULATION <=this.HORNET_POPULATION_LIMIT){
				this.launchHornet();
				this.HORNET_LAUNCH_TIME=game.time.now+this.HORNET_LAUNCH_INTERVAL;
			}
			this.updateBeeMotion();
			this.updateHornetCircularMotion();
			this.checkLowerBound();

		},
		checkAndUpdateGamePlay:function(){
			if(game.time.totalElapsedSeconds() >=20){
				this.BEE_POPULATION_LIMIT+=3;
				this.HORNET_POPULATION_LIMIT+=3;
				if(!this.currentPower){
					this.addPower();
				}
				
			}
		},
		addPower:function(){
			this.currentPower=game.add.sprite(game.rnd.integerInRange(0,game.width),10,'power-1');
			game.physics.arcade.enable(this.currentPower);
			this.currentPower.scale.setTo(0.2);
			this.currentPower.body.velocity.x=game.rnd.integerInRange(-50,50);
			this.currentPower.body.gravity.y=40;
			this.checkPowerCollision=true;
			this.currentPower.collideWorldBounds=true;
		},
		checkLowerBound:function(){
			var kill=0;
			this.beeGroup.forEachAlive(function (bee){
				if(bee.y+bee.height>=game.height){
					kill++;
					bee.kill();
				}
			});
			this.BEE_POPULATION-=kill;
		},
		checkCollision:function(){
			game.physics.arcade.collide(this.hornetGroup);
			game.physics.arcade.collide(this.beeGroup);
			game.physics.arcade.collide(this.hornetGroup,this.beeGroup);
			game.physics.arcade.collide(this.hornetGroup,this.flower,this.deathHandler,null,this);
			game.physics.arcade.overlap(this.flower,this.beeGroup,this.updatePower,null,this);
			game.physics.arcade.overlap(this.bulletGroup,this.hornetGroup,this.hits,null,this);
			if(this.checkBulletBeeCollision){
				game.physics.arcade.overlap(this.bulletGroup,this.beeGroup,this.handleBeeDeath,null,this);
			}
			if(this.checkPowerCollision){
				game.physics.arcade.overlap(this.flower,this.currentPower,this.powerUp,null,this);
			}
		},
		powerUp:function(){
			if(this.bulletType==1){
				this.bulletScale*=3;
			}
			this.currentPower.kill();
			this.checkBulletBeeCollision=false;
			this.checkPowerCollision=false;
		},
		updateBeeMotion:function(){
			this.beeGroup.forEachAlive(function(bee){
				bee.period+=0.05;
				bee.body.velocity.x=Math.cos(bee.period)*100;
				bee.body.velocity.y=Math.sin(bee.period)*60;
			});
		},
		updateHornetCircularMotion:function(){
			this.hornetGroup.forEachAlive(function(hornet){
				hornet.period+=0.05;
				hornet.body.velocity.x=Math.cos(hornet.period)*100;
				hornet.body.velocity.y=Math.sin(hornet.period)*50;
			});
		},
		updateHornetMotion:function(){
			var flowerPoint=this.getFlowerPoint();
			this.hornetGroup.forEachAlive(function(hornet) {
				hornet.body.velocity.x=0;
				hornet.body.velocity.y=0;
				var angle=Phaser.Point.angle(flowerPoint,new Phaser.Point(hornet.x,hornet.y));
				hornet.body.velocity.x=500*Math.cos(angle);
				hornet.body.velocity.y=500*Math.sin(angle);
			});
		},
		deathHandler:function(flower,hornet){
			console.log(this.TOTAL_POWER);
			if(this.TOTAL_POWER<=0){
				totalScore=this.score;
				game.state.add('finishState',finishState);
				game.state.start('finishState');
			}
			else{
				this.TOTAL_POWER=0;
				this.HORNET_POPULATION-=1;
				this.bulletScale=0.1;
				this.checkBulletBeeCollision=true;
				hornet.kill();
			}
		},
		hits:function(bullet,hornet){
			this.score+=10;
			hornet.kill();
			this.HORNET_POPULATION-=1;
		},
		handleBeeDeath:function(bullet,bee){
			bee.kill();
			this.score-=5;
		},
		getMousePointerPoint:function(){
			var mousePoint=new Phaser.Point(game.input.mousePointer.x,game.input.mousePointer.y);
			return mousePoint;
		},
		getFlowerPoint:function(){
			var flowerPoint=new Phaser.Point(this.flower.x,this.flower.y);
			return flowerPoint;
		},
		getHornetPoint:function(hornet){
			var hornetPoint=new Phaser.Point(hornet.x,hornet.y);
			return hornetPoint;
		},
		getAngleForBullet:function(){
			return Phaser.Point.angle(this.getMousePointerPoint(),this.getFlowerPoint());
		},
		launchBee:function(){
			var bee=game.add.sprite(game.rnd.integerInRange(0,game.width),game.rnd.integerInRange(0,300),'bee-1');
			this.beeGroup.add(bee);
			this.BEE_POPULATION+=1;
			bee.scale.setTo(0.1);
			game.physics.arcade.enable(bee);
			bee.body.velocity.x=game.rnd.integerInRange(-150,150);
			bee.body.collideWorldBounds=true;
			bee.body.gravity.y=1500;
			bee.audio=game.add.audio('buzz');
		    bee.audio.loop=true;
		    bee.audio.volume=0.3;
			bee.period=0;
			bee.audio.play();
		},
		launchHornet:function(){
			var hornet=game.add.sprite(game.rnd.integerInRange(0,game.width),game.rnd.integerInRange(0,150),'hornet');
			this.hornetGroup.add(hornet);
			hornet.scale.setTo(0.5);
			game.physics.arcade.enable(hornet);
			hornet.body.velocity.x=game.rnd.integerInRange(-50,50);
			hornet.body.collideWorldBounds=true;
			hornet.body.bounce.setTo(0.5);
			hornet.scale.setTo(0.1);
			hornet.period=0;
			hornet.audio=game.add.audio('wasp-buzz');
			hornet.audio.loop=true;
			hornet.audio.volume=0.3;
			hornet.audio.play();
			this.HORNET_POPULATION+=1;
		},
		updatePower:function(flower,bee){
			this.TOTAL_POWER+=1;
			this.BEE_POPULATION-=1;
			this.score+=5;
			bee.kill();
		},
		shootBullets:function(){
			if(game.time.now>this.SHOOT_BULLET_TIME){
				if(this.TOTAL_POWER>0){
					var bullet=game.add.sprite(this.flower.x,this.flower.y,'bullet');
					this.bulletGroup.add(bullet);
					var angle=this.getAngleForBullet();
					bullet.angle=angle;
					bullet.body.velocity.x=800*Math.cos(angle);
					bullet.body.velocity.y=800*Math.sin(angle);
					bullet.scale.setTo(this.bulletScale);
					this.TOTAL_POWER-=1;
					this.SHOOT_BULLET_TIME=game.time.now+this.NEXT_BULLET_INTERVAL;
				}
			}
		}
	};
	var finishState={
		preload:function(){
			game.load.image('background','images/game-bg-2.jpg');
			game.load.image('play-again','images/play-again.png');
		},
		create:function(){
			this.bg=game.add.image(game.world.centerX,game.world.centerY,'background');
			this.bg.anchor.setTo(0.5);
			this.bg.scale.setTo(0.73,0.6);
			game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
			game.add.text(game.world.centerX-50,game.world.centerY-100,"Game Over",{fontSize:'32px',fill:'#FFFFCC',fontWeight:'bold'});
			game.add.text(game.world.centerX-100,game.world.centerY,"Your Score is "+totalScore,{fontSize:'32px',fill:'#FFFFCC',fontWeight:'bold'});
			this.playAgainButton=game.add.button(game.world.centerX-100,game.world.centerY+100,'play-again',this.startGame,this);
			this.playAgainButton.scale.setTo(0.75);
			this.playAgainButton.inputEnabled=true;
		},
		startGame:function(){
			game.state.add('playstate',playstate);
			game.state.start('playState');
		}
	}
})();
