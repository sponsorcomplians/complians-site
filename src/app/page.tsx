"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Categories and levels data
const categories = [
  { id: "all", name: "All Categories" },
  { id: "compliance", name: "Compliance" },
  { id: "hr", name: "HR Management" },
  { id: "reporting", name: "Reporting" },
  { id: "monitoring", name: "Monitoring" },
];

const levels = [
  { id: "all", name: "All Levels" },
  { id: "starter", name: "Starter" },
  { id: "professional", name: "Professional" },
  { id: "enterprise", name: "Enterprise" },
];

// All agents data
const allAgents = [
  {
    id: "qualification",
    title: "AI Qualification Compliance Agent",
    description: "Instantly verify if your job meets Skilled Worker visa requirements",
    category: "compliance",
    level: "starter",
    price: 97,
    features: [
      "Instant qualification checker",
      "SOC code verification",
      "Salary threshold validation",
      "Downloadable compliance report"
    ],
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "salary",
    title: "AI Salary Compliance Agent",
    description: "Ensure your salary offers meet Home Office requirements",
    category: "compliance",
    level: "starter",
    price: 97,
    features: [
      "Real-time salary checking",
      "Going rate calculations",
      "Regional variance analysis",
      "Compliance certificates"
    ],
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "cos-generator",
    title: "AI CoS Document Generator",
    description: "Generate compliant Certificate of Sponsorship documents instantly",
    category: "hr",
    level: "professional",
    price: 297,
    features: [
      "Auto-populated CoS forms",
      "Compliance validation",
      "Document version control",
      "Multi-format export"
    ],
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "rtr-assistant",
    title: "AI Right to Rent Assistant",
    description: "Streamline right to rent checks with automated verification",
    category: "compliance",
    level: "professional",
    price: 197,
    features: [
      "Document verification",
      "Automated record keeping",
      "Expiry date tracking",
      "Audit trail generation"
    ],
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "audit-defender",
    title: "AI Audit Defender",
    description: "Prepare for Home Office audits with confidence",
    category: "reporting",
    level: "enterprise",
    price: 497,
    features: [
      "Audit readiness scoring",
      "Document completeness check",
      "Mock audit simulations",
      "Corrective action plans"
    ],
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "monitoring-system",
    title: "AI Compliance Monitoring System",
    description: "24/7 monitoring of your sponsor licence compliance",
    category: "monitoring",
    level: "enterprise",
    price: 597,
    features: [
      "Real-time compliance tracking",
      "Automated alerts",
      "Predictive risk analysis",
      "Executive dashboards"
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const filteredAgents = allAgents.filter((agent) => {
    const categoryMatch = selectedCategory === "all" || agent.category === selectedCategory;
    const levelMatch = selectedLevel === "all" || agent.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#001e70] to-[#00c3ff] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            AI-Powered Immigration Compliance
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Transform your sponsor licence management with intelligent automation. 
            Stay compliant, save time, and reduce risk with our suite of AI agents.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="#agents"
              className="bg-white text-[#001e70] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Explore AI Agents
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#001e70] transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our AI Compliance Agents?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[#00c3ff] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Intelligent Automation</h3>
              <p className="text-gray-600">
                Our AI agents understand complex immigration rules and apply them instantly to your specific situation.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[#00c3ff] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-gray-600">
                Get compliance answers in seconds, not hours. No more waiting for consultants or manual checks.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[#00c3ff] rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Always Up-to-Date</h3>
              <p className="text-gray-600">
                Our AI agents are continuously updated with the latest Home Office guidance and requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Featured AI Agents
          </h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Choose from our suite of specialized AI agents designed to handle every aspect of sponsor licence compliance
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedCategory === category.id
                      ? "bg-[#001e70] text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`px-4 py-2 rounded-lg transition ${
                    selectedLevel === level.id
                      ? "bg-[#00c3ff] text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition">
                <div className="h-48 relative">
                  <Image
                    src={agent.image}
                    alt={agent.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                    {agent.level}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{agent.title}</h3>
                  <p className="text-gray-600 mb-4">{agent.description}</p>
                  <ul className="mb-6 space-y-2">
                    {agent.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-[#001e70]">
                      {formatPrice(agent.price)}
                    </span>
                    <Link
                      href={`/agents/${agent.id}`}
                      className="bg-[#00c3ff] text-white px-4 py-2 rounded-lg hover:bg-[#0099cc] transition"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#001e70] to-[#00c3ff] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Compliance Process?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of UK sponsors who trust our AI agents to keep them compliant and audit-ready.
          </p>
          <Link
            href="/contact"
            className="bg-white text-[#001e70] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
