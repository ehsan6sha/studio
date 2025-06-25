
'use client';

import * as React from 'react';
import { format, isValid, parse } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { faIR as faIRJalali } from 'date-fns-jalali/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import type { Locale } from '@/i18n-config';

interface DatePickerProps {
  value?: string; // Expects YYYY-MM-DD
  onChange: (date?: string) => void;
  lang: Locale;
}

export function DatePicker({ value, onChange, lang }: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  
  // When the prop value changes (e.g., from calendar select or initial load), update the input field
  React.useEffect(() => {
    if (value) {
      const date = parse(value, 'yyyy-MM-dd', new Date());
      if (isValid(date)) {
        setInputValue(format(date, 'yyyy/MM/dd'));
      }
    } else {
      setInputValue(''); // Clear input if value is cleared
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/[^0-9]/g, '');
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.substring(0, 4);
    }
    if (numbers.length > 4) {
      formatted += '/' + numbers.substring(4, 6);
    }
    if (numbers.length > 6) {
      formatted += '/' + numbers.substring(6, 8);
    }

    setInputValue(formatted);

    if (formatted.length === 10) { // yyyy/MM/dd
      const parsedDate = parse(formatted, 'yyyy/MM/dd', new Date());
      if (isValid(parsedDate)) {
        onChange(format(parsedDate, 'yyyy-MM-dd'));
      } else {
        onChange(undefined); // Let parent know it's invalid
      }
    } else {
       onChange(undefined); // Let parent know it's incomplete/invalid
    }
  };

  const handleSelect = (selectedDate: Date | undefined) => {
    onChange(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined);
    setIsPopoverOpen(false);
  };
  
  const dateFromValue = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;

  const isJalali = lang === 'fa';
  const locale = isJalali ? faIRJalali : enUS;

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <div className="relative w-full">
        <Input
          type="text"
          placeholder={'YYYY/MM/DD'}
          value={inputValue}
          onChange={handleInputChange}
          className={cn('w-full text-left', lang === 'fa' ? 'pr-10' : 'pl-10')}
          maxLength={10}
        />
        <PopoverTrigger asChild>
          <Button
            variant={'ghost'}
            size="icon"
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground',
              lang === 'fa' ? 'right-1' : 'left-1'
            )}
            aria-label="Open calendar"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={dateFromValue && isValid(dateFromValue) ? dateFromValue : undefined}
          onSelect={handleSelect}
          initialFocus
          locale={locale}
          dir={lang === 'fa' ? 'rtl' : 'ltr'}
        />
      </PopoverContent>
    </Popover>
  );
}
