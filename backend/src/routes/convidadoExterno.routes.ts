import { Router } from 'express';
// Importando as funções exatas que você mostrou no seu arquivo
import { listar, criar, atualizar, deletar } from '../controllers/convidadoExternoController';

const router = Router();

router.get('/', listar);          // GET /externos
router.post('/', criar);          // POST /externos
router.put('/:id', atualizar);    // PUT /externos/:id
router.delete('/:id', deletar);   // DELETE /externos/:id

export default router;