import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import TelegramWebApp from './telegram';
// Telegram Web App
const tg = TelegramWebApp;
tg.ready();
tg.expand();
const levels = [
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
const GameCanvas = () => {
    console.log('GameCanvas rendering'); // Debug
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const restartGame = () => {
        setScore(0);
        setLevel(0);
        setGameOver(false);
        tg.MainButton.show();
        window.location.reload();
    };
    useEffect(() => {
        console.log('GameCanvas useEffect'); // Debug
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        const player = {
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
        const currentLevel = levels[level];
        let { platforms, artifacts, shadows } = currentLevel;
        const keys = { right: false, left: false, jump: false };
        // Keyboard controls
        const handleKeyDown = (e) => {
            if (e.code === 'ArrowRight')
                keys.right = true;
            if (e.code === 'ArrowLeft')
                keys.left = true;
            if (e.code === 'Space')
                keys.jump = true;
        };
        const handleKeyUp = (e) => {
            if (e.code === 'ArrowRight')
                keys.right = false;
            if (e.code === 'ArrowLeft')
                keys.left = false;
            if (e.code === 'Space')
                keys.jump = false;
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        // Touch controls
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');
        const jumpButton = document.getElementById('jumpButton');
        const handleTouchStart = (action) => {
            if (action === 'left')
                keys.left = true;
            if (action === 'right')
                keys.right = true;
            if (action === 'jump') {
                keys.jump = true;
                tg.HapticFeedback.impactOccurred('medium');
            }
        };
        const handleTouchEnd = (action) => {
            if (action === 'left')
                keys.left = false;
            if (action === 'right')
                keys.right = false;
            if (action === 'jump')
                keys.jump = false;
        };
        leftButton?.addEventListener('touchstart', () => handleTouchStart('left'));
        leftButton?.addEventListener('touchend', () => handleTouchEnd('left'));
        rightButton?.addEventListener('touchstart', () => handleTouchStart('right'));
        rightButton?.addEventListener('touchend', () => handleTouchEnd('right'));
        jumpButton?.addEventListener('touchstart', () => handleTouchStart('jump'));
        jumpButton?.addEventListener('touchend', () => handleTouchEnd('jump'));
        // Telegram MainButton for Jump
        tg.MainButton.setText('Jump').show().onClick(() => {
            keys.jump = true;
            setTimeout(() => keys.jump = false, 100);
            tg.HapticFeedback.impactOccurred('medium');
        });
        const update = () => {
            if (gameOver)
                return;
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
            if (player.x < 0)
                player.x = 0;
            if (player.x + player.width > canvas.width)
                player.x = canvas.width - player.width;
            if (player.y > canvas.height) {
                endGame();
                return;
            }
            player.grounded = false;
            for (let platform of platforms) {
                if (player.x < platform.x + platform.width &&
                    player.x + player.width > platform.x &&
                    player.y + player.height > platform.y &&
                    player.y + player.height < platform.y + platform.height &&
                    player.dy > 0) {
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
                if (!artifact.collected &&
                    player.x < artifact.x + artifact.width &&
                    player.x + player.width > artifact.x &&
                    player.y < artifact.y + artifact.height &&
                    player.y + player.height > artifact.y) {
                    artifact.collected = true;
                    setScore(prev => prev + 10);
                    tg.HapticFeedback.notificationOccurred('success');
                }
            });
            shadows.forEach(shadow => {
                shadow.x += shadow.speed;
                shadow.animationScale = 1 + Math.sin(Date.now() / 200) * 0.1;
                if (shadow.x > canvas.width || shadow.x < 0)
                    shadow.speed = -shadow.speed;
                if (player.x < shadow.x + shadow.width &&
                    player.x + player.width > shadow.x &&
                    player.y < shadow.y + shadow.height &&
                    player.y + player.height > shadow.y) {
                    endGame();
                }
            });
            if (artifacts.every(artifact => artifact.collected)) {
                if (level < levels.length - 1) {
                    setLevel(prev => prev + 1);
                    player.x = 50;
                    player.y = canvas.height - 50;
                    player.dy = 0;
                    const nextLevel = levels[level + 1];
                    platforms = nextLevel.platforms;
                    artifacts = nextLevel.artifacts;
                    shadows = nextLevel.shadows;
                }
                else {
                    endGame();
                }
            }
            draw();
            requestAnimationFrame(update);
        };
        const draw = () => {
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#4a4a4a';
            for (let platform of platforms) {
                ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
            }
            ctx.fillStyle = `rgba(255, 68, 68, ${0.7 + Math.sin(player.animationFrame) * 0.3})`;
            ctx.fillRect(player.x, player.y, player.width, player.height);
            ctx.fillStyle = '#ffffff';
            for (let artifact of artifacts) {
                if (!artifact.collected) {
                    ctx.beginPath();
                    ctx.arc(artifact.x + artifact.width / 2, artifact.y + artifact.height / 2, artifact.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.fillStyle = '#000000';
            for (let shadow of shadows) {
                const scaledWidth = shadow.width * shadow.animationScale;
                const scaledHeight = shadow.height * shadow.animationScale;
                ctx.fillRect(shadow.x - (scaledWidth - shadow.width) / 2, shadow.y - (scaledHeight - shadow.height) / 2, scaledWidth, scaledHeight);
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
                const data = await response.json();
                setHighScore(data.highScore);
            }
            catch (error) {
                console.error('Error saving score:', error);
            }
        };
        const fetchHighScore = async () => {
            try {
                const response = await fetch(`/api/scores/${tg.initDataUnsafe.user.id}`);
                const data = await response.json();
                setHighScore(data.highScore || 0);
            }
            catch (error) {
                console.error('Error fetching high score:', error);
            }
        };
        update();
        fetchHighScore();
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
    return (_jsxs("div", { className: "flex flex-col items-center justify-center h-screen relative", children: [_jsxs("div", { className: "absolute top-4 left-4 text-white text-xl font-bold", children: ["Score: ", score, " | Level: ", level + 1, " | High Score: ", highScore] }), _jsx("canvas", { id: "gameCanvas", className: "border border-gray-700" }), _jsxs("div", { className: "absolute bottom-4 left-4 flex space-x-4", children: [_jsx("button", { id: "leftButton", className: "bg-gray-700 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl", children: "\u2190" }), _jsx("button", { id: "rightButton", className: "bg-gray-700 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl", children: "\u2192" })] }), _jsx("div", { className: "absolute bottom-4 right-4", children: _jsx("button", { id: "jumpButton", className: "bg-red-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl", children: "\u2191" }) }), gameOver && (_jsxs("div", { className: "absolute bg-black bg-opacity-80 p-8 rounded-lg text-center", children: [_jsx("h2", { className: "text-3xl text-red-600 mb-4", children: "Game Over" }), _jsxs("p", { className: "text-white mb-4", children: ["Final Score: ", score] }), _jsx("button", { onClick: restartGame, className: "bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700", children: "Restart" })] }))] }));
};
const App = () => {
    console.log('App rendering'); // Debug
    return (_jsx("div", { className: "bg-gray-900 min-h-screen", children: _jsx(GameCanvas, {}) }));
};
// Updated to modern ReactDOM.createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(_jsx(App, {}));
console.log('ReactDOM.createRoot called'); // Debug
