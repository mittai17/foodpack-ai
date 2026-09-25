-- AlterTable
ALTER TABLE "packaging_structures" ADD COLUMN     "applicableProductForms" TEXT[] DEFAULT ARRAY[]::TEXT[];
