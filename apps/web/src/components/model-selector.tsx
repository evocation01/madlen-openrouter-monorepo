"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Info } from "lucide-react"
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
import { models, type Model } from "@/data/models"

interface ModelSelectorProps {
  selectedModelId: string
  onSelectModel: (modelId: string) => void
}

const tags = Array.from(new Set(models.flatMap(m => m.tags))).sort()

export function ModelSelector({ selectedModelId, onSelectModel }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [activeTag, setActiveTag] = React.useState<string | null>(null)
  
  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0]

  const filteredModels = React.useMemo(() => {
    if (!activeTag) return models
    return models.filter(m => m.tags.includes(activeTag))
  }, [activeTag])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full max-w-[300px] justify-between h-auto py-2 text-left truncate"
        >
          <div className="flex flex-col items-start truncate">
            <span className="font-semibold text-sm truncate w-full">{selectedModel?.name}</span>
            <span className="text-xs text-muted-foreground truncate w-full">{selectedModel?.id.split(':')[0]}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search models..." />
          <div className="flex gap-1 p-2 border-b overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTag(null)}
              className={cn(
                "px-2 py-1 text-xs rounded-full border transition-colors whitespace-nowrap",
                !activeTag ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-muted/80"
              )}
            >
              All
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={cn(
                  "px-2 py-1 text-xs rounded-full border transition-colors whitespace-nowrap",
                  tag === activeTag ? "bg-primary text-primary-foreground border-primary" : "bg-muted hover:bg-muted/80"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup heading="Available Models">
              {filteredModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.name + " " + model.id}
                  onSelect={() => {
                    onSelectModel(model.id)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start gap-1 py-3"
                >
                  <div className="flex w-full items-start justify-between">
                    <span className="font-semibold">{model.name}</span>
                    {selectedModelId === model.id && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground w-full flex flex-wrap gap-2 items-center">
                    <span>{model.context} ctx</span>
                    <span>•</span>
                    <span>{model.created}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {model.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {model.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-accent rounded text-accent-foreground">
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
