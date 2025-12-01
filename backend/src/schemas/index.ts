import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
});

export const registroSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  email: z.string().email(),
  senha: z.string().min(6),
  role: z.enum(["ADMIN", "GESTOR", "USER"]).optional()
});

export const colaboradorSchema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  cargo: z.string().optional(),
  empresaId: z.string().uuid("ID da empresa inválido"),
  // Novos campos:
  cpf: z.string().optional(),
  setor: z.string().optional(),
  // A data vem como string do frontend (YYYY-MM-DD), validamos se é string
  dataNascimento: z.string().optional() 
});

export const fornecedorSchema = z.object({
  nome: z.string().min(2),
  cnpjOuCpf: z.string().min(11, "Documento inválido"),
  categoria: z.string().optional(),
  telefone: z.string().optional()
});
