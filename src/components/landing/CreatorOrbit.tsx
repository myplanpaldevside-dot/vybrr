import { motion } from "framer-motion";
import { useState } from "react";

const orbitCreators = [
  // Inner orbit - 4 creators
  { name: "Chioma Okafor", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face", specialty: "Brand Identity", orbit: 1 },
  { name: "Tunde Bakare", avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&h=200&fit=crop&crop=face", specialty: "Video Editing", orbit: 1 },
  { name: "Adaeze Nwankwo", avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&h=200&fit=crop&crop=face", specialty: "Music Production", orbit: 1 },
  { name: "Oluwaseun Adeyemi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", specialty: "Motion Graphics", orbit: 1 },
  // Middle orbit - 6 creators
  { name: "Fatima Bello", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", specialty: "Writing", orbit: 2 },
  { name: "Emeka Eze", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", specialty: "Web Dev", orbit: 2 },
  { name: "Ngozi Ibe", avatar: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=200&h=200&fit=crop&crop=face", specialty: "UI/UX", orbit: 2 },
  { name: "Aminu Garba", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face", specialty: "Photography", orbit: 2 },
  { name: "Kemi Adesanya", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face", specialty: "Animation", orbit: 2 },
  { name: "Ifeanyi Okoro", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face", specialty: "Illustration", orbit: 2 },
  // Outer orbit - 8 creators
  { name: "Blessing Obi", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face", specialty: "Design", orbit: 3 },
  { name: "Yusuf Ahmed", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&h=200&fit=crop&crop=face", specialty: "Code", orbit: 3 },
  { name: "Amara Osei", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face", specialty: "Music", orbit: 3 },
  { name: "Ibrahim Musa", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face", specialty: "Video", orbit: 3 },
  { name: "Grace Adeola", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face", specialty: "Writing", orbit: 3 },
  { name: "David Okonkwo", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face", specialty: "3D Art", orbit: 3 },
  { name: "Aisha Balogun", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face", specialty: "Branding", orbit: 3 },
  { name: "Chidi Nnamdi", avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=200&h=200&fit=crop&crop=face", specialty: "Marketing", orbit: 3 },
];

interface OrbitRingProps {
  creators: typeof orbitCreators;
  radius: number;
  avatarSize: number;
  duration: number;
  reverse?: boolean;
  ringIndex: number;
}

function OrbitRing({ creators, radius, avatarSize, duration, reverse, ringIndex }: OrbitRingProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <motion.div
      className="absolute"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: "50%",
        top: "50%",
        marginLeft: -radius,
        marginTop: -radius,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {creators.map((creator, i) => {
        const angle = (i / creators.length) * 360;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const isHovered = hoveredIndex === i;

        return (
          <motion.div
            key={creator.name}
            className="absolute cursor-pointer"
            style={{
              width: avatarSize,
              height: avatarSize,
              left: radius + x - avatarSize / 2,
              top: radius + y - avatarSize / 2,
            }}
            animate={{ rotate: reverse ? 360 : -360 }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "linear",
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={`rounded-full overflow-hidden border-2 transition-all duration-300 ${
                isHovered
                  ? "border-primary scale-[1.3] shadow-xl shadow-primary/30 z-50"
                  : ringIndex === 0
                  ? "border-primary/40 shadow-lg shadow-primary/10"
                  : ringIndex === 1
                  ? "border-primary/25 shadow-md shadow-primary/5"
                  : "border-border shadow-sm"
              }`}
              style={{ width: avatarSize, height: avatarSize }}
            >
              <img
                src={creator.avatar}
                alt={creator.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="absolute left-1/2 -translate-x-1/2 -bottom-12 bg-card border border-border rounded-lg px-3 py-1.5 shadow-2xl whitespace-nowrap z-[100]"
              >
                <p className="text-xs font-heading font-bold text-foreground">{creator.name}</p>
                <p className="text-[10px] text-muted-foreground">{creator.specialty}</p>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function CreatorOrbit() {
  const orbit1 = orbitCreators.filter((c) => c.orbit === 1);
  const orbit2 = orbitCreators.filter((c) => c.orbit === 2);
  const orbit3 = orbitCreators.filter((c) => c.orbit === 3);

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto">
      {/* Orbit ring lines */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute rounded-full border border-primary/15" style={{ width: "38%", height: "38%" }} />
        <div className="absolute rounded-full border border-primary/10" style={{ width: "62%", height: "62%" }} />
        <div className="absolute rounded-full border border-primary/[0.06]" style={{ width: "88%", height: "88%" }} />
      </div>

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/10 rounded-full blur-[60px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />

      {/* Center Vybrr logo */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/30 border border-primary/30">
          <img
            src="/vybrr-icon.png"
            alt="Vybrr"
            className="w-14 h-14 object-contain drop-shadow-lg"
          />
        </div>
      </div>

      {/* Rotating pulse ring around center */}
      <div className="absolute inset-0 flex items-center justify-center z-[5]">
        <motion.div
          className="w-24 h-24 rounded-2xl border border-primary/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Inner orbit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <OrbitRing
          creators={orbit1}
          radius={105}
          avatarSize={54}
          duration={30}
          ringIndex={0}
        />
      </div>

      {/* Middle orbit - reverse */}
      <div className="absolute inset-0 flex items-center justify-center">
        <OrbitRing
          creators={orbit2}
          radius={170}
          avatarSize={44}
          duration={45}
          reverse
          ringIndex={1}
        />
      </div>

      {/* Outer orbit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <OrbitRing
          creators={orbit3}
          radius={240}
          avatarSize={36}
          duration={60}
          ringIndex={2}
        />
      </div>
    </div>
  );
}
