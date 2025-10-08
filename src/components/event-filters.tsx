import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from './ui/button';
import { Filter, ListFilter } from 'lucide-react';
import type { Category } from '@/lib/types';

const categories: Category[] = ['Music', 'Tech', 'Art', 'Sports', 'Workshop', 'Social', 'Conference', 'Party'];

export function EventFilters() {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-6">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Date</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="tomorrow">Tomorrow</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-weekend">This Weekend</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Location</SelectItem>
            <SelectItem value="quad">Main Quad</SelectItem>
            <SelectItem value="gym">University Gymnasium</SelectItem>
            <SelectItem value="eng-building">Engineering Building</SelectItem>
            <SelectItem value="union">Student Union</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button variant="outline" className='w-full sm:w-auto'>
        <ListFilter className="mr-2 h-4 w-4" />
        Filters
      </Button>
    </div>
  );
}
