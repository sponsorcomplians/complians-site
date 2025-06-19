'use client';

import { useState } from 'react';
import PersonalInformationSection from './sections/PersonalInformationSection';
import COSSummarySection from './sections/COSSummarySection';
import ComplianceArea1Section from './sections/ComplianceArea1Section';
import ComplianceArea2Section from './sections/ComplianceArea2Section';
import ComplianceArea3Section from './sections/ComplianceArea3Section';
import ComplianceArea4Section from './sections/ComplianceArea4Section';
import TrainingModulesSection from './sections/TrainingModulesSection';
import OtherDocumentsSection from './sections/OtherDocumentsSection';
import ReportingDutiesSection from './sections/ReportingDutiesSection';
import NotesCommentsSection from './sections/NotesCommentsSection';
import { toast } from 'sonner';

interface SW002FormProps {
  workerId: string;
  workerName?: string;
}

export default function SW002Form({ workerId, workerName }: SW002FormProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState<any>({
    personal_information: {},
    cos_summary: {},
    immigration_monitoring: {},
    documents_area1: {},
    contact_details: {},
    documents_part1: {},
    recruitment_evidence: {},
    salary_documents: {},
    skill_evidence: {},
    migrant_tracking: {},
    training_modules: {},
    other_documents: {},
    reporting_duties: [],
    notes_comments: []
  });

  // Update section data
  const updateSectionData = (section: string, data: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

  // Save section data (mock for now)
  const saveSectionData = (section: string) => {
    console.log('Saving section:', section, formData[section]);
    toast.success(`${section.replace(/_/g, ' ')} saved successfully`);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'cos', label: 'CoS Summary' },
    { id: 'area1', label: 'Compliance Area 1' },
    { id: 'area2', label: 'Compliance Area 2' },
    { id: 'area3', label: 'Compliance Area 3' },
    { id: 'area4', label: 'Compliance Area 4' },
    { id: 'training', label: 'Training' },
    { id: 'other', label: 'Other Docs' },
    { id: 'reporting', label: 'Reporting' },
    { id: 'notes', label: 'Notes' },
  ];

  const referenceNumber = `SW002/${new Date().getFullYear()}/${workerId.slice(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">SKILLED WORKER COVERSHEET</h1>
            <p className="text-gray-600">[SPONSOR DUTIES & COMPLIANCE]</p>
            <p className="text-sm text-gray-500 mt-2">
              Sponsorship is a privilege not a right. Significant trust is placed in sponsors and they must ensure they comply with immigration law and wider UK law.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Our Reference</p>
            <p className="text-lg font-mono">{referenceNumber}</p>
            <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <div className="flex flex-wrap gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'personal' && (
            <PersonalInformationSection
              data={formData.personal_information}
              onChange={(data) => updateSectionData('personal_information', data)}
              onSave={() => saveSectionData('personal_information')}
            />
          )}

          {activeTab === 'cos' && (
            <COSSummarySection
              data={formData.cos_summary}
              onChange={(data) => updateSectionData('cos_summary', data)}
              onSave={() => saveSectionData('cos_summary')}
            />
          )}

          {activeTab === 'area1' && (
            <ComplianceArea1Section
              data={{
                monitoring: formData.immigration_monitoring,
                documents: formData.documents_area1
              }}
              onChange={(section, data) => updateSectionData(section, data)}
              onSave={(section) => saveSectionData(section)}
            />
          )}

          {activeTab === 'area2' && (
            <ComplianceArea2Section
              data={formData.contact_details}
              onChange={(data) => updateSectionData('contact_details', data)}
              onSave={() => saveSectionData('contact_details')}
            />
          )}

          {activeTab === 'area3' && (
            <ComplianceArea3Section
              data={{
                documents_part1: formData.documents_part1,
                recruitment: formData.recruitment_evidence,
                salary: formData.salary_documents,
                skills: formData.skill_evidence
              }}
              onChange={(section, data) => updateSectionData(section, data)}
              onSave={(section) => saveSectionData(section)}
            />
          )}

          {activeTab === 'area4' && (
            <ComplianceArea4Section
              data={formData.migrant_tracking}
              onChange={(data) => updateSectionData('migrant_tracking', data)}
              onSave={() => saveSectionData('migrant_tracking')}
            />
          )}

          {activeTab === 'training' && (
            <TrainingModulesSection
              data={formData.training_modules}
              onChange={(data) => updateSectionData('training_modules', data)}
              onSave={() => saveSectionData('training_modules')}
            />
          )}

          {activeTab === 'other' && (
            <OtherDocumentsSection
              data={formData.other_documents}
              onChange={(data) => updateSectionData('other_documents', data)}
              onSave={() => saveSectionData('other_documents')}
            />
          )}

          {activeTab === 'reporting' && (
            <ReportingDutiesSection
              workerId={workerId}
              duties={formData.reporting_duties}
              onUpdate={() => console.log('Updating reporting duties')}
            />
          )}

          {activeTab === 'notes' && (
            <NotesCommentsSection
              workerId={workerId}
              notes={formData.notes_comments}
              onUpdate={() => console.log('Updating notes')}
            />
          )}

          {/* Save Button */}
          <div className="mt-6 pt-6 border-t flex justify-end">
            <button
              onClick={() => saveSectionData(activeTab)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Section
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Status Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Compliance Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">85%</div>
            <p className="text-sm text-gray-600">Documents Complete</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-sm text-gray-600">Pending Items</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <p className="text-sm text-gray-600">Days Until Expiry</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-sm text-gray-600">RTW Valid</p>
          </div>
        </div>
      </div>
    </div>
  );
}