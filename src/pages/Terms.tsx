import { motion } from "framer-motion";
import { PageMeta } from "@/components/PageMeta";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { FileText } from "lucide-react";

const sections = [
  { id: "agreement", title: "Agreement to Terms" },
  { id: "platform", title: "About the Platform" },
  { id: "accounts", title: "User Accounts" },
  { id: "creators", title: "Creator Terms" },
  { id: "clients", title: "Client Terms" },
  { id: "payments", title: "Payments & Fees" },
  { id: "commission", title: "Platform Commission" },
  { id: "orders", title: "Orders & Delivery" },
  { id: "disputes", title: "Disputes" },
  { id: "prohibited", title: "Prohibited Conduct" },
  { id: "ip", title: "Intellectual Property" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "termination", title: "Termination" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact" },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Terms of Service" description="The terms and conditions governing your use of the Vybrr platform." />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh pointer-events-none" />
        <div className="container px-4 relative">
          <motion.div className="text-center max-w-2xl mx-auto" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <FileText size={14} /> Terms of Service
            </div>
            <h1 className="text-4xl font-heading font-bold mb-3">Terms of <span className="gradient-text">Service</span></h1>
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
            <Section id="agreement" title="Agreement to Terms">
              <p>By accessing or using the Vybrr platform ("Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform. These Terms apply to all users — including clients, creators, and visitors.</p>
            </Section>

            <Section id="platform" title="About the Platform">
              <p>Vybrr is an online marketplace that connects clients ("Clients") seeking digital creative services with independent service providers ("Creators"). Vybrr facilitates transactions between Clients and Creators but is not a party to any agreement between them. Vybrr does not employ Creators and is not responsible for the quality, safety, legality, or accuracy of services offered.</p>
            </Section>

            <Section id="accounts" title="User Accounts">
              <ul className="list-disc pl-5 space-y-1">
                <li>You must be at least 18 years old to create an account.</li>
                <li>You must provide accurate, current, and complete information during registration.</li>
                <li>You are responsible for maintaining the confidentiality of your password and for all activity under your account.</li>
                <li>One person may not maintain more than one active account.</li>
                <li>Vybrr reserves the right to suspend or terminate accounts that violate these Terms.</li>
              </ul>
            </Section>

            <Section id="creators" title="Creator Terms">
              <ul className="list-disc pl-5 space-y-1">
                <li>Creators must accurately represent their skills, experience, and services in their Vybs.</li>
                <li>Creators are solely responsible for delivering the services described in their Vybs.</li>
                <li>Creators must respond to order messages within a reasonable time (ideally within 24 hours).</li>
                <li>Creators retain intellectual property rights to their work until full payment is received and confirmed, after which ownership transfers to the Client unless otherwise agreed in writing.</li>
                <li>Creators must not offer or solicit off-platform payments.</li>
                <li>Creators must have a valid Nigerian bank account to receive withdrawals.</li>
              </ul>
            </Section>

            <Section id="clients" title="Client Terms">
              <ul className="list-disc pl-5 space-y-1">
                <li>Clients must provide clear, accurate project briefs when placing orders.</li>
                <li>Clients must mark orders as complete within 7 days of delivery, failing which they are auto-completed.</li>
                <li>Clients may request revisions only within the revision count stated in the chosen package.</li>
                <li>Clients must not misuse the revision system to extract excessive work beyond the agreed scope.</li>
                <li>Clients must not attempt to communicate with or pay Creators outside the Platform.</li>
              </ul>
            </Section>

            <Section id="payments" title="Payments & Fees">
              <p>All payments on Vybrr are processed by Paystack, a PCI-DSS certified payment processor. By using the Platform, you agree to Paystack's terms and privacy policy.</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>All prices are displayed and charged in Nigerian Naira (₦).</li>
                <li>Payment is collected in full at the time of order placement.</li>
                <li>Funds are held securely until order completion.</li>
                <li>Creator withdrawals are processed via Paystack bank transfer. Minimum withdrawal is ₦1,000.</li>
              </ul>
            </Section>

            <Section id="commission" title="Platform Commission">
              <p className="font-medium text-foreground">Vybrr charges a 10% platform commission on every transaction.</p>
              <p className="mt-2">This means:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>When a Client pays ₦10,000 for a service, the Creator receives ₦9,000 and Vybrr retains ₦1,000.</li>
                <li>The commission is automatically deducted before earnings become available for withdrawal.</li>
                <li>The commission covers payment processing, platform infrastructure, fraud protection, and customer support.</li>
                <li>The commission percentage may be adjusted with 30 days' notice to existing users.</li>
              </ul>
              <p className="mt-2">Creator dashboards always display <strong>net earnings</strong> (after commission deduction) for full transparency.</p>
            </Section>

            <Section id="orders" title="Orders & Delivery">
              <ul className="list-disc pl-5 space-y-1">
                <li>Orders become active once a Creator accepts them.</li>
                <li>Creators must deliver work by the agreed delivery date.</li>
                <li>Late delivery should be communicated proactively to the Client via the order messaging system.</li>
                <li>Clients have 7 days after delivery to review the work and either approve, request a revision, or raise a dispute.</li>
                <li>Orders not reviewed within 7 days of delivery are automatically marked as completed and funds released to the Creator.</li>
              </ul>
            </Section>

            <Section id="disputes" title="Disputes">
              <p>If a dispute arises between a Client and a Creator, both parties should first attempt to resolve it through the order messaging system. If unresolved, contact Vybrr support at <a href="mailto:support@vybrr.ng" className="text-primary hover:underline">support@vybrr.ng</a>. Vybrr will review the case and make a final determination, which may include partial or full refunds at Vybrr's discretion.</p>
              <p className="mt-2">Vybrr's decision in dispute cases is final. Vybrr is not liable for losses beyond the order amount.</p>
            </Section>

            <Section id="prohibited" title="Prohibited Conduct">
              <p>The following are strictly prohibited on Vybrr:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Circumventing the platform to pay or receive payment off-platform</li>
                <li>Creating fake reviews or manipulating ratings</li>
                <li>Impersonating another user or person</li>
                <li>Posting false, misleading, or defamatory content</li>
                <li>Offering illegal services or content</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Using the platform for money laundering or fraudulent activity</li>
                <li>Scraping, crawling, or automated data collection without permission</li>
              </ul>
              <p className="mt-2">Violations may result in immediate account suspension and, where applicable, reporting to relevant authorities.</p>
            </Section>

            <Section id="ip" title="Intellectual Property">
              <p>All platform content, trademarks, logos, and branding ("Vybrr IP") are owned by or licensed to Vybrr. You may not use Vybrr IP without prior written consent.</p>
              <p className="mt-2">Work created by Creators for Clients: ownership transfers to the Client upon full payment, unless a different arrangement is explicitly stated in the Vyb listing or order agreement.</p>
            </Section>

            <Section id="liability" title="Limitation of Liability">
              <p>To the maximum extent permitted by law, Vybrr is not liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to loss of profits, data, or business opportunities. Vybrr's total liability for any claim shall not exceed the amount paid by you in the relevant transaction.</p>
            </Section>

            <Section id="termination" title="Termination">
              <p>Vybrr may suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or at our sole discretion with reasonable notice. You may close your account at any time by contacting support, provided all active orders are resolved and any outstanding balance is withdrawn.</p>
            </Section>

            <Section id="changes" title="Changes to Terms">
              <p>We may update these Terms periodically. Material changes will be communicated by email or via an in-platform notice at least 14 days before taking effect. Continued use of the Platform after the effective date constitutes acceptance of the updated Terms.</p>
            </Section>

            <Section id="contact" title="Contact">
              <p>For questions about these Terms:</p>
              <ul className="list-none mt-2 space-y-1">
                <li><strong>Email:</strong> <a href="mailto:legal@vybrr.ng" className="text-primary hover:underline">legal@vybrr.ng</a></li>
                <li><strong>Support:</strong> <a href="mailto:support@vybrr.ng" className="text-primary hover:underline">support@vybrr.ng</a></li>
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
