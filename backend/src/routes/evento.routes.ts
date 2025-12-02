import { Router } from 'express';
import { listarEventos, criarEvento, deletarEvento } from '../controllers/eventoController';

const router = Router();

router.get('/', listarEventos);
router.post('/', criarEvento);
router.delete('/:id', deletarEvento);

export default router;
