import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use('/auth', authRoutes);

// Health Check
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'API Gestão Corporativa rodando 🚀' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
