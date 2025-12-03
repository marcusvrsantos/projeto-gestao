import { Router } from 'express';
import { listarEventos, criarEvento, deletarEvento, atualizarEvento } from '../controllers/eventoController';

const router = Router();

router.get('/', listarEventos);
router.post('/', criarEvento);
router.put('/:id', atualizarEvento); // <--- Nova rota de edição
router.delete('/:id', deletarEvento);

export default router;
