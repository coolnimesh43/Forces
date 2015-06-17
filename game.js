;(function(){
	var game=new Phaser.Game(1380,630,Phaser.AUTO);
	var playState={
		preload : function(){
			game.load.image('game-bg','images/game-bg-1.png');
			game.load.image('bee-1','images/bee-4.png');
			game.load.image('flower','images/flower.png');
			game.load.audio('buzz','audio/bee.mp3');
		},
		create : function(){
			this.BEE_LAUNCH_INTERVAL=500;
			this.ENEMY_LAUNCH_INTERVAL=500;
			this.LAUNCH_TIME=0;
			this.BEE_POPULATION=0;
			this.TOTAL_POWER=0;

			game.world.setBounds(0,0,game.world.width,game.world.height);
			game.physics.startSystem(Phaser.Physics.ARCADE);

  			this.bg=game.add.image(0,0,'game-bg');
  			this.bg.scale.setTo(0.75,0.55);

  			this.flower=game.add.sprite(game.world.centerX,game.world.centerY+180,'flower');
  			this.flower.scale.setTo(0.15);
  			game.physics.arcade.enable(this.flower);
  			this.flower.body.gravity.y=350;
  			this.flower.body.collideWorldBounds=true;

  			this.cursorKeys= game.input.keyboard.createCursorKeys();

  			this.beeGroup=game.add.group();
  			this.beeGroup.enableBody=true;
  			this.enemyGroup=game.add.group();
		},
		jump:function(){
			this.flower.body.velocity.y=-100;
			this.flower.body.acceleration.y=-20;
		},
		update : function(){

			//move flower to left/right
			if(this.cursorKeys.left.isDown){
				this.flower.x-=10;
			}
			if(this.cursorKeys.right.isDown){
				this.flower.x+=10;
			}
			//jump 
			if(this.cursorKeys.up.isDown){
				this.flower.body.velocity.y=-250;
			}
			//escalate
			if(this.cursorKeys.down.isDown){
				this.flower.body.velocity.y=50;
				this.flower.y+=20;
			}

			if(game.time.now > this.LAUNCH_TIME+this.BEE_LAUNCH_INTERVAL && this.BEE_POPULATION<=10){
				this.launchBee();
				this.LAUNCH_TIME=game.time.now+this.BEE_LAUNCH_INTERVAL;
			}
			this.updateBeeMotion();
			this.checkLowerBound();
			this.checkCollision();
		},
		checkLowerBound:function(){
			this.beeGroup.forEachAlive(function (bee){
				if(bee.y+bee.height>=game.height){
					bee.kill();
					this.BEE_POPULATION-=1;
				}
			});
		},
		checkCollision:function(){
			game.physics.arcade.overlap(this.flower,this.beeGroup,this.updatePower,null,this);
		},
		updateBeeMotion:function(){
			this.beeGroup.forEachAlive(function(bee){
				bee.period+=0.05;
				bee.body.velocity.x=Math.cos(bee.period)*100;
				bee.body.velocity.y=Math.sin(bee.period)*60;
			});
		},
		launchBee:function(){
			this.bee=game.add.sprite(game.rnd.integerInRange(0,game.width),game.rnd.integerInRange(0,150),'bee-1');
			this.beeGroup.add(this.bee);
			this.BEE_POPULATION+=1;
			this.bee.scale.setTo(0.1);
			this.bee.body.velocity.x=game.rnd.integerInRange(-150,150);
			this.bee.body.collideWorldBounds=true;
			this.bee.body.gravity.y=1000;
			this.bee.audio=game.add.audio('buzz');
			this.bee.audio.loop=true;
			this.bee.period=0;
			// this.bee.audio.play();
		},
		updatePower:function(flower,bee){
			this.TOTAL_POWER+=1;
			this.BEE_POPULATION-=1;
			bee.kill();
		},
		shootBullets:function(){
			if(game.time.now>this.fireTime){
				var bullet=this.bullets.getFirstExists(false);
				if(bullet){
					// var bulletOffSetX=this.spaceShip.width/2*Math.cos(this.spaceShip.angle);
					// var bulletoffSetY=this.spaceShip.height/2*Math.sin(this.spaceShip.angle);
					// console.log(shipAngle,bulletOffSetX,bulletoffSetY);
					var mouseX = Math.round(game.input.activePointer.screenX)
	      			var mouseY= Math.round(game.input.activePointer.screenY);
	      			// console.log(mouseX,mouseY);
	      			// console.log(this.spaceShip.x,this.spaceShip.y)
	      			var mousePoint=new Phaser.Point(mouseX,mouseY);
	      			var mouseShipAngle=Phaser.Point.angle(mousePoint,this.getShipPoint());
	      			// console.log(mousePoint,shipPoint);
	      			// console.log("angle is "+this.getShipPoint());
					bullet.scale.setTo(0.1);
					// bullet.reset(this.spaceShip.x+bulletOffSetX,this.spaceShip.y+bulletoffSetY);
					bullet.reset(this.spaceShip.x,this.spaceShip.y);
					bullet.angle=this.spaceShip.angle+90;
					// bullet.rotation=this.spaceShip.rotation;
					// bullet.body.velocity.x = Math.cos(bullet.angle) * this.bulletSpeed;
    	// 			bullet.body.velocity.y = Math.sin(bullet.angle) * this.bulletSpeed;
					// bullet.body.velocity.y=this.spaceShip.body.velocity.y*fireDirection;
					bullet.body.velocity.x=this.bulletSpeed*Math.cos(mouseShipAngle);
					bullet.body.velocity.y=this.bulletSpeed*Math.sin(mouseShipAngle);
					// game.physics.arcade.velocityFromRotation(this.spaceShip.rotation, 400);
					this.fireTime=game.time.now+this.fireSpacing;
					// console.log(bullet.angle+90,game.math.radToDeg(this.spaceShip.body.rotation));
				}
			}
		},
	};
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
			// sound.play();

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
		},
	};
	game.state.add("homeState",homeState);
	game.state.start("homeState");
})();