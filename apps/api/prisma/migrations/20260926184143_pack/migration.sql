-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ProductState" ADD VALUE 'DRIED';
ALTER TYPE "ProductState" ADD VALUE 'FROZEN';
ALTER TYPE "ProductState" ADD VALUE 'POWDERED';
ALTER TYPE "ProductState" ADD VALUE 'LIQUID';

-- AlterTable
ALTER TABLE "analyses" ADD COLUMN     "packagingFormat" TEXT;
