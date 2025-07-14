import React, { useMemo } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { MasterComplianceWorker } from '@/types/master-compliance.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { errorHandlingService } from '@/lib/error-handling';

interface VirtualWorkerListProps {
  workers: MasterComplianceWorker[];
  onSelectWorker: (worker: MasterComplianceWorker) => void;
  onGenerateReport: (workerId: string) => void;
  selectedWorkerId?: string;
  loading?: boolean;
  error?: string | null;
}

export const VirtualWorkerList: React.FC<VirtualWorkerListProps> = ({
  workers,
  onSelectWorker,
  onGenerateReport,
  selectedWorkerId,
  loading = false,
  error = null,
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: workers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5,
  });

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-green-100 text-green-800';
      case 'MINOR_ISSUES':
        return 'bg-yellow-100 text-yellow-800';
      case 'MAJOR_CONCERNS':
        return 'bg-orange-100 text-orange-800';
      case 'SERIOUS_BREACH':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <span className="text-muted-foreground">Loading workers...</span>
      </div>
    );
  }

  if (error) {
    toast.error(error);
    return (
      <div className="flex items-center justify-center h-[600px] text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto border rounded-lg"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
          const worker = workers[virtualRow.index];
          const isSelected = worker.id === selectedWorkerId;

          try {
            return (
              <div
                key={worker.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div
                  className={cn(
                    "flex items-center justify-between p-4 border-b hover:bg-gray-50 cursor-pointer",
                    isSelected && "bg-blue-50"
                  )}
                  onClick={() => {
                    try {
                      onSelectWorker(worker);
                    } catch (err) {
                      errorHandlingService.handleError(err instanceof Error ? err : new Error('Unknown error'));
                    }
                  }}
                  tabIndex={0}
                  aria-selected={isSelected}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{worker.name}</h4>
                    <p className="text-sm text-gray-600">{worker.jobTitle || 'No Job Title'} • {worker.cosReference || 'No CoS'}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getComplianceColor(worker.overallComplianceStatus || 'PENDING')}>
                      {worker.overallComplianceStatus || 'PENDING'}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          onGenerateReport(worker.id);
                        } catch (err) {
                          errorHandlingService.handleError(err instanceof Error ? err : new Error('Unknown error'));
                        }
                      }}
                    >
                      Generate Report
                    </Button>
                  </div>
                </div>
              </div>
            );
          } catch (err) {
            errorHandlingService.handleError(err instanceof Error ? err : new Error('Unknown error'));
            return null;
          }
        })}
      </div>
    </div>
  );
}; 