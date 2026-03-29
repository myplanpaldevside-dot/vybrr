import { motion } from "framer-motion";

const avatars = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
];

function MiniOrbitRing({ radius, count, duration, reverse, size }: { radius: number; count: number; duration: number; reverse?: boolean; size: number }) {
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
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        const avatarIdx = (reverse ? count + i : i) % avatars.length;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: size,
              height: size,
              left: radius + x - size / 2,
              top: radius + y - size / 2,
            }}
            animate={{ rotate: reverse ? 360 : -360 }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
          >
            <div className="rounded-full overflow-hidden border border-primary/20 opacity-40">
              <img src={avatars[avatarIdx]} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

export function AuthOrbitBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary/5 rounded-full blur-[80px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px]" />

      {/* Orbit rings (decorative lines) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.08]" style={{ width: 300, height: 300, left: 0, top: 0 }} />
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.05]" style={{ width: 480, height: 480, left: 0, top: 0 }} />
        <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/[0.03]" style={{ width: 660, height: 660, left: 0, top: 0 }} />
      </div>

      {/* Rotating avatars */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <MiniOrbitRing radius={150} count={4} duration={35} size={36} />
        <MiniOrbitRing radius={240} count={5} duration={50} reverse size={30} />
        <MiniOrbitRing radius={330} count={6} duration={65} size={26} />
      </div>
    </div>
  );
}
