import { type ChangeEvent, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounce?: number;
}

/**
 * Debounced search input — uses shadcn Input
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  debounce = 400,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounce);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
