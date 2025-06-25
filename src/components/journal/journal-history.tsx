
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Locale } from '@/i18n-config';
import { Edit, Trash2, Smile, StickyNote, FilterX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { faIR as faIRJalali } from 'date-fns-jalali/locale';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const JOURNAL_HISTORY_KEY = 'hami-journal-history';

interface JournalEntry {
  id: string;
  timestamp: string;
  type: 'mood' | 'note';
  data: {
    primary?: string;
    subMoods?: string[];
    text?: string;
  };
}

interface JournalHistoryProps {
  dictionary: any;
  lang: Locale;
}

export function JournalHistory({ dictionary, lang }: JournalHistoryProps) {
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();
  
  const isRTL = lang === 'fa';
  const fnsLocale = isRTL ? faIRJalali : enUS;

  const loadHistory = useCallback(() => {
    const rawHistory = localStorage.getItem(JOURNAL_HISTORY_KEY);
    if (rawHistory) {
      try {
        setHistory(JSON.parse(rawHistory));
      } catch (e) {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    loadHistory();
    window.addEventListener('storage', loadHistory);
    return () => window.removeEventListener('storage', loadHistory);
  }, [loadHistory]);

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditingText(entry.data.text || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = () => {
    if (editingId === null) return;

    const updatedHistory = history.map(entry =>
      entry.id === editingId ? { ...entry, data: { ...entry.data, text: editingText } } : entry
    );
    setHistory(updatedHistory);
    localStorage.setItem(JOURNAL_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    toast({ title: dictionary.toast.editSuccess });
    setEditingId(null);
    setEditingText('');
  };

  const handleDelete = (id: string) => {
    const updatedHistory = history.filter((entry) => entry.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(JOURNAL_HISTORY_KEY, JSON.stringify(updatedHistory));
    toast({ title: dictionary.toast.deleteSuccess, variant: 'destructive' });
  };
  
  const formatDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        return format(date, 'PPP p', { locale: fnsLocale });
    } catch (e) {
        return dateString;
    }
  };

  const filteredHistory = useMemo(() => {
    return history
      .filter(entry => !!entry?.id) // Ensure entry has a unique ID to prevent key errors.
      .filter(entry => {
        if (!filterType || filterType === 'all') {
          return true;
        }
        return entry.type === filterType;
      })
      .filter(entry => {
        if (!filterDate) {
          return true;
        }
        if (typeof entry.timestamp !== 'string') {
          return false;
        }
        const entryDateStr = entry.timestamp.substring(0, 10);
        return entryDateStr === filterDate;
      });
  }, [history, filterDate, filterType]);

  const latestNote = useMemo(() => 
    history
      .filter(e => e.type === 'note')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0],
    [history]
  );

  const clearFilters = () => {
    setFilterDate(undefined);
    setFilterType('all');
  };

  if (history.length === 0) {
    return (
      <Card className="w-full max-w-3xl mx-auto shadow-lg">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">{dictionary.noEntries}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{dictionary.filterTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="type-filter">{dictionary.filterByTypeLabel}</Label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger id="type-filter">
                <SelectValue placeholder={dictionary.filterByTypeLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{dictionary.allTypes}</SelectItem>
                <SelectItem value="mood">{dictionary.moods}</SelectItem>
                <SelectItem value="note">{dictionary.notes}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label>{dictionary.filterByDateLabel}</Label>
            <DatePicker
              lang={lang}
              value={filterDate}
              onChange={setFilterDate}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" onClick={clearFilters}>
            <FilterX className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {dictionary.clearFiltersButton}
          </Button>
        </CardFooter>
      </Card>
      
      {filteredHistory.length > 0 ? (
        filteredHistory.map((entry) => (
          <Card key={entry.id} className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                  {entry.type === 'mood' ? <Smile className="h-4 w-4" /> : <StickyNote className="h-4 w-4" />}
                  {formatDate(entry.timestamp)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entry.type === 'mood' && entry.data.primary && (
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
                          <Smile className="h-5 w-5 text-primary"/>
                      </div>
                      <div>
                        <p className="font-semibold">{entry.data.primary}</p>
                        {entry.data.subMoods && entry.data.subMoods.length > 0 && 
                            <p className="text-sm text-muted-foreground">({entry.data.subMoods.join(lang === 'fa' ? '، ' : ', ')})</p>
                        }
                      </div>
                  </div>
              )}
              {entry.type === 'note' && (
                editingId === entry.id ? (
                  <Textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="min-h-[120px]"
                    autoFocus
                  />
                ) : (
                  <p className="text-foreground/90 whitespace-pre-wrap min-h-[24px]">
                    {entry.data.text}
                  </p>
                )
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {editingId === entry.id ? (
                <>
                  <Button variant="ghost" onClick={handleCancelEdit}>
                    {dictionary.buttons.cancel}
                  </Button>
                  <Button onClick={handleSaveEdit}>{dictionary.buttons.save}</Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {entry.type === 'note' && entry.id === latestNote?.id && (
                    <Button variant="outline" size="icon" onClick={() => handleEdit(entry)}>
                      <Edit className="h-4 w-4" />
                       <span className="sr-only">{dictionary.buttons.edit}</span>
                    </Button>
                  )}
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                           <span className="sr-only">{dictionary.buttons.delete}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{dictionary.deleteDialog.title}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {dictionary.deleteDialog.description}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{dictionary.deleteDialog.cancel}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                            {dictionary.deleteDialog.confirm}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              )}
            </CardFooter>
          </Card>
        ))
      ) : (
        <Card className="w-full max-w-3xl mx-auto shadow-lg">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">{dictionary.noFilteredResults}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
