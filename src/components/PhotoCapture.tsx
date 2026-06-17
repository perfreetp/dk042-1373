import { useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhotoCapture({
  photo,
  onChange,
}: {
  photo: string | null;
  onChange: (photo: string | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  if (photo) {
    return (
      <motion.div
        layout
        className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-good/50 shadow-glow-good"
      >
        <img src={photo} alt="异常现场" className="h-full w-full object-cover" />
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-md bg-ink/70 px-1.5 py-0.5 text-[0.65rem] text-good backdrop-blur">
          <Check className="h-3 w-3" /> 已拍照
        </div>
        <button
          onClick={() => onChange(null)}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-ink/70 text-slate-100 backdrop-blur hover:text-bad"
          aria-label="移除照片"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.button
      layout
      whileTap={{ scale: 0.96 }}
      onClick={() => ref.current?.click()}
      className={cn(
        "flex h-28 w-40 shrink-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-panel-2/50 text-slatey transition hover:border-amber/60 hover:text-amber",
      )}
    >
      <Camera className="h-5 w-5" />
      <span className="font-display text-xs tracking-wide">拍照记录</span>
      <span className="text-[0.6rem] text-slatey-dim">点击调用摄像头</span>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
    </motion.button>
  );
}
