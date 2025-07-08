// src/app/products/[slug]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { userHasPurchasedProduct } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Remove the old interface and use the correct one for Next.js 15
export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await the params (required in Next.js 15)
  const { slug } = await params;
  
  // Your existing product logic here
  // For now, using placeholder data
  const product = {
    id: '1',
    name: 'Sample Product',
    description: 'This is a sample product',
    price: 99.99,
    slug: slug
  };

  if (!product || product.slug !== slug) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const hasAccess = session?.user?.id 
    ? await userHasPurchasedProduct(session.user.id, product.id)
    : false;

  if (!session && process.env.NEXT_PUBLIC_DISABLE_AUTH !== 'true') {
    redirect('/auth/signin');
  }

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