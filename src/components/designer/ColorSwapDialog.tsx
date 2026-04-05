import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COLOR_GROUPS, PERLER_COLOR_MAP, type PerlerColor } from "@/data/perlerColors";

interface ColorSwapDialogProps {
  open: boolean;
  fromHex: string | null;
  onClose: () => void;
  onSwap: (fromHex: string, toHex: string) => void;
}

export default function ColorSwapDialog({ open, fromHex, onClose, onSwap }: ColorSwapDialogProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const fromColor = fromHex ? PERLER_COLOR_MAP.get(fromHex) : null;

  const handleSwap = () => {
    if (fromHex && selected && fromHex !== selected) {
      onSwap(fromHex, selected);
      onClose();
      setSelected(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose(); setSelected(null); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-extrabold">Swap Color</DialogTitle>
          <DialogDescription>
            Replace{" "}
            {fromColor ? (
              <span className="font-semibold">
                {fromColor.name} ({fromColor.code})
              </span>
            ) : (
              "this color"
            )}{" "}
            with a different Perler bead color
          </DialogDescription>
        </DialogHeader>

        {fromHex && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
            <span className="w-8 h-8 rounded-lg border" style={{ backgroundColor: fromHex }} />
            <span className="text-sm font-semibold">
              {fromColor?.name ?? fromHex}
            </span>
            <span className="text-xs text-muted-foreground">{fromColor?.code}</span>
            <span className="mx-2 text-muted-foreground">→</span>
            {selected ? (
              <>
                <span className="w-8 h-8 rounded-lg border" style={{ backgroundColor: selected }} />
                <span className="text-sm font-semibold">
                  {PERLER_COLOR_MAP.get(selected)?.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground italic">Pick below</span>
            )}
          </div>
        )}

        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
          {COLOR_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold text-muted-foreground mb-1 sticky top-0 bg-background py-0.5">
                {group.label}
              </p>
              <div className="grid grid-cols-8 gap-1.5">
                {group.colors.map((c) => (
                  <button
                    key={c.id}
                    title={`${c.name} (${c.code})`}
                    onClick={() => setSelected(c.hex)}
                    className={cn(
                      "w-8 h-8 rounded-lg transition-transform hover:scale-110",
                      selected === c.hex && "ring-2 ring-primary ring-offset-1 scale-110",
                      fromHex === c.hex && "opacity-30 cursor-not-allowed"
                    )}
                    disabled={fromHex === c.hex}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!selected || selected === fromHex} onClick={handleSwap}>
            Swap Color
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
