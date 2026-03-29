import { Link } from "react-router-dom";

const footerLinks = {
  Platform: ["Explore", "How it works", "Pricing", "Categories"],
  Company: ["About", "Blog", "Careers", "Press"],
  Support: ["Help Center", "Community", "Contact", "Terms"],
};

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <img src="/vybrr-logo.svg" alt="Vybrr" className="h-8 mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where creativity connects. The marketplace for digital creators and the clients who need them.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      to="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">© 2025 Vybrr. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
