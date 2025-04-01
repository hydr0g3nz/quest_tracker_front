import { BoardCheckingFilter, QuestStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface QuestFilterProps {
  onFilterChange: (filter: BoardCheckingFilter) => void;
  initialFilter?: BoardCheckingFilter;
}

export function QuestFilter({ onFilterChange, initialFilter }: QuestFilterProps) {
  const [filter, setFilter] = useState<BoardCheckingFilter>(
    initialFilter || {}
  );

  const handleFilterChange = (newFilter: Partial<BoardCheckingFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onFilterChange(filter);
  };

  const handleClear = () => {
    const emptyFilter = {};
    setFilter(emptyFilter);
    onFilterChange(emptyFilter);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by quest name..."
            className="pl-8"
            value={filter.name || ""}
            onChange={(e) => handleFilterChange({ name: e.target.value })}
          />
        </div>
        <Select
          value={filter.status || ""}
          onValueChange={(value) =>
            handleFilterChange({
              status: value ? (value as QuestStatus) : undefined,
            })
          }
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value={QuestStatus.Open}>Open</SelectItem>
              <SelectItem value={QuestStatus.InJourney}>In Journey</SelectItem>
              <SelectItem value={QuestStatus.Completed}>Completed</SelectItem>
              <SelectItem value={QuestStatus.Failed}>Failed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button type="submit">Filter</Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
