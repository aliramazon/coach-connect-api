import { CorsOptions } from 'cors';

const whitelist = ['https://coach-connect-ui.onrender.com'];

// Add localhost only in development
if (process.env.NODE_ENV === 'development') {
    whitelist.push('http://localhost:5173');
}

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
