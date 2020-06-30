import { Router } from 'express';

import transactionsRouter from './transactions.routes';
import categoriesRoutes from './categories.routes';

const routes = Router();

routes.use('/transactions', transactionsRouter);
routes.use('/categories', categoriesRoutes);

export default routes;
