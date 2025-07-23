import express from 'express';
import * as documentsController from '../controllers/documentsController';

const documentsRouter = express.Router();

documentsRouter.post('/upload', documentsController.uploadDocument);
documentsRouter.get('/list', documentsController.listDocuments);
documentsRouter.get('/:id', documentsController.getDocument);

export default documentsRouter;
