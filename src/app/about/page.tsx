// src/app/about/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">About Complians</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We're on a mission to simplify compliance and empower businesses to focus on what they do best.
        </p>
      </div>

      {/* Our Story */}
      <div className="max-w-4xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <p className="text-gray-600">
              Founded in 2024, Complians emerged from a simple observation: compliance shouldn't be complicated. 
              We saw businesses struggling with ever-changing regulations, drowning in paperwork, and risking 
              penalties due to simple oversights.
            </p>
            <p className="text-gray-600 mt-4">
              Our team of compliance experts, software engineers, and AI specialists came together to create 
              a solution that makes compliance management accessible, automated, and actually enjoyable.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mission & Values */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              To democratize compliance management by leveraging AI and automation, making it accessible 
              to businesses of all sizes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Our Vision</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              A world where compliance is no longer a burden but a competitive advantage that drives 
              business growth and innovation.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Simplicity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We believe complexity is the enemy of compliance. Every feature we build must make 
                compliance simpler, not harder.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transparency</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Clear communication, honest pricing, and open processes. We believe trust is built 
                through transparency.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We continuously push the boundaries of what's possible with AI and automation to 
                deliver better compliance solutions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Meet Our Team</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Sarah Chen",
              role: "CEO & Co-founder",
              bio: "Former compliance officer with 15 years of experience in Fortune 500 companies."
            },
            {
              name: "Marcus Johnson",
              role: "CTO & Co-founder",
              bio: "AI researcher and engineer passionate about making complex systems simple."
            },
            {
              name: "Elena Rodriguez",
              role: "Head of Compliance",
              bio: "Certified compliance professional with expertise in international regulations."
            }
          ].map((member) => (
            <Card key={member.name}>
              <CardHeader>
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4" />
                <CardTitle className="text-lg text-center">{member.name}</CardTitle>
                <CardDescription className="text-center">{member.role}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm text-center">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-blue-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Ready to simplify your compliance?</h2>
        <p className="text-gray-600 mb-6">
          Join thousands of businesses that trust Complians for their compliance needs.
        </p>
        <div className="space-x-4">
          <Link href="/contact">
            <Button>Get Started</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">View Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}