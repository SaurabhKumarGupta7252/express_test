import { Router } from 'express';
import { register } from './users.controller.js';

const usersRouter = Router();

usersRouter.post('/', register);

export default usersRouter;
