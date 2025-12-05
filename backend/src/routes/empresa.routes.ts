import { Router } from 'express';
import { listarEmpresas, criarEmpresa, deletarEmpresa } from '../controllers/empresaController';

const router = Router();

router.get('/', listarEmpresas);
router.post('/', criarEmpresa);   // <--- Essa linha é fundamental!
router.delete('/:id', deletarEmpresa);

export default router;
