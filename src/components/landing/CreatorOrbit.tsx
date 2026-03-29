import { motion } from "framer-motion";
import { useState } from "react";

const orbitCreators = [
  // Inner orbit (larger avatars)
  { name: "Chioma Okafor", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face", specialty: "Brand Identity", orbit: 1 },
  { name: "Tunde Bakare", avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&h=200&fit=crop&crop=face", specialty: "Video Editing", orbit: 1 },
  { name: "Adaeze Nwankwo", avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&h=200&fit=crop&crop=face", specialty: "Music Production", orbit: 1 },
  { name: "Marcus Webb", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face", specialty: "Motion Graphics", orbit: 1 },
  // Middle orbit
  { name: "Fatima Bello", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face", specialty: "Writing", orbit: 2 },
  { name: "Emeka Eze", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face", specialty: "Web Dev", orbit: 2 },
  { name: "Luna Park", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face", specialty: "UI/UX", orbit: 2 },
  { name: "Aria Chen", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face", specialty: "Photography", orbit: 2 },
  { name: "Kola Adeyemi", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face", specialty: "Animation", orbit: 2 },
  { name: "Nneka Uche", avatar: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=200&h=200&fit=crop&crop=face", specialty: "Illustration", orbit: 2 },
  // Outer orbit (smallest)
  { name: "David Kim", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face", specialty: "3D Art", orbit: 3 },
  { name: "Blessing Obi", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face", specialty: "Design", orbit: 3 },
  { name: "Yusuf Ahmed", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&h=200&fit=crop&crop=face", specialty: "Code", orbit: 3 },
  { name: "Amara Osei", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face", specialty: "Music", orbit: 3 },
  { name: "Ibrahim Musa", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face", specialty: "Video", orbit: 3 },
  { name: "Grace Adeola", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face", specialty: "Writing", orbit: 3 },
];

interface CreatorAvatarProps {
  creator: typeof orbitCreators[0];
  index: number;
  total: number;
  radius: number;
  size: number;
  duration: number;
  reverse?: boolean;
}

function CreatorAvatar({ creator, index, total, radius, size, duration, reverse }: CreatorAvatarProps) {
  const [hovered, setHovered] = useState(false);
  const startAngle = (index / total) * 360;

  return (
    <motion.div
      className="absolute"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      animate={{
        rotate: reverse ? [startAngle, startAngle - 360] : [startAngle, startAngle + 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.div
        className="absolute"
        style={{
          width: size,
          height: size,
          transform: `translateY(-${radius}px)`,
        }}
        animate={{
          rotate: reverse ? [-(startAngle), -(startAngle - 360)] : [-(startAngle), -(startAngle + 360)],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            className={`rounded-full overflow-hidden border-2 transition-all duration-300 shadow-lg ${
              hovered ? "border-primary scale-125 shadow-primary/30 shadow-xl z-50" : "border-background shadow-foreground/5"
            }`}
            style={{ width: size, height: size }}
          >
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute left-1/2 -translate-x-1/2 -bottom-10 bg-card border border-border rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap z-50"
            >
              <p className="text-xs font-heading font-semibold">{creator.name}</p>
              <p className="text-[10px] text-muted-foreground">{creator.specialty}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CreatorOrbit() {
  const orbit1 = orbitCreators.filter((c) => c.orbit === 1);
  const orbit2 = orbitCreators.filter((c) => c.orbit === 2);
  const orbit3 = orbitCreators.filter((c) => c.orbit === 3);

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto">
      {/* Orbit rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-[45%] h-[45%] rounded-full border border-primary/10" />
        <div className="absolute w-[70%] h-[70%] rounded-full border border-primary/[0.07]" />
        <div className="absolute w-[95%] h-[95%] rounded-full border border-primary/[0.04]" />
      </div>

      {/* Glowing center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center backdrop-blur-sm border border-primary/20">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-glow animate-pulse-glow" />
        </div>
      </div>

      {/* Ambient glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/8 rounded-full blur-[80px]" />
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-accent/6 rounded-full blur-[60px]" />

      {/* Inner orbit (clockwise, slower, larger avatars) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {orbit1.map((creator, i) => (
          <CreatorAvatar
            key={creator.name}
            creator={creator}
            index={i}
            total={orbit1.length}
            radius={135}
            size={56}
            duration={40}
          />
        ))}
      </div>

      {/* Middle orbit (counter-clockwise) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {orbit2.map((creator, i) => (
          <CreatorAvatar
            key={creator.name}
            creator={creator}
            index={i}
            total={orbit2.length}
            radius={210}
            size={44}
            duration={55}
            reverse
          />
        ))}
      </div>

      {/* Outer orbit (clockwise, fastest, smallest) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {orbit3.map((creator, i) => (
          <CreatorAvatar
            key={creator.name}
            creator={creator}
            index={i}
            total={orbit3.length}
            radius={280}
            size={36}
            duration={70}
          />
        ))}
      </div>
    </div>
  );
}
