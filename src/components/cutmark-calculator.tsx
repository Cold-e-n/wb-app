import { type CutMarkChunk } from './cutmark-kanban'

interface CutMarkCalculatorProps {
  form: any
  initialRolls: Array<CutMarkChunk>
}

export const CutMarkCalculator = ({
  form,
  initialRolls,
}: CutMarkCalculatorProps) => {
  return (
    <form.Subscribe
      selector={(state: any) => [
        state.values.testTying,
        state.values.testStretching,
        state.values.cutMarkSequence,
        state.values.fabricId,
        state.values.coneLength,
      ]}
    >
      {([testTying, testStretching, cutMarkSequence, fabricId, coneLength]: [
        number,
        number,
        Array<CutMarkChunk>,
        string,
        number,
      ]) => {
        // Ambil data sequence dengan aman
        const currentSequence = cutMarkSequence || []

        // Filter dan sort rolls dari sequence saat ini untuk dibandingkan dengan initialRolls
        const currentRollItems = currentSequence.filter(
          (item) => item.type === 'roll',
        )
        const sortedCurrentRolls = [...currentRollItems].sort((a, b) =>
          a.id.localeCompare(b.id),
        )
        const sortedInitialRolls = [...initialRolls].sort((a, b) =>
          a.id.localeCompare(b.id),
        )

        // Cek apakah data rolls (dari fabricId / rollCount) sudah berubah dari yang ada di sequence
        const isRollsChanged =
          sortedCurrentRolls.length !== sortedInitialRolls.length ||
          sortedCurrentRolls.some(
            (item, i) =>
              item.id !== sortedInitialRolls[i].id ||
              item.roll !== sortedInitialRolls[i].roll ||
              item.count !== sortedInitialRolls[i].count ||
              item.length !== sortedInitialRolls[i].length,
          )

        // Jika sekuens kosong (awal load) atau roll berubah, racik blueprint default
        const activeSequence =
          currentSequence.length > 0 && !isRollsChanged
            ? currentSequence
            : ([
                {
                  id: 'test-awal',
                  roll: 0,
                  type: 'test-awal',
                  length: testTying ?? 10,
                  count: 1,
                },
                ...initialRolls.map((r) => ({ ...r, type: 'roll' as const })),
                {
                  id: 'test-akhir',
                  roll: 0,
                  type: 'test-akhir',
                  length: testStretching ?? 35,
                  count: 1,
                },
              ] as Array<CutMarkChunk>)

        // A. Hitung Total Panjang (sectionLength)
        const total = activeSequence.reduce((sum, item) => {
          if (item.type === 'test-awal') return sum + (testTying ?? 10)
          if (item.type === 'test-akhir') return sum + (testStretching ?? 35)
          return sum + item.length * (item.count || 1)
        }, 0)

        // B. Hitung sectionCount secara otomatis berdasarkan coneLength dan total (sectionLength)
        const currentConeLength = coneLength ?? 0
        let calculatedSectionCount = 1
        if (currentConeLength > 0 && total > 0) {
          calculatedSectionCount = Math.floor(currentConeLength / total)
          if (calculatedSectionCount < 1) {
            calculatedSectionCount = 1
          }
        }

        // C. Hitung Total Length Keseluruhan
        const calculatedTotalLength = total * calculatedSectionCount

        const formulaParts: Array<string> = []
        activeSequence.forEach((item) => {
          if (item.type === 'test-awal') {
            formulaParts.push(`${testTying ?? 10}m`)
          } else if (item.type === 'test-akhir') {
            formulaParts.push(`${testStretching ?? 35}m`)
          } else {
            const itemLength = Number(item.length).toLocaleString('en-Us')
            formulaParts.push(`( ${itemLength}m x ${item.count} )`)
          }
        })
        const generatedFormula = formulaParts.join(' + ')

        const currentFormula = form.getFieldValue('cutmarkValue')
        const currentSectionLength = form.getFieldValue('sectionLength')
        const currentSectionCount = form.getFieldValue('sectionCount')
        const currentTotalLength = form.getFieldValue('totalLength')

        // E. Update field form SECARA AMAN hanya jika nilainya memang berubah
        if (
          currentFormula !== generatedFormula ||
          currentSectionLength !== total ||
          currentSectionCount !== calculatedSectionCount ||
          currentTotalLength !== calculatedTotalLength ||
          isRollsChanged
        ) {
          // Gunakan setTimeout 0 agar tidak mengganggu siklus render TanStack Form saat ini
          setTimeout(() => {
            if (isRollsChanged || currentSequence.length === 0) {
              form.setFieldValue('cutMarkSequence', activeSequence)
            }
            if (currentFormula !== generatedFormula) {
              form.setFieldValue('cutMarkFormula', generatedFormula)
            }
            if (currentSectionLength !== total) {
              form.setFieldValue('sectionLength', total)
            }
            if (currentSectionCount !== calculatedSectionCount) {
              form.setFieldValue('sectionCount', calculatedSectionCount)
            }
            if (currentTotalLength !== calculatedTotalLength) {
              form.setFieldValue('totalLength', calculatedTotalLength)
            }
          }, 0)
        }

        return null // Komponen ini hanya bertugas menghitung data (tidak merender UI)
      }}
    </form.Subscribe>
  )
}
