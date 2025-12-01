import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { colaboradorSchema } from '../schemas';

const prisma = new PrismaClient();

// Listar todos os colaboradores
export const listarColaboradores = async (req: Request, res: Response) => {
  try {
    const colaboradores = await prisma.colaborador.findMany({
      orderBy: { nome: 'asc' },
      include: { empresa: true } // Já traz os dados da empresa vinculada
    });
    res.json(colaboradores);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar colaboradores' });
  }
};

// Criar novo colaborador
export const criarColaborador = async (req: Request, res: Response) => {
  try {
    // 1. Valida os dados (Zod)
    const dados = colaboradorSchema.parse(req.body);

    // 2. Verifica se email já existe
    const existe = await prisma.colaborador.findUnique({
      where: { email: dados.email }
    });
    
    if (existe) {
      return res.status(400).json({ error: 'Já existe um colaborador com este e-mail.' });
    }

    // 3. Salva no banco
    const colaborador = await prisma.colaborador.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        cargo: dados.cargo,
        empresaId: dados.empresaId
      }
    });

    res.status(201).json(colaborador);
  } catch (error: any) {
    // Retorna erro amigável se for validação do Zod
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(400).json({ error: error.message || 'Erro ao criar colaborador' });
  }
};

// Deletar colaborador
export const deletarColaborador = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.colaborador.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar (verifique se ele não tem vínculos)' });
  }
};
