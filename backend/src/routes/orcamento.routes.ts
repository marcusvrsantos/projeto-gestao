import { Router } from 'express';
import { listarOrcamentos, criarOrcamento, deletarOrcamento, solicitarOrcamento } from '../controllers/orcamentoController';

const router = Router();

router.get('/', listarOrcamentos);
router.post('/', criarOrcamento);
router.delete('/:id', deletarOrcamento);
router.post('/solicitar', solicitarOrcamento); // Rota de envio de e-mail

export default router;
