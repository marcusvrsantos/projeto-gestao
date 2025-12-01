import { Router } from 'express';
import { listarEmpresas } from '../controllers/empresaController';

const router = Router();
router.get('/', listarEmpresas);

export default router;
