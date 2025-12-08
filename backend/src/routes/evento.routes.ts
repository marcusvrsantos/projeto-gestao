import { Router } from 'express';
// Note que adicionei "obterEvento" na importação abaixo
import { listarEventos, criarEvento, deletarEvento, atualizarEvento, obterEvento } from '../controllers/eventoController';

const router = Router();

router.get('/', listarEventos);
router.get('/:id', obterEvento); // <--- AQUI ESTÁ A CORREÇÃO! (Rota GET individual)
router.post('/', criarEvento);
router.put('/:id', atualizarEvento);
router.delete('/:id', deletarEvento);

export default router;