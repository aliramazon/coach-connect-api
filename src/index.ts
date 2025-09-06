import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { GlobalError } from './middlewares/global-error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(GlobalError.notFound);

app.use(GlobalError.handle);

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
    if (HOST === 'localhost') {
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    } else {
        console.log(`🚀 Server running on port ${PORT}`);
    }
});

// Global process-level error handling
process.on('unhandledRejection', GlobalError.handleUnhandledRejection);
process.on('uncaughtException', GlobalError.handleUncaughtException);
