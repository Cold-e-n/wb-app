import { useColorLayout } from '@/features/color-layout/hooks/use-color-layout'
import { Combobox } from '@/components/combobox'

export const ColorLayoutsCombobox = ({
  value,
  fieldName,
  onChange,
}: {
  value?: string
  fieldName?: string
  onChange?: (value: string) => void
}) => {
  const { data: colorLayouts, isLoading, error } = useColorLayout()
  const items = colorLayouts?.map((layout) => ({
    value: layout.id,
    label: layout.fabric.name,
  }))

  return (
    <Combobox
      items={items}
      isLoading={isLoading}
      error={error}
      value={value}
      fieldName={fieldName ?? 'yarnId'}
      placeholder="Pilih Layout Benang Warna"
      searchPlaceholder="cari layout benang warna ..."
      onChange={(val) => onChange?.(val)}
    />
  )
}
