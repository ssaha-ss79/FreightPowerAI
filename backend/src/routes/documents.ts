import express from 'express';
import multer, { StorageEngine } from 'multer';
import * as documentsController from '../controllers/documentsController';

const documentsRouter = express.Router();

// Multer setup for file uploads
const storage: StorageEngine = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, 'uploads/documents/');
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

documentsRouter.post('/upload', upload.single('file'), documentsController.uploadDocument);
documentsRouter.get('/list', documentsController.listDocuments);
documentsRouter.get('/:id', documentsController.getDocument);

// Serve uploaded document files
documentsRouter.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = require('path').join(process.cwd(), 'uploads/documents', filename);
  res.sendFile(filePath, err => {
    if (err) {
      res.status(404).json({ error: 'File not found' });
    }
  });
});

export default documentsRouter;
