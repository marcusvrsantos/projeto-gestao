import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { enviarEmail } from '../services/emailService';

const prisma = new PrismaClient();

export const listarConvitesPorEvento = async (req: Request, res: Response) => {
  try {
    const { eventoId } = req.params;
    const convites = await prisma.convite.findMany({
      where: { eventoId },
      orderBy: { nomeConvidado: 'asc' }
    });
    res.json(convites);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar convites' });
  }
};

export const adicionarConvidados = async (req: Request, res: Response) => {
  try {
    const { eventoId, listaPessoas } = req.body;
    const criados = [];
    
    for (const pessoa of listaPessoas) {
      const jaExiste = await prisma.convite.findFirst({
        where: { eventoId, emailConvidado: pessoa.email }
      });

      if (!jaExiste) {
        const token = Math.random().toString(36).substring(2, 15); // Token mais longo e seguro
        const convite = await prisma.convite.create({
          data: {
            eventoId,
            nomeConvidado: pessoa.nome,
            emailConvidado: pessoa.email,
            token,
            status: 'PENDENTE'
          }
        });
        criados.push(convite);
      }
    }
    res.status(201).json({ message: `${criados.length} convites adicionados.`, criados });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: 'Erro ao adicionar convidados' });
  }
};

export const removerConvidado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.convite.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Erro ao remover' });
  }
};

// --- NOVAS FUNÇÕES PÚBLICAS ---

// 1. Busca os dados do convite pelo Token (sem login)
export const buscarPorToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const convite = await prisma.convite.findUnique({
      where: { token },
      include: { evento: true } // Traz dados do evento para mostrar na tela
    });

    if (!convite) return res.status(404).json({ error: 'Convite inválido ou expirado.' });

    res.json(convite);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar convite' });
  }
};

// 2. Atualiza o status (Confirmar/Recusar) pelo Token
export const responderConvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { status } = req.body; // CONFIRMADO ou RECUSADO

    const convite = await prisma.convite.update({
      where: { token },
      data: { status }
    });

    res.json(convite);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao responder convite' });
  }
};

// 3. Disparo de E-mails (Atualizado com link LOCALHOST)
export const dispararConvites = async (req: Request, res: Response) => {
  try {
    const { eventoId } = req.body;
    
    const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
    const convitesPendentes = await prisma.convite.findMany({ 
      where: { eventoId, status: 'PENDENTE' } 
    });

    if (!evento) return res.status(404).json({ error: 'Evento não encontrado' });

    let enviados = 0;

    for (const convite of convitesPendentes) {
      // LINK REAL PARA SEU AMBIENTE LOCAL
      // Quando for pra produção, trocaremos localhost pelo domínio real
      const linkConfirmacao = `http://localhost:5173/confirmar/${convite.token}`;
      
      const assunto = `Convite: ${evento.nome}`;
      const corpo = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #A6192E;">Olá, ${convite.nomeConvidado}!</h2>
          <p>Você é nosso convidado especial para o evento <strong>${evento.nome}</strong>.</p>
          <p>
            📅 <strong>Data:</strong> ${new Date(evento.data).toLocaleString()}<br>
            📍 <strong>Local:</strong> ${evento.local || 'A definir'}
          </p>
          <p>Por favor, confirme sua presença clicando no botão abaixo:</p>
          <br>
          <a href="${linkConfirmacao}" style="background-color: #A6192E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            RESPONDER CONVITE
          </a>
          <br><br>
          <p style="font-size: 12px; color: #999;">Caso não consiga clicar, acesse: ${linkConfirmacao}</p>
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
