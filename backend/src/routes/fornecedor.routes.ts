import { Router } from 'express';
import { listarFornecedores, criarFornecedor, deletarFornecedor, atualizarFornecedor } from '../controllers/fornecedorController';

const router = Router();

router.get('/', listarFornecedores);
router.post('/', criarFornecedor);
router.put('/:id', atualizarFornecedor); // <--- Rota de Edição
router.delete('/:id', deletarFornecedor);

export default router;
