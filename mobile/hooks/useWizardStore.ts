import { create } from 'zustand';
import type {
  ProductState,
  StorageType,
  TransportType,
  PackagingFormat,
  ObjectiveType,
  AdvancedInputs,
} from '@foodpack/shared';
import type { FoodItem } from '@/lib/api/analysis';

export interface DetectedFoodResult {
  foodId: string;
  foodName: string;
  confidence: number;
  method: 'camera' | 'upload';
}

interface WizardState {
  // Step 0 — Food
  foodId: string | null;
  selectedFood: FoodItem | null;
  uploadedImageUri: string | null;
  detectedFood: DetectedFoodResult | null;

  // Step 1 — Product details
  productState: ProductState;
  storageType: StorageType;
  transportType: TransportType;
  packagingFormat: PackagingFormat;

  // Step 2 — Parameters
  targetShelfLifeDays: number;
  packageWeightKg: number;
  objective: ObjectiveType;

  // Step 3 — Environmental / Advanced
  advancedMode: boolean;
  advancedInputs: AdvancedInputs;

  // Actions
  setFood: (food: FoodItem) => void;
  setUploadedImage: (uri: string) => void;
  setDetectedFood: (result: DetectedFoodResult) => void;
  setProductState: (v: ProductState) => void;
  setStorageType: (v: StorageType) => void;
  setTransportType: (v: TransportType) => void;
  setPackagingFormat: (v: PackagingFormat) => void;
  setTargetShelfLifeDays: (v: number) => void;
  setPackageWeightKg: (v: number) => void;
  setObjective: (v: ObjectiveType) => void;
  setAdvancedMode: (v: boolean) => void;
  setAdvancedInputs: (v: Partial<AdvancedInputs>) => void;
  reset: () => void;
}

const DEFAULTS: Omit<WizardState, keyof ReturnType<typeof createActions>> = {
  foodId: null,
  selectedFood: null,
  uploadedImageUri: null,
  detectedFood: null,
  productState: 'FRESH',
  storageType: 'CHILLED',
  transportType: 'LOCAL',
  packagingFormat: 'AUTO',
  targetShelfLifeDays: 14,
  packageWeightKg: 1,
  objective: 'BALANCED',
  advancedMode: false,
  advancedInputs: {},
};

function createActions(
  set: (partial: Partial<WizardState> | ((state: WizardState) => Partial<WizardState>)) => void,
) {
  return {
    setFood: (food: FoodItem) =>
      set({ foodId: food.id, selectedFood: food }),
    setUploadedImage: (uri: string) =>
      set({ uploadedImageUri: uri }),
    setDetectedFood: (result: DetectedFoodResult) =>
      set({ detectedFood: result }),
    setProductState: (v: ProductState) => set({ productState: v }),
    setStorageType: (v: StorageType) => set({ storageType: v }),
    setTransportType: (v: TransportType) => set({ transportType: v }),
    setPackagingFormat: (v: PackagingFormat) => set({ packagingFormat: v }),
    setTargetShelfLifeDays: (v: number) => set({ targetShelfLifeDays: v }),
    setPackageWeightKg: (v: number) => set({ packageWeightKg: v }),
    setObjective: (v: ObjectiveType) => set({ objective: v }),
    setAdvancedMode: (v: boolean) => set({ advancedMode: v }),
    setAdvancedInputs: (v: Partial<AdvancedInputs>) =>
      set((s: WizardState) => ({ advancedInputs: { ...s.advancedInputs, ...v } })),
    reset: () => set({ ...DEFAULTS }),
  };
}

export const useWizardStore = create<WizardState>((set) => ({
  ...DEFAULTS,
  ...createActions(set),
}));
