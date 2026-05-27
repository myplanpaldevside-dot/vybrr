import { useState } from "react";
import { motion } from "framer-motion";
import { PageMeta } from "@/components/PageMeta";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, MessageCircle, Clock, Instagram, Twitter } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const subjects = ["General Enquiry", "Payment Issue", "Order Dispute", "Creator Support", "Technical Problem", "Partnership", "Report a User", "Other"];

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_messages" as any).insert({ name, email, subject, message });
      if (error) throw error;
      setSent(true);
    } catch {
      // Fallback: open mailto if table doesn't exist yet
      window.location.href = `mailto:support@vybrr.ng?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Contact Us" description="Get in touch with the Vybrr support team. We're here to help." />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="container px-4 relative text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Mail size={14} /> Get in touch
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-heading font-bold mb-4">
              We'd love to <span className="gradient-text">hear from you</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-xl mx-auto">
              Our team is always here. Drop us a message and we'll get back to you fast.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 container px-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 max-w-5xl mx-auto">

          {/* Info cards */}
          <motion.div
            className="lg:col-span-2 space-y-4"
            initial="hidden" animate="show" variants={stagger}
          >
            {[
              { icon: Mail, title: "Email us", body: "support@vybrr.ng", sub: "We reply within 2 hours" },
              { icon: Clock, title: "Business hours", body: "Mon – Fri, 9am – 6pm WAT", sub: "Weekend support available for urgent issues" },
              { icon: MessageCircle, title: "Response time", body: "Under 2 hours", sub: "Average first response during business hours" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} variants={fadeUp} className="glass-card p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-sm">{item.title}</p>
                    <p className="text-sm text-foreground">{item.body}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              );
            })}

            <motion.div variants={fadeUp} className="glass-card p-5">
              <p className="font-heading font-semibold text-sm mb-3">Follow us</p>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/vybrr.ng" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Instagram size={16} /> @vybrr.ng
                </a>
                <a href="https://x.com/vybrr_ng" target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Twitter size={16} /> @vybrr_ng
                </a>
              </div>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="glass-card p-8">
              {sent ? (
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2">Message sent!</h3>
                  <p className="text-muted-foreground">We'll get back to you within 2 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
                    </div>
                  </div>
                  <div>
                    <Label>Subject</Label>
                    <Select onValueChange={setSubject} required>
                      <SelectTrigger>
                        <SelectValue placeholder="What's this about?" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us as much as you can…" rows={5} required />
                  </div>
                  <Button type="submit" disabled={loading || !name || !email || !subject || !message} className="w-full h-11">
                    {loading ? "Sending…" : "Send Message"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
