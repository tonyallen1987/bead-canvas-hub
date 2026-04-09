import { ImageAdjustments as AdjustmentsType } from "@/hooks/useImageProcessor";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sun, Contrast, Palette, Grid3X3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageAdjustmentsProps {
  adjustments: AdjustmentsType;
  gridSize: number;
  dithering: boolean;
  onAdjustmentChange: (adj: Partial<AdjustmentsType>) => void;
  onGridSizeChange: (size: number) => void;
  onDitheringChange: (enabled: boolean) => void;
}

export default function ImageAdjustmentsPanel({
  adjustments,
  gridSize,
  dithering,
  onAdjustmentChange,
  onGridSizeChange,
  onDitheringChange,
}: ImageAdjustmentsProps) {
  const sliders = [
    { key: "brightness" as const, label: "亮度", icon: Sun, value: adjustments.brightness },
    { key: "contrast" as const, label: "对比度", icon: Contrast, value: adjustments.contrast },
    { key: "saturation" as const, label: "饱和度", icon: Palette, value: adjustments.saturation },
  ];

  const isDefault = adjustments.brightness === 0 && adjustments.contrast === 0 && adjustments.saturation === 0;

  return (
    <div className="space-y-3 bg-muted/30 rounded-lg p-3">
      {/* Grid size slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Grid3X3 size={13} className="text-muted-foreground" />
            <span className="text-xs font-semibold">网格大小</span>
          </div>
          <span className="text-xs font-bold text-primary tabular-nums">{gridSize}×{gridSize}</span>
        </div>
        <Slider
          value={[gridSize]}
          onValueChange={([v]) => onGridSizeChange(v)}
          min={8}
          max={64}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>8</span>
          <span>简单 ← → 精细</span>
          <span>64</span>
        </div>
      </div>

      {/* Brightness / Contrast / Saturation */}
      {sliders.map(({ key, label, icon: Icon, value }) => (
        <div key={key} className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icon size={13} className="text-muted-foreground" />
              <span className="text-xs font-semibold">{label}</span>
            </div>
            <span className="text-[11px] tabular-nums text-muted-foreground w-8 text-right">
              {value > 0 ? "+" : ""}{value}
            </span>
          </div>
          <Slider
            value={[value]}
            onValueChange={([v]) => onAdjustmentChange({ [key]: v })}
            min={-100}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      ))}

      <div className="flex items-center justify-between pt-1">
        {/* Dithering toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="dither"
            checked={dithering}
            onCheckedChange={onDitheringChange}
          />
          <Label htmlFor="dither" className="text-xs font-semibold flex items-center gap-1 cursor-pointer">
            <Sparkles size={12} />
            抖动算法
          </Label>
        </div>

        {/* Reset */}
        {!isDefault && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={() => onAdjustmentChange({ brightness: 0, contrast: 0, saturation: 0 })}
          >
            重置调节
          </Button>
        )}
      </div>
    </div>
  );
}
