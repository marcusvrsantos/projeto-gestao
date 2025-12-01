import { Router } from 'express';
import { listarColaboradores, criarColaborador, deletarColaborador } from '../controllers/colaboradorController';
// Middleware que garante que só quem tem Token pode acessar
import { authMiddleware } from '../middlewares/auth'; 

const router = Router();

// Vamos criar o middleware simples aqui mesmo se ele não existir ainda
// (Em um projeto maior, ficaria em arquivo separado)
router.use(async (req, res, next) => {
  // Por enquanto, vamos deixar aberto para facilitar o teste, 
  // mas na próxima etapa travamos com o Token.
  next(); 
});

router.get('/', listarColaboradores);
router.post('/', criarColaborador);
router.delete('/:id', deletarColaborador);

export default router;
