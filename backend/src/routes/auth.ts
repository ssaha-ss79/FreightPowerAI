import express from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/register', userController.register);

export default authRouter;
