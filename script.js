const canvas = document.getElementById('trajetoriaCanvas');
const ctx = canvas.getContext('2d'); 

const g = 9.8; // gravidade

//Imagens:
const personagemImg = new Image();
personagemImg.src = './Assets/Personagem.png';

const bolaImg = new Image();
bolaImg.src = './Assets/Bola.png';

const fundoImg = new Image();
fundoImg.src = './Assets/Campo.jpg';

// Tamanho original dos personagens e bola
const larguraPersonagemOriginal = 89;
const alturaPersonagemOriginal = 117;
const larguraBolaOriginal = 27;
const alturaBolaOriginal = 27;

// Valores que serão reajustados pela escala
let escala = 38;
let larguraPersonagem = larguraPersonagemOriginal;
let alturaPersonagem = alturaPersonagemOriginal;
let larguraBola = larguraBolaOriginal;
let alturaBola = alturaBolaOriginal;

// Ponto Y base original para o personagem e a bola
const yPosicaoBaseOriginal = 200; 
let yPosicaoBase = yPosicaoBaseOriginal; //posição que sera reajustada

// Função para ajustar a escala dos objetos de acordo com o tamanho da tela
function ajustarEscala() {
    const baseWidth = 1920;
    const baseHeight = 1080;
    escala = (window.innerWidth / baseWidth) * 38;

    let scale = escala / 38;
    larguraPersonagem = larguraPersonagemOriginal * scale;
    alturaPersonagem = alturaPersonagemOriginal * scale;
    larguraBola = larguraBolaOriginal * scale;
    alturaBola = alturaBolaOriginal * scale;

    yPosicaoBase = yPosicaoBaseOriginal * (canvas.height / baseHeight);
}

// Função para ajustar o tamanho do canvas
function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Ajuste inicial
ajustarCanvas();
ajustarEscala();

// Evento de redimensionamento
window.addEventListener('resize', () => {
    ajustarCanvas();
    ajustarEscala();
    desenharCenaInicial();
});

// Elementos de controle
const estadioSelect = document.getElementById('estadioSelect');
const velocidadeInput = document.getElementById('velocidade');
const anguloInput = document.getElementById('angulo');
const posicaoXInput = document.getElementById('posicaoX');

const velocidadeLabel = document.getElementById('velocidadeLabel');
const anguloLabel = document.getElementById('anguloLabel');
const posicaoXLabel = document.getElementById('posicaoXLabel');
const distanciaDisplay = document.getElementById('distancia');

let densidadeDoAr = parseFloat(estadioSelect.value);

// Array de trajetórias e cores para cada simulação anterior
let trajetoriasPassadas = [];

const cores = ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FFAF33', '#9D33FF', '#33FFF3', '#FF3333', '#33FF92', '#FF8333'];

// Função para escolher uma cor aleatória para a trajetória
function escolherCorAleatoria() {
    return cores[Math.floor(Math.random() * cores.length)];
}

// Função para atualizar as labels dos valores
function atualizarLabels() {
    velocidadeLabel.textContent = velocidadeInput.value;
    anguloLabel.textContent = anguloInput.value;
    posicaoXLabel.textContent = posicaoXInput.value;
}

function desenharCenaInicial() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(fundoImg, 0, 0, canvas.width, canvas.height);

    const posicaoInicialEmMetros = parseFloat(posicaoXInput.value);
    const posXInicialCanvas = posicaoInicialEmMetros * escala;

    const yBasePersonagem = canvas.height - yPosicaoBase - alturaPersonagem;
    const yBaseBola = canvas.height - yPosicaoBase - alturaBola;

    // Desenha o personagem
    ctx.drawImage(personagemImg, posXInicialCanvas, yBasePersonagem, larguraPersonagem, alturaPersonagem);

    // Desenha a bola ao lado do personagem
    ctx.drawImage(bolaImg, posXInicialCanvas + larguraPersonagem - larguraBola / 2, yBaseBola, larguraBola, alturaBola);

    // Desenha todas as trajetórias passadas
    trajetoriasPassadas.forEach(({ trajetoria, cor, posicaoInicial }) => {
        const posXInicialCanvasTrajetoria = posicaoInicial * escala; // Redesenha a trajetoria para tamanhos diferentes de tela

        ctx.beginPath();
        ctx.strokeStyle = cor;
        ctx.lineWidth = 2;
        ctx.moveTo(trajetoria[0].x * escala + posXInicialCanvasTrajetoria, canvas.height - yPosicaoBase - trajetoria[0].y * escala - alturaBola / 2);
        trajetoria.forEach(point => {
            ctx.lineTo(point.x * escala + posXInicialCanvasTrajetoria, canvas.height - yPosicaoBase - point.y * escala - alturaBola / 2);
        });
        ctx.stroke();

        // Desenha a bola no final de cada trajetória
        const { x, y } = trajetoria[trajetoria.length - 1];
        ctx.drawImage(bolaImg, x * escala + posXInicialCanvasTrajetoria - larguraBola / 2, canvas.height - yPosicaoBase - y * escala - alturaBola, larguraBola, alturaBola);
    });

    // Desenha a linha de direção
    const anguloRad = parseFloat(anguloInput.value) * Math.PI / 180;
    const velocidadeInicial = parseFloat(velocidadeInput.value);
    
    const velX = velocidadeInicial * Math.cos(anguloRad);
    const velY = velocidadeInicial * Math.sin(anguloRad);
    
    const t = 0.1;
    
    const posXFinal = posXInicialCanvas + larguraPersonagem + velX * t * escala;
    const posYFinal = (yBaseBola + alturaBola / 2) - (velY * t - 0.5 * g * t * t) * escala;
    
    ctx.beginPath();
    ctx.moveTo(posXInicialCanvas + larguraPersonagem, yBaseBola + alturaBola / 2);
    ctx.lineTo(posXFinal, posYFinal);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Função para calcular a trajetória
function calcularTrajetoria() {
    const trajetoria = [];

    let vInicial = parseFloat(velocidadeInput.value);
    let angulo = parseFloat(anguloInput.value) * Math.PI / 180;
    let massa = 0.45;
    let diametro = 0.22;
    let coefArrasto = 0.47;
    let area = Math.PI * Math.pow(diametro / 2, 2);

    let posX = larguraPersonagem / escala;
    let posY = 0;

    let velX = vInicial * Math.cos(angulo);
    let velY = vInicial * Math.sin(angulo);
    const dt = 0.01;

    while (posY >= 0) {
        let velocidade = Math.sqrt(velX ** 2 + velY ** 2);
        let forcaArrasto = 0.5 * densidadeDoAr * area * coefArrasto * (velocidade ** 2);

        let ax = -forcaArrasto * (velX / velocidade) / massa;
        let ay = -g - (forcaArrasto * (velY / velocidade) / massa);

        velX += ax * dt;
        velY += ay * dt;

        posX += velX * dt;
        posY += velY * dt;

        if (posY < 0) break;
        trajetoria.push({ x: posX, y: posY });
    }

    return trajetoria;
}

// Função para animar a bola ao longo da trajetória
function animarBola(trajetoria) {
    let index = 0;
    const posicaoInicialEmMetros = parseFloat(posicaoXInput.value);
    const posXInicialCanvas = posicaoInicialEmMetros * escala;
    const corTrajetoria = escolherCorAleatoria();
    let distanciaFinal = 0;

    function frame() {
        if (index < trajetoria.length) {
            desenharCenaInicial();

            // Desenha a trajetória atual enquanto a bola se move
            ctx.beginPath();
            ctx.strokeStyle = corTrajetoria;
            ctx.lineWidth = 2;
            ctx.moveTo(trajetoria[0].x * escala + posXInicialCanvas, canvas.height - yPosicaoBase - trajetoria[0].y * escala - alturaBola / 2);
            for (let i = 1; i <= index; i++) {
                ctx.lineTo(trajetoria[i].x * escala + posXInicialCanvas, canvas.height - yPosicaoBase - trajetoria[i].y * escala - alturaBola / 2);
            }
            ctx.stroke();

            // Pega a posição da bola na trajetória
            const { x, y } = trajetoria[index];
            ctx.drawImage(bolaImg, x * escala + posXInicialCanvas - larguraBola / 2, canvas.height - yPosicaoBase - y * escala - alturaBola, larguraBola, alturaBola);
            distanciaFinal = x;

            index++;
            requestAnimationFrame(frame);
        } else {
            trajetoriasPassadas.push({ trajetoria, cor: corTrajetoria, posicaoInicial: posicaoInicialEmMetros });
            distanciaDisplay.textContent = (distanciaFinal - larguraPersonagem / escala).toFixed(2);
        }
    }

    frame();
}

// Botão para iniciar a simulação
const iniciarBtn = document.getElementById('iniciar');
iniciarBtn.addEventListener('click', () => {
    const trajetoria = calcularTrajetoria();
    animarBola(trajetoria);
});

// Botão para limpar todas as trajetórias
const limparBtn = document.getElementById('limpar');
limparBtn.addEventListener('click', () => {
    trajetoriasPassadas = [];
    desenharCenaInicial();
    distanciaDisplay.textContent = '0';
});

// Atualiza tudo quando os sliders mudam
velocidadeInput.addEventListener('input', () => {
    atualizarLabels();
    desenharCenaInicial();
});

anguloInput.addEventListener('input', () => {
    atualizarLabels();
    desenharCenaInicial();
});

posicaoXInput.addEventListener('input', () => {
    atualizarLabels();
    desenharCenaInicial();
});

// Atualiza a densidade do ar de acordo com o estadio escolhido
estadioSelect.addEventListener('change', (event) => {
    densidadeDoAr = parseFloat(event.target.value);
    desenharCenaInicial();
});

// Carrega todas as imagens antes de aparecer na tela
let imagesLoaded = 0;
personagemImg.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 3) {
        desenharCenaInicial();
    }
};
bolaImg.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 3) {
        desenharCenaInicial();
    }
};
fundoImg.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 3) {
        desenharCenaInicial();
    }
};

atualizarLabels();
