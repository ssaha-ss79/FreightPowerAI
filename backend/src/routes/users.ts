import express from 'express';
import * as userController from '../controllers/userController';
const { authenticateToken } = require('../middleware/auth');

const usersRouter = express.Router();

usersRouter.post('/register', userController.register);
usersRouter.get('/profile', authenticateToken, userController.getUserProfile);
usersRouter.get('/', userController.getAllUsers);
usersRouter.get('/:id', userController.getUserById);

export default usersRouter;
