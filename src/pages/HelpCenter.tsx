import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageMeta } from "@/components/PageMeta";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Zap, CreditCard, Package, Users, Settings, MessageCircle } from "lucide-react";

const categories = [
  { icon: Zap,          label: "Getting Started",  id: "start" },
  { icon: CreditCard,   label: "Payments",          id: "payments" },
  { icon: Package,      label: "Orders",            id: "orders" },
  { icon: Users,        label: "For Creators",      id: "creators" },
  { icon: Settings,     label: "Account",           id: "account" },
  { icon: MessageCircle,label: "Messaging",         id: "messaging" },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  start: [
    { q: "What is Vybrr?", a: "Vybrr is a Nigerian creative marketplace connecting clients with top-tier digital creators — designers, video editors, musicians, developers, photographers, and more. You post what you need, find the right talent, pay securely, and receive world-class creative work." },
    { q: "How do I get started as a client?", a: "Simply sign up, browse Vybs (our name for services), select a package that fits your budget and needs, write your brief, and pay securely via Paystack. Your order goes live immediately." },
    { q: "How do I become a creator on Vybrr?", a: "Sign up and select Creator during onboarding. Complete your profile, add your skills, then create your first Vyb. Once published, clients can find and book you from anywhere." },
    { q: "Is Vybrr only for Nigerians?", a: "Vybrr is built for the Nigerian creative market and currently processes payments in NGN via Paystack. Creators must have a Nigerian bank account for withdrawals. Clients can be anywhere in the world." },
  ],
  payments: [
    { q: "How does payment work?", a: "Clients pay the full order amount upfront via Paystack (cards, bank transfer, USSD). The funds are held securely until the order is completed. Vybrr deducts a 10% platform fee, and the remaining 90% is credited to the creator's available balance." },
    { q: "What is the platform fee?", a: "Vybrr charges a 10% commission on every completed transaction. This covers payment processing, platform maintenance, customer support, and fraud protection. The fee is automatically deducted — creators always see their net earnings." },
    { q: "How do creators withdraw their earnings?", a: "From the Creator Dashboard, click Withdraw, enter your Nigerian bank account details, and your funds are transferred instantly via Paystack. Minimum withdrawal is ₦1,000." },
    { q: "What payment methods are accepted?", a: "We accept all major cards (Visa, Mastercard), bank transfers, USSD, and mobile wallets via Paystack — making it easy for any Nigerian to pay." },
    { q: "Is my payment secure?", a: "Yes. All payments are processed by Paystack, a PCI-DSS compliant payment processor trusted by thousands of Nigerian businesses. We never store your card details." },
  ],
  orders: [
    { q: "What happens after I place an order?", a: "The creator receives a notification and has to accept your order. Once accepted, the status moves to In Progress. You can message the creator, track progress, and download deliverables — all from the Order detail page." },
    { q: "What if I'm not happy with the delivery?", a: "If the work doesn't meet your brief, you can request a revision (within the revision count of your package). If you're still unsatisfied after revisions, contact our support team." },
    { q: "How do I mark an order as complete?", a: "When the creator submits their delivery, you'll see a Mark Complete button on your order. Once you confirm, funds are released to the creator and you're prompted to leave a review." },
    { q: "Can I cancel an order?", a: "Orders can be cancelled before the creator accepts them. Once in progress, contact support to discuss a resolution. We always aim for fair outcomes for both parties." },
  ],
  creators: [
    { q: "How do I create a Vyb?", a: "From your Creator Dashboard, click New Vyb. Add a title, description, category, and up to 3 pricing tiers (Basic, Standard, Premium) with different delivery times and features." },
    { q: "How many Vybs can I publish?", a: "There's no limit. You can publish as many Vybs as you offer services. We recommend starting with 2–3 well-crafted Vybs before expanding." },
    { q: "When do I get paid?", a: "Your earnings show in your dashboard as soon as a client pays. You can withdraw your available balance (90% of order value) at any time — minimum ₦1,000." },
    { q: "How are creator levels determined?", a: "Creators start at Rising and move to Pro and Expert based on completed orders, ratings, and response time. Higher levels unlock more visibility in search results." },
  ],
  account: [
    { q: "How do I update my profile?", a: "Go to Settings from the navigation menu. You can update your display name, username, bio, location, skills, and profile photo." },
    { q: "Can I be both a creator and a client?", a: "Yes! During onboarding or in settings you can select Both. Your dashboard will have tabs to switch between your creator and client views." },
    { q: "How do I reset my password?", a: "On the Login page, click Forgot Password. Enter your email and we'll send a reset link. Check your spam folder if it doesn't arrive within a few minutes." },
    { q: "Can I delete my account?", a: "Contact our support team at support@vybrr.ng to request account deletion. Note: pending orders must be resolved before deletion." },
  ],
  messaging: [
    { q: "How do I message a creator?", a: "Messaging is tied to orders — once you've placed an order, you can chat with the creator directly from the Order detail page. Real-time messages, file sharing, and delivery notes are all in one place." },
    { q: "Can I message a creator before ordering?", a: "Not yet — messaging is currently order-based to keep conversations focused and protect both parties. Pre-order enquiries are coming soon." },
    { q: "Are messages saved?", a: "Yes. All order messages are stored and visible to both parties throughout the order lifecycle." },
  ],
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("start");

  const filtered = search.trim()
    ? Object.values(faqs).flat().filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
    : faqs[activeCategory] ?? [];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Help Center" description="Find answers to common questions about Vybrr — payments, orders, creators, and more." />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="container px-4 relative">
          <motion.div className="text-center max-w-2xl mx-auto" initial="hidden" animate="show" variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <MessageCircle size={14} /> Help Center
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-heading font-bold mb-4">
              How can we <span className="gradient-text">help you?</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8">
              Browse our guides or search for a specific question.
            </motion.p>
            <motion.div variants={fadeUp} className="relative max-w-lg mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for answers…"
                className="pl-11 h-12 text-base"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 container px-4">
        {!search.trim() && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-12"
            initial="hidden" animate="show" variants={stagger}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              const active = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  variants={fadeUp}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/40 hover:bg-muted/50 text-muted-foreground"}`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium text-center">{cat.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        <motion.div className="max-w-3xl mx-auto" initial="hidden" animate="show" variants={stagger}>
          {search.trim() && (
            <motion.p variants={fadeUp} className="text-sm text-muted-foreground mb-6">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
            </motion.p>
          )}
          {filtered.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-3">
              {filtered.map((faq, i) => (
                <motion.div key={i} variants={fadeUp}>
                  <AccordionItem value={`faq-${i}`} className="glass-card px-5 border-none">
                    <AccordionTrigger className="font-heading font-semibold text-sm text-left hover:no-underline py-4">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          ) : (
            <motion.div variants={fadeUp} className="text-center py-16">
              <p className="text-muted-foreground mb-4">No results found for "{search}"</p>
              <Button variant="outline" onClick={() => setSearch("")}>Clear search</Button>
            </motion.div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="mt-20 glass-card p-10 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-heading font-bold mb-2">Still need help?</h2>
          <p className="text-muted-foreground mb-6">Our support team usually replies within 2 hours.</p>
          <Button asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
