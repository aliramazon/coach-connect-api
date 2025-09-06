import 'dotenv/config';
import { createApp } from './app';
import { GlobalError } from './middlewares/global-error.middleware';

const app = createApp();

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
    if (HOST === 'localhost') {
        console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    } else {
        console.log(`🚀 Server running on port ${PORT}`);
    }
});

process.on('unhandledRejection', GlobalError.handleUnhandledRejection);
process.on('uncaughtException', GlobalError.handleUncaughtException);
