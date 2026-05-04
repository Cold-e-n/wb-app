import { useYarn } from '@/features/yarns/hooks/use-yarn'
import { Combobox } from './combobox'

export const YarnCombobox = ({
  value,
  fieldName,
  onChange,
}: {
  value?: string
  fieldName?: string
  onChange?: (value: string) => void
}) => {
  const { data: yarns, isLoading, error } = useYarn()
  const items = yarns?.map((yarn) => ({ value: yarn.id, label: yarn.name }))

  return (
    <Combobox
      items={items}
      isLoading={isLoading}
      error={error}
      value={value}
      fieldName={fieldName ?? 'yarnId'}
      placeholder="Pilih Benang"
      searchPlaceholder="cari benang ..."
      onChange={(val) => onChange?.(val)}
    />
  )
}
