
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { HeartHandshake, Send, Bot, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { chatWithCompanion } from '@/ai/flows/chat-companion';
import type { ChatCompanionInput } from '@/ai/flows/chat-companion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatCompanionProps {
    dictionary: {
        title: string;
        inputPlaceholder: string;
        sendButtonLabel: string;
    }
}

export function ChatCompanion({ dictionary }: ChatCompanionProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const history = [...messages, userMessage];
            const input: ChatCompanionInput = {
                history: history.slice(0, -1), // History without the current message
                message: userMessage.content,
            };
            const result = await chatWithCompanion(input);
            const assistantMessage: Message = { role: 'assistant', content: result.response };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error chatting with companion:", error);
            const errorMessage: Message = { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="default"
                size="icon"
                className="fixed bottom-4 left-4 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center bg-primary hover:bg-primary/90"
                onClick={() => setIsOpen(true)}
                aria-label="Open AI Companion Chat"
            >
                <HeartHandshake className="h-7 w-7 text-primary-foreground" />
            </Button>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="bottom" className="h-[70vh] flex flex-col p-0 rounded-t-lg sm:max-w-lg mx-auto">
                    <SheetHeader className="p-4 border-b text-left">
                        <SheetTitle className="flex items-center gap-2">
                           <Bot /> {dictionary.title}
                        </SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                     {message.role === 'assistant' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><Bot size={20} /></AvatarFallback>
                                        </Avatar>
                                     )}
                                    <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><User size={20} /></AvatarFallback>
                                        </Avatar>
                                     )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg px-3 py-2 bg-muted">
                                         <Skeleton className="h-4 w-12" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                    <SheetFooter className="p-4 border-t">
                        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2 rtl:space-x-reverse">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={dictionary.inputPlaceholder}
                                disabled={isLoading}
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                                <Send className="h-4 w-4" />
                                <span className="sr-only">{dictionary.sendButtonLabel}</span>
                            </Button>
                        </form>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </>
    );
}
