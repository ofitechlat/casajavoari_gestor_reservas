import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Search } from "lucide-react"
import { Kbd } from "@/components/ui/kbd"

export type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export function SearchInput({
  value,
  onChange,
  onSubmit
}: SearchInputProps) {
  return (
    <InputGroup className="w-[400px]">
      <InputGroupAddon align="inline-start">
        <Search />
      </InputGroupAddon>

      <InputGroupInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            onSubmit()
          }
        }}
        placeholder="Buscar actividad..."
      />

      <InputGroupAddon align="inline-end">
        <Kbd>Ctrl + Enter</Kbd>
      </InputGroupAddon>
    </InputGroup>
  )
}
