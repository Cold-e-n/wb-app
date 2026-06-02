import { useCallback, useEffect, useRef, useState } from 'react'
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

export interface CutMarkChunk {
  id: string
  roll: number
  length: number
  count: number
  type?: 'roll' | 'test-awal' | 'test-akhir'
}

interface CardData {
  id: string
  title: string
  description: string
  meta: CutMarkChunk
}

interface ColumnData {
  id: string
  title: string
  cards: Array<CardData>
}

interface CutMarkKanbanProps {
  initialRolls: Array<CutMarkChunk>
  testTying: number
  testStretching: number
  // Sesuaikan tipe onChange agar mengalirkan objek sequence & formula kembali ke parent
  onChange: (value: { sequence: Array<CutMarkChunk>; formula: string }) => void
}

// Helper: build formula string from columns (single source of truth)
function buildFormula(cols: Array<ColumnData>): string {
  const allCards = cols.flatMap((c) => c.cards)
  const formulaParts: Array<string> = []
  allCards.forEach((card) => {
    const item = card.meta
    if (item.type === 'test-awal') {
      formulaParts.push(`${item.length}m`)
    } else if (item.type === 'test-akhir') {
      formulaParts.push(`${item.length}m`)
    } else {
      formulaParts.push(
        `( ${Number(item.length).toLocaleString('en-Us')}m x ${item.count} )`,
      )
    }
  })
  return formulaParts.join(' + ')
}

// Helper: build sequence from columns
function buildSequence(cols: Array<ColumnData>): Array<CutMarkChunk> {
  const allCards = cols.flatMap((c) => c.cards)
  return allCards.map((card) => ({
    id: card.meta.id,
    roll: card.meta.roll,
    length: card.meta.length,
    count: card.meta.count,
    type: card.meta.type,
  }))
}

export function CutMarkKanban({
  initialRolls,
  testTying,
  testStretching,
  onChange,
}: CutMarkKanbanProps) {
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

  // Effect 1: Rebuild columns from scratch when initialRolls change (fabric/rollCount change)
  useEffect(() => {
    const newColumns = [
      {
        id: 'col-cutmark',
        title: 'Urutan Cutmark',
        cards: [
          {
            id: 'test-awal',
            title: 'Test Awal',
            description: `Panjang: ${testTying}m`,
            meta: {
              id: 'test-awal',
              roll: 0,
              length: testTying,
              count: 1,
              type: 'test-awal' as const,
            },
          },
          ...initialRolls.map((r) => ({
            id: r.id,
            title: `Cutmark: ${r.roll} Roll`,
            description: `Panjang: ${r.length.toLocaleString('en-Us')}m\nJumlah: ${r.count}x`,
            meta: { ...r, type: 'roll' as const },
          })),
          {
            id: 'test-akhir',
            title: 'Test Akhir',
            description: `Panjang: ${testStretching}m`,
            meta: {
              id: 'test-akhir',
              roll: 0,
              length: testStretching,
              count: 1,
              type: 'test-akhir' as const,
            },
          },
        ],
      },
    ]

    setColumns(newColumns)
    notifyChange(newColumns)
    isInitialized.current = true
  }, [initialRolls])

  // Effect 2: When testTying/testStretching change, update existing cards in-place (preserve order)
  useEffect(() => {
    if (!isInitialized.current) return

    setColumns((prevColumns) => {
      const updatedColumns = prevColumns.map((col) => ({
        ...col,
        cards: col.cards.map((card) => {
          if (card.meta.type === 'test-awal') {
            return {
              ...card,
              description: `Panjang: ${testTying}m`,
              meta: { ...card.meta, length: testTying },
            }
          }
          if (card.meta.type === 'test-akhir') {
            return {
              ...card,
              description: `Panjang: ${testStretching}m`,
              meta: { ...card.meta, length: testStretching },
            }
          }
          return card
        }),
      }))

      return updatedColumns
    })
  }, [testTying, testStretching, notifyChange])

  useEffect(() => {
    if (!isInitialized.current) return
    notifyChange(columns)
  }, [columns, notifyChange])

  const handleDropOverColumn = (columnId: string, cardDataStr: string) => {
    const cardData = JSON.parse(cardDataStr) as CardData

    setColumns((prevColumns) => {
      let updatedColumns = prevColumns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardData.id),
      }))

      updatedColumns = updatedColumns.map((col) => {
        if (col.id === columnId) {
          if (!col.cards.some((c) => c.id === cardData.id)) {
            return { ...col, cards: [...col.cards, cardData] }
          }
        }
        return col
      })

      notifyChange(updatedColumns)
      return updatedColumns
    })
  }

  const handleDropOverListItem = (
    columnId: string,
    targetCardId: string,
    dropDirection: 'none' | 'top' | 'bottom',
    cardDataStr: string,
  ) => {
    const cardData = JSON.parse(cardDataStr) as CardData

    setColumns((prevColumns) => {
      let updatedColumns = prevColumns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardData.id),
      }))

      updatedColumns = updatedColumns.map((col) => {
        if (col.id === columnId) {
          const targetIndex = col.cards.findIndex((c) => c.id === targetCardId)
          if (targetIndex !== -1) {
            const newCards = [...col.cards]
            if (dropDirection === 'top') {
              newCards.splice(targetIndex, 0, cardData)
            } else if (dropDirection === 'bottom') {
              newCards.splice(targetIndex + 1, 0, cardData)
            } else {
              newCards.splice(targetIndex, 0, cardData)
            }
            return { ...col, cards: newCards }
          } else {
            return { ...col, cards: [...col.cards, cardData] }
          }
        }
        return col
      })

      notifyChange(updatedColumns)
      return updatedColumns
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
