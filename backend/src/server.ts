import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import colaboradorRoutes from './routes/colaborador.routes';
import empresaRoutes from './routes/empresa.routes';
import fornecedorRoutes from './routes/fornecedor.routes';
import dashboardRoutes from './routes/dashboard.routes'; // <--- Import novo

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/colaboradores', colaboradorRoutes);
app.use('/empresas', empresaRoutes);
app.use('/fornecedores', fornecedorRoutes);
app.use('/dashboard', dashboardRoutes); // <--- Rota nova

app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'API Gestão Corporativa rodando 🚀' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
