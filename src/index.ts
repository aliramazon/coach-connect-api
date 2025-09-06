import cors from 'cors';
import 'dotenv/config';
import express from 'express';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
});

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
    if (HOST === 'localhost') {
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    } else {
        console.log(`🚀 Server running on port ${PORT}`);
    }
});
