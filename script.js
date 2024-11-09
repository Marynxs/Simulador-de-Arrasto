const canvas = document.getElementById('trajetoriaCanvas');
const ctx = canvas.getContext('2d');

const g = 9.8; // Gravidade em m/s²
const airDensity = 1.293; // Densidade do ar em kg/m³

const personagemImg = new Image();
personagemImg.src = './Assets/Personagem.png';

const bolaImg = new Image();
bolaImg.src = './Assets/Bola.png';

// Dimensões do personagem e da bola
const larguraPersonagem = 89;
const alturaPersonagem = 117;
const larguraBola = 27;
const alturaBola = 27;

// Escala para converter metros para pixels
const escala = 38;

// Lista de trajetórias e cores para cada simulação anterior
let trajetoriasPassadas = [];

// Cores disponíveis para trajetórias
const cores = ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FFAF33', '#9D33FF', '#33FFF3', '#FF3333', '#33FF92', '#FF8333'];

// Elementos de controle
const velocidadeInput = document.getElementById('velocidade');
const anguloInput = document.getElementById('angulo');
const posicaoXInput = document.getElementById('posicaoX');

const velocidadeLabel = document.getElementById('velocidadeLabel');
const anguloLabel = document.getElementById('anguloLabel');
const posicaoXLabel = document.getElementById('posicaoXLabel');
const distanciaDisplay = document.getElementById('distancia');

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

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Ajusta o canvas no carregamento da página
ajustarCanvas();

// Função para desenhar o personagem, bola e trajetórias anteriores
function desenharCenaInicial() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    const posXInicial = parseFloat(posicaoXInput.value) * escala;
    const yBasePersonagem = canvas.height - alturaPersonagem; // Posição Y do personagem no chão
    const yBaseBola = canvas.height - alturaBola; // Posição Y da bola no chão

    // Desenha o personagem
    ctx.drawImage(personagemImg, posXInicial, yBasePersonagem, larguraPersonagem, alturaPersonagem);

    // Desenha a bola ao lado do personagem
    ctx.drawImage(bolaImg, posXInicial + larguraPersonagem - larguraBola / 2, yBaseBola, larguraBola, alturaBola);

    // Desenha todas as trajetórias passadas
    trajetoriasPassadas.forEach(({ trajetoria, cor, posicaoInicial }) => {
        ctx.beginPath();
        ctx.strokeStyle = cor;
        ctx.lineWidth = 2;
        ctx.moveTo(trajetoria[0].x * escala + posicaoInicial, canvas.height - trajetoria[0].y * escala - alturaBola / 2);
        trajetoria.forEach(point => {
            ctx.lineTo(point.x * escala + posicaoInicial, canvas.height - point.y * escala - alturaBola / 2);
        });
        ctx.stroke();

        // Desenha a bola no final de cada trajetória
        const { x, y } = trajetoria[trajetoria.length - 1];
        ctx.drawImage(bolaImg, x * escala + posicaoInicial - larguraBola / 2, canvas.height - y * escala - alturaBola, larguraBola, alturaBola);
    });

    // Desenhar a linha de direção
    const anguloRad = parseFloat(anguloInput.value) * Math.PI / 180;
    const velocidadeInicial = parseFloat(velocidadeInput.value);
    
    const velX = velocidadeInicial * Math.cos(anguloRad);
    const velY = velocidadeInicial * Math.sin(anguloRad);
    
    const t = 0.1; // Tempo em segundos
    
    const posXFinal = posXInicial + larguraPersonagem + velX * t * escala;
    const posYFinal = (yBaseBola + alturaBola / 2) - (velY * t - 0.5 * g * t * t) * escala;
    
    ctx.beginPath();
    ctx.moveTo(posXInicial + larguraPersonagem, yBaseBola + alturaBola / 2);
    ctx.lineTo(posXFinal, posYFinal);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Função para calcular a trajetória e retornar as posições para a animação
function calcularTrajetoria() {
    const trajetoria = []; // Array para armazenar a trajetória

    let vInicial = parseFloat(velocidadeInput.value);
    let angulo = parseFloat(anguloInput.value) * Math.PI / 180;
    let massa = 1;
    let diametro = 1;
    let coefArrasto = 0.47;
    let area = Math.PI * Math.pow(diametro / 2, 2);

    let posX = larguraPersonagem / escala;
    let posY = 0;

    let velX = vInicial * Math.cos(angulo);
    let velY = vInicial * Math.sin(angulo);
    const dt = 0.01;

    while (posY >= 0) {
        let velocidade = Math.sqrt(velX ** 2 + velY ** 2);
        let forcaArrasto = 0.5 * airDensity * area * coefArrasto * (velocidade ** 2);

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

// Função para animar uma nova bola ao longo da trajetória
function animarBola(trajetoria) {
    let index = 0;
    const posXInicial = parseFloat(posicaoXInput.value) * escala;
    const corTrajetoria = escolherCorAleatoria();
    let distanciaFinal = 0;

    function frame() {
        if (index < trajetoria.length) {
            desenharCenaInicial();

            // Desenha a trajetória atual enquanto a bola se move
            ctx.beginPath();
            ctx.strokeStyle = corTrajetoria;
            ctx.lineWidth = 2;
            ctx.moveTo(trajetoria[0].x * escala + posXInicial, canvas.height - trajetoria[0].y * escala - alturaBola / 2);
            for (let i = 1; i <= index; i++) {
                ctx.lineTo(trajetoria[i].x * escala + posXInicial, canvas.height - trajetoria[i].y * escala - alturaBola / 2);
            }
            ctx.stroke();

            // Pega a posição da bola na trajetória
            const { x, y } = trajetoria[index];
            ctx.drawImage(bolaImg, x * escala + posXInicial - larguraBola / 2, canvas.height - y * escala - alturaBola, larguraBola, alturaBola);
            distanciaFinal = x;

            index++;
            requestAnimationFrame(frame);
        } else {
            // Salva a trajetória e posição inicial da bola quando a animação termina
            trajetoriasPassadas.push({ trajetoria, cor: corTrajetoria, posicaoInicial: posXInicial });
            distanciaDisplay.textContent = (distanciaFinal - larguraPersonagem / escala).toFixed(2);
        }
    }

    frame();
}

// Botão para iniciar a simulação
const iniciarBtn = document.getElementById('iniciar');
iniciarBtn.addEventListener('click', () => {
    const trajetoria = calcularTrajetoria();
    animarBola(trajetoria); // Anima a bola ao longo da trajetória
});

// Botão para limpar todas as trajetórias
const limparBtn = document.createElement('button');
limparBtn.textContent = 'Limpar Trajetórias';
limparBtn.onclick = () => {
    trajetoriasPassadas = [];
    desenharCenaInicial();
};
document.body.appendChild(limparBtn);

// Atualiza as labels quando os sliders mudam
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

// Desenha o personagem e a bola na posição inicial ao carregar a página
personagemImg.onload = bolaImg.onload = desenharCenaInicial;

// Configura valores iniciais
atualizarLabels();
