import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { eventoSchema } from '../schemas';

const prisma = new PrismaClient();

export const listarEventos = async (req: Request, res: Response) => {
  const eventos = await prisma.evento.findMany({
    orderBy: { data: 'asc' }
  });
  res.json(eventos);
};

export const criarEvento = async (req: Request, res: Response) => {
  try {
    const dados = eventoSchema.parse(req.body);

    const evento = await prisma.evento.create({
      data: {
        nome: dados.nome,
        data: new Date(dados.data),
        local: dados.local,
        descricao: dados.descricao,
        status: dados.status as any || 'AGENDADO'
      }
    });

    res.status(201).json(evento);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

// --- NOVA FUNÇÃO DE ATUALIZAR ---
export const atualizarEvento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dados = eventoSchema.parse(req.body);

    const evento = await prisma.evento.update({
      where: { id },
      data: {
        nome: dados.nome,
        data: new Date(dados.data),
        local: dados.local,
        descricao: dados.descricao,
        status: dados.status as any
      }
    });
    res.json(evento);
  } catch (error: any) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Evento não encontrado' });
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const deletarEvento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.evento.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar' });
  }
};
