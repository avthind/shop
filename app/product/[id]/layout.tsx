import { Metadata } from 'next';
import { getProductById } from '@/data/products';

interface ProductLayoutProps {
  params: {
    id: string;
  };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: ProductLayoutProps): Promise<Metadata> {
  const product = getProductById(params.id);

  if (!product) {
    return {
      title: 'Product Not Found | Modern Storefront',
    };
  }

  return {
    title: `${product.name} | Modern Storefront`,
    description: product.description,
    keywords: `${product.name}, ${product.category}, shop, buy online`,
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'product',
      url: `https://shop.com/product/${product.id}`,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.images[0]],
    },
  };
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return <>{children}</>;
}

