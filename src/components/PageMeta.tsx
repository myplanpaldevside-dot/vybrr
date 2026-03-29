import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description?: string;
}

export function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    const suffix = "Vybrr";
    document.title = title === suffix ? `${suffix} - Where Creativity Connects` : `${title} | ${suffix}`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
  }, [title, description]);

  return null;
}
