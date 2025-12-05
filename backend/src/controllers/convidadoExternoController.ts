import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { convidadoExternoSchema } from '../schemas';

const prisma = new PrismaClient();

export const listar = async (req: Request, res: Response) => {
  const lista = await prisma.convidadoExterno.findMany({ orderBy: { nome: 'asc' } });
  res.json(lista);
};

export const criar = async (req: Request, res: Response) => {
  try {
    const dados = convidadoExternoSchema.parse(req.body);
    const existe = await prisma.convidadoExterno.findUnique({ where: { email: dados.email } });
    if (existe) return res.status(400).json({ error: 'E-mail já cadastrado.' });

    const novo = await prisma.convidadoExterno.create({ data: dados });
    res.status(201).json(novo);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const atualizar = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dados = convidadoExternoSchema.parse(req.body);
    const atualizado = await prisma.convidadoExterno.update({ where: { id }, data: dados });
    res.json(atualizado);
  } catch (error: any) {
    res.status(400).json({ error: 'Erro ao atualizar' });
  }
};

export const deletar = async (req: Request, res: Response) => {
  try {
    await prisma.convidadoExterno.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar' });
  }
};
