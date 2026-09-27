import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  OBJECTIVES,
  PRODUCT_STATES,
  STORAGE_TYPES,
  TRANSPORT_TYPES,
  PACKAGING_FORMATS,
  ENVIRONMENTAL_DATA_SOURCES,
  type ObjectiveType,
  type ProductState,
  type StorageType,
  type TransportType,
  type PackagingFormat,
  type EnvironmentalDataSource,
} from '@foodpack/shared';

export class AdvancedInputsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  moistureContentPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  ph?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fatContentPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  waterActivity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  respirationRateMlCo2PerKgPerHr?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  storageTemperatureC?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  relativeHumidityPercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  measuredOtr?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  measuredWvtr?: number;

  @ApiPropertyOptional({ enum: ENVIRONMENTAL_DATA_SOURCES })
  @IsOptional()
  @IsEnum(ENVIRONMENTAL_DATA_SOURCES)
  environmentalDataSource?: EnvironmentalDataSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateAnalysisDto {
  @ApiProperty()
  @IsString()
  foodId!: string;

  @ApiProperty({ enum: PRODUCT_STATES })
  @IsEnum(PRODUCT_STATES)
  productState!: ProductState;

  @ApiProperty({ enum: STORAGE_TYPES })
  @IsEnum(STORAGE_TYPES)
  storageType!: StorageType;

  @ApiProperty({ enum: TRANSPORT_TYPES })
  @IsEnum(TRANSPORT_TYPES)
  transportType!: TransportType;

  @ApiProperty({ minimum: 1, maximum: 730 })
  @IsInt()
  @Min(1)
  @Max(730)
  targetShelfLifeDays!: number;

  @ApiProperty({
    minimum: 0.1,
    maximum: 25000,
    description: 'Total quantity of product going into one pack, in kg — 1 for a retail pouch, 2000+ for bulk/export.',
  })
  @IsNumber()
  @Min(0.1)
  @Max(25000)
  packageWeightKg!: number;

  @ApiProperty({ enum: OBJECTIVES })
  @IsEnum(OBJECTIVES)
  objective!: ObjectiveType;

  @ApiPropertyOptional({ enum: ENVIRONMENTAL_DATA_SOURCES })
  @IsOptional()
  @IsEnum(ENVIRONMENTAL_DATA_SOURCES)
  environmentalDataSource?: EnvironmentalDataSource;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  advancedMode?: boolean;

  @ApiPropertyOptional({ enum: PACKAGING_FORMATS })
  @IsOptional()
  @IsEnum(PACKAGING_FORMATS)
  packagingFormat?: PackagingFormat;

  @ApiPropertyOptional({ type: AdvancedInputsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AdvancedInputsDto)
  advancedInputs?: AdvancedInputsDto;
}
