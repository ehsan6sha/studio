'use client';

import { useState, useEffect } from 'react';
import type { Locale } from '@/i18n-config';
import { getDictionary } from '@/lib/dictionaries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Eye, EyeOff, GitPullRequest, GraduationCap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: number;
  type: 'connection' | 'invitation' | 'content';
  from: string;
  details: string;
  isRead: boolean;
  scope?: string[];
  position?: string;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'connection',
    from: 'Dr. Sarah Ahmadi',
    details: 'wants to connect with you.',
    isRead: false,
    scope: ['Basic Profile', 'Daily Quiz Results'],
  },
  {
    id: 2,
    type: 'invitation',
    from: 'Rayan Clinic',
    details: 'has invited you to join their organization.',
    isRead: false,
    position: 'Psychologist',
  },
  {
    id: 3,
    type: 'content',
    from: 'Your instructor, Mr. Jafari',
    details: 'has assigned a new mindfulness exercise: "Breathing Techniques for Anxiety".',
    isRead: false,
  },
  {
    id: 4,
    type: 'connection',
    from: 'Tehran High School',
    details: 'wants to connect with you.',
    isRead: true,
    scope: ['Basic Profile', 'Student Performance'],
  },
];

const farsiNotifications: Notification[] = [
    {
      id: 1,
      type: 'connection',
      from: 'دکتر سارا احمدی',
      details: 'می‌خواهد با شما ارتباط برقرار کند.',
      isRead: false,
      scope: ['پروفایل پایه', 'نتایج آزمون‌های روزانه'],
    },
    {
      id: 2,
      type: 'invitation',
      from: 'کلینیک رایان',
      details: 'شما را برای پیوستن به سازمان خود دعوت کرده است.',
      isRead: false,
      position: 'روانشناس',
    },
    {
      id: 3,
      type: 'content',
      from: 'مدرس شما، آقای جعفری',
      details: 'یک تمرین ذهن‌آگاهی جدید برای شما تعیین کرده است: «تکنیک‌های تنفس برای اضطراب».',
      isRead: false,
    },
    {
      id: 4,
      type: 'connection',
      from: 'دبیرستان تهران',
      details: 'می‌خواهد با شما ارتباط برقرار کند.',
      isRead: true,
      scope: ['پروفایل پایه', 'عملکرد دانش‌آموز'],
    },
];

export default function NotificationsPage({ params: { lang } }: { params: { lang: Locale } }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dictionary, setDictionary] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    getDictionary(lang).then(dict => {
        setDictionary(dict.notificationsPage);
        setNotifications(lang === 'fa' ? farsiNotifications : initialNotifications);
    });
  }, [lang]);

  const toggleReadStatus = (id: number) => {
    setNotifications(
      notifications.map(n => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleAction = (id: number, action: 'accept' | 'ignore') => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast({
        title: action === 'accept' ? dictionary.toast.accepted : dictionary.toast.ignored,
        description: dictionary.toast.removed,
    });
  };
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Store unread count in localStorage for the navbar to read
  useEffect(() => {
    localStorage.setItem('unreadNotifications', unreadCount.toString());
    window.dispatchEvent(new Event('storage')); // Notify other components
  }, [unreadCount]);

  if (!dictionary) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  const renderNotificationCard = (notification: Notification) => (
    <Card key={notification.id} className={cn('mb-4 shadow-md transition-all', !notification.isRead && 'bg-primary/5')}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
        <div className="flex items-start gap-3">
            <div className="text-muted-foreground pt-1">
                {notification.type === 'connection' && <GitPullRequest />}
                {notification.type === 'invitation' && <GraduationCap />}
                {notification.type === 'content' && <Bell />}
            </div>
            <div>
                <CardTitle className="text-base font-semibold">{notification.from}</CardTitle>
                <CardDescription className="text-sm">{notification.details}</CardDescription>
            </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => toggleReadStatus(notification.id)}>
          {notification.isRead ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="sr-only">{notification.isRead ? dictionary.markAsUnread : dictionary.markAsRead}</span>
        </Button>
      </CardHeader>
      {notification.scope && (
        <CardContent className="pb-4 pl-12">
            <h4 className="font-semibold text-xs mb-2">{dictionary.requestedPermissions}</h4>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                {notification.scope.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
        </CardContent>
      )}
      {notification.position && (
        <CardContent className="pb-4 pl-12">
            <h4 className="font-semibold text-xs mb-2">{dictionary.positionOffered}</h4>
            <p className="text-xs text-muted-foreground">{notification.position}</p>
        </CardContent>
      )}
      {(notification.type === 'connection' || notification.type === 'invitation') && (
        <CardFooter className="flex justify-end gap-2 pl-12">
          <Button variant="outline" size="sm" onClick={() => handleAction(notification.id, 'ignore')}>
            <X className="h-4 w-4 ltr:mr-2 rtl:ml-2"/>
            {dictionary.buttons.ignore}
          </Button>
          <Button size="sm" onClick={() => handleAction(notification.id, 'accept')}>
            <Check className="h-4 w-4 ltr:mr-2 rtl:ml-2"/>
            {dictionary.buttons.accept}
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className='text-center md:text-start'>
            <h1 className="text-3xl font-headline font-bold tracking-tight text-foreground">
            {dictionary.title}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
            {dictionary.description}
            </p>
        </div>
        <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
          {dictionary.markAllAsRead}
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{dictionary.tabs.all}</TabsTrigger>
          <TabsTrigger value="connections">{dictionary.tabs.connections}</TabsTrigger>
          <TabsTrigger value="invitations">{dictionary.tabs.invitations}</TabsTrigger>
          <TabsTrigger value="content">{dictionary.tabs.content}</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {notifications.length > 0 ? (
            notifications.map(renderNotificationCard)
          ) : (
            <p className="text-center text-muted-foreground py-8">{dictionary.noNotifications}</p>
          )}
        </TabsContent>
        <TabsContent value="connections" className="mt-4">
            {notifications.filter(n => n.type === 'connection').length > 0 ? (
                notifications.filter(n => n.type === 'connection').map(renderNotificationCard)
            ) : (
                <p className="text-center text-muted-foreground py-8">{dictionary.noNotifications}</p>
            )}
        </TabsContent>
        <TabsContent value="invitations" className="mt-4">
            {notifications.filter(n => n.type === 'invitation').length > 0 ? (
                notifications.filter(n => n.type === 'invitation').map(renderNotificationCard)
            ) : (
                <p className="text-center text-muted-foreground py-8">{dictionary.noNotifications}</p>
            )}
        </TabsContent>
        <TabsContent value="content" className="mt-4">
            {notifications.filter(n => n.type === 'content').length > 0 ? (
                notifications.filter(n => n.type === 'content').map(renderNotificationCard)
            ) : (
                <p className="text-center text-muted-foreground py-8">{dictionary.noNotifications}</p>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
