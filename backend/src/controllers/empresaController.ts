import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listarEmpresas = async (req: Request, res: Response) => {
  const empresas = await prisma.empresa.findMany();
  res.json(empresas);
};
