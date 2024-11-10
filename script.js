const canvas = document.getElementById('trajetoriaCanvas');
const ctx = canvas.getContext('2d'); 

const g = 9.8; // gravidade

// Imagens:
const personagemImg = new Image();
personagemImg.src = './Assets/Personagem.png';

const bolaImg = new Image();
bolaImg.src = './Assets/Bola.png';

const fundoImg = new Image();
fundoImg.src = './Assets/Campo.jpg';

const GolFrente = new Image();
GolFrente.src = './Assets/Gol.png';

const GOOL = new Image();
GOOL.src = './Assets/GOOL.png';

// Tamanho original dos personagens e bola
const golLarguraOriginal = 120;
const golAlturaOriginal = 190;
const larguraPersonagemOriginal = 89;
const alturaPersonagemOriginal = 117;
const larguraBolaOriginal = 27;
const alturaBolaOriginal = 27;

// Tamanho original da imagem GOOL
const goolLarguraOriginal = 405; 
const goolAlturaOriginal = 300;  

// Valores que serão reajustados pela escala
let escalaX = 38;
let escalaY = 38;
let larguraPersonagem = larguraPersonagemOriginal;
let alturaPersonagem = alturaPersonagemOriginal;
let larguraBola = larguraBolaOriginal;
let alturaBola = alturaBolaOriginal;
let larguraGol = golLarguraOriginal;
let alturaGol = golAlturaOriginal;
let larguraGool = goolLarguraOriginal;
let alturaGool = goolAlturaOriginal;

// Variável para controlar a exibição da imagem GOOL
let mostrarGool = false;

// Ponto Y base original para o personagem e a bola
const yPosicaoBaseOriginal = 200; 
let yPosicaoBase = yPosicaoBaseOriginal; // posição que será reajustada

// Posições originais do gol
const golPosicaoXOriginal = 1716;
const golPosicaoYOriginal = 712;
let golPosicaoX = golPosicaoXOriginal;
let golPosicaoY = golPosicaoYOriginal;

// Função para ajustar a escala dos objetos de acordo com o tamanho da tela
function ajustarEscala() {
    const baseWidth = 1920;
    const baseHeight = 1080;

    escalaX = (window.innerWidth / baseWidth) * 38;
    escalaY = (window.innerHeight / baseHeight) * 38;

    let scaleX = escalaX / 38;
    let scaleY = escalaY / 38;

    larguraPersonagem = larguraPersonagemOriginal * scaleX;
    alturaPersonagem = alturaPersonagemOriginal * scaleY;
    larguraBola = larguraBolaOriginal * scaleX;
    alturaBola = alturaBolaOriginal * scaleY;
    larguraGol = golLarguraOriginal * scaleX;
    alturaGol = golAlturaOriginal * scaleY;

    // Ajustar tamanho da imagem GOOL
    larguraGool = goolLarguraOriginal * scaleX;
    alturaGool = goolAlturaOriginal * scaleY;

    yPosicaoBase = yPosicaoBaseOriginal * scaleY;

    // Ajusta as posições do gol com base na escala
    golPosicaoX = golPosicaoXOriginal * scaleX;
    golPosicaoY = golPosicaoYOriginal * scaleY;
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

// Variável para indicar se a bola está em animação
let animandoBola = false;

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

    // Desenha o fundo (já inclui a parte de trás do gol)
    ctx.drawImage(fundoImg, 0, 0, canvas.width, canvas.height);

    const posicaoInicialEmMetros = parseFloat(posicaoXInput.value);
    const posXInicialCanvas = posicaoInicialEmMetros * escalaX;

    const yBasePersonagem = canvas.height - yPosicaoBase - alturaPersonagem;
    const yBaseBola = canvas.height - yPosicaoBase - alturaBola;

    // Desenha o personagem
    ctx.drawImage(personagemImg, posXInicialCanvas, yBasePersonagem, larguraPersonagem, alturaPersonagem);

    // Desenha a bola na posição inicial somente se não estiver em animação
    if (!animandoBola) {
        ctx.drawImage(bolaImg, posXInicialCanvas + larguraPersonagem - larguraBola / 2, yBaseBola, larguraBola, alturaBola);
    }

    // Desenha todas as trajetórias passadas
    trajetoriasPassadas.forEach(({ trajetoria, cor, posicaoInicial }) => {
        const posXInicialCanvasTrajetoria = posicaoInicial * escalaX;

        ctx.beginPath();
        ctx.strokeStyle = cor;
        ctx.lineWidth = 2;
        ctx.moveTo(trajetoria[0].x * escalaX + posXInicialCanvasTrajetoria, canvas.height - yPosicaoBase - trajetoria[0].y * escalaY - alturaBola / 2);
        trajetoria.forEach(point => {
            ctx.lineTo(point.x * escalaX + posXInicialCanvasTrajetoria, canvas.height - yPosicaoBase - point.y * escalaY - alturaBola / 2);
        });
        ctx.stroke();

        // Desenha a bola no final de cada trajetória
        const { x, y } = trajetoria[trajetoria.length - 1];
        ctx.drawImage(bolaImg, x * escalaX + posXInicialCanvasTrajetoria - larguraBola / 2, canvas.height - yPosicaoBase - y * escalaY - alturaBola, larguraBola, alturaBola);
    });

    // Desenha a linha de direção somente se não estiver animando
    if (!animandoBola) {
        const anguloRad = parseFloat(anguloInput.value) * Math.PI / 180;
        const velocidadeInicial = parseFloat(velocidadeInput.value);
        
        const velX = velocidadeInicial * Math.cos(anguloRad);
        const velY = velocidadeInicial * Math.sin(anguloRad);
        
        const t = 0.1;
        
        const posXFinal = posXInicialCanvas + larguraPersonagem + velX * t * escalaX;
        const posYFinal = (yBaseBola + alturaBola / 2) - (velY * t - 0.5 * g * t * t) * escalaY;
        
        ctx.beginPath();
        ctx.moveTo(posXInicialCanvas + larguraPersonagem, yBaseBola + alturaBola / 2);
        ctx.lineTo(posXFinal, posYFinal);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Desenha a parte da frente do gol (trave e barras)
    ctx.drawImage(GolFrente, golPosicaoX, golPosicaoY, larguraGol, alturaGol);

    // Desenha a imagem GOOL se necessário
    if (mostrarGool) {
        const xCentro = (canvas.width - larguraGool) / 2;
        const yCentro = (canvas.height - alturaGool) / 2;
        ctx.drawImage(GOOL, xCentro, yCentro, larguraGool, alturaGool);
    }
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

    let posX = larguraPersonagem / escalaX;
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
    animandoBola = true;
    const posicaoInicialEmMetros = parseFloat(posicaoXInput.value);
    const corTrajetoria = escolherCorAleatoria();
    let distanciaFinal = 0;

    // Converter posições do gol para metros
    const golPosicaoXMetros = golPosicaoX / escalaX;
    const golLarguraMetros = larguraGol / escalaX;
    const golXMin = golPosicaoXMetros;
    const golXMax = golPosicaoXMetros + golLarguraMetros;

    function frame() {
        if (index < trajetoria.length) {
            // Limpa o canvas e desenha o fundo
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(fundoImg, 0, 0, canvas.width, canvas.height);

            const posXInicialCanvas = posicaoInicialEmMetros * escalaX;

            // Desenha o personagem
            const yBasePersonagem = canvas.height - yPosicaoBase - alturaPersonagem;
            ctx.drawImage(personagemImg, posXInicialCanvas, yBasePersonagem, larguraPersonagem, alturaPersonagem);

            // Desenha todas as trajetórias passadas
            trajetoriasPassadas.forEach(({ trajetoria, cor, posicaoInicial }) => {
                const posXInicialCanvasTrajetoria = posicaoInicial * escalaX;

                ctx.beginPath();
                ctx.strokeStyle = cor;
                ctx.lineWidth = 2;
                ctx.moveTo(trajetoria[0].x * escalaX + posXInicialCanvasTrajetoria, canvas.height - yPosicaoBase - trajetoria[0].y * escalaY - alturaBola / 2);
                trajetoria.forEach(point => {
                    ctx.lineTo(point.x * escalaX + posXInicialCanvasTrajetoria, canvas.height - yPosicaoBase - point.y * escalaY - alturaBola / 2);
                });
                ctx.stroke();

                // Desenha a bola no final de cada trajetória
                const { x, y } = trajetoria[trajetoria.length - 1];
                ctx.drawImage(bolaImg, x * escalaX + posXInicialCanvasTrajetoria - larguraBola / 2, canvas.height - yPosicaoBase - y * escalaY - alturaBola, larguraBola, alturaBola);
            });

            // Pega a posição da bola na trajetória
            const { x, y } = trajetoria[index];
            const xCanvas = x * escalaX + posXInicialCanvas - larguraBola / 2;
            const yCanvas = canvas.height - yPosicaoBase - y * escalaY - alturaBola;

            // Desenha a trajetória atual
            ctx.beginPath();
            ctx.strokeStyle = corTrajetoria;
            ctx.lineWidth = 2;
            ctx.moveTo(trajetoria[0].x * escalaX + posXInicialCanvas, canvas.height - yPosicaoBase - trajetoria[0].y * escalaY - alturaBola / 2);
            for (let i = 1; i <= index; i++) {
                ctx.lineTo(trajetoria[i].x * escalaX + posXInicialCanvas, canvas.height - yPosicaoBase - trajetoria[i].y * escalaY - alturaBola / 2);
            }
            ctx.stroke();

            // Verifica se a bola está antes ou depois do gol
            const posXBolaMetros = x + posicaoInicialEmMetros;

            if (posXBolaMetros < golXMin) {
                // Bola está antes do gol - desenhar bola após o gol (bola na frente)

                // Desenha a parte da frente do gol
                ctx.drawImage(GolFrente, golPosicaoX, golPosicaoY, larguraGol, alturaGol);

                // Desenha a bola
                ctx.drawImage(bolaImg, xCanvas, yCanvas, larguraBola, alturaBola);
            } else {
                // Bola está dentro ou depois do gol - desenhar bola antes do gol (bola atrás)

                // Desenha a bola
                ctx.drawImage(bolaImg, xCanvas, yCanvas, larguraBola, alturaBola);

                // Desenha a parte da frente do gol
                ctx.drawImage(GolFrente, golPosicaoX, golPosicaoY, larguraGol, alturaGol);
            }

            distanciaFinal = x;

            index++;
            requestAnimationFrame(frame);
        } else {
            animandoBola = false;
            trajetoriasPassadas.push({ trajetoria, cor: corTrajetoria, posicaoInicial: posicaoInicialEmMetros });
            distanciaDisplay.textContent = (distanciaFinal - larguraPersonagem / escalaX).toFixed(2);

            // Verificar se a posição final da bola está dentro do gol
            const posicaoFinalBolaMetros = distanciaFinal + posicaoInicialEmMetros;
            if (posicaoFinalBolaMetros >= golXMin && posicaoFinalBolaMetros <= golXMax) {
                mostrarGool = true;
                setTimeout(() => {
                    mostrarGool = false;
                    desenharCenaInicial(); // Atualizar a tela após ocultar a imagem
                }, 2000); // 2000 milissegundos = 2 segundos
            }

            desenharCenaInicial(); // Redesenha a cena final
        }
    }

    frame();
}

// Botão para iniciar a simulação
const iniciarBtn = document.getElementById('iniciar');
iniciarBtn.addEventListener('click', () => {
    if (!animandoBola) {
        const trajetoria = calcularTrajetoria();
        animarBola(trajetoria);
    }
});

// Botão para limpar todas as trajetórias
const limparBtn = document.getElementById('limpar');
limparBtn.addEventListener('click', () => {
    trajetoriasPassadas = [];
    mostrarGool = false;
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
personagemImg.onload = checkAllImagesLoaded;
bolaImg.onload = checkAllImagesLoaded;
fundoImg.onload = checkAllImagesLoaded;
GolFrente.onload = checkAllImagesLoaded;
GOOL.onload = checkAllImagesLoaded;

function checkAllImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 5) {
        desenharCenaInicial();
    }
}

atualizarLabels();
