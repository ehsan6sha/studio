import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-journal-entry.ts';
import '@/ai/flows/generate-insight-from-data.ts';
import '@/ai/flows/generate-journal-suggestions.ts';
import '@/ai/flows/suggest-specialist.ts';