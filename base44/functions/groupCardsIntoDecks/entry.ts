import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { nebiusChat, parseJsonLoose } from '../../shared/nebius.ts';

const MAX_CARDS = 200;
const MAX_FIELD = 300;

// Groups a pasted set of flashcards (no deck/topic column in the export)
// into meaningful subtopic decks using an LLM.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const cards = Array.isArray(body?.cards) ? body.cards : null;
    if (!cards || cards.length === 0) {
      return Response.json({ error: 'No cards provided' }, { status: 400 });
    }
    const safeCards = cards.slice(0, MAX_CARDS).map((c) => ({
      front: String(c?.front || '').slice(0, MAX_FIELD),
      back: String(c?.back || '').slice(0, MAX_FIELD),
    }));
    const subject = String(body?.subject || '');

    const list = safeCards
      .map((c, i) => `${i + 1}. ${c.front} | ${c.back}`)
      .join('\n');

    const text = await nebiusChat({
      messages: [
        {
          role: 'system',
          content:
            'You group A-Level flashcards into subtopic decks. ' +
            'Return ONLY valid JSON in this shape: {"groups":[{"name":"...","card_numbers":[1,2]}]}. ' +
            'No markdown, no explanation.',
        },
        {
          role: 'user',
          content:
            `You are organising ${subject ? subject : 'A-Level'} flashcards into subtopic decks.\n` +
            `Below is a numbered list of flashcards, each as "question | answer".\n` +
            `Group them into between 3 and 8 meaningful subtopic decks based on what each card is about.\n` +
            `Keep deck names short (1-4 words, e.g. "Enzymes", "Cell Organelles").\n` +
            `Every card must appear in exactly one group — do not invent cards that are not in the list.\n\n${list}`,
        },
      ],
      maxTokens: 2000,
      temperature: 0.2,
    });

    let parsed;
    try {
      parsed = parseJsonLoose(text);
    } catch {
      return Response.json({ error: 'The AI reply could not be read. Please try again.' }, { status: 502 });
    }

    const groups = (Array.isArray(parsed?.groups) ? parsed.groups : [])
      .map((g) => ({
        name: String(g?.name || '').trim(),
        indices: (Array.isArray(g?.card_numbers) ? g.card_numbers : [])
          .map((n) => Math.round(Number(n)) - 1)
          .filter((i) => i >= 0 && i < safeCards.length),
      }))
      .filter((g) => g.name && g.indices.length > 0);

    return Response.json({ groups });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
