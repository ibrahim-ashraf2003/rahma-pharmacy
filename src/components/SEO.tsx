import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  productData?: {
    name: string;
    price: number;
    currency?: string;
    sku?: string;
    brand?: string;
    availability?: 'InStock' | 'OutOfStock';
    rating?: number;
    reviewCount?: number;
  };
}

export default function SEO({ title, description, image, type = 'website', productData }: SEOProps) {
  useEffect(() => {
    // Update Document Title
    const baseStoreTitle = "متجر الجمال والعناية • صيدلية الرحمة";
    document.title = title.includes(baseStoreTitle) ? title : `${title} | ${baseStoreTitle}`;

    // Update Meta Description
    const metaDescContent = description || "متجر إلكتروني شامل لمنتجات العناية بالبشرة والشعر ومستحضرات التجميل الأصلية في مصر بأسعار معتمدة ومحدثة.";
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', metaDescContent);

    // Update OpenGraph / Social Tags
    const updateOrCreateMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateOrCreateMeta('og:title', title);
    updateOrCreateMeta('og:description', metaDescContent);
    if (image) updateOrCreateMeta('og:image', image);
    updateOrCreateMeta('og:type', type);
    updateOrCreateMeta('og:site_name', 'متجر الجمال والعناية');
    updateOrCreateMeta('og:locale', 'ar_EG');

    // JSON-LD Structured Data Schema Markup
    let schemaScript = document.getElementById('jsonld-schema');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'jsonld-schema';
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }

    if (type === 'product' && productData) {
      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productData.name,
        image: image ? [image] : undefined,
        description: metaDescContent,
        sku: productData.sku || `PROD-${Date.now()}`,
        brand: {
          '@type': 'Brand',
          name: productData.brand || 'Original Brand'
        },
        offers: {
          '@type': 'Offer',
          url: window.location.href,
          priceCurrency: productData.currency || 'EGP',
          price: productData.price,
          availability: productData.availability === 'OutOfStock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition'
        },
        aggregateRating: productData.rating ? {
          '@type': 'AggregateRating',
          ratingValue: productData.rating,
          reviewCount: productData.reviewCount || 15
        } : undefined
      };
      schemaScript.textContent = JSON.stringify(productSchema);
    } else {
      const storeSchema = {
        '@context': 'https://schema.org',
        '@type': 'BeautySalon',
        name: 'متجر الجمال والعناية',
        description: 'متجر متكامل لمستحضرات التجميل والعناية الشخصية والأجهزة ومستلزمات الصالون في مصر',
        currenciesAccepted: 'EGP',
        paymentAccepted: 'Cash, Credit Card, Vodafone Cash',
        priceRange: 'LE 20 - LE 1500'
      };
      schemaScript.textContent = JSON.stringify(storeSchema);
    }

  }, [title, description, image, type, productData]);

  return null;
}
