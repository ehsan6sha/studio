
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Edit, Trash2, Smile } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { faIR as faIRJalali } from 'date-fns-jalali/locale';

const JOURNAL_HISTORY_KEY = 'hami-journal-history';

interface JournalEntry {
  date: string;
  note?: string;
  mood?: {
    primary: string;
    subMoods: string[];
  };
}

interface JournalHistoryProps {
  dictionary: any; // JournalPage dictionary
  lang: Locale;
}

export function JournalHistory({ dictionary, lang }: JournalHistoryProps) {
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<string>('');
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

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditingNote(history[index].note || '');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingNote('');
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;

    const updatedHistory = [...history];
    updatedHistory[editingIndex].note = editingNote;
    setHistory(updatedHistory);
    localStorage.setItem(JOURNAL_HISTORY_KEY, JSON.stringify(updatedHistory));
    
    toast({ title: dictionary.toast.editSuccess });
    setEditingIndex(null);
    setEditingNote('');
  };

  const handleDelete = (date: string) => {
    const updatedHistory = history.filter((entry) => entry.date !== date);
    setHistory(updatedHistory);
    localStorage.setItem(JOURNAL_HISTORY_KEY, JSON.stringify(updatedHistory));
    toast({ title: dictionary.toast.deleteSuccess, variant: 'destructive' });
  };
  
  const formatDate = (dateString: string) => {
    try {
        const date = parseISO(dateString);
        return format(date, 'PPP', { locale: fnsLocale });
    } catch (e) {
        return dateString;
    }
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
      {history.map((entry, index) => (
        <Card key={entry.date} className="shadow-lg">
          <CardHeader>
            <CardTitle>{formatDate(entry.date)}</CardTitle>
            {entry.mood && (
                 <CardDescription className="flex items-center gap-2 pt-1">
                    <Smile className="h-4 w-4"/> {entry.mood.primary}
                    {entry.mood.subMoods.length > 0 && 
                        <span className="text-xs text-muted-foreground">({entry.mood.subMoods.join(', ')})</span>
                    }
                 </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {editingIndex === index ? (
              <Textarea
                value={editingNote}
                onChange={(e) => setEditingNote(e.target.value)}
                className="min-h-[120px]"
                autoFocus
              />
            ) : (
              <p className="text-foreground/90 whitespace-pre-wrap min-h-[40px]">
                {entry.note || <span className="text-muted-foreground">{dictionary.noNote}</span>}
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {editingIndex === index ? (
              <>
                <Button variant="ghost" onClick={handleCancelEdit}>
                  {dictionary.buttons.cancel}
                </Button>
                <Button onClick={handleSaveEdit}>{dictionary.buttons.save}</Button>
              </>
            ) : (
              <>
                {index === 0 && ( // Only allow editing the latest entry
                  <Button variant="outline" size="icon" onClick={() => handleEdit(index)}>
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
                        <AlertDialogAction onClick={() => handleDelete(entry.date)}>
                          {dictionary.deleteDialog.confirm}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
