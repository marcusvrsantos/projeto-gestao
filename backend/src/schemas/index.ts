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
  nome: z.string().min(2),
  cnpjOuCpf: z.string().min(11),
  categoria: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  responsavel: z.string().optional()
});

export const eventoSchema = z.object({
  nome: z.string().min(3),
  data: z.string(),
  local: z.string().optional(),
  descricao: z.string().optional(),
  status: z.enum(["AGENDADO", "REALIZADO", "CANCELADO"]).optional()
});

export const orcamentoSchema = z.object({
  valor: z.number().min(0),
  status: z.enum(["PENDENTE", "APROVADO", "REJEITADO"]).optional(),
  formaPagto: z.string().optional(),
  eventoId: z.string().uuid(),
  fornecedorId: z.string().uuid()
});

// Novo Schema para Convidado Externo
export const convidadoExternoSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  empresa: z.string().optional(),
  cargo: z.string().optional()
});
export * from './empresaSchema';
