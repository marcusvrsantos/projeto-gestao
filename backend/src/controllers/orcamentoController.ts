import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { orcamentoSchema } from '../schemas';
import { enviarEmail } from '../services/emailService';

const prisma = new PrismaClient();

// Lista todos os orçamentos (F4.2 Planilha)
export const listarOrcamentos = async (req: Request, res: Response) => {
  const orcamentos = await prisma.orcamento.findMany({
    include: {
      fornecedor: true,
      evento: true
    },
    orderBy: { criadoEm: 'desc' }
  });
  res.json(orcamentos);
};

// Registra um orçamento recebido
export const criarOrcamento = async (req: Request, res: Response) => {
  try {
    const dados = orcamentoSchema.parse(req.body);
    const orcamento = await prisma.orcamento.create({
      data: {
        valor: dados.valor,
        status: dados.status as any || 'PENDENTE',
        formaPagto: dados.formaPagto,
        eventoId: dados.eventoId,
        fornecedorId: dados.fornecedorId
      }
    });
    res.status(201).json(orcamento);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar orçamento
export const deletarOrcamento = async (req: Request, res: Response) => {
  try {
    await prisma.orcamento.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao deletar' });
  }
};

// F4.1 - Solicitar Orçamento por E-mail
export const solicitarOrcamento = async (req: Request, res: Response) => {
  try {
    const { fornecedorId, eventoId, mensagemPersonalizada } = req.body;

    // Busca dados para montar o e-mail
    const fornecedor = await prisma.fornecedor.findUnique({ where: { id: fornecedorId } });
    const evento = await prisma.evento.findUnique({ where: { id: eventoId } });

    if (!fornecedor || !evento) return res.status(404).json({ error: 'Fornecedor ou Evento não encontrado' });
    if (!fornecedor.email) return res.status(400).json({ error: 'Fornecedor não possui e-mail cadastrado.' });

    // Monta o e-mail
    const assunto = `Solicitação de Orçamento - ${evento.nome}`;
    const corpo = mensagemPersonalizada || `Olá ${fornecedor.nome}, gostaríamos de um orçamento para o evento ${evento.nome} que ocorrerá em ${new Date(evento.data).toLocaleDateString()}.`;

    // Envia (Simulação Ethereal)
    await enviarEmail(fornecedor.email, assunto, corpo);

    res.json({ message: 'Solicitação enviada com sucesso!' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao enviar e-mail' });
  }
};
