import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { empresaSchema } from '../schemas/empresaSchema';

const prisma = new PrismaClient();

export const listarEmpresas = async (req: Request, res: Response) => {
  const empresas = await prisma.empresa.findMany({
    orderBy: { razaoSocial: 'asc' }
  });
  res.json(empresas);
};

export const criarEmpresa = async (req: Request, res: Response) => {
  try {
    const dados = empresaSchema.parse(req.body);

    // Verifica duplicidade
    const existe = await prisma.empresa.findUnique({
      where: { cnpj: dados.cnpj }
    });

    if (existe) {
      return res.status(400).json({ error: 'CNPJ já cadastrado.' });
    }

    const empresa = await prisma.empresa.create({
      data: {
        razaoSocial: dados.razaoSocial,
        cnpj: dados.cnpj,
        nomeFantasia: dados.nomeFantasia
      }
    });

    res.status(201).json(empresa);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const deletarEmpresa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Verifica se tem colaboradores antes de deletar
    const temColaboradores = await prisma.colaborador.findFirst({ where: { empresaId: id }});
    if (temColaboradores) {
        return res.status(400).json({ error: 'Não é possível excluir: existem colaboradores nesta unidade.' });
    }

    await prisma.empresa.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar' });
  }
};
