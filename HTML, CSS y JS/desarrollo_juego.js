// SELECT CVS
const cvs = document.getElementById("personaje");
const ctx = cvs.getContext("2d");

// constante y variables del juego
let frames = 0;
const grado = Math.PI/180;

// cargar imagen
const fondo = new Image();
fondo.src = "img/Fondo_1.png";

// cragar sonido
const Puntos = new Audio();
Puntos.src = "audio/puntos.wav";

const Aleteo = new Audio();
Aleteo.src = "audio/aleteo.wav";

const Golpe = new Audio();
Golpe.src = "audio/golpe.wav";

const Aire = new Audio();
Aire.src = "audio/aire.wav";

const Muere = new Audio();
Muere.src = "audio/muere.wav";

// estado del juego
const estado = {
    current : 0,
    getReady : 0,
    game : 1,
    over : 2
}

// coordenadas del boton empezar
const empezar_boton = {
    x : 120,
    y : 263,
    w : 83,
    h : 29
}

// CONTROL del juego
cvs.addEventListener("click", function(evt){
    switch(estado.current){
        case estado.getReady:
            estado.current = estado.game;
            Aire.play();
            break;
        case estado.game:
            if(personaje.y - personaje.radio <= 0) return;
            personaje.flap();
            Aleteo.play();
            break;
        case estado.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;
            
            // chequear si presionamos el boton empezar
            if(clickX >= empezar_boton.x && clickX <= empezar_boton.x + empezar_boton.w && clickY >= empezar_boton.y && clickY <= empezar_boton.y + empezar_boton.h){
                tubos.reset();
                personaje.velocidadReset();
                puntaje.reset();
                estado.current = estado.getReady;
            }
            break;
    }
});

document.addEventListener("keyup", function(evt){   
    if(evt.code == "Space"){
        switch(estado.current){
        case estado.getReady:
            estado.current = estado.game;
            Aire.play();
            break;
        case estado.game:
            if(personaje.y - personaje.radio <= 0) return;
            personaje.flap();
            Aleteo.play();
            break;
        case estado.over:
            tubos.reset();
            personaje.velocidadReset();
            puntaje.reset();
            estado.current = estado.getReady;
            break;
    }
    }

});

// fondo
const bg = {
    sX : 0,
    sY : 0,
    w : 274,
    h : 226,
    x : 0,
    y : cvs.height - 226,
    
    dibujar : function(){
        ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }
    
}

// suelo
const suelo = {
    sX: 276,
    sY: 0,
    w: 220,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    
    dx : 2,
    
    dibujar : function(){
        ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        
        ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    
    actualizar: function(){
        if(estado.current == estado.game){
            this.x = (this.x - this.dx)%(this.w/2);
        }
    }
}

// personaje
const personaje = {
    animation : [
        {sX: 276, sY : 112},
        {sX: 276, sY : 139},
        {sX: 276, sY : 164},
        {sX: 276, sY : 139}
    ],
    x : 50,
    y : 150,
    w : 34,
    h : 26,
    
    radio : 12,
    
    frame : 0,
    
    gravedad : 0.25,
    saltar : 4.6,
    velocidad : 0,
    rotacion : 0,
    
    dibujar : function(){
        let personaje = this.animation[this.frame];
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotacion);
        ctx.drawImage(fondo, personaje.sX, personaje.sY, this.w, this.h,- this.w/2, - this.h/2, this.w, this.h);
        
        ctx.restore();
    },
    
    flap : function(){
        this.velocidad = - this.saltar;
    },
    
    actualizar: function(){
        // si el estado del juego es GET READY, el personaje "flap" de forma lenta
        this.period = estado.current == estado.getReady ? 10 : 5;
        // incrementamos FRAME con 1, cada periodo
        this.frame += frames%this.period == 0 ? 1 : 0;
        // FRAME va desde 0 hasta 4, despues de vuelta a 0
        this.frame = this.frame%this.animation.length;
        
        if(estado.current == estado.getReady){
            this.y = 150; // se resetea la posicion del personaje despues del GAME OVER
            this.rotacion = 0 * grado;
        }else{
            this.velocidad += this.gravedad;
            this.y += this.velocidad;
            
            if(this.y + this.h/2 >= cvs.height - suelo.h){
                this.y = cvs.height - suelo.h - this.h/2;
                if(estado.current == estado.game){
                    estado.current = estado.over;
                    Muere.play();
                }
            }
            
            // si la velocidad es mayor al saltar significa que el personaje se cae
            if(this.velocidad >= this.saltar){
                this.rotacion = 90 * grado;
                this.frame = 1;
            }else{
                this.rotacion = -25 * grado;
            }
        }
        
    },
    velocidadReset : function(){
        this.velocidad = 0;
    }
}

// GET READY mensaje
const getReady = {
    sX : 0,
    sY : 228,
    w : 172,
    h : 152,
    x : cvs.width/2 - 173/2,
    y : 80,
    
    dibujar: function(){
        if(estado.current == estado.getReady){
            ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
    
}

// GAME OVER mensaje
const gameOver = {
    sX : 175,
    sY : 228,
    w : 225,
    h : 202,
    x : cvs.width/2 - 225/2,
    y : 90,
    
    dibujar: function(){
        if(estado.current == estado.over){
            ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);   
        }
    }
    
}

// tubos
const tubos = {
    position : [],
    
    top : {
        sX : 553,
        sY : 0
    },
    bottom:{
        sX : 502,
        sY : 0
    },
    
    w : 53,
    h : 400,
    gap : 85,
    maxYPos : -150,
    dx : 2,
    
    dibujar : function(){
        for(let i  = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;
            
            // tubo superior
            ctx.drawImage(fondo, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);  
            
            // tubo inferior
            ctx.drawImage(fondo, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);  
        }
    },
    
    actualizar: function(){

        
        if(estado.current !== estado.game) return;
        
        if(frames%100 == 0){
            this.position.push({
                x : cvs.width,
                y : this.maxYPos * ( Math.random() + 1)
            });
        }
        for(let i = 0; i < this.position.length; i++){
            let p = this.position[i];
            
            let bottomPipeYPos = p.y + this.h + this.gap;
            
            // detector de colision
            // tubo superior
            if(personaje.x + personaje.radio > p.x && personaje.x - personaje.radio < p.x + this.w && personaje.y + personaje.radio > p.y && personaje.y - personaje.radio < p.y + this.h){
                estado.current = estado.over;
                Golpe.play();
            }
            // tubo inferior
            if(personaje.x + personaje.radio > p.x && personaje.x - personaje.radio < p.x + this.w && personaje.y + personaje.radio > bottomPipeYPos && personaje.y - personaje.radio < bottomPipeYPos + this.h){
                estado.current = estado.over;
                Golpe.play();
            }
            
            // mover los tubos a la izquierda
            p.x -= this.dx;
            
            // si los tubos se van fuera del canvas, se borran
            if(p.x + this.w <= 0){
                this.position.shift();
                puntaje.value += 1;
                Puntos.play();
                puntaje.best = Math.max(puntaje.value, puntaje.best);
                localStorage.setItem("best", puntaje.best);
            }
        }
    },
    
    reset : function(){
        this.position = [];
    }
    
}

// puntaje
const puntaje= {
    best : parseInt(localStorage.getItem("best")) || 0,
    value : 0,
    
    dibujar : function(){
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        
        if(estado.current == estado.game){
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width/2, 50);
            ctx.strokeText(this.value, cvs.width/2, 50);
            
        }else if(estado.current == estado.over){
            //valor del puntaje 
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST puntaje
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    
    reset : function(){
        this.value = 0;
    }
}

// funcion de dibujar
function dibujar(){
    ctx.fillStyle = "#6C8BBC";//"#CFCDF3";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    
    bg.dibujar();
    tubos.dibujar();
    suelo.dibujar();
    personaje.dibujar();
    getReady.dibujar();
    gameOver.dibujar();
    puntaje.dibujar();
}

// funcion actualizar
function actualizar(){
    personaje.actualizar();
    suelo.actualizar();
    tubos.actualizar();
}

// LOOP
function loop(){
    actualizar();
    dibujar();
    frames++;
    
    requestAnimationFrame(loop);
}
loop();