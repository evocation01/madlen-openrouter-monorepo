"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@repo/ui/utils"
import { Button } from "@repo/ui/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover"
import { models } from "@/data/models"

interface ModelSelectorProps {
  selectedModelId: string
  onSelectModel: (modelId: string) => void
}

const tags = Array.from(new Set(models.flatMap(m => m.tags))).sort()

export function ModelSelector({ selectedModelId, onSelectModel }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [activeTag, setActiveTag] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  
  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0]

  const filteredModels = React.useMemo(() => {
    let filtered = models
    
    // Filter by tag
    if (activeTag) {
      filtered = filtered.filter(m => m.tags.includes(activeTag))
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchLower) || 
        m.id.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered
  }, [activeTag, search])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-[250px] sm:max-w-[300px] justify-between h-auto py-2 text-left truncate"
        >
          <div className="flex flex-col items-start truncate overflow-hidden">
            <span className="font-semibold text-sm truncate w-full">{selectedModel?.name}</span>
            <span className="text-xs text-muted-foreground truncate w-full opacity-70">{selectedModel?.id.split(':')[0]}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[95vw] sm:w-[500px] p-0" align="end" collisionPadding={16}>
        <Command loop shouldFilter={false}>
          <CommandInput 
            placeholder="Search models..." 
            value={search}
            onValueChange={setSearch}
          />
          <div className="flex gap-1 p-2 border-b overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-full border transition-all whitespace-nowrap",
                !activeTag 
                  ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                  : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-full border transition-all whitespace-nowrap",
                  tag === activeTag 
                    ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <CommandList className="max-h-[400px]">
            {filteredModels.length === 0 && <CommandEmpty>No model found.</CommandEmpty>}
            <CommandGroup heading="Available Models">
              {filteredModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id} // value is required but filtering is manual now
                  onSelect={() => {
                    console.log("Selected:", model.id)
                    onSelectModel(model.id)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start gap-1 py-3 cursor-pointer aria-selected:bg-accent data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto"
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <span className="font-semibold text-sm">{model.name}</span>
                    {selectedModelId === model.id && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground w-full flex flex-wrap gap-2 items-center">
                    <span className="bg-muted px-1.5 rounded">{model.context} ctx</span>
                    <span>•</span>
                    <span>{model.created}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-90">
                    {model.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {model.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-accent/50 border rounded text-accent-foreground font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
