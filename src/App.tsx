import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import TelegramWebApp from './telegram';

// Типы
interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    dy: number;
    gravity: number;
    jumpPower: number;
    grounded: boolean;
    animationFrame: number;
}

interface Platform {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Artifact {
    x: number;
    y: number;
    width: number;
    height: number;
    collected: boolean;
}

interface Shadow {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    animationScale: number;
}

interface Level {
    platforms: Platform[];
    artifacts: Artifact[];
    shadows: Shadow[];
}

interface Keys {
    right: boolean;
    left: boolean;
    jump: boolean;
}

// Telegram Web App
const tg = TelegramWebApp;
tg.ready();
tg.expand();

const levels: Level[] = [
    {
        platforms: [
            { x: 0, y: 580, width: 800, height: 20 },
            { x: 200, y: 400, width: 150, height: 20 },
            { x: 400, y: 300, width: 150, height: 20 },
            { x: 600, y: 200, width: 150, height: 20 }
        ],
        artifacts: [
            { x: 250, y: 350, width: 20, height: 20, collected: false },
            { x: 450, y: 250, width: 20, height: 20, collected: false },
            { x: 650, y: 150, width: 20, height: 20, collected: false }
        ],
        shadows: [
            { x: 300, y: 540, width: 40, height: 40, speed: 2, animationScale: 1 }
        ]
    },
    {
        platforms: [
            { x: 0, y: 580, width: 800, height: 20 },
            { x: 150, y: 450, width: 100, height: 20 },
            { x: 350, y: 350, width: 100, height: 20 },
            { x: 550, y: 250, width: 100, height: 20 }
        ],
        artifacts: [
            { x: 200, y: 400, width: 20, height: 20, collected: false },
            { x: 400, y: 300, width: 20, height: 20, collected: false },
            { x: 600, y: 200, width: 20, height: 20, collected: false }
        ],
        shadows: [
            { x: 200, y: 540, width: 40, height: 40, speed: 3, animationScale: 1 },
            { x: 500, y: 540, width: 40, height: 40, speed: -3, animationScale: 1 }
        ]
    },
    {
        platforms: [
            { x: 0, y: 580, width: 800, height: 20 },
            { x: 100, y: 500, width: 120, height: 20 },
            { x: 300, y: 400, width: 120, height: 20 },
            { x: 500, y: 300, width: 120, height: 20 },
            { x: 700, y: 200, width: 120, height: 20 }
        ],
        artifacts: [
            { x: 150, y: 450, width: 20, height: 20, collected: false },
            { x: 350, y: 350, width: 20, height: 20, collected: false }
        ],
        shadows: [
            { x: 250, y: 540, width: 40, height: 40, speed: 4, animationScale: 1 },
            { x: 600, y: 540, width: 40, height: 40, speed: -4, animationScale: 1 }
        ]
    }
];

const GameCanvas: React.FC = () => {
    const [score, setScore] = useState<number>(0);
    const [level, setLevel] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [highScore, setHighScore] = useState<number>(0);

    const restartGame = () => {
        setScore(0);
        setLevel(0);
        setGameOver(false);
        tg.MainButton.show();
        window.location.reload();
    };

    useEffect(() => {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        // Scale canvas for iPhone 11
        const scaleFactor = Math.min(window.innerWidth / 800, (window.innerHeight - 100) / 600);
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.width = `${800 * scaleFactor}px`;
        canvas.style.height = `${600 * scaleFactor}px`;

        // Load sprites
        const playerSprite = new Image();
        playerSprite.src = '/assets/player.png';
        const platformSprite = new Image();
        platformSprite.src = '/assets/platform.png';
        const artifactSprite = new Image();
        artifactSprite.src = '/assets/artifact.png';
        const shadowSprite = new Image();
        shadowSprite.src = '/assets/shadow.png';
        const background = new Image();
        background.src = '/assets/background.jpg';

        const player: Player = {
            x: 50,
            y: canvas.height - 50,
            width: 40,
            height: 40,
            speed: 5,
            dy: 0,
            gravity: 0.5,
            jumpPower: -15,
            grounded: false,
            animationFrame: 0
        };

        let currentLevel = levels[level];
        let { platforms, artifacts, shadows } = currentLevel;

        const keys: Keys = { right: false, left: false, jump: false };

        // Keyboard controls
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowRight') keys.right = true;
            if (e.code === 'ArrowLeft') keys.left = true;
            if (e.code === 'Space') keys.jump = true;
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'ArrowRight') keys.right = false;
            if (e.code === 'ArrowLeft') keys.left = false;
            if (e.code === 'Space') keys.jump = false;
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // Touch controls
        const leftButton = document.getElementById('leftButton') as HTMLButtonElement;
        const rightButton = document.getElementById('rightButton') as HTMLButtonElement;
        const jumpButton = document.getElementById('jumpButton') as HTMLButtonElement;

        const handleTouchStart = (action: 'left' | 'right' | 'jump') => {
            if (action === 'left') keys.left = true;
            if (action === 'right') keys.right = true;
            if (action === 'jump') {
                keys.jump = true;
                tg.HapticFeedback.impactOccurred('medium');
            }
        };

        const handleTouchEnd = (action: 'left' | 'right' | 'jump') => {
            if (action === 'left') keys.left = false;
            if (action === 'right') keys.right = false;
            if (action === 'jump') keys.jump = false;
        };

        leftButton?.addEventListener('touchstart', () => handleTouchStart('left'));
        leftButton?.addEventListener('touchend', () => handleTouchEnd('left'));
        rightButton?.addEventListener('touchstart', () => handleTouchStart('right'));
        rightButton?.addEventListener('touchend', () => handleTouchEnd('right'));
        jumpButton?.addEventListener('touchstart', () => handleTouchStart('jump'));
        jumpButton?.addEventListener('touchend', () => handleTouchEnd('jump'));

        // Telegram MainButton
        tg.MainButton.setText('Jump').show().onClick(() => {
            keys.jump = true;
            setTimeout(() => keys.jump = false, 100);
            tg.HapticFeedback.impactOccurred('medium');
        });

        const update = () => {
            if (gameOver) return;

            if (keys.right) {
                player.x += player.speed;
                player.animationFrame += 0.2;
            }
            if (keys.left) {
                player.x -= player.speed;
                player.animationFrame += 0.2;
            }

            player.dy += player.gravity;
            player.y += player.dy;

            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
            if (player.y > canvas.height) {
                endGame();
                return;
            }

            player.grounded = false;
            for (let platform of platforms) {
                if (
                    player.x < platform.x + platform.width &&
                    player.x + player.width > platform.x &&
                    player.y + player.height > platform.y &&
                    player.y + player.height < platform.y + platform.height &&
                    player.dy > 0
                ) {
                    player.y = platform.y - player.height;
                    player.dy = 0;
                    player.grounded = true;
                }
            }

            if (keys.jump && player.grounded) {
                player.dy = player.jumpPower;
                player.grounded = false;
                tg.HapticFeedback.impactOccurred('light');
            }

            artifacts.forEach(artifact => {
                if (
                    !artifact.collected &&
                    player.x < artifact.x + artifact.width &&
                    player.x + player.width > artifact.x &&
                    player.y < artifact.y + artifact.height &&
                    player.y + player.height > artifact.y
                ) {
                    artifact.collected = true;
                    setScore(prev => prev + 10);
                    tg.HapticFeedback.notificationOccurred('success');
                }
            });

            shadows.forEach(shadow => {
                shadow.x += shadow.speed;
                shadow.animationScale = 1 + Math.sin(Date.now() / 200) * 0.1;
                if (shadow.x > canvas.width || shadow.x < 0) shadow.speed = -shadow.speed;
                if (
                    player.x < shadow.x + shadow.width &&
                    player.x + player.width > shadow.x &&
                    player.y < shadow.y + shadow.height &&
                    player.y + player.height > shadow.y
                ) {
                    endGame();
                }
            });

            if (artifacts.every(artifact => artifact.collected)) {
                if (level < levels.length - 1) {
                    setLevel(prev => prev + 1);
                    player.x = 50;
                    player.y = canvas.height - 50;
                    player.dy = 0;
                    currentLevel = levels[level + 1];
                    platforms = currentLevel.platforms;
                    artifacts = currentLevel.artifacts;
                    shadows = currentLevel.shadows;
                } else {
                    endGame();
                }
            }

            draw();
            requestAnimationFrame(update);
        };

        const draw = () => {
            // Draw background
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Draw platforms
            for (let platform of platforms) {
                ctx.drawImage(platformSprite, platform.x, platform.y, platform.width, platform.height);
            }

            // Draw player with animation
            ctx.globalAlpha = 0.7 + Math.sin(player.animationFrame) * 0.3;
            ctx.drawImage(playerSprite, player.x, player.y, player.width, player.height);
            ctx.globalAlpha = 1;

            // Draw artifacts
            for (let artifact of artifacts) {
                if (!artifact.collected) {
                    ctx.drawImage(artifactSprite, artifact.x, artifact.y, artifact.width, artifact.height);
                }
            }

            // Draw shadows with animation
            for (let shadow of shadows) {
                const scaledWidth = shadow.width * shadow.animationScale;
                const scaledHeight = shadow.height * shadow.animationScale;
                ctx.drawImage(
                    shadowSprite,
                    shadow.x - (scaledWidth - shadow.width) / 2,
                    shadow.y - (scaledHeight - shadow.height) / 2,
                    scaledWidth,
                    scaledHeight
                );
            }
        };

        const endGame = () => {
            setGameOver(true);
            tg.MainButton.hide();
            fetchHighScore();
            saveScore();
        };

        const saveScore = async () => {
            try {
                const response = await fetch('/api/scores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: tg.initDataUnsafe.user.id, score })
                });
                const data: { highScore: number } = await response.json();
                setHighScore(data.highScore);
            } catch (error) {
                console.error('Error saving score:', error);
            }
        };

        const fetchHighScore = async () => {
            try {
                const response = await fetch(`/api/scores/${tg.initDataUnsafe.user.id}`);
                const data: { highScore: number } = await response.json();
                setHighScore(data.highScore || 0);
            } catch (error) {
                console.error('Error fetching high score:', error);
            }
        };

        // Wait for images to load
        Promise.all([
            new Promise(resolve => { playerSprite.onload = resolve; }),
            new Promise(resolve => { platformSprite.onload = resolve; }),
            new Promise(resolve => { artifactSprite.onload = resolve; }),
            new Promise(resolve => { shadowSprite.onload = resolve; }),
            new Promise(resolve => { background.onload = resolve; })
        ]).then(() => {
            update();
            fetchHighScore();
        });

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            leftButton?.removeEventListener('touchstart', () => handleTouchStart('left'));
            leftButton?.removeEventListener('touchend', () => handleTouchEnd('left'));
            rightButton?.removeEventListener('touchstart', () => handleTouchStart('right'));
            rightButton?.removeEventListener('touchend', () => handleTouchEnd('right'));
            jumpButton?.removeEventListener('touchstart', () => handleTouchStart('jump'));
            jumpButton?.removeEventListener('touchend', () => handleTouchEnd('jump'));
        };
    }, [gameOver, score, level]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black font-creepy">
            <div className="absolute top-4 left-4 text-glow text-lg sm:text-xl">
                Score: {score} | Level: {level + 1} | High Score: {highScore}
            </div>
            <canvas id="gameCanvas" className="border-4 border-gray-800 rounded-lg shadow-glow"></canvas>
            <div className="absolute bottom-4 left-4 flex space-x-4">
                <button
                    id="leftButton"
                    className="bg-gray-900 bg-opacity-70 text-glow w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl shadow-glow"
                >
                    <img src="/assets/left-arrow.png" alt="Left" className="w-8 h-8" />
                </button>
                <button
                    id="rightButton"
                    className="bg-gray-900 bg-opacity-70 text-glow w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl shadow-glow"
                >
                    <img src="/assets/right-arrow.png" alt="Right" className="w-8 h-8" />
                </button>
            </div>
            <div className="absolute bottom-4 right-4">
                <button
                    id="jumpButton"
                    className="bg-red-900 bg-opacity-70 text-glow w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-2xl shadow-glow"
                >
                    <img src="/assets/jump-arrow.png" alt="Jump" className="w-8 h-8" />
                </button>
            </div>
            {gameOver && (
                <div className="absolute bg-black bg-opacity-90 p-6 sm:p-8 rounded-lg text-center border-2 border-red-800 shadow-glow">
                    <h2 className="text-2xl sm:text-3xl text-red-600 mb-4 font-creepy">Game Over</h2>
                    <p className="text-glow mb-4">Final Score: {score}</p>
                    <button
                        onClick={restartGame}
                        className="bg-red-900 text-glow px-4 py-2 rounded hover:bg-red-800 shadow-glow"
                    >
                        Restart
                    </button>
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
    return (
        <div className="bg-black min-h-screen">
            <GameCanvas />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);