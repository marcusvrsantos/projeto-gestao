import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const empresa = await prisma.empresa.create({
    data: {
      razaoSocial: 'ISG Participações S.A.',
      cnpj: '00.000.000/0001-00', // CNPJ Fictício
      nomeFantasia: 'ISG'
    }
  });
  console.log('Empresa criada com ID:', empresa.id);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
