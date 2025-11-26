import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rota de Teste (Health Check)
app.get('/', async (req, res) => {
  try {
    // Tenta contar quantos usuários existem só para testar o banco
    const count = await prisma.usuario.count(); 
    res.json({ 
      status: 'online', 
      db_connection: 'ok', 
      usuarios_cadastrados: count,
      message: 'API Gestão Corporativa rodando 🚀' 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Erro ao conectar no banco', error });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
