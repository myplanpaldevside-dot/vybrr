import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const creators = [
  {
    name: "Chioma Okafor",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=face",
    specialty: "Brand Identity",
    rating: 4.9,
    startingAt: 45000,
    level: "Pro",
  },
  {
    name: "Marcus Webb",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    specialty: "Motion Graphics",
    rating: 5.0,
    startingAt: 80000,
    level: "Expert",
  },
  {
    name: "Adaeze Nwankwo",
    avatar: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&h=200&fit=crop&crop=face",
    specialty: "Music Production",
    rating: 4.8,
    startingAt: 30000,
    level: "Pro",
  },
  {
    name: "Tunde Bakare",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=200&h=200&fit=crop&crop=face",
    specialty: "Video Editing",
    rating: 4.9,
    startingAt: 55000,
    level: "Expert",
  },
  {
    name: "Luna Park",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    specialty: "UI/UX Design",
    rating: 4.7,
    startingAt: 60000,
    level: "Pro",
  },
  {
    name: "Emeka Eze",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    specialty: "Web Development",
    rating: 5.0,
    startingAt: 100000,
    level: "Expert",
  },
  {
    name: "Fatima Bello",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    specialty: "Content Writing",
    rating: 4.8,
    startingAt: 20000,
    level: "Rising",
  },
  {
    name: "Aria Chen",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    specialty: "Photography",
    rating: 4.9,
    startingAt: 75000,
    level: "Pro",
  },
];

export function FeaturedCreators() {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Featured <span className="gradient-text">Creators</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Top-rated talent ready to bring your vision to life.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creators.map((creator, i) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-5 cursor-pointer group"
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                />
                <div>
                  <h3 className="font-heading font-semibold text-sm">{creator.name}</h3>
                  <p className="text-xs text-muted-foreground">{creator.specialty}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-accent text-accent" />
                  <span className="text-sm font-medium">{creator.rating}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {creator.level}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Starting at </span>
                <span className="text-sm font-heading font-semibold">₦{creator.startingAt.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
