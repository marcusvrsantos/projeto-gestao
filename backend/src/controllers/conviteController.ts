import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { enviarEmail } from '../services/emailService';

const prisma = new PrismaClient();

// ... (Funções anteriores mantidas: listar, adicionar, remover, buscarPorToken, responder) ...
export const listarConvitesPorEvento = async (req: Request, res: Response) => {
  try {
    const { eventoId } = req.params;
    const convites = await prisma.convite.findMany({ where: { eventoId }, orderBy: { nomeConvidado: 'asc' } });
    res.json(convites);
  } catch (error) { res.status(500).json({ error: 'Erro ao listar' }); }
};

export const adicionarConvidados = async (req: Request, res: Response) => {
  try {
    const { eventoId, listaPessoas } = req.body;
    const criados = [];
    for (const pessoa of listaPessoas) {
      const jaExiste = await prisma.convite.findFirst({ where: { eventoId, emailConvidado: pessoa.email } });
      if (!jaExiste) {
        const token = Math.random().toString(36).substring(2, 15);
        const convite = await prisma.convite.create({
          data: { eventoId, nomeConvidado: pessoa.nome, emailConvidado: pessoa.email, token, status: 'PENDENTE' }
        });
        criados.push(convite);
      }
    }
    res.status(201).json({ message: `${criados.length} convites adicionados.`, criados });
  } catch (error: any) { res.status(400).json({ error: 'Erro ao adicionar' }); }
};

export const removerConvidado = async (req: Request, res: Response) => {
  try { await prisma.convite.delete({ where: { id: req.params.id } }); res.status(204).send(); } 
  catch (error) { res.status(400).json({ error: 'Erro ao remover' }); }
};

export const buscarPorToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const convite = await prisma.convite.findUnique({ where: { token }, include: { evento: true } });
    if (!convite) return res.status(404).json({ error: 'Convite inválido.' });
    res.json(convite);
  } catch (error) { res.status(500).json({ error: 'Erro ao buscar' }); }
};

export const responderConvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { status } = req.body;
    const convite = await prisma.convite.update({ where: { token }, data: { status } });
    res.json(convite);
  } catch (error) { res.status(400).json({ error: 'Erro ao responder' }); }
};

export const dispararConvites = async (req: Request, res: Response) => {
  try {
    const { eventoId } = req.body;
    const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
    const convitesPendentes = await prisma.convite.findMany({ where: { eventoId, status: 'PENDENTE' } });

    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });

    let enviados = 0;

   const baseURL = "https://super-engine-r4rgggrr6qxv2xjj7-5173.app.github.dev"; 
    
    for (const convite of convitesPendentes) {
      const linkConfirmacao = `${baseURL}/confirmar/${convite.token}`;
      
      const assunto = `Convite: ${evento.nome}`;
      const corpo = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #A6192E;">Olá, ${convite.nomeConvidado}!</h2>
          <p>Você é nosso convidado especial para o evento <strong>${evento.nome}</strong>.</p>
          <p>
            📅 <strong>Data:</strong> ${new Date(evento.data).toLocaleString()}<br>
            📍 <strong>Local:</strong> ${evento.local || 'A definir'}
          </p>
          <br>
          <a href="${linkConfirmacao}" style="background-color: #A6192E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            RESPONDER CONVITE
          </a>
          <br><br>
          <p style="font-size: 12px; color: #999;">Link: ${linkConfirmacao}</p>
        </div>
      `;

      await enviarEmail(convite.emailConvidado, assunto, corpo);
      enviados++;
    }

    res.json({ message: `${enviados} convites enviados!` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao disparar e-mails' });
  }
};
