import { motion } from "framer-motion";
import { PageMeta } from "@/components/PageMeta";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Shield } from "lucide-react";

const sections = [
  { id: "overview", title: "Overview" },
  { id: "collection", title: "Data We Collect" },
  { id: "use", title: "How We Use Your Data" },
  { id: "sharing", title: "Data Sharing" },
  { id: "payments", title: "Payment Data" },
  { id: "cookies", title: "Cookies" },
  { id: "rights", title: "Your Rights" },
  { id: "security", title: "Data Security" },
  { id: "children", title: "Children's Privacy" },
  { id: "changes", title: "Changes to This Policy" },
  { id: "contact", title: "Contact Us" },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Privacy Policy" description="How Vybrr collects, uses, and protects your personal data." />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="container px-4 relative">
          <motion.div className="text-center max-w-2xl mx-auto" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield size={14} /> Privacy Policy
            </div>
            <h1 className="text-4xl font-heading font-bold mb-3">Your privacy <span className="gradient-text">matters to us</span></h1>
            <p className="text-muted-foreground">Last updated: 26 May 2026</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 container px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Sticky TOC */}
          <motion.aside
            className="hidden lg:block"
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="sticky top-28 glass-card p-5">
              <p className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-4">Contents</p>
              <nav className="space-y-2">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="block text-sm text-muted-foreground hover:text-primary transition-colors py-0.5">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Content */}
          <motion.div
            className="lg:col-span-3 space-y-10 text-sm leading-relaxed text-muted-foreground"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Section id="overview" title="Overview">
              <p>Vybrr ("we", "our", "us") is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data. By using Vybrr, you agree to the practices described in this policy.</p>
            </Section>

            <Section id="collection" title="Data We Collect">
              <p>We collect information you provide directly:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Account data:</strong> name, email address, username, profile photo, bio, location, skills</li>
                <li><strong>Identity data:</strong> bank account details (for creator withdrawals only)</li>
                <li><strong>Order data:</strong> project briefs, messages, delivered files, requirements</li>
                <li><strong>Communication data:</strong> messages between creators and clients, support enquiries</li>
              </ul>
              <p className="mt-3">We also collect data automatically:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Device and browser information</li>
                <li>IP address and approximate location</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Cookie data (see Cookies section)</li>
              </ul>
            </Section>

            <Section id="use" title="How We Use Your Data">
              <ul className="list-disc pl-5 space-y-1">
                <li>To create and manage your account</li>
                <li>To process orders and facilitate payments via Paystack</li>
                <li>To match clients with relevant creators</li>
                <li>To send transactional emails (order updates, payment receipts)</li>
                <li>To provide customer support</li>
                <li>To improve platform features and performance</li>
                <li>To detect and prevent fraud and abuse</li>
                <li>To comply with legal obligations</li>
              </ul>
            </Section>

            <Section id="sharing" title="Data Sharing">
              <p>We do not sell your personal data. We share it only in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Between users:</strong> Creator profiles, Vyb listings, and order details are shared between the relevant client and creator to fulfil orders.</li>
                <li><strong>Paystack:</strong> Payment data is processed by Paystack in accordance with their privacy policy. We do not store card details.</li>
                <li><strong>Service providers:</strong> We use trusted third-party services (hosting, email, analytics) under strict data processing agreements.</li>
                <li><strong>Legal requirements:</strong> We may disclose data when required by law or to protect rights, property, or safety.</li>
              </ul>
            </Section>

            <Section id="payments" title="Payment Data">
              <p>All payment transactions are processed by Paystack, a PCI-DSS Level 1 certified payment processor. Vybrr does not store card numbers, CVVs, or bank PINs. For creator withdrawals, we store your bank account number and account name solely for the purpose of processing transfers via Paystack.</p>
              <p className="mt-2">Vybrr collects a 10% platform commission on every transaction. This fee is transparently shown in your earnings dashboard and deducted before funds become available for withdrawal.</p>
            </Section>

            <Section id="cookies" title="Cookies">
              <p>We use cookies and similar technologies to keep you logged in, remember your preferences, and understand how you use the platform. You can control cookies through your browser settings. Disabling cookies may affect some platform functionality.</p>
            </Section>

            <Section id="rights" title="Your Rights">
              <p>Under applicable Nigerian data protection law (NDPR) and international standards, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Withdraw consent where processing is consent-based</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Object to processing for marketing purposes</li>
              </ul>
              <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:privacy@vybrr.ng" className="text-primary hover:underline">privacy@vybrr.ng</a>.</p>
            </Section>

            <Section id="security" title="Data Security">
              <p>We implement industry-standard security measures including encryption in transit (TLS), encrypted storage for sensitive data, role-based access controls, and regular security reviews. However, no online system is completely secure. We encourage you to use a strong password and enable two-factor authentication where available.</p>
            </Section>

            <Section id="children" title="Children's Privacy">
              <p>Vybrr is not intended for users under 18 years of age. We do not knowingly collect personal data from minors. If you believe a minor has provided us with their data, contact us immediately at <a href="mailto:privacy@vybrr.ng" className="text-primary hover:underline">privacy@vybrr.ng</a>.</p>
            </Section>

            <Section id="changes" title="Changes to This Policy">
              <p>We may update this Privacy Policy periodically. We will notify you of significant changes by email or by displaying a prominent notice on the platform. Your continued use after changes take effect constitutes acceptance of the revised policy.</p>
            </Section>

            <Section id="contact" title="Contact Us">
              <p>For any privacy-related questions or requests:</p>
              <ul className="list-none space-y-1 mt-2">
                <li><strong>Email:</strong> <a href="mailto:privacy@vybrr.ng" className="text-primary hover:underline">privacy@vybrr.ng</a></li>
                <li><strong>General support:</strong> <a href="mailto:support@vybrr.ng" className="text-primary hover:underline">support@vybrr.ng</a></li>
              </ul>
            </Section>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28">
      <h2 className="text-lg font-heading font-bold text-foreground mb-3 pb-2 border-b border-border">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
