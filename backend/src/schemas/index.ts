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
  cpf: z.string().optional(),
  setor: z.string().optional(),
  dataNascimento: z.string().optional() 
});

export const fornecedorSchema = z.object({
  nome: z.string().min(2, "Razão Social é obrigatória"),
  cnpjOuCpf: z.string().min(11, "CNPJ inválido"),
  categoria: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  responsavel: z.string().optional()
});

// Novo Schema de Evento
export const eventoSchema = z.object({
  nome: z.string().min(3, "Nome do evento é obrigatório"),
  data: z.string(), // Recebe como string do front (ISO date)
  local: z.string().optional(),
  descricao: z.string().optional(),
  status: z.enum(["AGENDADO", "REALIZADO", "CANCELADO"]).optional()
});
