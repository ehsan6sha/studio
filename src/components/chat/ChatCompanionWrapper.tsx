'use client';

import { useAuth } from '@/context/auth-context';
import { getDictionary } from '@/lib/dictionaries';
import { useEffect, useState } from 'react';
import type { Locale } from '@/i18n-config';
import { ChatCompanion } from './ChatCompanion';
import { useParams } from 'next/navigation';

export function ChatCompanionWrapper() {
    const { isAuthenticated } = useAuth();
    const [dictionary, setDictionary] = useState<any>(null);
    const params = useParams();
    const lang = (Array.isArray(params.lang) ? params.lang[0] : params.lang) as Locale || 'fa';

    useEffect(() => {
        if (isAuthenticated) {
            getDictionary(lang).then(dict => setDictionary(dict.chatCompanion));
        }
    }, [isAuthenticated, lang]);

    if (!isAuthenticated || !dictionary) {
        return null;
    }

    return <ChatCompanion dictionary={dictionary} lang={lang} />;
}
