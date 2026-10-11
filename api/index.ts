import express from 'express';
import cors from 'cors';
import { apiRouter } from '../src/server/api.ts';

const app = express();

app.use(cors());
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
