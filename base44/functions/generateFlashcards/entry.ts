import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { nebiusChat, parseJsonLoose } from '../../shared/nebius.ts';

const MAX_NOTES = 12000;
const SUBJECTS = ['biology', 'chemistry', 'physics', 'business', 'psychology', 'economics'];

// Turns a student's revision notes into a set of flashcards using Nebius Token Factory.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const notes = String(body?.notes || '').trim();
    const subject = String(body?.subject || '').trim().toLowerCase();

    if (!notes) return Response.json({ error: 'Please paste some revision notes first.' }, { status: 400 });
    if (!SUBJECTS.includes(subject)) {
      return Response.json({ error: 'Please choose a subject.' }, { status: 400 });
    }

    const text = await nebiusChat({
      messages: [
        {
          role: 'system',
          content: `You are an A-Level revision expert. Turn the notes into 8-20 clear flashcards for AQA ${subject}. Return ONLY valid JSON: {"cards":[{"front":"...","back":"..."}]}. No markdown.`,
        },
        { role: 'user', content: notes.slice(0, MAX_NOTES) },
      ],
      maxTokens: 3000,
      temperature: 0.2,
    });

    let parsed;
    try {
      parsed = parseJsonLoose(text);
    } catch {
      return Response.json({ error: 'The AI reply could not be read. Please try again.' }, { status: 502 });
    }

    const cards = (Array.isArray(parsed?.cards) ? parsed.cards : [])
      .map((c) => ({
        front: String(c?.front || '').trim(),
        back: String(c?.back || '').trim(),
      }))
      .filter((c) => c.front && c.back)
      .slice(0, 40);

    if (cards.length === 0) {
      return Response.json(
        { error: 'No usable cards came back — try again with more detailed notes.' },
        { status: 502 }
      );
    }

    // (ending below was cut off in the original paste and completed here)
    return Response.json({ cards });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
