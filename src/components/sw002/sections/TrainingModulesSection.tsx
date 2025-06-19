// src/components/sw002/sections/TrainingModulesSection.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrainingModulesSectionProps {
  data: Record<string, boolean>;
  onChange: (field: string, value: boolean) => void;
  onSave: () => void;
}

const trainingModules = [
  {
    code: 'TM001',
    name: 'Introduction to Care',
    field: 'tm001_intro_to_care',
    description: 'Covers basic principles of caregiving',
    required: true
  },
  {
    code: 'TM002',
    name: 'Health & Safety',
    field: 'tm002_health_safety',
    description: 'Understanding risks and precautions',
    required: true
  },
  {
    code: 'TM003',
    name: 'Medication Administration',
    field: 'tm003_med_admin',
    description: 'Safe handling and administration of medication',
    required: true
  },
  {
    code: 'TM004',
    name: 'Manual Handling',
    field: 'tm004_manual_handling',
    description: 'Proper techniques for lifting and transferring patients',
    required: true
  },
  {
    code: 'TM005',
    name: 'Safeguarding',
    field: 'tm005_safeguarding',
    description: 'Protecting vulnerable individuals from harm',
    required: true
  }
];

export default function TrainingModulesSection({ data, onChange, onSave }: TrainingModulesSectionProps) {
  const completedModules = trainingModules.filter(module => data[module.field]).length;
  const completionPercentage = (completedModules / trainingModules.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Modules</CardTitle>
        <CardDescription>
          Track completion of training modules required for compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Module List</h3>
          <p className="text-sm text-muted-foreground">
            Tick the box once the staff has completed the training module.
          </p>

          {trainingModules.map((module) => (
            <div key={module.code} className="flex items-start gap-4 border rounded-lg p-4">
              <Checkbox
                id={module.field}
                checked={!!data[module.field]}
                onCheckedChange={(checked) => onChange(module.field, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor={module.field} className="font-medium">
                  {module.code} - {module.name}
                  {module.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </div>
            </div>
          ))}

          <div className="text-sm text-muted-foreground">
            Completed: {completedModules} / {trainingModules.length} ({completionPercentage.toFixed(0)}%)
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Training Modules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
