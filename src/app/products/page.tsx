// src/app/products/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { userHasPurchasedProduct } from '@/lib/auth';

// Define the props type for Next.js 15
interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Mock product data - replace with your actual data fetching
const products = [
  { 
    id: '1', 
    slug: 'product-one', 
    name: 'Product One', 
    description: 'Description for product one',
    price: 99.99 
  },
  { 
    id: '2', 
    slug: 'product-two', 
    name: 'Product Two', 
    description: 'Description for product two',
    price: 149.99 
  },
];

async function getProduct(slug: string) {
  // Replace with actual database query
  return products.find(p => p.slug === slug);
}

export default async function ProductPage({ params }: PageProps) {
  // Await the params in Next.js 15
  const { slug } = await params;
  
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Check if user has access
  const session = await getServerSession(authOptions);
  const hasAccess = session?.user?.id 
    ? await userHasPurchasedProduct(session.user.id, product.id)
    : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-600 mb-6">{product.description}</p>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-2xl font-semibold mb-4">
          ${product.price.toFixed(2)}
        </p>
        
        {hasAccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            You have access to this product!
          </div>
        ) : (
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Purchase Product
          </button>
        )}
      </div>
    </div>
  );
}