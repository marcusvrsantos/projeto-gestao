import { Router } from 'express';
import { listarColaboradores, criarColaborador, deletarColaborador, atualizarColaborador } from '../controllers/colaboradorController';

const router = Router();

router.use(async (req, res, next) => { next(); });

router.get('/', listarColaboradores);
router.post('/', criarColaborador);
router.put('/:id', atualizarColaborador); // <--- Nova rota de edição
router.delete('/:id', deletarColaborador);

export default router;
