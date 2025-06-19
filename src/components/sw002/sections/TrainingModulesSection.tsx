import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle2 } from 'lucide-react';

interface TrainingModulesSectionProps {
  data: any;
  onChange: (field: string, value: any) => void;
}

const trainingModules = [
  {
    field: 'inductionCompleted',
    title: 'Company Induction',
    description: 'General orientation and company policies'
  },
  {
    field: 'safeguardingTraining',
    title: 'Safeguarding Training',
    description: 'Adult and child protection procedures'
  },
  {
    field: 'healthSafetyTraining',
    title: 'Health & Safety Training',
    description: 'Workplace safety and emergency procedures'
  },
  {
    field: 'fireTraining',
    title: 'Fire Safety Training',
    description: 'Fire prevention and evacuation procedures'
  },
  {
    field: 'firstAidTraining',
    title: 'First Aid Training',
    description: 'Basic first aid and CPR certification'
  },
  {
    field: 'medicationTraining',
    title: 'Medication Administration',
    description: 'Safe handling and administration of medications'
  },
  {
    field: 'infectionControlTraining',
    title: 'Infection Control',
    description: 'Hygiene and infection prevention measures'
  },
  {
    field: 'manualHandlingTraining',
    title: 'Manual Handling',
    description: 'Safe lifting and handling techniques'
  },
  {
    field: 'foodHygieneTraining',
    title: 'Food Hygiene',
    description: 'Food safety and hygiene standards'
  },
  {
    field: 'equalityDiversityTraining',
    title: 'Equality & Diversity',
    description: 'Promoting inclusive care practices'
  },
  {
    field: 'dataProtectionTraining',
    title: 'Data Protection & GDPR',
    description: 'Confidentiality and data handling'
  },
  {
    field: 'mentalCapacityTraining',
    title: 'Mental Capacity Act',
    description: 'Understanding consent and capacity'
  },
  {
    field: 'communicationTraining',
    title: 'Effective Communication',
    description: 'Communication skills in care settings'
  },
  {
    field: 'personalCareTraining',
    title: 'Personal Care Skills',
    description: 'Providing dignified personal care'
  },
  {
    field: 'dementiaCareTraining',
    title: 'Dementia Care',
    description: 'Understanding and supporting dementia patients'
  }
];

export default function TrainingModulesSection({ data, onChange }: TrainingModulesSectionProps) {
  const completedModules = trainingModules.filter(module => data[module.field]).length;
  const completionPercentage = (completedModules / trainingModules.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Training Modules</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">
              {completedModules} / {trainingModules.length} Completed
            </span>
          </div>
        </div>
        <CardDescription>
          Track completion of required training modules
        </CardDescription>
        <Progress value={completionPercentage} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {trainingModules.map((module) => (
            <div
              key={module.field}
              className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={module.field}
                checked={data[module.field] || false}
                onCheckedChange={(checked) => onChange(module.field, checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <label
                  htmlFor={module.field}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {module.title}
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {module.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}