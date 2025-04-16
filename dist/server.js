import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
// Derive __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;
// Временное хранилище (замените на MongoDB для продакшена)
const scores = {};
app.use(cors());
app.use(express.json());
// Настройка отдачи статических файлов из Vite dist
app.use(express.static(path.join(__dirname, 'dist')));
// Маршрут для корневого пути
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
app.post('/api/scores', (req, res) => {
    const { userId, score } = req.body;
    if (!userId || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const currentHighScore = scores[userId] || 0;
    if (score > currentHighScore) {
        scores[userId] = score;
    }
    res.json({ highScore: scores[userId] });
});
app.get('/api/scores/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({ highScore: scores[userId] || 0 });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
