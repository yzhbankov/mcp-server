import express from 'express';
import controllers from './controllers';

const router = express.Router();

router.post('/mcp', controllers.zones.post);

export default router;
