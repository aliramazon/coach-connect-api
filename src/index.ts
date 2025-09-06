import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
