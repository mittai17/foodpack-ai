import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const candidateInclude = {
  layers: {
    orderBy: { order: 'asc' },
    include: {
      material: { include: { properties: true } },
    },
  },
} satisfies Prisma.PackagingStructureInclude;

export type StructureCandidate = Prisma.PackagingStructureGetPayload<{
  include: typeof candidateInclude;
}>;

@Injectable()
export class CandidateGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns every packaging structure that has at least one layer with
   * recorded OTR/WVTR data — structures with no scorable data are excluded
   * rather than scored with invented numbers. Two further, independently
   * sourced filters narrow this down to what's actually real:
   *
   *  - Pack weight: a flexible retail pouch isn't a real option for a
   *    2000kg bulk shipment, regardless of barrier fit.
   *  - Product form (fresh produce / grain-pulse / powder-spice / liquid /
   *    nuts-snacks): a woven sack is never used for milk and a bottle is
   *    never used for rice, no matter how the OTR/WVTR numbers line up.
   *    Real packaging suppliers key format to commodity category first,
   *    weight second (IndiaMART/Uline product taxonomy) — see the mapping
   *    this filter encodes in product-form.ts.
   *
   * Form is the harder constraint (checked first): a form-correct option at
   * the wrong weight beats a form-wrong option at the exact weight — a rice
   * sack sized for 50kg is still a far more honest answer for a 40kg order
   * than a jumbo bag sized for 500kg+, but a milk bottle is never a real
   * answer for rice at any weight. Falls back one constraint at a time
   * rather than to the full set, so "closest available" stays as close as
   * possible instead of jumping straight to "everything".
   */
  async generate(packageWeightKg?: number, productForm?: string | null): Promise<StructureCandidate[]> {
    const structures = await this.prisma.packagingStructure.findMany({
      include: candidateInclude,
    });

    const scorable = structures.filter((structure) =>
      structure.layers.some((layer) => layer.material.properties.length > 0),
    );

    const formMatched =
      productForm != null
        ? scorable.filter(
            (s) => s.applicableProductForms.length === 0 || s.applicableProductForms.includes(productForm),
          )
        : scorable;
    const formPool = formMatched.length > 0 ? formMatched : scorable;

    if (packageWeightKg === undefined) return formPool;

    const weightMatched = formPool.filter((s) => this.fitsPackWeight(s, packageWeightKg));
    return weightMatched.length > 0 ? weightMatched : formPool;
  }

  private fitsPackWeight(
    structure: StructureCandidate,
    packageWeightKg: number,
  ): boolean {
    const min = structure.minPackWeightKg ?? 0;
    const max = structure.maxPackWeightKg ?? Infinity;
    return packageWeightKg >= min && packageWeightKg <= max;
  }
}
