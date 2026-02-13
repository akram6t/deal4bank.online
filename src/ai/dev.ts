import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-long-email-flow.ts';
import '@/ai/flows/refine-email-tone-flow.ts';