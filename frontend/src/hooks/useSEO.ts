import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
}

export function useSEO({ title, description }: SEOProps) {
  useEffect(() => {
    // Update title
    document.title = `${title} | Nirikshan`;

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }
  }, [title, description]);
}
