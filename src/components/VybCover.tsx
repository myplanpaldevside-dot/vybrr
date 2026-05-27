import {
  Palette, Video, Music, PenTool, Code2, Camera, Sparkles,
  Layers, Clapperboard, Mic2, FileText,
} from "lucide-react";

interface CategoryStyle {
  bg: string;
  iconBg: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  iconClass: string;
  pattern: string;
}

const categoryStyles: Record<string, CategoryStyle> = {
  design: {
    bg: "from-violet-500/20 via-purple-400/10 to-pink-400/15",
    iconBg: "bg-violet-500/20",
    icon: Palette,
    iconClass: "text-violet-500",
    pattern: "radial-gradient(circle at 20% 80%, rgba(124,92,252,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(236,72,153,0.12) 0%, transparent 60%)",
  },
  video: {
    bg: "from-orange-400/20 via-red-400/10 to-rose-400/15",
    iconBg: "bg-orange-400/20",
    icon: Clapperboard,
    iconClass: "text-orange-500",
    pattern: "radial-gradient(circle at 20% 80%, rgba(249,115,22,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(239,68,68,0.12) 0%, transparent 60%)",
  },
  music: {
    bg: "from-teal-400/20 via-cyan-400/10 to-sky-400/15",
    iconBg: "bg-teal-400/20",
    icon: Mic2,
    iconClass: "text-teal-500",
    pattern: "radial-gradient(circle at 20% 80%, rgba(20,184,166,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 60%)",
  },
  writing: {
    bg: "from-amber-400/20 via-yellow-300/10 to-orange-300/15",
    iconBg: "bg-amber-400/20",
    icon: FileText,
    iconClass: "text-amber-500",
    pattern: "radial-gradient(circle at 20% 80%, rgba(245,158,11,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(251,191,36,0.12) 0%, transparent 60%)",
  },
  code: {
    bg: "from-emerald-400/20 via-green-400/10 to-lime-400/15",
    iconBg: "bg-emerald-400/20",
    icon: Code2,
    iconClass: "text-emerald-500",
    pattern: "radial-gradient(circle at 20% 80%, rgba(52,211,153,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(34,197,94,0.12) 0%, transparent 60%)",
  },
  photography: {
    bg: "from-sky-400/20 via-blue-400/10 to-indigo-400/15",
    iconBg: "bg-sky-400/20",
    icon: Camera,
    iconClass: "text-sky-500",
    pattern: "radial-gradient(circle at 20% 80%, rgba(56,189,248,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 60%)",
  },
  animation: {
    bg: "from-purple-500/20 via-violet-400/10 to-indigo-400/15",
    iconBg: "bg-purple-500/20",
    icon: Sparkles,
    iconClass: "text-purple-500",
    pattern: "radial-gradient(circle at 20% 80%, rgba(168,85,247,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 60%)",
  },
};

const fallback: CategoryStyle = {
  bg: "from-primary/20 via-primary/10 to-primary/5",
  iconBg: "bg-primary/20",
  icon: Layers,
  iconClass: "text-primary",
  pattern: "radial-gradient(circle at 20% 80%, rgba(124,92,252,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(124,92,252,0.08) 0%, transparent 60%)",
};

interface VybCoverProps {
  category?: string;
  mediaUrl?: string;
  className?: string;
}

export function VybCover({ category, mediaUrl, className = "h-40" }: VybCoverProps) {
  if (mediaUrl) {
    return (
      <div className={`${className} overflow-hidden`}>
        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  const slug = category?.toLowerCase() ?? "";
  const style = categoryStyles[slug] ?? fallback;
  const Icon = style.icon;

  return (
    <div
      className={`${className} bg-gradient-to-br ${style.bg} flex items-center justify-center relative overflow-hidden`}
      style={{ backgroundImage: style.pattern }}
    >
      {/* Decorative blurred circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -bottom-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-40 ${style.iconBg}`} />
        <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl opacity-30 ${style.iconBg}`} />
      </div>

      {/* Central icon */}
      <div className={`relative w-14 h-14 rounded-2xl ${style.iconBg} flex items-center justify-center backdrop-blur-sm`}>
        <Icon size={28} strokeWidth={1.5} className={style.iconClass} />
      </div>
    </div>
  );
}
