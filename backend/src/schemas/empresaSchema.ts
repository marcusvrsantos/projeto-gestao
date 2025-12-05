import { z } from 'zod';

export const empresaSchema = z.object({
  razaoSocial: z.string().min(2, "Razão Social obrigatória"),
  cnpj: z.string().min(14, "CNPJ deve ter 14 dígitos"), // Aceita string
  nomeFantasia: z.string().optional()
});
