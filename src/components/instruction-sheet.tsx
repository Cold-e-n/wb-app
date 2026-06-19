import type { FabricConstructionWithRelation } from '@/types/FabricConstruction'
import type { CutmarkItem } from '@/types/Cutmark'
import { cn, fringeWidth } from '@/lib/utils'
import { parseCutmarkChunks } from '@/lib/cutmark'
import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import React from 'react'

/**
 * Resolve the display value for a field given its option and computed default.
 * - false / undefined → field is hidden (returns null)
 * - true              → show computed default
 * - string / number   → show override value
 */
const resolve = (
  option: boolean | string | number | undefined,
  computed: React.ReactNode,
): { show: boolean; value: React.ReactNode } => {
  if (option === false) return { show: false, value: null }
  if (option === undefined || option === true)
    return { show: true, value: computed }
  return { show: true, value: String(option) }
}

/**
 * Build roll range labels for the laporan weaving rows.
 *
 * For each chunk in the formula, looks up its length in `cutmarkPerRoll`
 * to get the number of rolls that length represents per entry:
 *   - Fabric A: cutmarkPerRoll = [{ roll: 1, length: 550 }]
 *     "( 550m x 5 )" → 1 roll/entry × 5 entries → (1/5)(2/5)...(5/5)
 *   - Fabric B: cutmarkPerRoll = [{ roll: 1, length: 301 }, { roll: 2, length: 563 }]
 *     "( 563m x 3 ) + ( 301m x 1 )" → 2r×3 + 1r×1 → (1-2/7)(3-4/7)(5-6/7)(7/7)
 *
 * Falls back to sequential labels when formula or cutmarkPerRoll is absent.
 */
const buildRollLabels = ({
  cutmarkValue,
  rollCount,
  cutmarkPerRoll,
}: {
  cutmarkValue?: string | null
  rollCount: number
  cutmarkPerRoll?: Array<CutmarkItem>
}): Array<string> => {
  const fallback = () =>
    Array.from({ length: 8 }, (_, i) =>
      i < rollCount ? `(${i + 1}/${rollCount})` : '',
    )

  if (!cutmarkValue || !cutmarkPerRoll || cutmarkPerRoll.length === 0)
    return fallback()

  const chunks = parseCutmarkChunks(cutmarkValue)
  if (chunks.length === 0) return fallback()

  const sortedChunks = [...chunks].sort((a, b) => {
    const rollsA =
      cutmarkPerRoll.find((c) => Math.abs(c.length - a.length) < 0.01)?.roll ??
      1
    const rollsB =
      cutmarkPerRoll.find((c) => Math.abs(c.length - b.length) < 0.01)?.roll ??
      1
    return rollsA - rollsB
  })
  const labels: Array<string> = []
  let currentRoll = 1

  for (const chunk of sortedChunks) {
    if (currentRoll > rollCount) break

    // Look up how many rolls this length produces per entry
    const def = cutmarkPerRoll.find(
      (c) => Math.abs(c.length - chunk.length) < 0.01,
    )
    const rollsPerEntry = def?.roll ?? 1

    for (let i = 0; i < chunk.count; i++) {
      if (currentRoll > rollCount) break

      const startRoll = currentRoll
      const endRoll = Math.min(currentRoll + rollsPerEntry - 1, rollCount)

      labels.push(
        startRoll === endRoll
          ? `(${startRoll}/${rollCount})`
          : `(${startRoll}-${endRoll}/${rollCount})`,
      )

      currentRoll = endRoll + 1
    }
  }

  while (labels.length < 8) labels.push('')
  return labels.slice(0, 8)
}

// Header
export const InstructionHeader = ({
  fabricConstruction,
  options = {},
}: {
  fabricConstruction: FabricConstructionWithRelation
  options?: Exclude<InstructionHeaderOptions, false>
}) => {
  const isBennKm = fabricConstruction.warpingMachine === 'BENN_KM'

  const instructionNo = resolve(
    options.instructionNo,
    `CONST-${fabricConstruction.constructionId}`,
  )
  const instructionDate = resolve(
    options.instructionDate,
    format(new Date(fabricConstruction.createdAt ?? new Date()), 'dd-MMM-yy', {
      locale: enUS,
    }),
  )
  const weavingMachine = resolve(options.weavingMachine, '')
  const warpingMachine = resolve(
    options.warpingMachine,
    isBennKm ? 'BENN / KARL' : 'MO / TSUDAKOMA',
  )

  const showTopRow = instructionNo.show || instructionDate.show
  const showMachineRow = weavingMachine.show || warpingMachine.show

  return (
    <>
      <div className="flex justify-end text-[13px] text-muted-foreground mb-3">
        F.PR.1
      </div>

      {showTopRow && (
        <div className="overflow-hidden text-[13px]">
          {instructionNo.show && (
            <div className={cn('grid grid-cols-[14rem_1fr_15rem_10rem]')}>
              <div className="py-1 px-2" />
              <div className="py-1 px-2 text-center">
                Instruksi No.（整経指示番号）：
              </div>
              <div className="border-b py-1 px-2 text-center font-mono font-semibold">
                {instructionNo.value}
              </div>
            </div>
          )}
          {instructionDate.show && (
            <div className="grid grid-cols-[14rem_1fr_15rem_10rem]">
              <div className="py-1 px-2" />
              <div className="py-1 px-2 text-center">
                Tanggal/Bulan Instruksi（指図月日）:
              </div>
              <div className="border-b py-1 px-2 text-center font-mono">
                {instructionDate.value}
              </div>
            </div>
          )}
        </div>
      )}

      {showMachineRow && (
        <div className="mt-2 overflow-hidden text-[13px]">
          <div className="grid grid-cols-[14rem_1fr_15rem_10rem]">
            {weavingMachine.show ? (
              <>
                <div className="py-1 px-2">Weaving Mesin No.（織機番号）：</div>
                <div className="border-b py-1 px-2 text-center">
                  #{weavingMachine.value}
                </div>
              </>
            ) : (
              <div className="col-span-2 border-r py-1 px-2" />
            )}
            {warpingMachine.show ? (
              <>
                <div className="py-1 px-2 text-center text-nowrap">
                  Warping/Beaming Mesin：
                </div>
                <div className="border-b py-1 px-2 text-center">
                  {warpingMachine.value}
                </div>
              </>
            ) : (
              <div className="col-span-2 py-1 px-2" />
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Row
export const InstructionRow = ({
  label,
  labelJp,
  value,
}: {
  label: string
  labelJp: string
  value?: React.ReactNode
}) => (
  <div className="grid grid-cols-[14rem_15rem_1fr] text-[13px] border-x border-b">
    <div className="border-r py-1 px-2 leading-snug">{label}</div>
    <div className="border-r py-1 px-2 text-muted-foreground leading-snug">
      {labelJp}
    </div>
    <div className="py-1 px-2 leading-snug">{value ?? ''}</div>
  </div>
)

// Section
export const InstructionSection = ({
  label,
  labelJp,
  children,
}: {
  label: string
  labelJp: string
  children: React.ReactNode
}) => (
  <div className="mt-5 overflow-hidden text-[13px]">
    <div className="grid grid-cols-[14rem_15rem_1fr] border-b">
      <div className="py-1 px-2">({label})</div>
      <div className="py-1 px-2 text-muted-foreground">[ {labelJp} ]</div>
    </div>
    {children}
  </div>
)

// Weaving report section
export const InstructionWeavingReport = ({
  rollCount = 1,
  cutmarkValue,
  cutmarkPerRoll,
  options = {},
  children,
}: {
  rollCount?: number
  cutmarkValue?: string | null
  cutmarkPerRoll?: Array<CutmarkItem>
  options?: DocWeavingReportOptions
  children?: React.ReactNode
}) => {
  const remarkLabel =
    options.remarkLabel === false
      ? null
      : typeof options.remarkLabel === 'string'
        ? options.remarkLabel
        : 'Remark : '
  const rollLabels = buildRollLabels({
    cutmarkValue,
    cutmarkPerRoll,
    rollCount,
  })

  return (
    <InstructionSection label="Laporan Weaving" labelJp="織機記入">
      <div className="grid grid-cols-[29rem_1fr] text-[13px]">
        <div className="border border-t-0">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="flex space-x-1 border-b last:border-b-0 py-1 px-2 text-muted-foreground"
            >
              <div className="flex items-center justify-center border w-5 h-5 rounded-full text-[12px]">
                {i + 1}
              </div>
              <div>{rollLabels[i]}</div>
            </div>
          ))}
        </div>

        <div className="border border-l-0 border-t-0">
          <div className="py-1 px-2 text-muted-foreground text-[13px]">
            {remarkLabel}
          </div>

          <div className="py-1 px-2">{children}</div>
        </div>
      </div>
    </InstructionSection>
  )
}

// Wrapper
export const InstructionWarpper = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'rounded-lg border border-border bg-card/50 shadow-md w-full mx-auto pl-10 pr-5 lg:pl-30 lg:pr-20 py-15',
      className,
    )}
  >
    {children}
  </div>
)

// Options

export type InstructionHeaderOptions =
  | false
  | {
      instructionNo?: boolean | string
      instructionDate?: boolean | string
      weavingMachine?: boolean | string
      warpingMachine?: boolean | string
    }

export type DocWarpingOptions = {
  warpDate?: boolean | string
  coneCount?: boolean | string
  warpYarn?: boolean | string
  twistingMachine?: boolean | string
  sectionCount?: boolean | string
  sectionLength?: boolean | string
  coneWeightLength?: boolean | string
  color?: boolean | string
}

export type DocBeamingOptions = {
  beamDate?: boolean | string
  beamWidth?: boolean | string
  cutmarkValue?: boolean | string
  beamNo?: boolean | string
}

export type DocWeavingOptions = {
  weavDate?: boolean | string
  fabricName?: boolean | string
  totalEnds?: boolean | string
  reedWidth?: boolean | string
  reedNo?: boolean | string
  pick?: boolean | string | number
  beamNo?: boolean | string
  warpYarn?: boolean | string
  weftYarn?: boolean | string
}

export type DocWeavingReportOptions = {
  remarkLabel?: boolean | string
}

export interface InstructionSheetOptions {
  header?: InstructionHeaderOptions
  warping?: DocWarpingOptions
  beaming?: DocBeamingOptions
  weaving?: DocWeavingOptions
  weavingReport?: DocWeavingReportOptions | false
}

// Main component
export const InstructionSheet = ({
  fabricConstruction,
  options = {},
}: {
  fabricConstruction: FabricConstructionWithRelation
  options?: InstructionSheetOptions
}) => {
  const { fabricSpec } = fabricConstruction
  const isBennKm = fabricConstruction.warpingMachine.toLowerCase() === 'benn_km'

  const totalEnds =
    (fabricSpec.totalEnds ?? 0) +
    (fabricConstruction.spareEnds ?? 0) +
    (fabricSpec.fringe !== 0 ? (fabricSpec.fringe ?? 0) : 0)

  const totalEndsComputed = [
    fabricSpec.totalEnds.toLocaleString('en-US'),
    fabricConstruction.spareEnds === 0
      ? ''
      : ` + ${fabricConstruction.spareEnds}`,
    fabricSpec.fringe !== 0 ? `+ ${fabricSpec.fringe}` : null,
    totalEnds === fabricSpec.totalEnds
      ? ' Helai'
      : `= ${totalEnds.toLocaleString('en-US')} Helai`,
  ]
    .filter(Boolean)
    .join(' ')

  const fringeWidthValue = fringeWidth({
    fringe: fabricSpec.fringe ?? 1,
    reedNo: fabricSpec.reedNo,
  })

  // Warping
  const w = options.warping ?? {}

  const warpRows: Array<{
    key: string
    label: string
    labelJp: string
    opt: boolean | string | undefined
    computed: React.ReactNode
  }> = [
    {
      key: 'warpDate',
      label: 'Tanggal/Bulan',
      labelJp: '（日/月）',
      opt: w.warpDate,
      computed: '',
    },
    {
      key: 'coneCount',
      label: 'Jumlah Helai (Cones)',
      labelJp: '（立個数）',
      opt: w.coneCount,
      computed: `${fabricConstruction.coneCount} cones`,
    },
    {
      key: 'warpYarn',
      label: 'Jenis Benang',
      labelJp: '（糸番手・ロット）',
      opt: w.warpYarn,
      computed: `${fabricSpec.warpYarn.name} Lot:`,
    },
    {
      key: 'twistingMachine',
      label: 'Jenis Mesin Twisting',
      labelJp: '（撚糸機）',
      opt: w.twistingMachine,
      computed: '',
    },
    {
      key: 'sectionCount',
      label: 'Jumlah Beam / Seksi',
      labelJp: '（取り本数・巻回数）',
      opt: w.sectionCount,
      computed: `${fabricConstruction.sectionCount} ${isBennKm ? 'section' : 'beam'}`,
    },
    {
      key: 'sectionLength',
      label: 'Panjang Benang',
      labelJp: '（ワーピング長）',
      opt: w.sectionLength,
      computed: `${fabricConstruction.sectionLength.toLocaleString('en-US')} m`,
    },
    {
      key: 'coneWeightLength',
      label: 'Berat dan Panjang / Cone',
      labelJp: '（糸全長）',
      opt: w.coneWeightLength,
      computed: '',
    },
    {
      key: 'color',
      label: 'Benang Warna yang Masuk',
      labelJp: '（色糸入れ方）',
      opt: w.color,
      computed: '',
    },
  ]

  // Beaming
  const b = options.beaming ?? {}

  const beamRows: Array<{
    key: string
    label: string
    labelJp: string
    opt: boolean | string | undefined
    computed: React.ReactNode
  }> = [
    {
      key: 'beamDate',
      label: 'Tanggal/Bulan',
      labelJp: '（日/月）',
      opt: b.beamDate,
      computed: '',
    },
    {
      key: 'beamWidth',
      label: 'Lebar Beam',
      labelJp: '（整経幅）',
      opt: b.beamWidth,
      computed: `${Number(fabricConstruction.beamWidth / 25.4).toFixed(2)}'' (${fabricConstruction.beamWidth.toLocaleString('en-Us')} mm)`,
    },
    {
      key: 'cutmarkValue',
      label: 'Cut Mark',
      labelJp: '（カットマーク）',
      opt: b.cutmarkValue,
      computed: fabricConstruction.cutmarkValue ?? '',
    },
    {
      key: 'beamNo',
      label: 'Nomor Beam',
      labelJp: '（ビーム番号）',
      opt: b.beamNo,
      computed: '',
    },
  ]

  // Weaving
  const wv = options.weaving ?? {}

  const weavRows: Array<{
    key: string
    label: string
    labelJp: string
    opt: boolean | string | number | undefined
    computed: React.ReactNode
  }> = [
    {
      key: 'weavDate',
      label: 'Tanggal/Bulan',
      labelJp: '（日/月）',
      opt: wv.weavDate,
      computed: '',
    },
    {
      key: 'fabricName',
      label: 'Kode Kain',
      labelJp: '（品名）',
      opt: wv.fabricName,
      computed: `${fabricSpec.fabric.name} (${fabricSpec.width}mm × ${fabricSpec.length.toLocaleString('en-Us')}m × ${fabricConstruction.rollCount}R)`,
    },
    {
      key: 'totalEnds',
      label: 'Jumlah Helai Lusi',
      labelJp: '（経糸総本数）',
      opt: wv.totalEnds,
      computed: totalEndsComputed,
    },
    {
      key: 'reedWidth',
      label: 'Lebar Sisir',
      labelJp: '（オサ入れ幅）',
      opt: wv.reedWidth,
      computed:
        fabricSpec.fringe === 0
          ? `${fabricSpec.reedWidth}'' (${Number(Math.floor(fabricSpec.reedWidth * 25.4)).toLocaleString('en-Us')} mm)`
          : `${fabricSpec.reedWidth}'' (${Number(Math.floor(fabricSpec.reedWidth * 25.4)).toLocaleString('en-Us')} mm) Total ${Number(fabricConstruction.beamWidth / 25.4).toFixed(2)} ''`,
    },
    {
      key: 'reedNo',
      label: 'Nomor Sisir',
      labelJp: '（オサ番手）',
      opt: wv.reedNo,
      computed: `#${fabricSpec.reedNo}`,
    },
    {
      key: 'pick',
      label: 'Jumlah Helai Pakan / inch',
      labelJp: '（緯糸密度）',
      opt: wv.pick,
      computed: String(fabricSpec.pickPerInch),
    },
    {
      key: 'beamNo',
      label: 'Nomor Beam',
      labelJp: '（ビーム番号）',
      opt: wv.beamNo,
      computed: '',
    },
    {
      key: 'warpYarn',
      label: 'Lusi',
      labelJp: '（経糸）',
      opt: wv.warpYarn,
      computed: fabricSpec.warpYarn.name,
    },
    {
      key: 'weftYarn',
      label: 'Pakan',
      labelJp: '（緯糸）',
      opt: wv.weftYarn,
      computed: fabricSpec.weftYarn.name,
    },
  ]

  const visibleWarpRows = warpRows.filter(
    (r) => resolve(r.opt, r.computed).show,
  )
  const visibleBeamRows = beamRows.filter(
    (r) => resolve(r.opt, r.computed).show,
  )
  const visibleWeavRows = weavRows.filter(
    (r) => resolve(r.opt, r.computed).show,
  )

  return (
    <InstructionWarpper>
      {/* Header */}
      {options.header !== false && (
        <InstructionHeader
          fabricConstruction={fabricConstruction}
          options={
            options.header && typeof options.header === 'object'
              ? options.header
              : {}
          }
        />
      )}

      {/* Warping */}
      {visibleWarpRows.length > 0 && (
        <InstructionSection label="Warping" labelJp="ワーピング">
          {visibleWarpRows.map((r) => {
            const { value } = resolve(r.opt, r.computed)
            return (
              <InstructionRow
                key={r.key}
                label={r.label}
                labelJp={r.labelJp}
                value={value}
              />
            )
          })}
        </InstructionSection>
      )}

      {/* Beaming */}
      {visibleBeamRows.length > 0 && (
        <InstructionSection label="Beaming" labelJp="ビーミング">
          {visibleBeamRows.map((r) => {
            const { value } = resolve(r.opt, r.computed)
            return (
              <InstructionRow
                key={r.key}
                label={r.label}
                labelJp={r.labelJp}
                value={value}
              />
            )
          })}
        </InstructionSection>
      )}

      {/* Weaving */}
      {visibleWeavRows.length > 0 && (
        <InstructionSection label="Weaving" labelJp="織布">
          {visibleWeavRows.map((r) => {
            const { value } = resolve(r.opt, r.computed)
            return (
              <InstructionRow
                key={r.key}
                label={r.label}
                labelJp={r.labelJp}
                value={value}
              />
            )
          })}
        </InstructionSection>
      )}

      {/* Laporan Weaving */}
      {options.weavingReport !== false && (
        <InstructionWeavingReport
          rollCount={fabricConstruction.rollCount}
          cutmarkValue={fabricConstruction.cutmarkValue}
          cutmarkPerRoll={fabricConstruction.fabricSpec.cutmarkPerRoll}
          options={
            options.weavingReport && typeof options.weavingReport === 'object'
              ? options.weavingReport
              : {}
          }
        >
          {fabricSpec.fringe !== 0 && (
            <>
              <div className="flex items-center justify-center space-x-5 text-[12px] text-center">
                <div className="flex flex-col space-y-1 w-1/10">
                  <div>{(fabricSpec.fringe ?? 2) / 2} h</div>
                  <div className="border" />
                  <div>{fringeWidthValue}"</div>
                </div>

                <div className="flex flex-col space-y-1 w-1/4">
                  <div>{fabricSpec.totalEnds} helai</div>
                  <div className="border" />
                  <div>{fabricSpec.reedWidth}"</div>
                </div>

                <div className="flex flex-col space-y-1 w-1/10">
                  <div>{(fabricSpec.fringe ?? 2) / 2} h</div>
                  <div className="border" />
                  <div>{fringeWidthValue}"</div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-15">
                Total {(fabricConstruction.beamWidth / 25.4).toFixed(2)}"
              </div>
            </>
          )}
        </InstructionWeavingReport>
      )}

      <div className="flex items-center justify-center text-[13px] py-1 h-7">
        JARAK ANTARA BENANG WARNA
      </div>

      <div className="border-b-3 h-7" />

      <div className="mt-7 text-[13px]">
        <div>Total Sambungan Yang Terdata di Warping/Beaming:</div>
        <div className="grid grid-cols-[1fr_10rem_10rem_10rem_10rem]">
          <div>
            <div>Tape Merah (Sambungan Assembling)</div>
            <div>Tape Kuning (Sambungan Twisting)</div>
            <div>Deffect (Sambungan Warping)</div>
            <div>Deffect (Sambungan Beaming)</div>
          </div>

          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>: C1 = </div>
            ))}
          </div>

          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>C2 = </div>
            ))}
          </div>

          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>C3 = </div>
            ))}
          </div>

          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>C4 = </div>
            ))}
          </div>
        </div>
      </div>
    </InstructionWarpper>
  )
}
