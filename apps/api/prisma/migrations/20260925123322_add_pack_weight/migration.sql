-- AlterTable
ALTER TABLE "analyses" ADD COLUMN     "packageWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "packaging_structures" ADD COLUMN     "maxPackWeightKg" DOUBLE PRECISION,
ADD COLUMN     "minPackWeightKg" DOUBLE PRECISION;
