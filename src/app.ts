import cors from 'cors';
import express from 'express';
import { corsOptions } from './config/cors';
import { GlobalError } from './middlewares/global-error.middleware';
import { userRouter } from './routes/user.routes';

export const createApp = () => {
    const app = express();

    app.use(cors(corsOptions));
    app.use(express.json());

    app.get('/healthz', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api/users', userRouter);

    app.use(GlobalError.notFound);
    app.use(GlobalError.handle);

    return app;
};
