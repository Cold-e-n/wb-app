import { useState, useCallback, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { useFabricSpecs } from '@/features/fabric-specs/hooks/use-fabric-specs'
import { useFabricConstructionForm } from '../../hooks/use-fabric-contructions-form'

import type { FabricConstructionForm } from '@/types/FabricConstruction'
import type { FabricSpecWithRelation } from '@/types/FabricSpec'

import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/confirm-dialog'

import {
  Plus,
  Trash2,
  ArrowDown,
  AlertTriangleIcon,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { FabricConstructionEntryForm } from './fabric-construction-entry-form'

export const FabricConstructionsForm = ({
  mode = 'edit',
  initialData,
}: FabricConstructionForm) => {
  const { data: fabricSpecs } = useFabricSpecs()
  const {
    entries,
    updateEntry,
    addEntry,
    removeEntry,
    canAddMore,
    handleSubmit,
    executeUpdate,
    needsConfirmation,
    isPending,
    hasChildren,
    effectedChildren,
  } = useFabricConstructionForm({
    mode,
    initialData,
    initialConeLength: 0,
  })

  const [confirmOpen, setConfirmOpen] = useState(false)

  // Lazy Initialization: Form pertama terbuka, sisanya tertutup
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    () => {
      const initialState: Record<string, boolean> = {}
      if (entries && entries.length > 0) {
        entries.forEach((entry, index) => {
          initialState[entry.constructionId] = index === 0
        })
      }
      return initialState
    },
  )

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }))
  }

  const handleAddEntryClick = () => {
    const newState = { ...expandedCards }
    entries.forEach((e) => {
      newState[e.constructionId] = false
    })
    setExpandedCards(newState)
    addEntry()
  }

  const handleSubmitClick = useCallback(() => {
    if (needsConfirmation) {
      setConfirmOpen(true)
    } else {
      handleSubmit()
    }
  }, [needsConfirmation, handleSubmit])

  // --- KALKULASI UNTUK SUMMARY CARD ---
  const { initialConeLength, totalUsed, finalRemainder } = useMemo(() => {
    const initialCone = Number(entries[0]?.formValues?.coneLength) || 0

    // Total terpakai riil adalah = Jumlah Tarikan x Panjang Tarikan
    const used = entries.reduce((acc, entry) => {
      const sectionCount = Number(entry.formValues.sectionCount) || 1
      const sectionLength = Number(entry.formValues.sectionLength) || 0
      return acc + sectionCount * sectionLength
    }, 0)

    return {
      initialConeLength: initialCone,
      totalUsed: used,
      finalRemainder: initialCone - used,
    }
  }, [entries])

  // Summary hanya muncul di mode Create dan jika ada minimal 2 kain (1 Parent + 1 Child)
  const showSummary = mode === 'create' && entries.length > 1

  return (
    <div className="space-y-6 w-full relative">
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update Konstruksi Terhubung?"
        desc={
          <div className="space-y-3">
            <p>
              Perubahan ini akan otomatis disesuaikan pada konstruksi penerus:
            </p>
            <div className="flex flex-wrap gap-2">
              {effectedChildren.map((child) => (
                <Badge key={child.constructionId} variant="outline">
                  #{child.constructionId}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              Nilai <span className="font-mono">coneLength</span> pada
              konstruksi di atas akan dihitung ulang berdasarkan sisa benang
              terbaru.
            </p>
          </div>
        }
        confirmText="Ya, Update Semua"
        cancelBtnText="Batal"
        handleConfirm={() => {
          setConfirmOpen(false)
          executeUpdate()
        }}
        isLoading={isPending}
      />

      {mode === 'edit' && hasChildren && effectedChildren.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangleIcon className="h-5 w-5" />
          <AlertTitle>Peringatan Cascade Update</AlertTitle>
          <AlertDescription>
            Kamu sedang mengedit konstruksi kain yang terhubung dengan kain
            lain. Perubahan di sini akan berdampak pada:
            <div className="mt-2 flex flex-wrap gap-2">
              {effectedChildren.map((child) => (
                <Badge key={child.constructionId} variant="destructive" asChild>
                  <Link
                    to="/fabric-constructions/$fabricConstructionId/edit"
                    params={{ fabricConstructionId: child.constructionId }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    #{child.constructionId}{' '}
                    <ArrowUpRight className="ml-1 inline-end h-3 w-3" />
                  </Link>
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* STRUKTUR DUA KOLOM (Kiri: Form, Kanan: Summary) */}
      <div className="flex flex-col xl:flex-row gap-6 items-start w-full">
        {/* KOLOM KIRI: Daftar Form Kain */}
        <div className="flex-1 space-y-6 min-w-0 w-full">
          {entries.map((entry, index) => {
            const isExpanded = expandedCards[entry.constructionId] !== false

            return (
              <div key={entry.constructionId} className="relative">
                {index > 0 &&
                  (() => {
                    const startLength = entries[0].effectiveConeLength || 1
                    const currentRemainder = entry.effectiveConeLength || 0
                    const percentage = (currentRemainder / startLength) * 100
                    const isLow = currentRemainder < 2000

                    return (
                      <div className="flex flex-col items-center justify-center my-4 transition-all">
                        <div className="h-6 w-0.5 bg-linear-to-b from-border to-transparent" />
                        <div className="flex flex-col items-center gap-2 bg-background border rounded-xl px-5 py-3 shadow-sm min-w-55 z-10">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <ArrowDown className="h-4 w-4 text-muted-foreground animate-bounce" />
                            <span>
                              Sisa Benang: {currentRemainder.toLocaleString()} m
                            </span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full transition-all duration-700 ease-in-out',
                                isLow ? 'bg-destructive' : 'bg-primary',
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono self-end -mt-1">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-6 w-0.5 bg-linear-to-b from-transparent to-border" />
                      </div>
                    )
                  })()}

                <Card className="w-full border-border/60 shadow-md transition-all duration-300 relative overflow-hidden">
                  <div
                    className={cn(
                      'absolute top-0 left-0 right-0 h-0.75',
                      index === 0 ? 'bg-primary' : 'bg-emerald-500',
                    )}
                  />
                  <CardHeader
                    className={cn(
                      'flex flex-row items-center justify-between space-y-0 pb-4 pt-5 cursor-pointer transition-colors hover:bg-muted/30 select-none',
                      !isExpanded && 'pb-5',
                    )}
                    onClick={() => toggleCard(entry.constructionId)}
                  >
                    <div className="flex flex-col gap-1.5">
                      <CardTitle className="text-lg font-bold flex items-center gap-2 flex-wrap">
                        {`Kain (#${index + 1})`}
                        <span className="text-xs font-mono font-normal bg-muted px-2 py-0.5 rounded text-muted-foreground">
                          ID: {entry.constructionId}
                        </span>
                      </CardTitle>
                    </div>

                    <div className="flex items-center gap-1.5 z-10">
                      {index > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeEntry(index)
                          }}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4 sm:mr-1.5" />
                          <span className="hidden sm:inline text-xs">
                            Hapus
                          </span>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pb-6 border-t pt-5 animate-in slide-in-from-top-2 fade-in duration-200">
                      <FabricConstructionEntryForm
                        entry={entry}
                        index={index}
                        onUpdate={(vals) => updateEntry(index, vals)}
                        isEditMode={mode === 'edit'}
                        fabricSpecs={
                          fabricSpecs as unknown as Array<FabricSpecWithRelation>
                        }
                      />
                    </CardContent>
                  )}
                </Card>
              </div>
            )
          })}
        </div>

        {/* KOLOM KANAN: Sticky Summary Card */}
        {showSummary && (
          <div className="w-full xl:w-65 shrink-0 xl:sticky xl:top-20 z-10 animate-in slide-in-from-right-4 fade-in duration-300">
            <Card className="border-primary/20 shadow-lg bg-primary/5">
              <CardHeader className="border-b border-primary/10">
                <CardTitle className="text-sm font-bold text-primary flex items-center gap-2">
                  Ringkasan
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* 1. List Kain dan Total Panjang Terpakai */}
                <div className="space-y-3">
                  {entries.map((entry, i) => {
                    const rolls = entry.formValues.rollCount || 1
                    const conesCount = entry.formValues.coneCount || 1
                    const sectionCount =
                      Number(entry.formValues.sectionCount) || 1
                    const sectionLength =
                      Number(entry.formValues.sectionLength) || 1
                    const used = Number(entry.formValues.totalLength) || 0

                    return (
                      <div
                        key={entry.constructionId}
                        className="flex justify-between items-start border-b border-border/50 pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            Kain #{i + 1} [{rolls} Roll]
                          </span>
                          <span className="text-xs font-jetbrains-mono text-muted-foreground">
                            {conesCount} cones
                          </span>
                          <span className="text-xs font-jetbrains-mono text-muted-foreground">
                            {sectionCount}{' '}
                            {entry.formValues.warpingMachine === 'BENN_KM'
                              ? 'section'
                              : 'beam'}
                          </span>
                          <span className="text-xs font-jetbrains-mono text-muted-foreground">
                            {sectionLength.toLocaleString()} m
                          </span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-mono text-xs font-medium">
                            {used.toLocaleString()} m
                          </span>

                          <span className="text-[11px] text-muted-foreground">
                            Terpakai
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 2 & 3. Kalkulasi Grand Total dan Sisa */}
                <div className="bg-background rounded-lg p-3 border shadow-sm space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Panjang Awal</span>
                    <span className="font-mono">
                      {initialConeLength.toLocaleString()} m
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Total Terpakai</span>
                    <span className="font-mono text-destructive">
                      -{totalUsed.toLocaleString()} m
                    </span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between items-center text-sm font-bold pt-1">
                    <span className="text-foreground">Sisa Akhir</span>
                    <span
                      className={cn(
                        'font-mono',
                        finalRemainder < 2000
                          ? 'text-destructive'
                          : 'text-primary',
                      )}
                    >
                      {finalRemainder.toLocaleString()} m
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS (Sticky Bottom) */}
      <div className="sticky bottom-0 z-40 flex flex-wrap items-center justify-between gap-4 border-t bg-background/80 p-4 backdrop-blur-md shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] -mx-4 px-4 sm:mx-0 sm:px-4">
        {mode === 'create' ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddEntryClick}
            className="border-dashed hover:border-primary hover:bg-primary/5 transition-all"
            disabled={!canAddMore}
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Kain (Gunakan Sisa Benang)
          </Button>
        ) : (
          <div></div>
        )}

        <Button
          type="button"
          onClick={handleSubmitClick}
          disabled={isPending}
          className="shadow-sm font-semibold"
        >
          {isPending
            ? 'Menyimpan...'
            : mode === 'edit'
              ? 'Simpan Perubahan'
              : 'Buat Konstruksi'}
        </Button>
      </div>
    </div>
  )
}
