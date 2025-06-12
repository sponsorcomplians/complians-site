'use client';

import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Download, Upload, MoreHorizontal } from 'lucide-react';
import { AddWorkerModal } from '@/components/AddWorkerModal';

interface Worker {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  position: string;
  startDate: string;
  status: 'active' | 'inactive' | 'on-leave';
}

const mockWorkers: Worker[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    position: 'Senior Developer',
    startDate: '2022-01-15',
    status: 'active'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    department: 'Marketing',
    position: 'Marketing Manager',
    startDate: '2021-06-20',
    status: 'active'
  }
];

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleAddWorker = (newWorker: Worker) => {
    setWorkers([...workers, newWorker]);
    // In a real app, you would also save to database here
    console.log('New worker added:', newWorker);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || worker.department === selectedDepartment;
    
    let matchesStatus = true;
    if (activeTab === 'active') matchesStatus = worker.status === 'active';
    else if (activeTab === 'inactive') matchesStatus = worker.status === 'inactive';
    else if (activeTab === 'on-leave') matchesStatus = worker.status === 'on-leave';
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleExport = () => {
    // Convert workers data to CSV
    const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Position', 'Start Date', 'Status'];
    const csvData = filteredWorkers.map(w => [
      w.employeeId,
      `${w.firstName} ${w.lastName}`,
      w.email,
      w.department,
      w.position,
      w.startDate,
      w.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workers.csv';
    a.click();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
          <p className="text-muted-foreground">Manage your company's workforce</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Worker
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Workers ({workers.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({workers.filter(w => w.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({workers.filter(w => w.status === 'inactive').length})</TabsTrigger>
          <TabsTrigger value="on-leave">On Leave ({workers.filter(w => w.status === 'on-leave').length})</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Worker Directory</CardTitle>
            <CardDescription>
              A complete list of all workers in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <WorkerTable workers={filteredWorkers} />
          </CardContent>
        </Card>
      </Tabs>

      <AddWorkerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddWorker}
      />
    </div>
  );
}

function WorkerTable({ workers }: { workers: Worker[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No workers found.
              </TableCell>
            </TableRow>
          ) : (
            workers.map((worker) => (
              <TableRow key={worker.id}>
                <TableCell className="font-medium">{worker.employeeId}</TableCell>
                <TableCell>{`${worker.firstName} ${worker.lastName}`}</TableCell>
                <TableCell>{worker.email}</TableCell>
                <TableCell>{worker.department}</TableCell>
                <TableCell>{worker.position}</TableCell>
                <TableCell>{new Date(worker.startDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    worker.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : worker.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {worker.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}