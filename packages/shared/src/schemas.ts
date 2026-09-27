import { z } from 'zod';
import {
  OBJECTIVES,
  PRODUCT_STATES,
  STORAGE_TYPES,
  TRANSPORT_TYPES,
  PACKAGING_FORMATS,
  ENVIRONMENTAL_DATA_SOURCES,
} from './enums';

export const iotReadingsSchema = z.object({
  deviceId: z.string().optional(),
  temperatureC: z.number().optional(),
  relativeHumidityPercent: z.number().optional(),
  co2Ppm: z.number().optional(),
  o2Percent: z.number().optional(),
  respirationRateMlCo2PerKgPerHr: z.number().optional(),
  timestamp: z.string().optional(),
});
export type IotReadings = z.infer<typeof iotReadingsSchema>;

export const advancedInputsSchema = z
  .object({
    moistureContentPercent: z.number().min(0).max(100).optional(),
    ph: z.number().min(0).max(14).optional(),
    fatContentPercent: z.number().min(0).max(100).optional(),
    waterActivity: z.number().min(0).max(1).optional(),
    respirationRateMlCo2PerKgPerHr: z.number().min(0).optional(),
    storageTemperatureC: z.number().min(-40).max(60).optional(),
    relativeHumidityPercent: z.number().min(0).max(100).optional(),
    measuredOtr: z.number().min(0).optional(),
    measuredWvtr: z.number().min(0).optional(),
    environmentalDataSource: z.enum(ENVIRONMENTAL_DATA_SOURCES).optional(),
    iotReadings: iotReadingsSchema.optional(),
    notes: z.string().max(1000).optional(),
  })
  .partial();

export type AdvancedInputs = z.infer<typeof advancedInputsSchema>;

export const createAnalysisSchema = z.object({
  foodId: z.string().min(1, 'Select a food commodity'),
  productState: z.enum(PRODUCT_STATES),
  storageType: z.enum(STORAGE_TYPES),
  transportType: z.enum(TRANSPORT_TYPES),
  targetShelfLifeDays: z.number().int().min(1).max(730),
  packageWeightKg: z.number().min(0.1).max(25000),
  objective: z.enum(OBJECTIVES),
  packagingFormat: z.enum(PACKAGING_FORMATS).optional(),
  environmentalDataSource: z.enum(ENVIRONMENTAL_DATA_SOURCES).optional(),
  projectId: z.string().optional(),
  advancedMode: z.boolean().default(false),
  advancedInputs: advancedInputsSchema.optional(),
});

export type CreateAnalysisInput = z.infer<typeof createAnalysisSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
