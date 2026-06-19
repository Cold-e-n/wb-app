import { useCallback, useEffect, useRef, useState } from 'react'
import { CutmarkChunk } from '@/types/Cutmark'

import {
  KanbanBoard,
  KanbanBoardCard,
  KanbanBoardCardDescription,
  KanbanBoardCardTitle,
  KanbanBoardColumn,
  KanbanBoardColumnHeader,
  KanbanBoardColumnList,
  KanbanBoardColumnListItem,
  KanbanBoardColumnTitle,
  KanbanBoardProvider,
} from '@/components/ui/kanban'

interface CardData {
  id: string
  title: string
  description: string
  meta: CutmarkChunk
}

interface ColumnData {
  id: string
  title: string
  cards: Array<CardData>
}

interface CutMarkKanbanProps {
  initialRolls: Array<CutmarkChunk>
  testTying: number
  testStretching: number[]
  onChange: (value: { sequence: Array<CutmarkChunk>; formula: string }) => void
}

const buildFormula = (cols: Array<ColumnData>): string => {
  return cols
    .flatMap((c) => c.cards)
    .map((card) => {
      const { type, length, count } = card.meta
      if (type === 'test-tying' || type === 'test-stretching') {
        return `${length}m`
      }
      return `( ${Number(length).toLocaleString('en-US')}m x ${count} )`
    })
    .join(' + ')
}

const buildSequence = (cols: Array<ColumnData>): Array<CutmarkChunk> => {
  return cols.flatMap((c) =>
    c.cards.map((card) => ({
      id: card.meta.id,
      roll: card.meta.roll,
      length: card.meta.length,
      count: card.meta.count,
      type: card.meta.type,
    })),
  )
}

const makeTestTyingCard = (length: number): CardData => {
  return {
    id: 'test-tying',
    title: 'Test Tying',
    description: `Panjang: ${length}m`,
    meta: { id: 'test-tying', roll: 0, length, count: 1, type: 'test-tying' },
  }
}

const makeTestStretchingCard = (length: number, i: number): CardData => {
  return {
    id: `test-stretching-${i}`,
    title: `Test Stretching ${i + 1}`,
    description: `${length}m`,
    meta: {
      id: `test-stretching-${i}`,
      type: 'test-stretching',
      length,
      count: 1,
      roll: 0,
    },
  }
}

export const CutMarkKanban = ({
  initialRolls,
  testTying,
  testStretching,
  onChange,
}: CutMarkKanbanProps) => {
  const [columns, setColumns] = useState<Array<ColumnData>>([])
  const isInitialized = useRef(false)

  const notifyChange = useCallback(
    (updatedColumns: Array<ColumnData>) => {
      onChange({
        sequence: buildSequence(updatedColumns),
        formula: buildFormula(updatedColumns),
      })
    },
    [onChange],
  )

  // Effect 1: Inisialisasi awal saat komponen dimuat atau initialRolls berubah
  useEffect(() => {
    const newColumns: Array<ColumnData> = [
      {
        id: 'col-cutmark',
        title: 'Item Cutmark',
        cards: [
          makeTestTyingCard(testTying),
          ...initialRolls.map((r) => ({
            id: r.id,
            title: `Cutmark: ${r.roll} Roll`,
            description: `Panjang: ${r.length.toLocaleString('en-US')}m\nJumlah: ${r.count}x`,
            meta: { ...r, type: 'roll' as const },
          })),
          ...testStretching.map((length, i) =>
            makeTestStretchingCard(length, i),
          ),
        ],
      },
    ]

    setColumns(newColumns)
    isInitialized.current = true
  }, [initialRolls])

  // Effect 2: Sinkronisasi adaptif saat nilai testTying atau jumlah array testStretching berubah
  useEffect(() => {
    if (!isInitialized.current) return

    setColumns((prev) => {
      return prev.map((col) => {
        let stretchingCount = 0

        // Filter kartu lama, buang yang melebihi jumlah testStretching baru
        let newCards = col.cards.filter((card) => {
          if (card.meta.type !== 'test-stretching') return true
          const keep = stretchingCount < testStretching.length
          stretchingCount++
          return keep
        })

        // Perbarui nilai panjang meter berdasarkan urutan tampilannya
        stretchingCount = 0
        newCards = newCards.map((card) => {
          if (card.meta.type === 'test-tying') {
            return {
              ...card,
              description: `Panjang: ${testTying}m`,
              meta: { ...card.meta, length: testTying },
            }
          }
          if (card.meta.type === 'test-stretching') {
            const newLength = testStretching[stretchingCount]
            const idx = stretchingCount
            stretchingCount++
            return {
              ...card,
              id: `test-stretching-${idx}`,
              title: `Test Stretching ${idx + 1}`,
              description: `Panjang: ${newLength}m`,
              meta: {
                ...card.meta,
                id: `test-stretching-${idx}`,
                length: newLength,
              },
            }
          }
          return card
        })

        // Jika ada item baru ditambahkan di form, buatkan kartu baru di posisi bawah
        for (let i = stretchingCount; i < testStretching.length; i++) {
          newCards.push(makeTestStretchingCard(testStretching[i], i))
        }

        return { ...col, cards: newCards }
      })
    })
  }, [testTying, testStretching])

  // Effect 3: Amankan notifikasi ke parent agar berjalan terpusat
  useEffect(() => {
    if (!isInitialized.current) return
    notifyChange(columns)
  }, [columns, notifyChange])

  const handleDropOverColumn = (columnId: string, cardDataStr: string) => {
    const cardData = JSON.parse(cardDataStr) as CardData
    setColumns((prev) => {
      let updated = prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardData.id),
      }))
      updated = updated.map((col) => {
        if (
          col.id === columnId &&
          !col.cards.some((c) => c.id === cardData.id)
        ) {
          return { ...col, cards: [...col.cards, cardData] }
        }
        return col
      })
      return updated
    })
  }

  const handleDropOverListItem = (
    columnId: string,
    targetCardId: string,
    dropDirection: 'none' | 'top' | 'bottom',
    cardDataStr: string,
  ) => {
    const cardData = JSON.parse(cardDataStr) as CardData
    setColumns((prev) => {
      let updated = prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardData.id),
      }))
      updated = updated.map((col) => {
        if (col.id !== columnId) return col
        const targetIndex = col.cards.findIndex((c) => c.id === targetCardId)
        if (targetIndex === -1) {
          return { ...col, cards: [...col.cards, cardData] }
        }
        const newCards = [...col.cards]
        const insertAt =
          dropDirection === 'bottom' ? targetIndex + 1 : targetIndex
        newCards.splice(insertAt, 0, cardData)
        return { ...col, cards: newCards }
      })
      return updated
    })
  }

  return (
    <KanbanBoardProvider>
      <KanbanBoard>
        {columns.map((column) => (
          <KanbanBoardColumn
            key={column.id}
            columnId={column.id}
            onDropOverColumn={(data) => handleDropOverColumn(column.id, data)}
          >
            <KanbanBoardColumnHeader className="text-xs font-bold text-muted-foreground tracking-wider border-b pb-2 mb-2">
              <KanbanBoardColumnTitle columnId={column.id}>
                {column.title}
              </KanbanBoardColumnTitle>
            </KanbanBoardColumnHeader>
            <KanbanBoardColumnList>
              {column.cards.map((card) => (
                <KanbanBoardColumnListItem
                  key={card.id}
                  cardId={card.id}
                  onDropOverListItem={(data, direction) =>
                    handleDropOverListItem(column.id, card.id, direction, data)
                  }
                >
                  <KanbanBoardCard data={card}>
                    <KanbanBoardCardTitle>{card.title}</KanbanBoardCardTitle>
                    <KanbanBoardCardDescription>
                      {card.description}
                    </KanbanBoardCardDescription>
                  </KanbanBoardCard>
                </KanbanBoardColumnListItem>
              ))}
            </KanbanBoardColumnList>
          </KanbanBoardColumn>
        ))}
      </KanbanBoard>
    </KanbanBoardProvider>
  )
}
