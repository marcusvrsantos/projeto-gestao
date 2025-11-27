import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { registroSchema, loginSchema } from '../schemas';
import { hashSenha, checarSenha, gerarToken } from '../utils/auth';

const prisma = new PrismaClient();

export const registrar = async (req: Request, res: Response) => {
  try {
    // 1. Valida os dados com Zod
    const dados = registroSchema.parse(req.body);

    // 2. Verifica se já existe
    const existe = await prisma.usuario.findUnique({ where: { email: dados.email } });
    if (existe) return res.status(400).json({ error: 'E-mail já cadastrado' });

    // 3. Cria usuário com senha criptografada
    const senhaHash = await hashSenha(dados.senha);
    const usuario = await prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
        role: dados.role || 'USER' // Se não vier, cria como USER
      }
    });

    // 4. Remove a senha do retorno
    const { senha, ...userSemSenha } = usuario;

    res.status(201).json(userSemSenha);
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const dados = loginSchema.parse(req.body);

    // 1. Busca usuário
    const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } });
    if (!usuario) return res.status(401).json({ error: 'Credenciais inválidas' });

    // 2. Checa senha
    const senhaValida = await checarSenha(dados.senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ error: 'Credenciais inválidas' });

    // 3. Gera token
    const token = gerarToken({ id: usuario.id, role: usuario.role });

    res.json({ 
      token, 
      user: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role } 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.errors || error.message });
  }
};
