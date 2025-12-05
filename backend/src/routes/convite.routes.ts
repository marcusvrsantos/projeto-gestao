import { Router } from 'express';
import { listarConvitesPorEvento, adicionarConvidados, removerConvidado, dispararConvites, buscarPorToken, responderConvite } from '../controllers/conviteController';

const router = Router();

router.get('/:eventoId', listarConvitesPorEvento);
router.post('/adicionar', adicionarConvidados);
router.post('/disparar', dispararConvites);
router.delete('/:id', removerConvidado);

// Rotas Públicas (Usam o Token)
router.get('/publico/:token', buscarPorToken);
router.post('/responder/:token', responderConvite);

export default router;
