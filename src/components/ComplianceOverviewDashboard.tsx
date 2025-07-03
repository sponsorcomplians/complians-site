"use client";

import { useState } from 'react';
import { PieChart, BarChart3, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import Link from 'next/link';

// Sample/mock data
const complianceAspects = [
  { key: 'salary', label: 'Salary' },
  { key: 'skills', label: 'Skills/Experience' },
  { key: 'qualifications', label: 'Qualifications' },
  { key: 'recordKeeping', label: 'Record Keeping' },
  { key: 'reporting', label: 'Reporting Duties' },
  { key: 'thirdParty', label: 'Third-Party Labour' },
  { key: 'immigration', label: 'Immigration Status' },
  { key: 'contractedHours', label: 'Contracted Hours' },
  { key: 'paragraphC726', label: 'Paragraph C7-26' },
];

const workers = [
  {
    id: 1,
    name: 'John Smith',
    compliance: {
      salary: 'COMPLIANT',
      skills: 'COMPLIANT',
      qualifications: 'COMPLIANT',
      recordKeeping: 'COMPLIANT',
      reporting: 'COMPLIANT',
      thirdParty: 'COMPLIANT',
      immigration: 'COMPLIANT',
      contractedHours: 'COMPLIANT',
      paragraphC726: 'COMPLIANT',
    } as Record<string, string>,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    compliance: {
      salary: 'BREACH',
      skills: 'SERIOUS BREACH',
      qualifications: 'COMPLIANT',
      recordKeeping: 'COMPLIANT',
      reporting: 'COMPLIANT',
      thirdParty: 'COMPLIANT',
      immigration: 'COMPLIANT',
      contractedHours: 'COMPLIANT',
      paragraphC726: 'COMPLIANT',
    } as Record<string, string>,
  },
  {
    id: 3,
    name: 'Ahmed Hassan',
    compliance: {
      salary: 'COMPLIANT',
      skills: 'BREACH',
      qualifications: 'COMPLIANT',
      recordKeeping: 'COMPLIANT',
      reporting: 'COMPLIANT',
      thirdParty: 'COMPLIANT',
      immigration: 'COMPLIANT',
      contractedHours: 'COMPLIANT',
      paragraphC726: 'COMPLIANT',
    } as Record<string, string>,
  },
];

const statusColors = {
  COMPLIANT: 'bg-green-500 text-white',
  BREACH: 'bg-yellow-400 text-white',
  'SERIOUS BREACH': 'bg-red-500 text-white',
  PENDING: 'bg-gray-300 text-gray-800',
};

const statusIcons = {
  COMPLIANT: <CheckCircle className="inline h-4 w-4 mr-1" />,
  BREACH: <AlertTriangle className="inline h-4 w-4 mr-1" />,
  'SERIOUS BREACH': <XCircle className="inline h-4 w-4 mr-1" />,
  PENDING: <span className="inline-block w-4 h-4 mr-1 bg-gray-400 rounded-full" />,
};

function getOverallStatus(compliance: Record<string, string>) {
  if (Object.values(compliance).includes('SERIOUS BREACH')) return 'SERIOUS BREACH';
  if (Object.values(compliance).includes('BREACH')) return 'BREACH';
  if (Object.values(compliance).includes('PENDING')) return 'PENDING';
  return 'COMPLIANT';
}

export default function ComplianceOverviewDashboard() {
  // Pie chart data
  const statusCounts = workers.reduce(
    (acc, w) => {
      const status = getOverallStatus(w.compliance);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const pieChartData = [
    { name: 'Compliant', value: statusCounts['COMPLIANT'] || 0, color: '#22c55e' },
    { name: 'Breach', value: statusCounts['BREACH'] || 0, color: '#facc15' },
    { name: 'Serious Breach', value: statusCounts['SERIOUS BREACH'] || 0, color: '#ef4444' },
    { name: 'Pending', value: statusCounts['PENDING'] || 0, color: '#a3a3a3' },
  ];

  // Bar chart data (by aspect)
  const barChartData = complianceAspects.map((aspect) => {
    let compliant = 0, breach = 0, serious = 0, pending = 0;
    for (const w of workers) {
      const s = w.compliance[aspect.key];
      if (s === 'COMPLIANT') compliant++;
      else if (s === 'BREACH') breach++;
      else if (s === 'SERIOUS BREACH') serious++;
      else pending++;
    }
    return {
      aspect: aspect.label,
      compliant,
      breach,
      serious,
      pending,
    };
  });

  // Summary row
  const summary = complianceAspects.map((aspect) => {
    const col = workers.map((w) => w.compliance[aspect.key]);
    return {
      compliant: col.filter((s) => s === 'COMPLIANT').length,
      breach: col.filter((s) => s === 'BREACH').length,
      serious: col.filter((s) => s === 'SERIOUS BREACH').length,
      pending: col.filter((s) => s === 'PENDING').length,
    };
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-[#263976] mb-2">Compliance Overview</h1>
      <p className="text-gray-600 mb-6">Monitor all workers and their compliance status across all sponsor compliance aspects.</p>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="font-semibold text-[#263976] mb-2 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Overall Compliance Distribution
          </div>
          {/* Pie chart placeholder */}
          <div className="flex items-center justify-center h-48">
            <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">[Pie Chart]</span>
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            {pieChartData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow border">
          <div className="font-semibold text-[#263976] mb-2 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Compliance Breakdown by Aspect
          </div>
          {/* Bar chart placeholder */}
          <div className="flex items-end justify-around h-48">
            {barChartData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center mx-1">
                <div className="flex flex-col-reverse h-32 w-6">
                  <div className="bg-green-400" style={{ height: `${item.compliant * 10}px` }} title="Compliant"></div>
                  <div className="bg-yellow-400" style={{ height: `${item.breach * 10}px` }} title="Breach"></div>
                  <div className="bg-red-400" style={{ height: `${item.serious * 10}px` }} title="Serious Breach"></div>
                  <div className="bg-gray-400" style={{ height: `${item.pending * 10}px` }} title="Pending"></div>
                </div>
                <span className="text-xs mt-2 text-center">{item.aspect}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="bg-white rounded-lg p-6 shadow border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-[#263976]">
              <th className="px-4 py-2 text-left">Worker</th>
              {complianceAspects.map((aspect) => (
                <th key={aspect.key} className="px-4 py-2 text-left">{aspect.label}</th>
              ))}
              <th className="px-4 py-2 text-left">Overall Status</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((worker) => {
              const overall = getOverallStatus(worker.compliance);
              return (
                <tr key={worker.id}>
                  <td className="px-4 py-2 font-medium">{worker.name}</td>
                  {complianceAspects.map((aspect) => (
                    <td key={aspect.key} className="px-4 py-2">
                      <Link href={`/${aspect.key}-compliance?worker=${worker.id}`} className="underline">
                        <span className={`px-2 py-1 rounded font-semibold text-xs ${statusColors[worker.compliance[aspect.key] as keyof typeof statusColors]}`}>
                          {statusIcons[worker.compliance[aspect.key] as keyof typeof statusIcons]}
                          {worker.compliance[aspect.key]}
                        </span>
                      </Link>
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded font-semibold text-xs ${statusColors[overall as keyof typeof statusColors]}`}>
                      {statusIcons[overall as keyof typeof statusIcons]}
                      {overall}
                    </span>
                  </td>
                </tr>
              );
            })}
            {/* Summary row */}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-2">Summary</td>
              {summary.map((sum, idx) => (
                <td key={idx} className="px-4 py-2">
                  <span className="text-green-600">{sum.compliant}✓</span>{' '}
                  <span className="text-yellow-600">{sum.breach}⚠️</span>{' '}
                  <span className="text-red-600">{sum.serious}🚨</span>{' '}
                  <span className="text-gray-600">{sum.pending}…</span>
                </td>
              ))}
              <td className="px-4 py-2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 