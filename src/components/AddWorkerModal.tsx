// src/components/AddWorkerModal.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorker: (worker: WorkerFormData) => void;
}

interface WorkerFormData {
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  startDate: string;
  experience: string;
  skills: string[];
}

export default function AddWorkerModal({ isOpen, onClose, onAddWorker }: AddWorkerModalProps) {
  const [formData, setFormData] = useState<WorkerFormData>({
    name: '',
    role: '',
    email: '',
    phone: '',
    department: '',
    startDate: '',
    experience: '',
    skills: []
  });

  const [skillInput, setSkillInput] = useState('');

  const handleChange = (field: keyof WorkerFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      handleChange('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    handleChange('skills', formData.skills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.role || !formData.email || !formData.department) {
      alert('Please fill in all required fields');
      return;
    }

    onAddWorker(formData);
    
    // Reset form
    setFormData({
      name: '',
      role: '',
      email: '',
      phone: '',
      department: '',
      startDate: '',
      experience: '',
      skills: []
    });
    setSkillInput('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Worker</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                placeholder="Software Engineer"
                required
              />
            </div>

            {/* Phone */}
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Department */}
            <div className="grid gap-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                id="department"
                value={formData.department}
                onValueChange={(value) => handleChange('department', value)}
                required
                className="w-full"
              >
                <option value="">Select department</option>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="design">Design</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
              </Select>
            </div>

            {/* Experience */}
            <div className="grid gap-2">
              <Label htmlFor="experience">Experience Level</Label>
              <Select
                id="experience"
                value={formData.experience}
                onValueChange={(value) => handleChange('experience', value)}
                className="w-full"
              >
                <option value="">Select experience</option>
                <SelectItem value="0-1">0-1 years</SelectItem>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="3-5">3-5 years</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="10+">10+ years</SelectItem>
              </Select>
            </div>

            {/* Start Date */}
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full"
              />
            </div>

            {/* Skills */}
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddSkill} variant="outline" size="default">
                  Add
                </Button>
              </div>
              
              {/* Skills list */}
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 rounded-full"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 text-gray-500 hover:text-gray-700 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

         <div className="mt-6">
  <DialogFooter>
    <Button type="button" variant="outline" onClick={onClose}>
      Cancel
    </Button>
    {/* other buttons */}
  </DialogFooter>
</div>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Worker</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}