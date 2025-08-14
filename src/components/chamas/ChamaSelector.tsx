"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Chama } from "@/types/api";

interface ChamaSelectorProps {
  chamas: Chama[];
  selectedChamaId: string | null;
  onSelectChama: (chamaId: string) => void;
  className?: string;
}

export function ChamaSelector({ 
  chamas, 
  selectedChamaId, 
  onSelectChama,
  className 
}: ChamaSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedChama = chamas.find(chama => chama.id === selectedChamaId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedChama ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedChama.name}</span>
              </div>
            </div>
          ) : (
            "Select a chama..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search chamas..." />
          <CommandEmpty>No chamas found.</CommandEmpty>
          <CommandGroup>
            {chamas.map((chama) => (
              <CommandItem
                key={chama.id}
                value={chama.name}
                onSelect={() => {
                  onSelectChama(chama.id);
                  setOpen(false);
                }}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{chama.name}</span>
                  {chama.description && (
                    <span className="text-xs text-muted-foreground">
                      {chama.description}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {chama.totalMembers || 0} members
                  </span>
                  <span className="text-xs text-muted-foreground">
                    KSH {chama.monthlyContribution.toLocaleString()}/month
                  </span>
                </div>
                <Check
                  className={cn(
                    "ml-2 h-4 w-4",
                    selectedChamaId === chama.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}