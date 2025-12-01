import { Router } from 'express';
import { listarFornecedores, criarFornecedor, deletarFornecedor } from '../controllers/fornecedorController';

const router = Router();

router.get('/', listarFornecedores);
router.post('/', criarFornecedor);
router.delete('/:id', deletarFornecedor);

export default router;
