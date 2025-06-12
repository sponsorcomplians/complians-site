'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  workerName: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmationModal({ 
  isOpen, 
  workerName, 
  onClose, 
  onConfirm 
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle>Delete Worker</CardTitle>
              <CardDescription>
                This action cannot be undone
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{workerName}</strong>? 
            This will permanently remove all their data from the system.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete Worker
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}