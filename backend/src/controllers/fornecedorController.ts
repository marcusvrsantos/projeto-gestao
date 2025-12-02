import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { fornecedorSchema } from '../schemas';

const prisma = new PrismaClient();

export const listarFornecedores = async (req: Request, res: Response) => {
  const fornecedores = await prisma.fornecedor.findMany({
    orderBy: { nome: 'asc' }
  });
  res.json(fornecedores);
};

export const criarFornecedor = async (req: Request, res: Response) => {
  try {
    const dados = fornecedorSchema.parse(req.body);

    const existe = await prisma.fornecedor.findUnique({
      where: { cnpjOuCpf: dados.cnpjOuCpf }
    });

    if (existe) {
      return res.status(400).json({ error: 'Fornecedor já cadastrado com este CNPJ.' });
    }

    const fornecedor = await prisma.fornecedor.create({
      data: {
        nome: dados.nome,
        cnpjOuCpf: dados.cnpjOuCpf,
        categoria: dados.categoria,
        telefone: dados.telefone,
        email: dados.email,
        responsavel: dados.responsavel
      }
    });

    res.status(201).json(fornecedor);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

// --- NOVA FUNÇÃO DE EDIÇÃO ---
export const atualizarFornecedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Valida os dados recebidos (usa o mesmo schema de criação)
    const dados = fornecedorSchema.parse(req.body);

    const fornecedor = await prisma.fornecedor.update({
      where: { id },
      data: {
        nome: dados.nome,
        cnpjOuCpf: dados.cnpjOuCpf,
        categoria: dados.categoria,
        telefone: dados.telefone,
        email: dados.email,
        responsavel: dados.responsavel
      }
    });

    res.json(fornecedor);
  } catch (error: any) {
    // Erro P2025 do Prisma significa "Registro não encontrado"
    if (error.code === 'P2025') return res.status(404).json({ error: 'Fornecedor não encontrado' });
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const deletarFornecedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.fornecedor.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar' });
  }
};
