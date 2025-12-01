import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Executa todas as contagens em paralelo (muito mais rápido)
    const [totalColaboradores, totalFornecedores, totalEventos] = await Promise.all([
      prisma.colaborador.count(),
      prisma.fornecedor.count(),
      prisma.evento.count()
    ]);

    // Retorna o objeto com os totais
    res.json({
      colaboradores: totalColaboradores,
      fornecedores: totalFornecedores,
      eventos: totalEventos,
      orcamentos: 0 // Placeholder por enquanto
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar estatísticas' });
  }
};
