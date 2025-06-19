'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  FileText
} from 'lucide-react';
import SW002Form from '@/components/sw002/SW002Form';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Safe date formatting functions
function formatDate(date: string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
}

function formatDateTime(date: string | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    return dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'N/A';
  }
}

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  role: string;
  department?: string;
  startDate?: string;
  visaExpiry?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export default function WorkerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.id as string;
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (workerId) {
      fetchWorker();
    }
  }, [workerId]);

  const fetchWorker = async () => {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .eq('id', workerId)
        .single();

      if (error) throw error;

      if (data) {
        // Transform snake_case to camelCase
        const transformedWorker: Worker = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.date_of_birth,
          nationality: data.nationality,
          passportNumber: data.passport_number,
          role: data.role,
          department: data.department,
          startDate: data.start_date,
          visaExpiry: data.visa_expiry,
          status: data.is_active ? 'active' : 'inactive',
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };

        setWorker(transformedWorker);
      }
    } catch (error) {
      console.error('Error fetching worker:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading worker details...</div>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-xl text-muted-foreground">Worker not found</div>
          <Button onClick={() => router.push('/workers')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Workers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.push('/workers')}
            variant="outline"
            size="icon"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {worker.firstName} {worker.lastName}
            </h1>
            <p className="text-muted-foreground">{worker.email}</p>
          </div>
        </div>
        <Badge variant={worker.status === 'active' ? 'default' : 'secondary'}>
          {worker.status}
        </Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Worker Details</TabsTrigger>
          <TabsTrigger value="sw002">SW002 Form</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Basic information about the worker</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground">Full Name</dt>
                  <dd className="mt-1">{worker.firstName} {worker.lastName}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </dt>
                  <dd className="mt-1">{worker.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone
                  </dt>
                  <dd className="mt-1">{worker.phone || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Date of Birth
                  </dt>
                  <dd className="mt-1">{formatDate(worker.dateOfBirth)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Nationality
                  </dt>
                  <dd className="mt-1">{worker.nationality || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Passport Number
                  </dt>
                  <dd className="mt-1">{worker.passportNumber || 'N/A'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Employment Information
              </CardTitle>
              <CardDescription>Work-related details</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground">Role</dt>
                  <dd className="mt-1">{worker.role}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground">Department</dt>
                  <dd className="mt-1">{worker.department || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground">Start Date</dt>
                  <dd className="mt-1">{formatDate(worker.startDate)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground">Visa Expiry</dt>
                  <dd className="mt-1">{formatDate(worker.visaExpiry)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Record timestamps</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground">Created</dt>
                  <dd className="mt-1">{formatDateTime(worker.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-sm text-muted-foreground">Last Updated</dt>
                  <dd className="mt-1">{formatDateTime(worker.updatedAt)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sw002">
          <SW002Form workerId={workerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}const fetchWorkers = async () => {
  try {
    console.log('Starting to fetch workers...');
    setLoading(true);

    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    // ... rest of your code