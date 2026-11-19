import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import type {
  CvFormData,
  GeneratedCoverLetterData,
  GeneratedCvData,
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

async function generateCvContent(
  ai: GoogleGenAI,
  payload: CvFormData
): Promise<GeneratedCvData> {
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

  const prompt = `You are a senior professional CV writer specialising in the Kenyan and East African job market.

CANDIDATE PROFILE:
Name: ${payload.name}
Target Role: ${payload.role}
Email: ${payload.email}
Phone: ${payload.phone}
Location: ${payload.location || 'Kenya'}
${payload.linkedin ? `LinkedIn / Portfolio: ${payload.linkedin}` : ''}

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

INSTRUCTIONS:
1. Write a sharp, ATS-optimised professional summary (maximum 3 concise sentences tailored to the target role).
2. Refine every work experience entry with strong action verbs, achievement-focused bullet points, and realistic quantified impact where appropriate without fabricating employers or dates. If no work experience was provided, return an empty array for experience.
3. Format education cleanly. If no education was provided, return an empty array for education.
4. Preserve ALL skills provided by the candidate in the skills array (and optionally normalize casing).
5. Polish any provided achievements into crisp, results-oriented statements; if none were provided, return an empty array.
6. Include contact items (email, phone, location, and LinkedIn if provided) as clean strings in contactItems.
7. Include languages string if provided, otherwise return an empty string.`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction:
        'Return strictly valid JSON matching the requested schema. Do not invent employers, degrees, or contact information not implied by the candidate profile.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
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
    },
  });

  const text = (response.text ?? '').trim();
  if (!text) {
    throw new Error('CV generation returned an empty response.');
  }
  return JSON.parse(text) as GeneratedCvData;
}

async function generateCoverLetterContent(
  ai: GoogleGenAI,
  payload: CvFormData
): Promise<GeneratedCoverLetterData> {
  const today = formatTodayForKenya();
  const expText = payload.experiences.length
    ? payload.experiences
        .map(
          (e) =>
            `${e.title} at ${e.company} (${e.start || ''}${
              e.end ? ` – ${e.end}` : ''
            }): ${e.bullets.join('; ')}`
        )
        .join('\n')
    : 'Entry-level candidate / transferable skills';

  const skillsText = payload.skills.length
    ? payload.skills.join(', ')
    : 'Communication, Teamwork, Problem Solving';

  const prompt = `You are a senior career coach writing a tailored cover letter for the Kenyan job market.

DATE: ${today}

CANDIDATE:
Name: ${payload.name}
Target Role: ${payload.role}
Email: ${payload.email}
Phone: ${payload.phone}
Location: ${payload.location || 'Kenya'}

EXPERIENCE:
${expText}

SKILLS:
${skillsText}

${payload.summary ? `SUMMARY: ${payload.summary}` : ''}

RULES:
- date: "${today}"
- recipientLines: ["Hiring Manager", "Human Resources Department"]
- subject: "Application for ${payload.role}"
- salutation: "Dear Hiring Manager,"
- paragraphs: Write 3 to 4 crisp, warm, confident, non-robotic paragraphs:
  1) Opening expressing strong interest in the ${payload.role} role and core background.
  2) Middle paragraph(s) highlighting 2–3 relevant strengths, achievements, or skills.
  3) Closing paragraph with call to action and appreciation.
- Do NOT use placeholder brackets like [Company Name]; write "your organisation" instead.
- closing: "Yours sincerely,"
- signatureName: "${payload.name}"`;

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: prompt,
    config: {
      systemInstruction:
        'Return strictly valid JSON matching the requested schema. No placeholder brackets.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
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
  });

  const text = (response.text ?? '').trim();
  if (!text) {
    throw new Error('Cover letter generation returned an empty response.');
  }
  return JSON.parse(text) as GeneratedCoverLetterData;
}

function mapGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('GEMINI_API_KEY')) {
    return { status: 500, message: raw };
  }
  if (raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID') || raw.includes('403') || raw.includes('400')) {
    return {
      status: 400,
      message:
        'Please check your GEMINI_API_KEY in the Settings > Secrets panel.',
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    return {
      status: 429,
      message:
        'Rate limit reached. Please wait a moment and try again.',
    };
  }
  return {
    status: 500,
    message: raw || 'Failed to generate documents.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

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
      const [cv, coverLetter] = await Promise.all([
        generateCvContent(ai, payload),
        generateCoverLetterContent(ai, payload),
      ]);

      res.json({ cv, coverLetter });
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
