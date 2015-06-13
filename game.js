;(function(){
	var game=new Phaser.Game("100","100",Phaser.AUTO);
	var playState={
		preload : function(){
			game.load.image('space','images/space.jpg');
			game.load.image('red-dot','images/red-dot.png');
			game.load.image('blue-dot','images/blue-dot.png');
			game.load.image('dark-blue-dot','images/dark-blue-dot.png');	
			game.load.image('green-dot','images/green-dot.png');	
			game.load.image('pointer','images/pointer.png');
			game.load.image('fireblob','images/fireblob.png');
		},
		create : function(){
			this.formerMouse=-1; // Phaser.Mouse.NO_BUTTON

			game.world.setBounds(0,0,game.world.width,game.world.height);
			game.physics.startSystem(Phaser.Physics.P2JS);
			game.physics.p2.setImpactEvents(true);
  			game.physics.p2.gravity.y = 0;
  			game.physics.p2.restitution = 0.8;
  			this.particleCollisionGroup=game.physics.p2.createCollisionGroup();
  			this.pointerCG=game.physics.p2.createCollisionGroup();
  			game.physics.p2.updateBoundsCollisionGroup();

  			this.bg=game.add.image(0,0,'space');

  			this.pointer=game.add.sprite(game.world.centerX,game.world.centerY,'pointer');
  			game.physics.p2.enable(this.pointer,false);
  			this.pointer.scale.setTo(0.5);

			this.particleGroup=game.add.group(game,null,"particleGroup",true,true,Phaser.Physics.P2JS);
			
			this.particleGroup.createMultiple(10,'dark-blue-dot');
			this.particleGroup.setAll('checkWorldBounds',true);
			// this.particleGroup.setAll('outOfBoundsKill',true);
			this.pointer.body.setCollisionGroup(this.pointerCG);
  			// this.pointer.body.collides(this.particleCollisionGroup,this.particlePointCollisionHandler,this);


  			this.emitter = game.add.emitter(this.pointer.x,this.pointer.y, 9000);
 			this.emitter.makeParticles('fireblob');
 			this.pointer.addChild(this.emitter);
 			this.emitter.setAlpha(0.7,0.7);
 			this.emitter.y = 0;
  			this.emitter.x = 0;
  			this.emitter.lifespan = 500;

  			// this.halo=Phaser.Circle(this.pointer.x,this.pointer.y,50);

  			this.collectedParticles=game.add.group();
  			this.collectedParticles.enableBody=true;
  			game.physics.p2.enable(this.collectedParticles,false);
  			
			this.createParticles();
		},
		update : function(){
			if(game.physics.arcade.distanceToPointer(this.pointer, game.input.activePointer) > 30){
				game.physics.arcade.moveToPointer(this.pointer,2500);
			}
			else{
				this.pointer.body.velocity.x=0;
				this.pointer.body.velocity.y=0;
			}
			if(game.input.mouse.button!=-1 && game.input.mouse.button==0){
				//Phaser.Mouse.LEFT_CLICK
				this.emitter.emitParticle();
			}
			if(game.input.mouse.button!=-1 && game.input.mouse.button==2){
				//Phaser.Mouse.RIGHT_CLICK
			}
			if(game.input.mouse.button!=-1 && game.input.mouse.button==1){
				//Phaser.Mouse.MIDDLE_CLICK
				this.collectParticles();
			}
			// game.physics.
		},
		collectParticles:function(){	
			var mousePoint=new Phaser.Point(this.pointer.x,this.pointer.y);

			for(var i=0;i<10;i++){
				var singleParticle=this.particleGroup.getAt(game.rnd.integerInRange(0,this.particleGroup.length-1));
				if(singleParticle){
					var particlePoint=new Phaser.Point(singleParticle.x,singleParticle.y);
					var angle=Phaser.Point.angle(mousePoint,particlePoint);
					singleParticle.angle=angle;
					// singleParticle.body.angularVelocity=25;
					console.log(Math.cos(angle),Math.sin(angle));
					singleParticle.body.velocity.x=2*singleParticle.body.velocity.x * Math.cos(angle);
					singleParticle.body.velocity.y=2*singleParticle.body.velocity.y * Math.sin(angle);
					// console.log(singleParticle.body.velocity.x,singleParticle.body.velocity.y,angle);
					// singleParticle.body.acceleration.x=100*Math.cos(angle);
					// singleParticle.body.acceleration.y=100*Math.sin(angle);
				}
			}
		},
		particlePointCollisionHandler:function(pointer,particle){
				// this.collectedParticles.add(particle);
				// this.particleGroup.remove(particle);
				// console.log(this.collectedParticles.length);
		},
		render:function(){
			// game.debug.cameraInfo(game.camera, 500, 32);
   // 			game.debug.spriteCoords(this.spaceShip, 32, 32);
   			// game.debug.geom(this.halo,#fff,true);
		},
		createParticles:function(){

			for(var i=0;i<this.particleGroup.length;i++){
				var singleParticle=this.particleGroup.getFirstExists(false);
				if(singleParticle){
					// singleParticle.scale.setTo(0.5);
					singleParticle.reset(game.rnd.integerInRange(0,game.width),game.rnd.integerInRange(0,game.height));
					game.physics.p2.enable(singleParticle, false);
					singleParticle.body.velocity.x=game.rnd.integerInRange(-5,5);
					singleParticle.body.velocity.y=game.rnd.integerInRange(-5,5);
					// singleParticle.body.bounce.setTo(1);
					// singleParticle.physicsBodyType=Phaser.Physics.P2JS;
					singleParticle.body.collideWorldBounds=true;
					// singleParticle.body.collides(enemyGroup,dieEnemy,this);
					singleParticle.body.setCollisionGroup(this.particleCollisionGroup);	
					singleParticle.body.collides(this.particleCollisionGroup);
					singleParticle.body.collides(this.pointerCG,this.particlePointCollisionHandler(),singleParticle);
				}
			}
		},
		rotate:function(){
			this.spaceShip.body.rotation = game.physics.arcade.angleToPointer(this.spaceShip)+Math.PI/2;
		},
		launchEnemy:function(){
			var enemy=this.aliens.getFirstExists(false);
			if(enemy){
				enemy.scale.setTo(0.05);
				enemy.reset(game.rnd.integerInRange(0,game.width),game.rnd.integerInRange(0,game.height));
				enemy.angle=this.spaceShip.angle;
				var enemyPoint=new Phaser.Point(enemy.x,enemy.y);
				var enemyShipAngle=Phaser.Point.angle(enemyPoint,this.getShipPoint());
				enemy.body.velocity.x=-this.ENEMY_SPEED*Math.cos(enemyShipAngle);
				enemy.body.velocity.y=-this.ENEMY_SPEED*Math.sin(enemyShipAngle);
			}
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
		updateEnemyShip:function(){
				this.aliens.forEachAlive(function(enemy){
				var enemyPoint=new Phaser.Point(enemy.x,enemy.y);
				var enemyShipAngle=Phaser.Point.angle(enemyPoint,this.getShipPoint());
				enemy.angle=enemyShipAngle;
				enemy.body.velocity.x=-this.ENEMY_SPEED*Math.cos(enemyShipAngle);
				enemy.body.velocity.y=-this.ENEMY_SPEED*Math.sin(enemyShipAngle);
			},this);
		},
		getShipPoint:function(){
  			var shipPoint=new Phaser.Point(this.spaceShip.x,this.spaceShip.y);
  			return shipPoint;
		},

	};
	var homeState={
		preload : function(){
			game.load.image('start','images/space.jpg');
			game.load.image('gameTitle','images/game_title.png')
			game.load.image('spaceCraft','images/blue_craft.png')
		},
		create : function(){
			// game.stage.backgroundColor='#cccccc';
			this.bg=game.add.image(game.world.centerX, game.world.centerY,'start');
			this.bg.anchor.setTo(0.5);
			game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
			this.gameTitle=game.add.image(game.world.centerX-550,game.world.centerY-200,'gameTitle')
			var playBtn=game.add.image(game.world.centerX,game.world.centerY,'spaceCraft');
			playBtn.scale.setTo(0.5)
			playBtn.anchor.setTo(0.5,0.2);
			playBtn.inputEnabled=true;
			playBtn.input.useHandCursor=true;
			var playText=game.add.text(-140,350,"Click here to play",{font:"40px Arial",fill:"#8e99d8"})
			playBtn.addChild(playText)
			playBtn.events.onInputDown.add(function(){
				game.state.add('playState',playState);
				game.state.start('playState');
			},this);
		},
		update : function(){
		},

	};
	game.state.add("playState",playState);
	game.state.start("playState");
})();