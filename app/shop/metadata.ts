import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop - Modern Storefront | Quality Products',
  description: 'Discover quality products with a clean, minimal shopping experience. Browse our curated collection of art prints, canvas art, and wall decor.',
  keywords: 'shop, storefront, art prints, canvas art, wall decor, minimal design',
  openGraph: {
    title: 'Shop - Modern Storefront',
    description: 'Discover quality products with a clean, minimal shopping experience.',
    type: 'website',
    url: 'https://shop.com',
    images: [
      {
        url: 'https://shop.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Shop - Modern Storefront',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop - Modern Storefront',
    description: 'Discover quality products with a clean, minimal shopping experience.',
    images: ['https://shop.com/og-image.jpg'],
  },
};

