import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto_mudar_em_prod';

// Criptografa a senha
export const hashSenha = async (senha: string) => {
  return await bcrypt.hash(senha, 10);
};

// Compara senha enviada com o hash do banco
export const checarSenha = async (senha: string, hash: string) => {
  return await bcrypt.compare(senha, hash);
};

// Gera o Token JWT
export const gerarToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
};
