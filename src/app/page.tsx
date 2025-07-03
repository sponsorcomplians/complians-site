"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Brain,
  FileText,
  Users,
  Building,
  Calculator,
  AlertTriangle,
  BookOpen,
  FileCheck,
  UserCheck,
  Briefcase,
  Target,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Play,
} from "lucide-react";

export const dynamic = "force-dynamic";

// AI Agents Data
const featuredAgents = [
  {
    id: "qualification",
    title: "AI Qualification Compliance Agent",
    description:
      "Advanced AI-powered qualification verification with red flag detection and expert-level assessment",
    price: 199.99,
    originalPrice: 299.99,
    status: "Popular",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated compliance checking",
      "Expert-level analysis quality",
      "Immediate breach detection",
    ],
    available: true,
  },
  {
    id: "salary",
    title: "AI Salary Compliance Agent",
    description:
      "Comprehensive salary compliance analysis with payslip verification and NMW checking",
    price: 179.99,
    originalPrice: 249.99,
    status: "New",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated salary verification",
      "NMW compliance assurance",
      "Underpayment prevention",
    ],
    available: true,
  },
];

const allAgents = [
  {
    id: "qualification",
    title: "AI Qualification Compliance Agent",
    description:
      "Advanced AI-powered qualification verification and compliance checking for UK sponsors with red flag detection and expert-level assessment.",
    price: 199.99,
    originalPrice: 299.99,
    status: "Popular",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated compliance checking",
      "Expert-level analysis quality",
      "Immediate breach detection",
    ],
    available: true,
    image: "/images/ai-qualification-compliance-agent.png",
  },
  {
    id: "salary",
    title: "AI Salary Compliance Agent",
    description:
      "Comprehensive salary compliance analysis with payslip verification, NMW checking, and Home Office threshold monitoring.",
    price: 179.99,
    originalPrice: 249.99,
    status: "New",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated salary verification",
      "NMW compliance assurance",
      "Underpayment prevention",
    ],
    available: true,
    image: "/images/ai-salary-compliance-agent.png",
  },

  {
    id: "right-to-work",
    title: "AI Right to Work Agent",
    description:
      "Automated right to work checking and verification with Home Office integration.",
    price: 159.99,
    status: "Available",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated RTW checking",
      "Real-time status updates",
      "Compliance monitoring",
    ],
    available: true,
    image: "/images/ai-right-to-work-agent.png",
  },

  {
    id: "skills-experience",
    title: "AI Skills & Experience Compliance Agent",
    description:
      "Comprehensive skills assessment and work experience verification for sponsored worker compliance.",
    price: 169.99,
    status: "Available",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated skills verification",
      "Experience compliance assurance",
      "Professional background checks",
    ],
    available: true,
    image: "/images/ai-skills-experience-compliance-agent.png",
  },
  {
    id: "genuine-vacancies",
    title: "AI Genuine Vacancies Compliance Agent",
    description:
      "Intelligent analysis of genuine vacancy requirements and recruitment compliance for UK sponsors.",
    price: 159.99,
    status: "Available",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated vacancy verification",
      "Recruitment compliance assurance",
      "Market rate validation",
    ],
    available: true,
    image: "/images/ai-genuine-vacancies-compliance-agent.png",
  },
  {
    id: "third-party-labour",
    title: "AI Third-Party Labour Compliance Agent",
    description:
      "Comprehensive monitoring and compliance checking for third-party labour arrangements.",
    price: 189.99,
    status: "Available",
    category: "compliance",
    level: "enterprise",
    benefits: [
      "Automated third-party monitoring",
      "Compliance risk identification",
      "Contract verification",
    ],
    available: true,
    image: "/images/ai-third-party-labour-compliance-agent.png",
  },
  {
    id: "reporting-duties",
    title: "AI Reporting Duties Compliance Agent",
    description:
      "Automated monitoring and compliance checking for sponsor reporting obligations.",
    price: 149.99,
    status: "Available",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated deadline tracking",
      "Compliance obligation monitoring",
      "Timely reporting assurance",
    ],
    available: true,
    image: "/images/ai-reporting-duties-compliance-agent.png",
  },
  {
    id: "immigration-status-monitoring",
    title: "AI Immigration Status Monitoring Agent",
    description:
      "Real-time monitoring and compliance checking for migrant worker immigration status.",
    price: 179.99,
    status: "Available",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Real-time status monitoring",
      "Immigration compliance assurance",
      "Status change alerts",
    ],
    available: true,
    image: "/images/ai-immigration-status-monitoring-agent.png",
  },
  {
    id: "record-keeping",
    title: "AI Record Keeping Compliance Agent",
    description:
      "Comprehensive record keeping compliance and document management for UK sponsors.",
    price: 139.99,
    status: "Available",
    category: "compliance",
    level: "basic",
    benefits: [
      "Automated record verification",
      "Compliance assurance",
      "Audit readiness",
    ],
    available: true,
    image: "/images/ai-record-keeping-compliance-agent.png",
  },
  {
    id: "migrant-contact-maintenance",
    title: "AI Migrant Contact Maintenance Agent",
    description:
      "Automated monitoring and compliance checking for maintaining migrant worker contact.",
    price: 129.99,
    status: "Available",
    category: "compliance",
    level: "basic",
    benefits: [
      "Automated contact monitoring",
      "Communication tracking",
      "Compliance assurance",
    ],
    available: true,
    image: "/images/ai-migrant-contact-maintenance-agent.png",
  },
  {
    id: "recruitment-practices-compliance",
    title: "AI Recruitment Practices Compliance Agent",
    description:
      "Comprehensive monitoring and compliance checking for recruitment practices and policies.",
    price: 169.99,
    status: "Available",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Recruitment process monitoring",
      "Policy compliance assurance",
      "Transparency verification",
    ],
    available: true,
    image: "/images/ai-recruitment-practices-compliance-agent.png",
  },
  {
    id: "migrant-tracking-compliance",
    title: "AI Migrant Tracking Compliance Agent",
    description:
      "Comprehensive tracking and compliance monitoring for migrant worker movements and activities.",
    price: 189.99,
    status: "Available",
    category: "compliance",
    level: "enterprise",
    benefits: [
      "Movement tracking",
      "Activity monitoring",
      "Compliance verification",
    ],
    available: true,
    image: "/images/ai-migrant-tracking-compliance-agent.png",
  },
  {
    id: "contracted-hours",
    title: "AI Contracted Hours Compliance Agent",
    description:
      "Comprehensive monitoring and compliance checking for contracted working hours.",
    price: 159.99,
    status: "Available",
    category: "compliance",
    level: "advanced",
    benefits: [
      "Automated hours monitoring",
      "Contract compliance assurance",
      "Hours verification",
    ],
    available: true,
    image: "/images/ai-contracted-hours-compliance-agent.png",
  },
  {
    id: "paragraph-c7-26",
    title: "AI Paragraph C7-26 Compliance Agent",
    description:
      "Specialized compliance monitoring for Paragraph C7-26 requirements and obligations.",
    price: 199.99,
    status: "Available",
    category: "compliance",
    level: "enterprise",
    benefits: [
      "Specialized C7-26 monitoring",
      "Requirement compliance assurance",
      "Specialized guidance",
    ],
    available: true,
    image: "/images/ai-paragraph-c7-26-compliance-agent.png",
  },
  {
    id: "document-compliance",
    title: "AI Document Compliance Agent",
    description:
      "Comprehensive document compliance and management for UK sponsors.",
    price: 149.99,
    status: "Available",
    category: "compliance",
    level: "basic",
    benefits: [
      "Automated document verification",
      "Compliance assurance",
      "Audit readiness",
    ],
    available: true,
    image: "/images/ai-document-compliance-agent.png"
  }
];

const categories = [
  { id: "all", name: "All Agents", count: allAgents.length },
  {
    id: "compliance",
    name: "Compliance",
    count: allAgents.filter((agent) => agent.category === "compliance").length,
  },
  {
    id: "hr",
    name: "HR Management",
    count: allAgents.filter((agent) => agent.category === "hr").length,
  },
  {
    id: "finance",
    name: "Finance",
    count: allAgents.filter((agent) => agent.category === "finance").length,
  },
  {
    id: "operations",
    name: "Operations",
    count: allAgents.filter((agent) => agent.category === "operations").length,
  },
];

const levels = [
  { id: "all", name: "All Levels", count: allAgents.length },
  {
    id: "basic",
    name: "Basic",
    count: allAgents.filter((agent) => agent.level === "basic").length,
  },
  {
    id: "advanced",
    name: "Advanced",
    count: allAgents.filter((agent) => agent.level === "advanced").length,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    count: allAgents.filter((agent) => agent.level === "enterprise").length,
  },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const filteredAgents = allAgents.filter((agent) => {
    const categoryMatch =
      selectedCategory === "all" || agent.category === selectedCategory;
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
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            AI Compliance Agents
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Revolutionise your compliance management with our suite of
            intelligent AI agents
          </p>
          <p className="text-lg mb-12 max-w-4xl mx-auto">
            From qualification verification to salary compliance, our AI agents
            provide expert-level analysis, automated reporting, and real-time
            compliance monitoring for UK sponsors.
          </p>

          {/* Feature Highlights with Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <Brain className="w-10 h-10 text-[#001e70]" />
              </div>
              <h3 className="font-semibold">Expert-Level Analysis</h3>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-10 h-10 text-[#001e70]" />
              </div>
              <h3 className="font-semibold">Real-Time Monitoring</h3>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-10 h-10 text-[#001e70]" />
              </div>
              <h3 className="font-semibold">Professional Reporting</h3>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-10 h-10 text-[#001e70]" />
              </div>
              <h3 className="font-semibold">24/7 Availability</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured AI Agents */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured AI Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our most popular AI-powered compliance solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featuredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="relative overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Image/Video Holder */}
                <div className="relative h-56 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                  {agent.id === "qualification" && (
                    <img
                      src="/images/ai-qualification-compliance-agent.png"
                      alt="AI Qualification Compliance Agent"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {agent.id === "salary" && (
                    <img
                      src="/images/ai-salary-compliance-agent.png"
                      alt="AI Salary Compliance Agent"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* Video Play Button Overlay for Available Agents */}
                  {agent.available && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white bg-opacity-90 rounded-full p-4 cursor-pointer">
                        <Play className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            agent.status === "Popular" ? "default" : "secondary"
                          }
                        >
                          {agent.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {agent.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">
                        {agent.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {agent.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Key Benefits:
                    </h4>
                    <ul className="space-y-1">
                      {agent.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-center text-sm text-gray-600"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatPrice(agent.price)}
                      </span>
                      {agent.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(agent.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Button
                      size={agent.status ? "lg" : "sm"}
                      className="bg-blue-600 hover:bg-blue-700"
                      asChild
                      disabled={!agent.available}
                    >
                      <Link
                        href={`/ai-${agent.id}${agent.id.endsWith("-compliance") ? "" : "-compliance"}?tab=assessment`}
                      >
                        {agent.available ? "Get Started" : "Coming Soon"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
              <div className="text-gray-600">Available Now</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600 mb-2">11</div>
              <div className="text-gray-600">Coming Soon</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600 mb-2">17</div>
              <div className="text-gray-600">Total Planned</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">UK Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* All AI Compliance Agents */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              All AI Compliance Agents
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our complete suite of AI-powered compliance solutions
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Category:
                </span>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  Level:
                </span>
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedLevel === level.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {level.name} ({level.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
              >
                {/* Image/Video Holder */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                  {agent.image ? (
                    <img
                      src={agent.image}
                      alt={agent.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-100">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-700 font-medium">
                          {agent.title.split(" ")[1]}
                        </p>
                        <p className="text-xs text-gray-600">
                          Showcase Coming Soon
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Video Play Button Overlay for Available Agents */}
                  {agent.available &&
                    ["qualification", "salary"].includes(agent.id) && (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white bg-opacity-90 rounded-full p-3 cursor-pointer">
                          <Play className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                    )}
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {agent.status !== "Coming Soon" && (
                          <Badge
                            variant={
                              agent.status === "Popular"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {agent.status}
                          </Badge>
                        )}
                        {agent.status === "Coming Soon" && (
                          <Badge
                            variant="outline"
                            className="text-orange-600 border-orange-600"
                          >
                            Coming Soon
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {agent.level}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-2">
                        {agent.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {agent.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                      Key Benefits:
                    </h4>
                    <ul className="space-y-1">
                      {agent.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-center text-xs text-gray-600"
                        >
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(agent.price)}
                      </span>
                      {agent.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(agent.originalPrice)}
                        </span>
                      )}
                    </div>
                    <Button
                      size={agent.status ? "lg" : "sm"}
                      className="bg-blue-600 hover:bg-blue-700"
                      asChild
                      disabled={!agent.available}
                    >
                      <Link
                        href={`/ai-${agent.id}${agent.id.endsWith("-compliance") ? "" : "-compliance"}?tab=assessment`}
                      >
                        {agent.available ? "Get Started" : "Coming Soon"}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Our AI Agents */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our AI Agents?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology meets compliance expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert-Level Analysis
              </h3>
              <p className="text-gray-600">
                AI that matches human expert assessment quality
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Instant Processing
              </h3>
              <p className="text-gray-600">
                Get compliance reports in seconds, not hours
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                100% UK Compliant
              </h3>
              <p className="text-gray-600">
                Built specifically for UK sponsor requirements
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Continuous Learning
              </h3>
              <p className="text-gray-600">
                AI that improves with every assessment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transform Your Compliance Management Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of UK sponsors who trust our AI agents for their
            compliance needs
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-blue-900 hover:bg-gray-100"
            >
              Start with Qualification Agent
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-900"
            >
              Try Salary Agent
            </Button>
          </div>

          <p className="text-sm text-blue-200 mt-6">
            No subscription required • One-time purchase • Instant access
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Complians</h3>
              <p className="text-gray-400 text-sm">
                Advanced AI-powered compliance solutions for UK sponsors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/products"
                    className="hover:text-white transition-colors"
                  >
                    Digital Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/ai-agents"
                    className="hover:text-white transition-colors"
                  >
                    AI Agents
                  </Link>
                </li>
                <li>
                  <a
                    href="https://dragon.sponsorcomplians.co.uk"
                    className="hover:text-white transition-colors"
                  >
                    Dragon AI
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="hover:text-white transition-colors"
                  >
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  info@complians.co.uk
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +44 (0) 20 1234 5678
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  London, UK
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Complians. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
