-- CreateEnum
CREATE TYPE "StatusEvento" AS ENUM ('AGENDADO', 'REALIZADO', 'CANCELADO');

-- AlterTable
ALTER TABLE "Evento" ADD COLUMN     "status" "StatusEvento" NOT NULL DEFAULT 'AGENDADO';
