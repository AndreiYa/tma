import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

// Типы
interface Score {
    [userId: string]: number;
}

interface ScoreRequest {
    userId: string;
    score: number;
}

const app = express();
const port = 3000;

// Временное хранилище (замените на MongoDB для продакшена)
const scores: Score = {};

app.use(cors());
app.use(express.json());

// Настройка отдачи статических файлов из Vite dist
app.use(express.static(path.join(__dirname, 'dist')));

// Маршрут для корневого пути
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.post('/api/scores', (req: Request<{}, {}, ScoreRequest>, res: Response) => {
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

app.get('/api/scores/:userId', (req: Request<{ userId: string }>, res: Response) => {
    const { userId } = req.params;
    res.json({ highScore: scores[userId] || 0 });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});