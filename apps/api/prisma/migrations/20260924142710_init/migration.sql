-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'FOOD_EXPERT', 'PACKAGING_EXPERT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ObjectiveType" AS ENUM ('MAX_SHELF_LIFE', 'MIN_COST', 'SUSTAINABILITY', 'BALANCED');

-- CreateEnum
CREATE TYPE "StorageType" AS ENUM ('AMBIENT', 'CHILLED', 'FROZEN');

-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('LOCAL', 'LONG_DISTANCE', 'EXPORT');

-- CreateEnum
CREATE TYPE "ProductState" AS ENUM ('FRESH', 'CUT_READY_TO_EAT', 'PROCESSED');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "food_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "commonNames" TEXT[],
    "scientificName" TEXT,
    "categoryId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "isFreshProduce" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_sources" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "publication" TEXT,
    "year" INTEGER,
    "url" TEXT,

    CONSTRAINT "food_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_properties" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "temperatureC" DOUBLE PRECISION,
    "relativeHumidity" DOUBLE PRECISION,
    "sourceId" TEXT,
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,

    CONSTRAINT "food_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_storage_conditions" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "storageType" "StorageType" NOT NULL,
    "minTempC" DOUBLE PRECISION,
    "maxTempC" DOUBLE PRECISION,
    "minRH" DOUBLE PRECISION,
    "maxRH" DOUBLE PRECISION,
    "notes" TEXT,
    "sourceId" TEXT,

    CONSTRAINT "food_storage_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_respiration_data" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "temperatureC" DOUBLE PRECISION NOT NULL,
    "co2ProductionRate" DOUBLE PRECISION,
    "o2ConsumptionRate" DOUBLE PRECISION,
    "unit" TEXT,
    "sourceId" TEXT,
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'MEDIUM',

    CONSTRAINT "food_respiration_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_shelf_life_data" (
    "id" TEXT NOT NULL,
    "foodId" TEXT NOT NULL,
    "storageType" "StorageType" NOT NULL,
    "minDays" INTEGER,
    "maxDays" INTEGER,
    "packagingContext" TEXT,
    "sourceId" TEXT,
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'MEDIUM',

    CONSTRAINT "food_shelf_life_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_materials" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "description" TEXT,
    "recyclable" BOOLEAN,
    "monoMaterial" BOOLEAN,
    "biodegradable" BOOLEAN,
    "approxCostMin" DOUBLE PRECISION,
    "approxCostMax" DOUBLE PRECISION,
    "costUnit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packaging_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_sources" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "publication" TEXT,
    "year" INTEGER,
    "url" TEXT,

    CONSTRAINT "material_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_properties" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "unit" TEXT,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "testConditionTempC" DOUBLE PRECISION,
    "testConditionRH" DOUBLE PRECISION,
    "sourceId" TEXT,
    "confidence" "ConfidenceLevel" NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,

    CONSTRAINT "material_properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_structures" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "structureType" TEXT NOT NULL,
    "description" TEXT,
    "supportsMap" BOOLEAN NOT NULL DEFAULT false,
    "microPerforated" BOOLEAN NOT NULL DEFAULT false,
    "approxCostMin" DOUBLE PRECISION,
    "approxCostMax" DOUBLE PRECISION,
    "costUnit" TEXT,

    CONSTRAINT "packaging_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packaging_structure_layers" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "layerRole" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "thicknessMinMicron" DOUBLE PRECISION,
    "thicknessMaxMicron" DOUBLE PRECISION,

    CONSTRAINT "packaging_structure_layers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "foodId" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "productState" "ProductState" NOT NULL,
    "storageType" "StorageType" NOT NULL,
    "transportType" "TransportType" NOT NULL,
    "targetShelfLifeDays" INTEGER NOT NULL,
    "objective" "ObjectiveType" NOT NULL DEFAULT 'BALANCED',
    "advancedInputs" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "targetOtrMin" DOUBLE PRECISION,
    "targetOtrMax" DOUBLE PRECISION,
    "otrUnit" TEXT,
    "targetWvtrMin" DOUBLE PRECISION,
    "targetWvtrMax" DOUBLE PRECISION,
    "wvtrUnit" TEXT,
    "mapRecommended" BOOLEAN,
    "recommendedO2Min" DOUBLE PRECISION,
    "recommendedO2Max" DOUBLE PRECISION,
    "recommendedCo2Min" DOUBLE PRECISION,
    "recommendedCo2Max" DOUBLE PRECISION,
    "sealabilityRequired" BOOLEAN NOT NULL DEFAULT true,
    "mechanicalNotes" TEXT,
    "assumptions" TEXT[],
    "limitingFactors" TEXT[],
    "dataConfidence" "ConfidenceLevel" NOT NULL DEFAULT 'MEDIUM',

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "materialId" TEXT,
    "structureId" TEXT,
    "rank" INTEGER NOT NULL,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "scoreBreakdown" JSONB NOT NULL,
    "estimatedShelfLifeMinDays" INTEGER,
    "estimatedShelfLifeMaxDays" INTEGER,
    "shelfLifeConfidence" "ConfidenceLevel" NOT NULL DEFAULT 'MEDIUM',
    "estimatedCostMin" DOUBLE PRECISION,
    "estimatedCostMax" DOUBLE PRECISION,
    "costUnit" TEXT,
    "sustainabilityNotes" TEXT,
    "explanation" TEXT[],
    "aiExplanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "food_categories_name_key" ON "food_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "food_categories_slug_key" ON "food_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "foods_slug_key" ON "foods"("slug");

-- CreateIndex
CREATE INDEX "foods_categoryId_idx" ON "foods"("categoryId");

-- CreateIndex
CREATE INDEX "food_sources_foodId_idx" ON "food_sources"("foodId");

-- CreateIndex
CREATE INDEX "food_properties_foodId_propertyType_idx" ON "food_properties"("foodId", "propertyType");

-- CreateIndex
CREATE INDEX "food_storage_conditions_foodId_storageType_idx" ON "food_storage_conditions"("foodId", "storageType");

-- CreateIndex
CREATE INDEX "food_respiration_data_foodId_idx" ON "food_respiration_data"("foodId");

-- CreateIndex
CREATE INDEX "food_shelf_life_data_foodId_storageType_idx" ON "food_shelf_life_data"("foodId", "storageType");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_materials_slug_key" ON "packaging_materials"("slug");

-- CreateIndex
CREATE INDEX "material_sources_materialId_idx" ON "material_sources"("materialId");

-- CreateIndex
CREATE INDEX "material_properties_materialId_propertyType_idx" ON "material_properties"("materialId", "propertyType");

-- CreateIndex
CREATE UNIQUE INDEX "packaging_structures_slug_key" ON "packaging_structures"("slug");

-- CreateIndex
CREATE INDEX "packaging_structure_layers_structureId_idx" ON "packaging_structure_layers"("structureId");

-- CreateIndex
CREATE INDEX "analyses_userId_idx" ON "analyses"("userId");

-- CreateIndex
CREATE INDEX "analyses_foodId_idx" ON "analyses"("foodId");

-- CreateIndex
CREATE UNIQUE INDEX "requirements_analysisId_key" ON "requirements"("analysisId");

-- CreateIndex
CREATE INDEX "recommendations_analysisId_idx" ON "recommendations"("analysisId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "food_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_sources" ADD CONSTRAINT "food_sources_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_properties" ADD CONSTRAINT "food_properties_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_properties" ADD CONSTRAINT "food_properties_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "food_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_storage_conditions" ADD CONSTRAINT "food_storage_conditions_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_storage_conditions" ADD CONSTRAINT "food_storage_conditions_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "food_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_respiration_data" ADD CONSTRAINT "food_respiration_data_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_respiration_data" ADD CONSTRAINT "food_respiration_data_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "food_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_shelf_life_data" ADD CONSTRAINT "food_shelf_life_data_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_shelf_life_data" ADD CONSTRAINT "food_shelf_life_data_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "food_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_sources" ADD CONSTRAINT "material_sources_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "packaging_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_properties" ADD CONSTRAINT "material_properties_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "packaging_materials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_properties" ADD CONSTRAINT "material_properties_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "material_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_structure_layers" ADD CONSTRAINT "packaging_structure_layers_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "packaging_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packaging_structure_layers" ADD CONSTRAINT "packaging_structure_layers_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "packaging_materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "packaging_materials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "packaging_structures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
