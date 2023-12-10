//selecting elements
const canvas=document.querySelector('canvas');
const c=canvas.getContext('2d');
canvas.width=window.innerWidth;
canvas.height=window.innerHeight;
const scoreEl=document.querySelector("#scoreEl");
const triesEl=document.querySelector('#Tries');
const startGameBtn=document.querySelector("#startGameBtn");
const modalEl=document.querySelector('#modalEl');
const bigScoreEl=document.querySelector('#bigScoreEl');
//class definitions
class Player{
    constructor(x,y,radius,color,velocity)
    {
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
    }
    draw()
    {
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
    }
    
    
}
class Projectile extends Player
{
   constructor(x,y,radius,color,velocity)
   {
    super(x,y,radius,color,velocity);
   }
   update()
   {
    this.draw();
    this.x+=this.velocity.x;
    this.y+=this.velocity.y;
   }
}
class Enemy extends Projectile
{
    constructor(x,y,radius,color,velocity,state,speedCoefficient)
    {
        super(x,y,radius,color,velocity);
        this.state=state;
        this.speedCoefficient=speedCoefficient;
    }

    updateEnemy(velocity)
    {
        this.velocity=velocity;
        this.update();
    }
}
const friction=0.99;
class Particle extends Projectile
{
    constructor(x,y,radius,color,velocity)
    {
       super(x,y,radius,color,velocity);
        this.alpha=1;
    }
    draw()
    {c.save()
        c.globalAlpha=this.alpha;
        c.beginPath();
        c.arc(this.x,this.y,this.radius,0,Math.PI*2,false);
        c.fillStyle=this.color;
        c.fill();
        c.restore();
    }
    update()
    {
     this.draw();
     this.velocity.x*=friction;
     this.velocity.y*=friction;
     this.x+=this.velocity.x;
     this.y+=this.velocity.y;
     this.alpha-=.01;
    }
}
let mouse={
    x:undefined,
    y:undefined
}
addEventListener('mousemove',(event)=>
{
    mouse.x=event.clientX;
    mouse.y=event.clientY;
})
let player=new Player(canvas.width/2,canvas.height/2,19,'white',{x:0,y:0});
let projectiles=[],enemies=[],particles=[],tries=3;
triesEl.innerHTML=tries;
//functions
//function to restart the game
function init()
{
    player=new Player(canvas.width/2,canvas.height/2,19,'white',{x:0,y:0});
    projectiles=[];
    enemies=[];
    particles=[];
    score=0;
    scoreEl.innerHTML=score;
    tries=3;
    triesEl.innerHTML=tries;
    bigScoreEl.innerHTML=0;
}
// function to instantiate enemies randomly

function spawnEnemies()
{
    let x,y,radius,color,angle,velocity;
    setInterval(()=>{
        
        radius=Math.random()*(30-4)+4; 
        if(Math.random()<0.5)
        {
            x=Math.random()<0.5? -radius: canvas.width+radius;
            y=Math.random()*canvas.height;
        }
        else
        {
            x=Math.random()*canvas.width;
            y=Math.random()<0.5? -radius: canvas.height+radius;
        }
         angle=Math.atan2(player.y-y,player.x-x);
         velocity={
            x:Math.cos(angle)*1.5,
            y:Math.sin(angle)*1.5
        }
     
        if(Math.random()<0.8)
        {
            color=`rgb(${Math.random()*240},${Math.random()*240},${Math.random()*240})`;
        }
        else{
                       color='rgb(255,255,255)';
        }
        if(color==='rgb(255,255,255)') 
        {
            angle=0;
            velocity={
                x:Math.cos(angle)*3,
                y:Math.sin(angle)*3
            }
            enemies.push(new Enemy(x,y,radius,color,velocity,2,3));
        }
        
    else{
        enemies.push(new Enemy(x,y,radius,color,velocity,1,1.5));
    } 
   
    },2000);
 
    
}
function speedIncreasing()
{
    setInterval(()=>{
          for(let i=0;i<enemies.length;i++)
          {
            if(enemies[i].state==1)
            {
                enemies[i].speedCoefficient+=0.3;
            }
          }
    },4000)
}

let animationId,score=0,playerSpeed=3,initialSpeed=3;
//animation function

function animate()
{
    animationId= requestAnimationFrame(animate);
    c.fillStyle='rgba(0,0,0,0.8)';
    c.fillRect(0,0,canvas.width,canvas.height);
    
//update player animation

    addEventListener('keydown',(event)=>
{
    if(event.key=='ArrowUp')
    {
               player.velocity.y=-playerSpeed;
    }
    else if(event.key=='ArrowDown')
    {
        player.velocity.y=playerSpeed;
    }
    else if(event.key=='ArrowRight')
    {
        player.velocity.x=playerSpeed;
    }
    else if(event.key=='ArrowLeft')
    {
        player.velocity.x=-playerSpeed;
    }
})
addEventListener('keyUp',(event)=>
{
    if(event.key=='ArrowUp'||event.key=='ArrowDown')
    {
        player.velocity.y=0;
    }
    else if(event.key=='ArrowRight'||event.key=='Arrowleft')
    {
   player.velocity.x=0;
    }
})

player.x+=player.velocity.x;
player.y+=player.velocity.y;
player.draw();
/////////////////////////////
//update health animation

  
//update particles animation
    particles.forEach((particle,index)=>{
        if(particle.alpha<=0)
        {
            particles.splice(index,1);
        }
        else
        particle.update();
    })
    //update projectiles animation
    projectiles.forEach((projectile,projectileindex)=>{
        projectile.update();
        if(projectile.x+projectile.radius<0||projectile.x-projectile.radius>canvas.width||
            projectile.y+projectile.radius<0|| projectile.y-projectile.radius>canvas.height)
        {
            setTimeout(()=>{

                projectiles.splice(projectileindex,1);
            },0)
        }
    })



    //update enemies animation

    enemies.forEach((enemy,index)=>{
        //
        let angle=Math.atan2(player.y-enemy.y,player.x-enemy.x);
        
        let velocity={
            x:undefined,
            y:undefined
        }
        if(enemy.state==2)  angle=0;
         
        velocity={
            x:Math.cos(angle)*enemy.speedCoefficient,
            y:Math.sin(angle)*enemy.speedCoefficient
        } 
        
        enemy.updateEnemy(velocity);
        ///
        const dist= Math.hypot(player.x-enemy.x,player.y-enemy.y)
        //end game or health
        if(dist-player.radius-enemy.radius<1)
        {
            if(enemy.state==1)//bad enemy
            {
                
                if(tries!=0)
                {
  for(let i=0;i<15;i++)
                    {
                        particles.push(new Particle(player.x,player.y,Math.random()*2,player.color,{x:(Math.random()-0.5)*Math.random()*8,y:(Math.random()-0.5)*Math.random()*8}))
                    }
                    gsap.to(player,{
                        radius:player.radius-5
                 })
                    setTimeout(()=>{
                       
                        enemies.splice(index,1);
                    },0)
                    tries--;
                    triesEl.innerHTML=tries;
                    playSound("soundEffects/notification-positive-bleep-joshua-chivers-1-00-01.mp3");
                }
                  
                if(tries==0)
                {
                    playSound("soundEffects/notification-positive-bleep-joshua-chivers-1-00-01.mp3");
                    modalEl.style.display='flex';
                    bigScoreEl.innerHTML=scoreEl.innerHTML;
                      cancelAnimationFrame(animationId);
                }
            
            }
            else //good health
            {
                gsap.to(player,{
                    radius:player.radius+5
             })
             
                setTimeout(()=>{
                   
                    enemies.splice(index,1);
                },0)
                tries++;
                triesEl.innerHTML=tries;
              playSound("soundEffects/mixkit-space-coin-win-notification-271.wav")
            }
           
        }
        
        projectiles.forEach((projectile,projectileindex)=>{
           const dist= Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y);
           if(dist-projectile.radius-enemy.radius<1)
           {

            //create explosions
            for(let i=0;i<8;i++)
            {
                particles.push(new Particle(projectile.x,projectile.y,Math.random()*2,enemy.color,{x:(Math.random()-0.5)*Math.random()*8,y:(Math.random()-0.5)*Math.random()*8}))
            }
          
            if(enemy.state==1)
            {
                if(enemy.radius-10>10)
                {
                    //increase score
               score+=100;
               playerSpeed=Math.floor(score/1000)*.5+initialSpeed;
            
               scoreEl.innerHTML=score;

                    gsap.to(enemy,{
                           radius:enemy.radius-10
                    })
                    
                    setTimeout(()=>{
                        projectiles.splice(projectileindex,1);
                    },0)
                    
                }
                else
                {
                    //increase score
               score+=150;
               playerSpeed=Math.floor(score/1000)*.5+initialSpeed;
        
               scoreEl.innerHTML=score;
                    setTimeout(()=>{
                        enemies.splice(index,1);
                        projectiles.splice(projectileindex,1);
                    },0)
                }
            }
            else
            {
                tries++;
                gsap.to(player,{
                    radius:player.radius+5
             })
                setTimeout(()=>{
                    enemies.splice(index,1);
                    projectiles.splice(projectileindex,1);
                },0)
                triesEl.innerHTML=tries;
                playSound("soundEffects/mixkit-space-coin-win-notification-271.wav");
            }
            
           }
          
        })
    })
}

//event to create projectiles
addEventListener('click',(event)=>
{

    const angle=Math.atan2(event.clientY-player.y,event.clientX-player.x);
    const velocity={
        x:Math.cos(angle)*5,
        y:Math.sin(angle)*5
    }
 projectiles.push(new Projectile(player.x,player.y,5,'wheat',velocity));  
  playSound("soundEffects/mixkit-short-laser-gun-shot-1670.wav");
});

//event to start the game
startGameBtn.addEventListener('click',()=>
{
  init();
    animate();
    spawnEnemies();
    speedIncreasing()
    modalEl.style.display='none';
})

//sound effects
function playSound(audioName)
{
 let audio=new Audio(audioName);

 audio.play();
}
