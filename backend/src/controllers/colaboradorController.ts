import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { colaboradorSchema } from '../schemas';

const prisma = new PrismaClient();

export const listarColaboradores = async (req: Request, res: Response) => {
  try {
    const colaboradores = await prisma.colaborador.findMany({
      orderBy: { nome: 'asc' },
      include: { empresa: true }
    });
    res.json(colaboradores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar colaboradores' });
  }
};

export const criarColaborador = async (req: Request, res: Response) => {
  try {
    const dados = colaboradorSchema.parse(req.body);

    const existe = await prisma.colaborador.findUnique({
      where: { email: dados.email }
    });
    
    if (existe) {
      return res.status(400).json({ error: 'Já existe um colaborador com este e-mail.' });
    }

    // Converte a data de string para objeto Date do Javascript (se existir)
    const dataNascFormatada = dados.dataNascimento ? new Date(dados.dataNascimento) : null;

    const colaborador = await prisma.colaborador.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        cargo: dados.cargo,
        empresaId: dados.empresaId,
        cpf: dados.cpf,
        setor: dados.setor,
        dataNascimento: dataNascFormatada
      }
    });

    res.status(201).json(colaborador);
  } catch (error: any) {
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(400).json({ error: error.message || 'Erro ao criar colaborador' });
  }
};

export const deletarColaborador = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.colaborador.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar' });
  }
};
