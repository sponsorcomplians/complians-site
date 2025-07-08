// src/app/products/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

const products = [
  {
    id: 'compliance-starter',
    name: 'Compliance Starter',
    description: 'Perfect for small businesses just getting started with compliance',
    price: 49,
    features: [
      'Basic compliance tracking',
      'Up to 10 employees',
      'Monthly compliance reports',
      'Email support',
      'Basic document storage'
    ],
    popular: false,
    slug: 'compliance-starter'
  },
  {
    id: 'compliance-pro',
    name: 'Compliance Pro',
    description: 'Comprehensive compliance management for growing businesses',
    price: 149,
    features: [
      'Advanced compliance tracking',
      'Up to 100 employees',
      'Real-time compliance monitoring',
      'Priority support',
      'Unlimited document storage',
      'Custom compliance workflows',
      'API access'
    ],
    popular: true,
    slug: 'compliance-pro'
  },
  {
    id: 'compliance-enterprise',
    name: 'Compliance Enterprise',
    description: 'Enterprise-grade compliance solution with custom features',
    price: null,
    features: [
      'Everything in Pro',
      'Unlimited employees',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment option',
      'Advanced analytics'
    ],
    popular: false,
    slug: 'compliance-enterprise'
  }
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Choose Your Compliance Solution
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Powerful compliance management tools that grow with your business. 
          Start free and upgrade as you need.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
        {products.map((product) => (
          <Card 
            key={product.id} 
            className={`relative ${product.popular ? 'border-blue-500 shadow-lg' : ''}`}
          >
            {product.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center pb-8 pt-6">
              <CardTitle className="text-2xl mb-2">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
              <div className="mt-4">
                {product.price ? (
                  <div>
                    <span className="text-4xl font-bold">${product.price}</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold">Custom Pricing</div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pb-8">
              <ul className="space-y-3">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            
            <CardFooter>
              <Link href={`/products/${product.slug}`} className="w-full">
                <Button 
                  className="w-full" 
                  variant={product.popular ? 'default' : 'outline'}
                >
                  {product.price ? 'Get Started' : 'Contact Sales'}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          All Plans Include
        </h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: 'Security First',
              description: 'Bank-level encryption and security for all your compliance data'
            },
            {
              title: 'Regular Updates',
              description: 'Stay compliant with automatic regulation updates'
            },
            {
              title: '99.9% Uptime',
              description: 'Reliable service with guaranteed availability'
            },
            {
              title: 'Data Export',
              description: 'Export your data anytime in multiple formats'
            }
          ].map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect 
                immediately, and we'll prorate any payments.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Yes, all plans come with a 14-day free trial. No credit card required to start.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What kind of support do you offer?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                All plans include email support. Pro and Enterprise plans get priority support 
                with faster response times and phone support.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">
          Ready to simplify your compliance?
        </h2>
        <p className="text-gray-600 mb-6">
          Start your free trial today. No credit card required.
        </p>
        <div className="space-x-4">
          <Link href="/ai-agents">
            <Button size="lg">Start Free Trial</Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="outline">Talk to Sales</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}