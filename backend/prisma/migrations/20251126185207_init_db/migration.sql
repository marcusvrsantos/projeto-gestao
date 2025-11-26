-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTOR', 'USER');

-- CreateEnum
CREATE TYPE "StatusOrcamento" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO');

-- CreateEnum
CREATE TYPE "StatusConvite" AS ENUM ('PENDENTE', 'CONFIRMADO', 'RECUSADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cargo" TEXT,
    "empresaId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Colaborador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpjOuCpf" TEXT NOT NULL,
    "categoria" TEXT,
    "telefone" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id" TEXT NOT NULL,
    "nomeArquivo" TEXT NOT NULL,
    "caminho" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "local" TEXT,
    "descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orcamento" (
    "id" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "status" "StatusOrcamento" NOT NULL DEFAULT 'PENDENTE',
    "formaPagto" TEXT,
    "eventoId" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Orcamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convite" (
    "id" TEXT NOT NULL,
    "emailConvidado" TEXT NOT NULL,
    "nomeConvidado" TEXT,
    "status" "StatusConvite" NOT NULL DEFAULT 'PENDENTE',
    "acompanhantes" INTEGER NOT NULL DEFAULT 0,
    "eventoId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "enviadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Convite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cnpj_key" ON "Empresa"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Colaborador_email_key" ON "Colaborador"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpjOuCpf_key" ON "Fornecedor"("cnpjOuCpf");

-- CreateIndex
CREATE UNIQUE INDEX "Convite_token_key" ON "Convite"("token");

-- AddForeignKey
ALTER TABLE "Colaborador" ADD CONSTRAINT "Colaborador_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documento" ADD CONSTRAINT "Documento_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orcamento" ADD CONSTRAINT "Orcamento_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convite" ADD CONSTRAINT "Convite_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
