import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Download, Filter, Calendar as CalendarIcon, User, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { securityService } from '@/lib/securityService';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: Record<string, any>;
  ipAddress: string;
  timestamp: Date;
  result: 'success' | 'failure';
}

export const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const loadAuditLogs = async () => {
    // In production, fetch from API
    const auditLogs = securityService.getAuditReport({});
    setLogs(auditLogs);
  };

  const applyFilters = () => {
    const filtered = securityService.getAuditReport(filters);
    setFilteredLogs(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Date/Time', 'User ID', 'Action', 'Resource', 'IP Address', 'Result'];
    const rows = filteredLogs.map(log => [
      format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      log.userId,
      log.action,
      `${log.resource}/${log.resourceId}`,
      log.ipAddress,
      log.result
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      'create': 'bg-green-100 text-green-800',
      'read': 'bg-blue-100 text-blue-800',
      'update': 'bg-yellow-100 text-yellow-800',
      'delete': 'bg-red-100 text-red-800',
      'generate': 'bg-purple-100 text-purple-800'
    };
    
    return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getResultBadge = (result: string) => {
    return result === 'success' 
      ? <Badge className="bg-green-100 text-green-800">Success</Badge>
      : <Badge className="bg-red-100 text-red-800">Failed</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Audit Trail
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-1 block">User ID</label>
              <Input
                id="userId-filter"
                name="userId"
                placeholder="Filter by user..."
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Action</label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters({ ...filters, action: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="generate">Generate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, 'PP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters({ ...filters, startDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, 'PP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters({ ...filters, endDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
        
        {/* Audit logs table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.userId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.resource}/{log.resourceId}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell>
                      {getResultBadge(log.result)}
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="space-y-2">
                            <h4 className="font-medium">Metadata</h4>
                            <pre className="text-xs bg-gray-100 p-2 rounded">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredLogs.length} of {logs.length} entries
          </div>
          <div className="flex items-center gap-4">
            <span>
              Success: {filteredLogs.filter(l => l.result === 'success').length}
            </span>
            <span>
              Failed: {filteredLogs.filter(l => l.result === 'failure').length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 