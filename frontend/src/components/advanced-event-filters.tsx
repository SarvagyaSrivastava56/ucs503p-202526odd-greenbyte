'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Calendar } from './ui/calendar';
import { Search, Filter, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

const categories: Category[] = [
  'Music',
  'Tech',
  'Art',
  'Sports',
  'Workshop',
  'Social',
  'Conference',
  'Party',
  'Networking',
];

export interface FilterOptions {
  search: string;
  category: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  status: 'all' | 'upcoming' | 'past';
}

interface AdvancedEventFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export function AdvancedEventFilters({ onFilterChange }: AdvancedEventFiltersProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [status, setStatus] = useState<'all' | 'upcoming' | 'past'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = () => {
    onFilterChange({
      search,
      category,
      dateFrom,
      dateTo,
      status,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setCategory(null);
    setDateFrom(null);
    setDateTo(null);
    setStatus('all');
    onFilterChange({
      search: '',
      category: null,
      dateFrom: null,
      dateTo: null,
      status: 'all',
    });
  };

  const hasActiveFilters = search || category || dateFrom || dateTo || status !== 'all';

  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // Auto-apply search
              onFilterChange({
                search: e.target.value,
                category,
                dateFrom,
                dateTo,
                status,
              });
            }}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {[search && 1, category && 1, dateFrom && 1, dateTo && 1, status !== 'all' && 1]
                .filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20 animate-in slide-in-from-top">
          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select value={category || 'all'} onValueChange={(val) => setCategory(val === 'all' ? null : val)}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateFrom && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom || undefined}
                  onSelect={(date) => setDateFrom(date || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dateTo && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo || undefined}
                  onSelect={(date) => setDateTo(date || null)}
                  disabled={(date) => dateFrom ? date < dateFrom : false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(val: 'all' | 'upcoming' | 'past') => setStatus(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming Only</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-4 flex gap-2 justify-end">
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {category && (
            <Badge variant="secondary" className="gap-1">
              {category}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setCategory(null);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          {dateFrom && (
            <Badge variant="secondary" className="gap-1">
              From: {format(dateFrom, 'MMM d')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setDateFrom(null);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          {dateTo && (
            <Badge variant="secondary" className="gap-1">
              To: {format(dateTo, 'MMM d')}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setDateTo(null);
                  applyFilters();
                }}
              />
            </Badge>
          )}
          {status !== 'all' && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setStatus('all');
                  applyFilters();
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

