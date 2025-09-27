import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { corsOptions } from './config/cors';
import { GlobalError } from './middlewares/global-error.middleware';
import { slotRouter } from './routes/slot.routes';
import { userRouter } from './routes/user.routes';

export const createApp = () => {
    const app = express();

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(cookieParser());

    app.get('/healthz', (_req, res) => {
        res.json({ status: 'ok' });
    });

    app.use('/api/users', userRouter);
    app.use('/api/slots', slotRouter);

    app.use(GlobalError.notFound);
    app.use(GlobalError.handle);

    return app;
};
