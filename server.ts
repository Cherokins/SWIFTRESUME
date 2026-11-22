import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  CvFormData,
  GeneratedDocumentsResponse,
} from './src/types/cv.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const PRICE_KOBO = 5000; // KES 50 in minor units (cents/kobo)
const CURRENCY = 'KES';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add it in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 20000,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatTodayForKenya(): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientModelError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : '';
  return (
    name === 'AbortError' ||
    name === 'TimeoutError' ||
    raw.includes('503') ||
    raw.includes('UNAVAILABLE') ||
    raw.includes('high demand') ||
    raw.includes('429') ||
    raw.includes('RESOURCE_EXHAUSTED') ||
    raw.includes('500') ||
    raw.includes('INTERNAL') ||
    raw.includes('ECONNRESET') ||
    raw.includes('ETIMEDOUT') ||
    raw.toLowerCase().includes('timeout')
  );
}

const DOCUMENTS_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    cv: {
      type: Type.OBJECT,
      properties: {
        fullName: { type: Type.STRING },
        targetRole: { type: Type.STRING },
        contactItems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        professionalSummary: { type: Type.STRING },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              company: { type: Type.STRING },
              dateRange: { type: Type.STRING },
              bullets: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['role', 'company', 'dateRange', 'bullets'],
          },
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              degree: { type: Type.STRING },
              institution: { type: Type.STRING },
              meta: { type: Type.STRING },
            },
            required: ['degree', 'institution', 'meta'],
          },
        },
        skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        achievements: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        languages: { type: Type.STRING },
      },
      required: [
        'fullName',
        'targetRole',
        'contactItems',
        'professionalSummary',
        'experience',
        'education',
        'skills',
        'achievements',
        'languages',
      ],
    },
    coverLetter: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING },
        recipientLines: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        subject: { type: Type.STRING },
        salutation: { type: Type.STRING },
        paragraphs: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        closing: { type: Type.STRING },
        signatureName: { type: Type.STRING },
      },
      required: [
        'date',
        'recipientLines',
        'subject',
        'salutation',
        'paragraphs',
        'closing',
        'signatureName',
      ],
    },
  },
  required: ['cv', 'coverLetter'],
};

async function generateDocuments(
  ai: GoogleGenAI,
  payload: CvFormData
): Promise<GeneratedDocumentsResponse> {
  const today = formatTodayForKenya();

  const expText = payload.experiences.length
    ? payload.experiences
        .map(
          (e) =>
            `Role: ${e.title}\nCompany: ${e.company}\nPeriod: ${e.start || ''}${
              e.end ? ` – ${e.end}` : ''
            }\nResponsibilities:\n${
              e.bullets.length
                ? e.bullets.map((b) => `- ${b}`).join('\n')
                : '- General duties in this role'
            }`
        )
        .join('\n\n')
    : 'No prior formal work experience provided.';

  const eduText = payload.education.length
    ? payload.education
        .map(
          (e) =>
            `${e.degree}, ${e.school}${e.year ? `, ${e.year}` : ''}${
              e.grade ? `, ${e.grade}` : ''
            }`
        )
        .join('\n')
    : 'Not provided.';

  const skillsText = payload.skills.length
    ? payload.skills.join(', ')
    : 'Not specified.';

  const achsText = payload.achievements.length
    ? payload.achievements.map((a, i) => `${i + 1}. ${a}`).join('\n')
    : 'None provided.';

  const prompt = `You are a senior CV writer and career coach specialising in the Kenyan and East African job market.
Generate BOTH a complete ATS-optimised CV ("cv") AND a tailored cover letter ("coverLetter") in a single JSON response.

DATE: ${today}

CANDIDATE PROFILE:
Name: ${payload.name}
Target Role: ${payload.role}
Email: ${payload.email}
Phone: ${payload.phone}
Location: ${payload.location || 'Kenya'}
${payload.linkedin ? `LinkedIn / Portfolio: ${payload.linkedin}` : ''}
${payload.targetCompany ? `Target Employer: ${payload.targetCompany}` : ''}
${payload.jobDescription ? `TARGET JOB ADVERT / KEYWORDS:\n${payload.jobDescription}` : ''}

WORK EXPERIENCE:
${expText}

EDUCATION:
${eduText}

SKILLS:
${skillsText}

${payload.summary ? `CANDIDATE SUMMARY NOTES:\n${payload.summary}` : ''}

ACHIEVEMENTS & AWARDS:
${achsText}

${payload.languages ? `LANGUAGES:\n${payload.languages}` : ''}

CV RULES:
1. Write a sharp, ATS-optimised professionalSummary (maximum 3 concise sentences tailored to the target role).
2. Refine every work experience entry with strong action verbs and achievement-focused bullet points without fabricating employers or dates. If no work experience was provided, return an empty array for experience.
3. Format education cleanly. If no education was provided, return an empty array for education.
4. Preserve ALL skills provided by the candidate in cv.skills.
5. Polish any provided achievements; if none were provided, return an empty array.
6. Include email, phone, location, and LinkedIn (if provided) in contactItems.
7. Include languages if provided, otherwise return an empty string.

COVER LETTER RULES:
- date: "${today}"
- recipientLines: ${
    payload.targetCompany
      ? `["Hiring Manager", "${payload.targetCompany}"]`
      : `["Hiring Manager", "Human Resources Department"]`
  }
- subject: "Application for ${payload.role}"
- salutation: "Dear Hiring Manager,"
- paragraphs: Write 3 to 4 warm, confident, non-robotic paragraphs:
  1) Opening expressing strong interest in the ${payload.role} role${
    payload.targetCompany ? ` at ${payload.targetCompany}` : ''
  } and core background.
  2) Middle paragraph(s) highlighting 2–3 relevant strengths, achievements, or skills aligned with the role.
  3) Closing paragraph with call to action and appreciation.
- Do NOT use placeholder brackets like [Company Name]; write ${
    payload.targetCompany
      ? `"${payload.targetCompany}"`
      : `"your organisation"`
  }.
- closing: "Yours sincerely,"
- signatureName: "${payload.name}"`;

  const attempts: Array<{ model: string; useThinking: boolean; delayMs: number }> = [
    { model: 'gemini-4-hydrogen', useThinking: true, delayMs: 0 },
    { model: 'gemini-4-hydrogen', useThinking: true, delayMs: 900 },
    { model: 'gemini-3.1-flash-lite', useThinking: false, delayMs: 1200 },
  ];

  let lastError: unknown;

  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await sleep(attempt.delayMs);
    }
    try {
      const response = await ai.models.generateContent({
        model: attempt.model,
        contents: prompt,
        config: {
          systemInstruction:
            'Return strictly valid JSON matching the requested schema. Do not invent employers, degrees, or contact information not implied by the candidate profile.',
          ...(attempt.useThinking
            ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
            : {}),
          responseMimeType: 'application/json',
          responseSchema: DOCUMENTS_RESPONSE_SCHEMA,
        },
      });

      const text = (response.text ?? '').trim();
      if (!text) {
        throw new Error('Document generation returned an empty response.');
      }
      return JSON.parse(text) as GeneratedDocumentsResponse;
    } catch (err) {
      lastError = err;
      if (!isTransientModelError(err)) {
        throw err;
      }
      console.warn(
        `Transient Gemini error on ${attempt.model}, retrying/falling back:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  throw lastError;
}

function mapGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('GEMINI_API_KEY')) {
    return { status: 500, message: raw };
  }
  if (
    raw.includes('PERMISSION_DENIED') ||
    raw.includes('API_KEY_INVALID') ||
    raw.includes('403') ||
    raw.includes('400')
  ) {
    return {
      status: 400,
      message:
        'Please check your GEMINI_API_KEY in the Settings > Secrets panel.',
    };
  }
  if (
    raw.includes('503') ||
    raw.includes('UNAVAILABLE') ||
    raw.includes('high demand')
  ) {
    return {
      status: 503,
      message:
        'The AI service is experiencing temporary high demand. Please click "Build My CV" again in a few seconds.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message:
        'Rate limit reached. Please wait a few seconds and try again.',
    };
  }
  return {
    status: 500,
    message: 'Failed to generate documents. Please try again shortly.',
  };
}

function resolveBaseUrl(req: Request): string {
  const configured = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (configured && configured !== 'MY_APP_URL') {
    return configured;
  }
  const protoHeader = req.get('x-forwarded-proto');
  const proto = protoHeader ? protoHeader.split(',')[0].trim() : req.protocol;
  const host = req.get('x-forwarded-host') || req.get('host') || `localhost:${PORT}`;
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/robots.txt', (req: Request, res: Response) => {
    const baseUrl = resolveBaseUrl(req);
    res
      .type('text/plain')
      .send(
        `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`
      );
  });

  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const baseUrl = resolveBaseUrl(req);
    const todayIso = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
    res.type('application/xml').send(xml);
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.get('/api/config', (_req: Request, res: Response) => {
    const publicKey = (process.env.PAYSTACK_PUBLIC_KEY || '').trim();
    const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim();
    res.json({
      paystackPublicKey:
        publicKey && publicKey !== 'MY_PAYSTACK_PUBLIC_KEY' ? publicKey : '',
      amountKobo: PRICE_KOBO,
      currency: CURRENCY,
      hasPaystackSecret: Boolean(
        secretKey && secretKey !== 'MY_PAYSTACK_SECRET_KEY'
      ),
    });
  });

  app.post('/api/generate', async (req: Request, res: Response) => {
    try {
      const body = req.body as Partial<CvFormData>;
      const name = body?.name?.trim() || '';
      const role = body?.role?.trim() || '';
      const email = body?.email?.trim() || '';
      const phone = body?.phone?.trim() || '';

      if (!name || !role || !email || !phone) {
        res.status(400).json({
          error: 'Please fill in your name, role, email, and phone number.',
        });
        return;
      }

      const payload: CvFormData = {
        name,
        role,
        email,
        phone,
        location: body?.location?.trim() || 'Kenya',
        linkedin: body?.linkedin?.trim() || '',
        targetCompany: body?.targetCompany?.trim() || '',
        jobDescription: body?.jobDescription?.trim() || '',
        summary: body?.summary?.trim() || '',
        languages: body?.languages?.trim() || '',
        experiences: Array.isArray(body?.experiences) ? body.experiences : [],
        education: Array.isArray(body?.education) ? body.education : [],
        skills: Array.isArray(body?.skills) ? body.skills : [],
        achievements: Array.isArray(body?.achievements)
          ? body.achievements
          : [],
      };

      const ai = getAiClient();
      const result = await generateDocuments(ai, payload);

      res.json(result);
    } catch (error) {
      const mapped = mapGeminiError(error);
      console.error('Document generation error:', error);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  app.post('/api/paystack/verify', async (req: Request, res: Response) => {
    try {
      const reference =
        typeof req.body?.reference === 'string'
          ? req.body.reference.trim()
          : '';
      if (!reference) {
        res.status(400).json({ error: 'Payment reference is required.' });
        return;
      }

      const secretKey = (process.env.PAYSTACK_SECRET_KEY || '').trim();
      if (!secretKey || secretKey === 'MY_PAYSTACK_SECRET_KEY') {
        res.status(503).json({
          error:
            'PAYSTACK_SECRET_KEY is not configured in Settings > Secrets. Add your Paystack secret key to verify transactions securely.',
        });
        return;
      }

      const verifyRes = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(
          reference
        )}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const verifyData = (await verifyRes.json()) as {
        status?: boolean;
        message?: string;
        data?: {
          status?: string;
          amount?: number;
          currency?: string;
          reference?: string;
        };
      };

      if (!verifyRes.ok || !verifyData.status || !verifyData.data) {
        res.status(402).json({
          error:
            verifyData.message ||
            'Unable to verify Paystack transaction. Please try again.',
        });
        return;
      }

      const tx = verifyData.data;
      if (
        tx.status !== 'success' ||
        tx.currency !== CURRENCY ||
        typeof tx.amount !== 'number' ||
        tx.amount < PRICE_KOBO
      ) {
        res.status(402).json({
          error: 'Payment was not completed for the required amount.',
        });
        return;
      }

      res.json({
        verified: true,
        reference: tx.reference,
        amount: tx.amount,
        currency: tx.currency,
      });
    } catch (error) {
      console.error('Paystack verification error:', error);
      res.status(500).json({
        error: 'Failed to communicate with Paystack verification service.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SwiftCV server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SwiftCV server:', err);
  process.exit(1);
});
