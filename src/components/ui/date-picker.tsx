
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale'; // For English
import { faIR as faIRJalali } from 'date-fns-jalali/locale'; // For Farsi (Jalali)
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { Locale } from '@/i18n-config';

interface DatePickerProps {
  value?: string; // Expects YYYY-MM-DD
  onChange: (date?: string) => void;
  lang: Locale;
  dictionary: {
    placeholder: string;
  };
}

export function DatePicker({ value, onChange, lang, dictionary }: DatePickerProps) {
  // react-day-picker works with Date objects
  const selectedDate = value ? new Date(value) : undefined;
  
  const handleSelect = (selectedDate: Date | undefined) => {
    // We store the date as a 'yyyy-MM-dd' string
    onChange(selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined);
  };
  
  const isJalali = lang === 'fa';
  const locale = isJalali ? faIRJalali : enUS;
  
  const formattedDate = selectedDate ? format(selectedDate, 'PPP', { locale }) : <span>{dictionary.placeholder}</span>;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          initialFocus
          locale={locale}
          dir={lang === 'fa' ? 'rtl' : 'ltr'}
        />
      </PopoverContent>
    </Popover>
  );
}
