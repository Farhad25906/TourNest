"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'ADVENTURE', label: 'Adventure' },
  { value: 'CULTURAL', label: 'Cultural' },
  { value: 'BEACH', label: 'Beach' },
  { value: 'MOUNTAIN', label: 'Mountain' },
  { value: 'URBAN', label: 'Urban' },
  { value: 'NATURE', label: 'Nature' },
  { value: 'FOOD', label: 'Food' },
  { value: 'HISTORICAL', label: 'Historical' },
  { value: 'RELIGIOUS', label: 'Religious' },
  { value: 'LUXURY', label: 'Luxury' },
];

const DIFFICULTIES = [
  { value: 'ALL', label: 'All Difficulties' },
  { value: 'EASY', label: 'Easy' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'DIFFICULT', label: 'Difficult' },
  { value: 'EXTREME', label: 'Extreme' },
];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'startDate_asc', label: 'Date: Earliest First' },
  { value: 'startDate_desc', label: 'Date: Latest First' },
];

export function ToursFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [difficulty, setDifficulty] = useState(searchParams.get('difficulty') || 'ALL');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt_desc');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilter = () => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('searchTerm', searchTerm);
    if (category !== 'ALL') params.set('category', category);
    if (difficulty !== 'ALL') params.set('difficulty', difficulty);
    
    const [sortField, sortOrder] = sortBy.split('_');
    params.set('sortBy', sortField);
    params.set('sortOrder', sortOrder);
    
    router.push(`/tours?${params.toString()}`);
  };

  const handleReset = () => {
    setSearchTerm('');
    setCategory('ALL');
    setDifficulty('ALL');
    setSortBy('createdAt_desc');
    router.push('/tours');
  };

  const hasFilters = searchTerm || category !== 'ALL' || difficulty !== 'ALL' || sortBy !== 'createdAt_desc';

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tours by title, destination, or description..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
            {hasFilters && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          {diff.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((sort) => (
                        <SelectItem key={sort.value} value={sort.value}>
                          {sort.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button onClick={handleFilter}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Badges */}
          {hasFilters && !showFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {category !== 'ALL' && (
                <Badge variant="secondary" className="gap-1">
                  Category: {CATEGORIES.find(c => c.value === category)?.label}
                  <button
                    onClick={() => setCategory('ALL')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {difficulty !== 'ALL' && (
                <Badge variant="secondary" className="gap-1">
                  Difficulty: {DIFFICULTIES.find(d => d.value === difficulty)?.label}
                  <button
                    onClick={() => setDifficulty('ALL')}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}