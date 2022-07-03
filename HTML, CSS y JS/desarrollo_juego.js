/*
    Esta función chequea que el campo donde se ingresa el nombre no se encuentre vacío.
    En caso de que lo esté, arroja una alerta.
    Si no está vacío, procede a guardar el nombre ingresado.
*/

function alerta_si_esta_vacio() {
    let nombre, url;
    nombre = document.getElementById("nombre").value;
    url = "desarrollo_juego.html"
    if (nombre === "") {
        alert("El nombre no puede estar vacío, ingrese un nombre válido.");
    } else {
        window.open(url + "#" + nombre, "_self");
    }
}

//Select los elementos del canvas
const cvs = document.getElementById("personaje");
const ctx = cvs.getContext("2d");

/*
 * constante y variables del juego
 * @param {let} frames - marco o cuadros que empieza en cero.
 * @param {const} grado - ayudara a determinar el angulo de inclinacion del pajarito.
 */
let frames = 0;
const grado = Math.PI / 180;

// cargar imagen del fondo en el canvas del juego.
const fondo = new Image();
fondo.src = "img/Fondo_1.png";

// cargar sonidos en el juego
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

/*
 * @param {const} estado - alamcena el estado del juego:
 *current=actual, getReady=cuando empieza el juego.
 *game=durante el juego, over=cuando termina el juego.
 */
const estado = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2,
}
/*
 * @param {const} start - almacena las coordenadas de la imagen del boton empezar cuando finalice el juego.
 */
const empezar_boton = {
    x: 120,
    y: 263,
    w: 83,
    h: 29,
}

// El usuario tiene control del juego con el mousse
cvs.addEventListener("click", function (evt) {
    switch (estado.current) {
        //del inicio "getReady" al desarrollo del juego.
        case estado.getReady:
            estado.current = estado.game;
            Aire.play().then(() => {
            });
            break;
        //mientras el usuario siga jugando
        case estado.game:
            if (personaje.y - personaje.radio <= 0) return;
            personaje.flap();
            Aleteo.play().then(() => {
            });
            break;
        //si el usuario pierde aparece "game Over".
        case estado.over:
            //
            let rect = cvs.getBoundingClientRect();
            let clickX = evt.clientX - rect.left;
            let clickY = evt.clientY - rect.top;

            // chequear si presionamos el boton empezar, se reinicia todo el juego.
            if (clickX >= empezar_boton.x && clickX <= empezar_boton.x + empezar_boton.w && clickY >= empezar_boton.y && clickY <= empezar_boton.y + empezar_boton.h) {
                tubos.reset();
                personaje.velocidadReset();
                puntaje.reset();
                estado.current = estado.getReady;
            }
            break;
    }
});
// El usuario tiene control del juego con la tecla Space
document.addEventListener("keyup", function (evt) {
    if (evt.code === "Space") {
        switch (estado.current) {
            case estado.getReady:
                estado.current = estado.game;
                Aire.play().then(() => {
                });
                break;
            case estado.game:
                if (personaje.y - personaje.radio <= 0) return;
                personaje.flap();
                Aleteo.play().then(() => {
                });
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

// dibujar la imagen del fondo dentro canvas.
const bg = {
    sX: 0,
    sY: 0,
    w: 274,
    h: 226,
    x: 0,
    y: cvs.height - 226,
    /*
     * Se encargara de posicionar la imagen del fondo correctamente dentro del canvas.
     * @method Funcion dibujar
     */
    dibujar: function () {
        //posiciona la imagen del fondo dentro del canvas.
        ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        //ajusta de forma correcta la imagen dentro del canvas.
        ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    }

}

// dibujar la imagen del suelo dentro canvas.
const suelo = {
    sX: 276,
    sY: 0,
    w: 220,
    h: 112,
    x: 0,
    y: cvs.height - 112,
    dx: 2,
    /*
     * Se encargara de posicionar la imagen del suelo correctamente dentro del canvas.
     * @method Funcion dibujar
     */

    dibujar: function () {
        ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },

    actualizar: function () {
        //el suelo durante el juego va ha estar en movimiento.
        if (estado.current === estado.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}

const personaje = {
//generamos "movimiento" del pajaro a traves de imagenes sucesivas.
    animation: [
        {sX: 276, sY: 114},
        {sX: 276, sY: 139},
        {sX: 276, sY: 164},
        {sX: 276, sY: 139}
    ],
// dibujar la imagen del fondo dentro canvas.
    x: 50,
    y: 150,
    w: 34,
    h: 26,
//paramentros del pajarito
    radio: 12,
    frame: 0,
    gravedad: 0.25,
    saltar: 4.6,
    velocidad: 0,
    rotacion: 0,
    /*
     * Se encargara de posicionar la imagen del pajarito correctamente dentro del canvas y que funcione con la animacion.
     * @method Funcion dibujar
     */
    dibujar: function () {
        let personaje = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotacion);
        ctx.drawImage(fondo, personaje.sX, personaje.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);

        ctx.restore();
    },
    /*
     * //el personaje irá a la cima simplemente
     * @method Funcion flap
     */
    flap: function () {
        this.velocidad = -this.saltar;
    },

    actualizar: function () {
        // si el estado del juego es GET READY, el personaje "aletea" de forma lenta
        this.period = estado.current === estado.getReady ? 10 : 5;
        // incrementamos FRAME con 1, cada periodo
        this.frame += frames % this.period === 0 ? 1 : 0;
        // FRAME va desde 0 hasta 4, despues de vuelta a 0
        this.frame = this.frame % this.animation.length;

        if (estado.current === estado.getReady) {
            // se resetea la posicion del personaje despues del GAME OVER
            this.y = 150;
            this.rotacion = 0;
        } else {
            //el personaje se encuentra en movimiento
            this.velocidad += this.gravedad;
            this.y += this.velocidad;
            //si el personaje toca el suelo
            if (this.y + this.h / 2 >= cvs.height - suelo.h) {
                this.y = cvs.height - suelo.h - this.h / 2;
                //si el personaje toca el suelo se termino el juego
                if (estado.current === estado.game) {
                    estado.current = estado.over;
                    Muere.play().then(() => {
                    });
                }
            }
            // si la velocidad es mayor al saltar significa que el personaje se cae
            if (this.velocidad >= this.saltar) {
                this.rotacion = 90 * grado;
                //el pajaro deja de aletear
                this.frame = 1;
            } else {
                this.rotacion = -25 * grado;
            }
        }

    },
    //se resetea a 0 la velocidad cuando inicia de vuelta.
    velocidadReset: function () {
        this.velocidad = 0;
    }
}

// dibujar la imagen de  "get Ready" dentro canvas.
const getReady = {
    sX: 0,
    sY: 228,
    w: 172,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 80,
    /*
     * Se encargara de posicionar la imagen de get ready correctamente dentro del canvas
     * @method Funcion dibujar
     */
    dibujar: function () {
        if (estado.current === estado.getReady) {
            ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        }
    }

}

//dibujar la imagen de  "Game Over" dentro canvas.
const gameOver = {
    sX: 176,
    sY: 228,
    w: 225,
    h: 202,
    x: cvs.width / 2 - 225 / 2,
    y: 90,
    gameOver: false,
    wasOver: false,
    /*
     * Se encargara de posicionar la imagen del game over correctamente dentro del canvas
     * @method Funcion dibujar
     */
    dibujar: function () {
        //aparecera unicamente cuando el usuario termine de jugar
        if (estado.current === estado.over) {
            ctx.drawImage(fondo, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        }
    },

    actualizar: function () {
        if (estado.current === estado.game) {
            this.wasOver = false;
        }
        if (estado.current === estado.over && !this.wasOver) {
            this.gameOver = true;
            this.wasOver = true;
        }
    }


}
const tubos = {
    position: [],
    //las posiciones de los tubos
    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 500,
        sY: 0
    },

    w: 53,
    h: 400,
    gap: 85,
    maxYPos: -150,
    dx: 2,
    /*
     * Se encargara de posicionar la imagen del tubo correctamente dentro del canvas
     * @method Funcion dibujar
     */
    dibujar: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            // tubo superior
            ctx.drawImage(fondo, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

            // tubo inferior
            ctx.drawImage(fondo, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    actualizar: function () {
        if (estado.current !== estado.game) return;
        //se crea la posicion del tubo.
        if (frames % 100 === 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        //use un loop completo para pasar a nuestra posición del array
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomPipeYPos = p.y + this.h + this.gap;

            // detector de colision del tubo superior.
            if (personaje.x + personaje.radio > p.x && personaje.x - personaje.radio < p.x + this.w && personaje.y + personaje.radio > p.y && personaje.y - personaje.radio < p.y + this.h) {
                estado.current = estado.over;
                Golpe.play().then(() => {
                });
            }
            //detector de colision del tubo inferior.
            if (personaje.x + personaje.radio > p.x && personaje.x - personaje.radio < p.x + this.w && personaje.y + personaje.radio > bottomPipeYPos && personaje.y - personaje.radio < bottomPipeYPos + this.h) {
                estado.current = estado.over;
                Golpe.play().then(() => {
                });
            }

            // mover los tubos a la izquierda
            p.x -= this.dx;

            // si los tubos se van fuera del canvas, se borran

            if (p.x + this.w <= 0) {
                this.position.shift();
                puntaje.value += 1;
                Puntos.play().then(() => {
                });
                puntaje.best = Math.max(puntaje.value, puntaje.best);
                localStorage.setItem("best", puntaje.best);
            }
        }
    },
    //se resetea y se vacia la posicion cuando inicia de vuelta.
    reset: function () {
        this.position = [];
    }

}

const puntaje = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,
    /*
     * Se encargara de posicionar la imagen del puntaje correctamente dentro del canvas
     * @method Funcion dibujar
     */
    dibujar: function () {
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#000";
        //numero que se visualiza mientras el pajaro esta jugando
        if (estado.current === estado.game) {
            ctx.lineWidth = 2;
            ctx.font = "35px Teko";
            ctx.fillText(this.value, cvs.width / 2, 50);
            ctx.strokeText(this.value, cvs.width / 2, 50);

        } else if (estado.current === estado.over) {
            //valor del puntaje que se obtuvo cuando termino la partida del juego.
            ctx.font = "25px Teko";
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // valor del mejor puntaje obtenido hasta la ultima partida.
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    //se resetea a 0 el puntaje cuando inicia de vuelta.
    reset: function () {
        this.value = 0;
    }
}

/*
 * Se encargara de todos los dibujos de cada objeto definido previamente que le haremos al canvas del juego.
 * @method Funcion dibujar
 * ctx.fillStyle - color de fondo de nuestro rectangulo de canvas
 * ctx.fillRect- tamaño del rectangulo va ser igual a nuestro canvas.
 */
function dibujar() {
    ctx.fillStyle = "#6C8BBC";
    ctx.fillRect(0, 0, cvs.width, cvs.height);

    bg.dibujar();
    tubos.dibujar();
    suelo.dibujar();
    personaje.dibujar();
    getReady.dibujar();
    gameOver.dibujar();
    puntaje.dibujar();
}

/*
 * Se encargara de actualizar la posicion de nuestras imagenes
 * @method Funcion actualizar
 */
function actualizar() {
    personaje.actualizar();
    suelo.actualizar();
    tubos.actualizar();
    //se encaragara de tirar un alert al jugador de que perdio.
    if (gameOver.gameOver) {
        alert("Lo sentimos perdiste, vuelve a intentarlo  " + window.location.href.split("#")[1])
        gameOver.gameOver = false;
    }
    gameOver.actualizar();
}

/*
 * Se encargara de actualizar nuestro juego cada segundo.
 * @method Funcion loop
 * @param {let} frames++ - incrementa la variable en 1 y sabre cuántos cuadros dibujé en el canvas.
 * requestAnimationFrame(loop)-tomar la función de devolución de nuestra función de loop
 */
function loop() {
    actualizar();
    dibujar();
    frames++;
    requestAnimationFrame(loop);
}

loop();
