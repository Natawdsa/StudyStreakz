# StudyStreak

The revision cockpit for A-Level students. Track the AQA syllabus, review flashcards with spaced repetition (SM-2), log past papers, follow a day-by-day study plan, and keep a daily streak.

StudyStreak was built during the submission period. The AI flashcard generation uses NVIDIA Nemotron on Nebius Token Factory, and the card-grouping feature uses it too.

**Live demo:** [
](https://studystreakz.base44.app)
## Hackathon: Nebius x NVIDIA Global AI Hackathon
**Track:** Best Apps and Agents

### How I use NVIDIA Nemotron on Nebius Token Factory
Students paste their messy revision notes into the Flashcards page and click **Generate with AI**. The app sends the notes to **NVIDIA Nemotron** (`nvidia/nemotron-3-super-120b-a12b`) running on **Nebius Token Factory**, which returns a set of flashcards. The student previews them, deletes any they don't want, and saves them as a deck that is then scheduled with spaced repetition.

The same Nemotron model also powers the "group imported Anki cards into topic decks" feature.

- Backend function: `generateFlashcards` calls the Token Factory chat completions API
- The API key is stored as a server-side secret and is never exposed in the front end

### What was added during the contest

## Features
- Syllabus tracker with traffic-light mastery
- Spaced-repetition flashcards (SM-2) and adaptive Learn mode
- Past paper logging with grade conversion
- Phased study plans that count down to each exam
- Focus timer, streaks, badges and leaderboard

## Tech
React, Vite, Tailwind, Base44 (auth, database, backend functions), Nebius Token Factory, NVIDIA Nemotron

## Setup
1. Create a Nebius Token Factory API key
2. Add it as a secret named `NEBIUS_API_KEY`
3. Deploy the `generateFlashcards` function and open the Flashcards page

## License
MIT
