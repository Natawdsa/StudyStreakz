# StudyStreak — Complete Product & Technical Specification

> Everything needed to rebuild this app from scratch: the problem, the pitch, every feature,
> the full data model, the real algorithms (with code), the architecture, and a demo script.

---

## 0. One-line pitch

**StudyStreak is the revision cockpit for A-Level students: it turns a syllabus into daily,
research-backed study actions — spaced-repetition flashcards, retrieval-practice self-tests,
timed past papers and a day-by-day plan that counts down to each exam — with streaks and a
leaderboard to keep students coming back.**

Elevator pitch (30 seconds):
> A-Level students have to revise 2 years of content across 3–4 subjects with no idea whether
> they're on track. Generic flashcard apps don't know the AQA spec, and planners don't test you.
> StudyStreak combines all three: it seeds the actual AQA syllabus, schedules flashcards with
> SM-2 spaced repetition, generates a research-backed study plan for every test date, and turns
> revision into a daily streak you don't want to break.

---

## 1. The problem

### The student's reality
- A-Level courses are 2 years of dense content, examined in a 3–5 week summer window.
- Students juggle 3–4 subjects, coursework, UCAS applications and mocks simultaneously.
- Most revision advice ("just do past papers") assumes you already know the content and have
  already scheduled the work.

### What actually works, per cognitive science
| Technique | Evidence | How the app applies it |
|---|---|---|
| **Spaced practice** | Distributing study over time produces far better long-term retention than massed practice (Cepeda et al., 2006) | SM-2 flashcard scheduler; plan spaces reviews instead of bunching |
| **Retrieval practice** | Testing yourself beats re-reading (Roediger & Karpicke, 2006) | Learn mode, closed-book self-tests, "blitz" tasks, active recall cards |
| **Practice testing with real papers** | Practice testing transfers strongly to exam performance (Agarwal et al., 2014) | Timed past papers in the run-in, each followed by a mistake-log day |
| **Interleaving + error correction** | Mixing topics and repairing errors beats blocked repetition (Rohrer & Taylor, 2007) | Subject/topic mixing, mistake → flashcard loop, weak-topic blitzes |
| **Habit + immediate feedback** | Behavioural nudges sustain adherence | Streaks, daily goals, badges, live leaderboard |

### The product gap
- **Anki** schedules well but knows nothing about the AQA spec, past papers, or exam dates,
  and its UI is hostile to a 17-year-old on a phone.
- **Quizlet** is content-first but does not schedule, plan, or track syllabus coverage.
- **Notion/Google Sheets revision trackers** show what to do but do not test you or adapt.
- **Habit apps (Forest etc.)** time study but don't know what to study.

StudyStreak is the only one that answers, in one place:
**"What exactly should I do in the next 45 minutes, and will it get me to my target grade?"**

---

## 2. Target user

**Primary persona — "Aisha, Year 13":**
- Studying AQA Biology, Chemistry, Psychology; target A*AA; medicine applicant.
- Studies 60–90 min/day on weekdays, more at weekends.
- Uses TikTok/Instagram, Quizlet, YouTube, and a paper revision timetable.
- Pain: doesn't know if she's covered the spec; abandons flashcard decks after a week;
  leaves past papers until the last month.

**Secondary:** Year 12 students building habits early; home-schooled / resitting students;
tutors who want a shared progress view (not yet built).

**Job to be done:** "Tell me what to study today, make it fast to start, prove I'm making progress,
and don't let me quit."

---

## 3. Product principles

1. **Start in under 10 seconds.** Dashboard shows due cards, today's plan tasks and a focus button.
2. **Never show a blank slate.** The AQA syllabus is seeded per user at onboarding.
3. **Every number is actionable.** Coverage % links to topics; due count links to a review session.
4. **Research is visible.** Every plan phase carries a one-line citation of why it exists.
5. **Light, calm, mobile-first.** One accent colour per subject; no dashboard clutter.
6. **Privacy by default.** Every record is owner-scoped; leaderboards share aggregates only.

---

## 4. Feature inventory (complete)

### 4.1 Authentication & onboarding
- Email/password sign-up with email OTP verification, sign-in, forgot/reset password.
- Google OAuth sign-in.
- Protected routes; unauthenticated users redirect to `/login`.
- **5-step onboarding** (only once, `Profile.onboarded` gates the app):
  1. **Subjects + display name** — pick from Biology, Chemistry, Physics, Business,
     Psychology, Economics. Name validated `2–20` chars, letters/numbers/spaces.
  2. **Grades** — target grade and (optional) current grade per subject (A*–E).
  3. **Exam dates** — one date per selected subject.
  4. **Study commitment** — minutes/day (15–240, step 15) and days/week (1–7).
  5. **Goal** — free text ("Get into Medicine at UCL — need A*A*A").
- On finish: creates/updates `Profile` **and bulk-creates a private copy of the AQA topics**
  for each selected subject (89 topics total across six subjects).

### 4.2 Dashboard (`/`)
- Welcome + personal goal quote + large streak badge.
- **Exam countdown cards** per subject (Biology/Chemistry by default; driven by `Profile.exam_date_*`).
- **Today's study plan** — today's tasks from every active plan, tickable inline.
- **Today's focus grid** — due cards, start focus session, content coverage, planned papers,
  assignments due.
- **Content coverage bars** per subject (average topic mastery).
- **Upcoming assignments** with day countdown.

### 4.3 Flashcards (`/flashcards`)
- Decks grouped by **Year 1 (AS)**, **Year 2 (A2)**, **Unsorted**.
- Each deck: Learn, Review due, Manage (add/delete individual cards), Delete deck (cascade deletes cards).
- **New deck modal**: name, subject, year, module, and optional starter cards (parsed live).
- **Review mode (SM-2)**: flip card, rate Again / Hard / Good / Easy; "Again" re-queues the card;
  session result screen; logs cards reviewed to today's `StudyLog`.
- **Learn mode**: adaptive rounds —
  - Multiple choice (4 options) for new material,
  - True/False,
  - Typed written recall as mastery increases.
  - Each card needs **2 correct answers** to be mastered; misses recycle.
  - Round summary + restart.
- **Quizlet import**: paste `term - definition` lines (tab/comma/` - ` separators); auto-detects.
- **Anki import**: paste tab-separated export; supports deck-name column → subtopic decks;
  HTML stripped; if no topic column, an **AI option** groups cards into 3–8 subtopic decks.
- **Flashcard stats panel**: due today, new, learning, mastered, 7-day review activity.
- "Mastered" = `reps >= 5`.

### 4.4 Content coverage (`/topics`)
- The user's private copy of the AQA spec (89 topics), grouped by subject and module
  (AS · Year 1 / A2 · Year 2, plus chemistry's Physical/Inorganic/Organic/Analysis split).
- Filters: subject chips, year (All / Year 1 / Year 2).
- Traffic-light mastery: **red ≤30%** needs learning, **amber 31–70%** practice,
  **green >70%** confident.
- Tap the circle to cycle status (Not started → In progress → Mastered);
  or set mastery precisely with the slider (0–100).
- Summary bar: topic counts by RAG state and average mastery.

### 4.5 Past papers (`/past-papers`)
- Log a paper: title, subject, paper code, score, max score, date completed, planned date, notes.
- Auto-converts percentage to an A-Level grade (`A* ≥90, A ≥80, B ≥70, C ≥60, D ≥50, E ≥40, U`).
- **Planned** section with days remaining.
- **Completed** list with score, %, grade, notes, delete.
- **Stats panel**: average %, best %, trend chart, grade distribution, papers by subject.

### 4.6 Study Plan (`/study-plans`) — the differentiator
- Create a plan per test: name, subject, test date, intensity (Light / Standard / Intense).
- Generates a **phased, day-by-day schedule** from today to the test:
  - **≤3 days out:** Final revision only (retrieval blitzes).
  - **4–7 days:** Consolidate → Past papers → Final revision.
  - **8–30 days:** Learn (35%) → Consolidate (30%) → Past papers (25%) → Final (10%).
  - **31–90 days:** Learn 30% → Consolidate 30% → Past papers 25% → Final 15%.
  - **90+ days:** Learn 28% → Consolidate 22% → Past papers 32% → Final 18%,
    with **weekly "Foundation" tasks** for everything before the final 90 days.
- Each task is specific: which topics to learn, **how many flashcards to review**, which numbered
  past paper to sit, which day to mark it and convert mistakes into cards.
- Sized to the user's profile: daily minutes and study days/week, scaled by intensity.
- Rest days get a single optional 10-minute flashcard skim (keeps spacing and streak alive).
- Day before the test = light review + early night; test day = "trust the prep".
- Trackable: tick tasks, overdue/today/upcoming sections, per-phase progress, overall progress.
- Deleting a plan cascades its tasks.
- **"The research behind your plan"** panel explains spacing, retrieval, papers, interleaving
  with citations.

### 4.7 Focus / Pomodoro (`/pomodoro`)
- Durations: 15 / 25 / 50 / 90 minutes (persisted to `Profile.pomodoro_length`).
- 5-minute break mode; start/pause/reset; keyboard shortcut (space) on desktop.
- **Timestamp-based countdown** — computes remaining time from `endsAt`, so background tabs
  and sleep don't drift.
- Completing a focus session creates a `StudyLog` with minutes, start/end time and
  `activity: "pomodoro"`.
- Today minutes, today's sessions list, 7-day bar chart, month total, goal progress.

### 4.8 Assignments (`/assignments`)
- Manual homework/coursework: title, subject, due date, description.
- Tick complete, delete, overdue highlighting.
- **Google Classroom sync** (per-user OAuth): lists active courses and published coursework,
  guesses the subject from the course name, previews what will be imported, then commits.
  Deduplicated by `courseId:courseWorkId` so re-sync never duplicates.

### 4.9 Badges / Achievements (`/achievements`)
- **10 badges**, evaluated from real activity:
  First Steps (1 session), On Fire (7-day streak), Unstoppable (30-day streak),
  Week Warrior (300 min/week), Elite Studier (600 min/week), Scholar (50 mastered cards),
  Card Master (100 mastered), Perfect Week (goal 7/7 days), Perfect Month (goal 30/30),
  Test Taker (score 100+ on a paper).
- Unlocks persist as `Achievement` records; new unlocks show a toast.

### 4.10 Leaderboard (`/leaderboard`)
- Two views: **Friends** and **Global**.
- **Opt-in with a 6-character join code** (alphabet excludes I/O/0/1 to avoid confusion).
- Add friends by code; remove friends.
- Period tabs: Today / Week / Month / All-time, ranked by study minutes.
- Personal header: total minutes, current streak, longest streak, rank.
- **Global board** merges real opted-in students with **20 simulated students** whose stats are
  deterministic per name+day and tick up live during the day — so the board always feels alive
  and competitive. Only aggregates ever leave the server.
- Per-subject progress cards (mastered / learning / fresh cards).

### 4.11 Search (`/search`)
- Searches the user's flashcards and syllabus topics client-side.
- Subject filter + type toggles (flashcards / content).
- Highlights matches, deep-links to the deck or topic.
- Last 5 searches stored in `localStorage`.

### 4.12 Profile (`/profile`)
- Avatar upload, display name, subjects, goal, grades, exam dates, study commitment.
- Streak badge.
- **Download offline version** — a standalone single-file HTML app
  (`public/studystreak.html`, ~600 lines) that runs from `localStorage` with streaks,
  flashcards, content and past papers.
- Sign out.
- **Delete account** — backend wipes every owned record, then the user record.

### 4.13 Legal pages
- `/privacy` and `/terms` — public, no auth, plain-English policies covering data storage,
  third-party auth, Google Classroom access, leaderboard sharing and account deletion
  (required for Google OAuth verification).

---

## 5. User journeys

### First-run
`/register` → OTP email → verify → `/onboarding` (5 steps) → syllabus seeded →
`/` dashboard with 0 due cards, 0% coverage, countdowns, and a "create your first deck" nudge.

### Daily loop (the core habit)
1. Open dashboard → streak + countdown + today's plan tasks + due card count.
2. Start Focus (25 min) → StudyLog written on completion.
3. Review 30 due cards → SM-2 reschedules them; cards reviewed logged.
4. Tick today's plan task(s) → plan progress advances.
5. Streak increments → badge may unlock.

### Exam run-in
Create plan for "Biology Paper 1" 30 days out → daily tasks switch from learning to
self-testing to timed papers with marking days → final week is retrieval-only.

### Importing existing decks
Quizlet: copy from a set → paste → preview count → import into a new deck.
Anki: export "Notes in plain text" with deck names → paste → subtopic decks created
automatically (or AI-sorted if no topic column).

---

## 6. Architecture

```
React 18 + Vite (SPA)
├── React Router v6         routes + protected layout
├── Tailwind CSS + shadcn   design system (light/dark, neutral palette)
├── Base44 backend-as-a-service
│   ├── Auth                email/password + OTP, Google OAuth
│   ├── Entities            JSON-schema collections with row-level security
│   ├── Functions           Deno/TS serverless endpoints (secrets, service role)
│   ├── Connectors          Google Classroom (per-user OAuth)
│   └── Integrations        LLM (card grouping), file upload (avatars)
└── localStorage            recent searches; standalone offline app
```

Key architectural decisions:
- **No custom server.** All persistence through entity SDK; all privileged logic in 6 functions.
- **Owner-scoped RLS everywhere** (`created_by_id = {{user.id}}` on read/update/delete).
- **Aggregates, not raw data, cross users.** Leaderboard functions return totals only.
- **Client-side scheduling.** SM-2 and plan generation run in the browser; writes are tiny
  per-card/per-task updates.
- **Deterministic simulation.** The global leaderboard's bot students are a pure function of
  (name, day) — consistent, no database writes, live-scaling today's minutes.

---

## 7. Data model (all entities)

Every entity also has platform fields: `id`, `created_by_id`, `created_by`, `created_date`,
`updated_date`. All user entities use RLS:

```json
"rls": {
  "read":   { "created_by_id": "{{user.id}}" },
  "update": { "created_by_id": "{{user.id}}" },
  "delete": { "created_by_id": "{{user.id}}" }
}
```

### `Profile`
| Field | Type | Default | Notes |
|---|---|---|---|
| display_name | string | "" | 2–20 chars, shown on leaderboard |
| selected_subjects | string[] enum(biology, chemistry, physics, business, psychology, economics) | ["biology","chemistry"] | |
| target_grade_bio / chem / physics / business / psychology / economics | string | "A*" | A*–E |
| current_grade_bio / … | string | "" | optional self-report |
| exam_date_bio / chem / physics / business / psychology / economics | date | — | drives countdowns |
| daily_minutes | number | 60 | 15–240 |
| study_days_per_week | number | 5 | 1–7 |
| pomodoro_length | number | 25 | last chosen focus length |
| goal | string | "" | motivation quote |
| profile_pic | string | "" | uploaded URL |
| onboarded | boolean | false | gates the app |

### `Topic`
| Field | Type | Default |
|---|---|---|
| subject | enum(6 subjects) | — required |
| name | string | — required |
| module | string | "" (e.g. "AS · Year 1") |
| status | enum(not_started, in_progress, mastered) | not_started |
| mastery_level | number 0–100 | 0 |

### `Deck`
| Field | Type | Default |
|---|---|---|
| name | string | — required |
| subject | enum(6) | — required |
| module | string | "" |
| year | number enum(1,2) | — |
| color | string | "#10b981" |

### `Flashcard`
| Field | Type | Default |
|---|---|---|
| deck_id | string | — required |
| front | string | — required |
| back | string | — required |
| ease | number | 2.5 |
| interval | number (days) | 0 |
| reps | number | 0 |
| lapses | number | 0 |
| due_date | date | — |
| last_reviewed | string | "" |

### `PastPaper`
`subject` (enum, required), `title` (required), `paper_code`, `date_completed` (date),
`score` (number), `max_score` (number, default 100), `grade` (string),
`notes` (string), `planned_date` (date).

### `Assignment`
`title` (required), `subject`, `due_date` (date), `completed` (bool, default false),
`source` (enum manual | google_classroom, default manual), `source_id` (string, dedupe key),
`description`.

### `StudyLog`
`date` (date, required), `cards_reviewed` (number, default 0),
`minutes_studied` (number, default 0), `subject` (string),
`activity` (string, default "flashcards"; "pomodoro" for focus sessions),
`session_start`, `session_end` (strings, "HH:MM").

### `Achievement`
`badge_id` (string, required), `unlocked_date` (date).

### `Friend`
`join_code` (string, required), `display_name` (string).

### `LeaderboardEntry`
`join_code` (string, required), `display_name` (string).

### `StudyPlan`
`name` (required), `subject` (enum, required), `exam_date` (date, required),
`intensity` (enum light | standard | intense, default standard).

### `StudyPlanTask`
`plan_id` (string, required), `date` (date, required), `phase`
(enum foundation | learn | consolidate | papers | final),
`title` (required), `type` (enum learn | flashcards | review | past_paper | rest),
`target` (number, default 0), `completed` (bool, default false).

### `User`
Built-in. Only `role` is customised (admin/user). Never created manually — invites only.

---

## 8. Core algorithms (with the actual code)

### 8.1 SM-2 spaced repetition — `src/lib/studyUtils.js`

Grades: `0 = Again`, `1 = Hard`, `2 = Good`, `3 = Easy`.

```js
export function reviewCard(card, grade) {
  let ease = card.ease || 2.5;
  let interval = card.interval || 0;
  let reps = card.reps || 0;
  let lapses = card.lapses || 0;

  if (grade === 0) {
    reps = 0;
    lapses += 1;
    interval = 1;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reps += 1;
    if (reps === 1) {
      interval = grade === 3 ? 3 : 1;
    } else if (reps === 2) {
      interval = grade === 3 ? 6 : grade === 1 ? 2 : 3;
    } else {
      if (grade === 1) interval = Math.max(1, Math.round(interval * 1.2));
      else if (grade === 2) interval = Math.round(interval * ease);
      else interval = Math.round(interval * ease * 1.3);
      ease = grade === 1 ? Math.max(1.3, ease - 0.15)
           : Math.min(3.0, ease + (grade === 3 ? 0.15 : 0));
    }
  }

  const due = new Date();
  due.setDate(due.getDate() + interval);
  return {
    ease: Math.round(ease * 100) / 100,
    interval,
    reps,
    lapses,
    due_date: due.toISOString().slice(0, 10),
    last_reviewed: new Date().toISOString().slice(0, 10),
  };
}
```

Review queue rule: cards with no `due_date` or `due_date <= today` are due.
"Again" re-queues the card at the end of the current session.

### 8.2 Streak calculation

```js
export function computeStreak(dates) {
  const set = new Set(dates);
  let streak = 0;
  const d = new Date();
  // If not studied today, allow the streak to still count from yesterday
  if (!set.has(d.toISOString().slice(0, 10))) {
    d.setDate(d.getDate() - 1);
    if (!set.has(d.toISOString().slice(0, 10))) return 0;
  }
  while (set.has(d.toISOString().slice(0, 10))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
```

Longest streak: sort unique dates, walk forward counting consecutive-day runs
(diff in ms / 86 400 000 === 1).

### 8.3 Grade conversion

```js
export function gradeFromPercent(pct) {
  if (pct >= 90) return "A*";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  if (pct >= 40) return "E";
  return "U";
}
```

### 8.4 Learn mode question builder — `src/lib/learnUtils.js`

- Shuffle cards; each needs **2 correct** answers to be mastered.
- Question type for a card with `correctCount === 0`:
  - 60% multiple choice if ≥3 other cards exist (3 distractors + correct),
  - else 50% true/false if ≥1 other card exists,
  - otherwise written recall.
- After the first correct answer, questions escalate to typed recall.
- Wrong answers reset that card's count to 0 and re-append it to the queue.
- Written answers are compared with normalisation: lowercase, trim, strip
  `.,;:!?'"()`, collapse whitespace.

### 8.5 Study plan generator — `src/lib/planBuilder.js`

**Inputs:** exam date, intensity, daily minutes, study days/week, topic names.

**Targets:**
```js
cardsPerSession = clamp(round((dailyMinutes / 1.5) * intensityMultiplier), 15, 150)
// light 0.70 · standard 1.00 · intense 1.40
```

**Phase proportions by days remaining:**

| Days to test | Phases |
|---|---|
| ≤ 3 | final 100% |
| 4–7 | consolidate 35% → papers 40% → final 25% |
| 8–30 | learn 35% → consolidate 30% → papers 25% → final 10% |
| 31–90 | learn 30% → consolidate 30% → papers 25% → final 15% |
| 90+ | learn 28% → consolidate 22% → papers 32% → final 18% |

**Long horizons:** everything before the final 90 days becomes one **Foundation** task per week,
cycling 3 syllabus topics and a weekly card target. The final 90 days get the daily schedule.

**Daily task templates:**
- **Rest day** (Sat/Sun/Fri depending on days/week): one optional 10-min due-card skim.
- **Learn:** "Learn: {Topic A} & {Topic B}" + "Write flashcards for {A} (aim N/2 cards)".
- **Consolidate:** "Review N flashcards (spaced repetition)" + "Closed-book self-test: {Topic}".
- **Papers:** alternate days — "Past paper N — full paper under exam conditions, timed", then
  "Mark paper N — log every mistake" + "Turn mistakes into flashcards + review N due cards".
- **Final:** "Flashcard blitz — N weakest/due cards" + "Blitz weakest topic: {Topic}".
- **Day before:** light skim + early night. **Exam day:** "trust the prep".

Day numbering is generated by walking forward from today; rest days are chosen from
`[Saturday, Sunday, Friday]` sliced to `7 - studyDaysPerWeek`.

### 8.6 Global leaderboard simulation — `getGlobalLeaderboard`

20 fixed first-name + initial bot students. Each day's minutes are a **pure function** of
`(name, date)` via FNV-1a hash → mulberry32 PRNG, so the same student always behaves
consistently:

```js
function dayMinutes(name, day, liveDay) {
  const rnd = mulberry32(hashStr(name + day));
  const studied = rnd() > 0.25;          // ~75% of days
  if (!studied) return 0;
  const goal = 25 + Math.floor(rnd() * 120);
  let mins = Math.round(goal * (0.55 + rnd() * 0.9));
  if (liveDay) {
    // scale today's total by elapsed portion of 07:00–23:00 UTC
    const elapsed = now.getUTCHours() * 60 + now.getUTCMinutes() - 420;
    mins = Math.round(mins * Math.max(0.08, Math.min(1, elapsed / 960)));
  }
  return Math.max(0, Math.round(mins / 5) * 5);
}
```

- `weekMinutes` = last 7 days; `monthMinutes` = last 30; `totalMinutes = month * 3 + base`
  where `base = 400 + hash(name) % 4000`.
- `streak`: walk backwards from today (or yesterday if not studied today) up to 365 days.
- Real opted-in users are aggregated server-side from their `StudyLog`s; the caller's own row
  is computed client-side from their private data.
- The client refreshes on a timer so today's numbers grow during a demo.

### 8.7 Friend stats privacy — `getFriendStats`

- Input: up to 25 join codes matching `/^[A-Z0-9]{6}$/`.
- Server looks up `LeaderboardEntry` records, reads each owner's `StudyLog`s **with the service
  role**, and returns only `{ join_code, display_name, todayMinutes, weekMinutes, monthMinutes,
  totalMinutes, sessions, streak }`.
- Raw logs, subjects and card data never cross the boundary.

### 8.8 Badge evaluation — `src/lib/achievements.js`

```js
computeStats({ logs, cards, papers, goal }) → {
  sessions,            // StudyLogs with activity === "pomodoro"
  streak,              // computeStreak(log dates)
  weekMinutes,         // sum of last 7 days
  mastered,            // flashcards with reps >= 5
  goalDays7,           // days hitting daily goal in last 7
  goalDays30,          // days hitting daily goal in last 30
  bigPapers            // papers with score >= 100
}
```
Each badge has `{ stat, target }`; unlocked when `stats[stat] >= target`.
Newly unlocked badges are bulk-created and toasted once.

### 8.9 Import parsing — `src/lib/importUtils.js`

- **Quizlet:** each line split on tab, ` - `, `–`, `—` or a comma; first part = front,
  rest = back; skips blanks and header rows.
- **Anki:** tab-separated; column 1 may be a deck/topic path
  (`AQA Biology::Cells::Organelles`); HTML tags stripped (`<br>`, `<div>`, `<img>` → text);
  deck path's last segment becomes the subtopic deck name.
- **AI grouping:** up to 200 cards, 300 chars per side, subject-aware prompt, returns
  `{ groups: [{ name, card_numbers[] }] }`, 3–8 groups, card numbers converted to indices.

---

## 9. Backend functions

| Function | Auth | Purpose | Returns |
|---|---|---|---|
| `optInLeaderboard` | user | Create/refresh own leaderboard entry with a unique 6-char code | `{ join_code, display_name }` |
| `getFriendStats` | user | Aggregate stats for up to 25 join codes | `{ stats: [...] }` |
| `getGlobalLeaderboard` | user | Real opted-in students (max 50) + 20 simulated students | `{ rows, updatedAt }` |
| `groupCardsIntoDecks` | user | LLM-group pasted cards into 3–8 subtopic decks | `{ groups }` |
| `syncGoogleClassroom` | user + connector | Preview/import Classroom coursework | `{ connected, courses, found, imported }` |
| `deleteAccount` | user | Delete all owned records, then the user | `{ success }` |

Shared helpers live in `base44/shared/leaderboardStats.ts`
(`sumMinutes`, `computeStreak`, `buildStats`, `DAY_MS`, `dateStr`) and are imported by both
leaderboard functions — never duplicated.

Notes:
- All functions verify `base44.auth.me()` and return 401 otherwise.
- Service role is used only where cross-user reads are required (leaderboards, deletion).
- The Classroom function stores the connector id and uses the **current app user's** access token,
  so each student syncs their own account.

---

## 10. Routes & component map

```jsx
/login                 Login                 public
/register              Register              public (register → OTP → verify)
/forgot-password       ForgotPassword        public
/reset-password        ResetPassword         public (?token=)
/privacy               Privacy               public
/terms                 Terms                 public
/oauth-consent         OAuthConsent          consent screen
/onboarding            Onboarding            authenticated, no layout
/                      Dashboard             authenticated + <Layout/>
/study-plans           StudyPlans            authenticated + <Layout/>
/flashcards            Flashcards            authenticated + <Layout/>
/pomodoro              Pomodoro              authenticated + <Layout/>
/achievements          Achievements          authenticated + <Layout/>
/leaderboard           Leaderboard           authenticated + <Layout/>
/search                Search                authenticated + <Layout/>
/topics                Topics                authenticated + <Layout/>
/past-papers           PastPapers            authenticated + <Layout/>
/assignments           Assignments           authenticated + <Layout/>
/profile               Profile               authenticated + <Layout/>
*                      PageNotFound          sets a prerender 404 meta
```

`Layout` = sticky top bar (logo, search, dark-mode toggle, streak, avatar) +
desktop sidebar (`md:` ≥768px, width 14rem) + mobile bottom nav + `<Outlet context={{ profile }}>`
and the onboarding redirect gate.

Key components:

```
components/
├── Layout.jsx                    shell, nav, profile load, onboarding gate
├── ProtectedRoute.jsx            auth guard
├── AuthLayout.jsx                auth page frame
├── StreakBadge.jsx               flame pill
├── FlashcardReview.jsx           SM-2 session UI
├── QuizletImport.jsx · AnkiImport.jsx
├── flashcards/
│   ├── LearnMode.jsx             adaptive rounds
│   ├── MultipleChoiceQuestion.jsx · TrueFalseQuestion.jsx · WrittenQuestion.jsx
│   ├── LearnFeedback.jsx · LearnSummary.jsx · FlashcardStats.jsx
├── plans/
│   ├── NewPlanModal.jsx · PlanCard.jsx · PlanDetail.jsx
│   ├── TaskRow.jsx · ResearchNotes.jsx · TodayPlanTasks.jsx
├── leaderboard/
│   ├── MyCodeCard.jsx · FriendsPanel.jsx · RankList.jsx · GlobalBoard.jsx · SubjectProgress.jsx
├── pastpapers/PaperStats.jsx
├── pomodoro/PomodoroTimer.jsx · TimerDisplay.jsx · TimerControls.jsx · WeekChart.jsx · GoalProgress.jsx
├── achievements/BadgeCard.jsx · UnlockToast.jsx
├── assignments/ClassroomSync.jsx
├── onboarding/SubjectStep.jsx
└── search/HighlightedText.jsx
```

Libraries: `studyUtils.js` (SM-2, streaks, grades, subject palette), `syllabus.js` (89 topics),
`learnUtils.js` (question generation), `planBuilder.js` (plan generation),
`achievements.js` (badges), `importUtils.js` (Quizlet/Anki parsing), `alerts.js`, `theme.js`,
`AuthContext.jsx`, `query-client.js`.

---

## 11. Design system

**Palette**
- Background `#ffffff` (light) / `hsl(0 0% 3.9%)` (dark).
- Primary: neutral-900 `#171717` — all buttons, active nav, emphasis.
- Borders: neutral-200 `#e5e5e5`; muted text neutral-500 `#737373`.
- Card radius: `rounded-2xl` (16px); inputs `rounded-xl`; pills `rounded-full`.
- Shadow: near-none; separation via 1px border.

**Subject colours**
| Subject | Colour | Tint |
|---|---|---|
| Biology 🧬 | `#10b981` | `#ecfdf5` |
| Chemistry 🧪 | `#6366f1` | `#eef2ff` |
| Physics ⚛️ | `#0ea5e9` | `#f0f9ff` |
| Business 💼 | `#f59e0b` | `#fffbeb` |
| Psychology 🧠 | `#ec4899` | `#fdf2f8` |
| Economics 📊 | `#14b8a6` | `#f0fdfa` |

**Typography** — system sans (`ui-sans-serif`), headings 600 weight:
`text-2xl` page titles, `text-lg` section titles, `text-sm` body, `text-xs` meta.
No display fonts; the product should feel like a tool, not a landing page.

**Layout** — `max-w-5xl` content, 1rem gutters, 8-point spacing scale,
2-column card grids on ≥640px that collapse to 1 on phones.

**Motion** — only functional transitions: progress-bar widths, hover border darkening,
toast entry. No decorative animation.

**Dark mode** — token swap in `index.css` plus explicit overrides mapping the light
neutral/slate utilities used across pages onto dark tokens.

---

## 12. Content assets

- **89 AQA topics** across Biology (8), Chemistry (~25), Physics (8), Business (10),
  Psychology (~13), Economics (8), each with a module label (`AS · Year 1`, `A2 · Year 2`,
  `Physical · Year 1`, etc.).
- **10 badges** with id, emoji, name, description, stat and target.
- **4 research notes** shown on the Study Plan page (spacing, retrieval, past papers,
  interleaving) with author-year citations.
- **20 simulated student names** for the global leaderboard.
- **Offline app** (`public/studystreak.html`) with seeded Biology starter cards.

---

## 13. Analytics / KPIs to instrument

| Event | Why |
|---|---|
| `user_in_app` (session) | Weekly active users |
| `study_session_logged` | Real study depth (Pomodoro completion / card session) |
| `flashcard_reviewed` | Spacing loop retention |
| `plan_created` / `plan_task_completed` | Plan adoption and adherence |
| `deck_imported` (source: quizlet/anki) | Migration friction |
| `leaderboard_opted_in` | Virality loop |

North-star: **weekly study minutes per active user**. Healthy leading indicators: day-7
retention, cards due cleared daily, plan adherence (% tasks completed on the day).

---

## 14. Rebuild guide (Base44 — fastest path, ~4–6 hours)

1. **Entities** (13): create the schemas from §7 exactly. Add the owner RLS block to every one.
2. **Auth**: keep the platform Login/Register/Forgot/Reset pages; register all four routes.
3. **Libraries first** (pure functions, easy to test):
   `studyUtils.js` → `syllabus.js` → `learnUtils.js` → `importUtils.js` → `planBuilder.js`
   → `achievements.js`.
4. **Shell**: `Layout` (nav + onboarding gate), `ProtectedRoute`, routes in `App.jsx`.
5. **Onboarding** + profile seeding (writes Profile then bulk-creates topics).
6. **Flashcards**: deck list → review (SM-2) → learn mode → imports.
7. **Topics / Past papers / Assignments / Pomodoro** — each is a straightforward CRUD page
   plus one derived-stats panel.
8. **Study Plan**: generator → modal → card → detail → dashboard widget.
9. **Leaderboard**: opt-in function → friend function → global function with simulation.
10. **Badges**, **Search**, **Profile**, **Privacy/Terms**.
11. Instrument analytics events (§13).

### If rebuilding outside Base44
- **Next.js/React + Supabase**: mirror entities as Postgres tables with
  `user_id uuid default auth.uid()` and RLS policies `auth.uid() = user_id`.
  Move the 6 functions to route handlers / edge functions.
- **Firebase**: Firestore subcollections under `users/{uid}/…`; leaderboards via callable
  Cloud Functions (aggregate server-side, never expose other users' logs).
- Any LLM API replaces `groupCardsIntoDecks`; any OAuth setup replaces the Classroom connector.
- The offline HTML app is a useful fallback / demo-kiosk artifact.

---

## 15. Hackathon demo script (5 minutes)

1. **0:00 — The problem (20s).** "Three A-Level subjects, two years of content, and no idea
   if you're on track. Anki schedules cards but doesn't know your spec or your exam date."
2. **0:20 — Onboarding (40s).** Pick Biology + Chemistry, set A* targets, exam dates,
   60 min/day. Show the 89 topics appear instantly.
3. **1:00 — Dashboard (30s).** Streak, two countdowns, due cards, today's plan. One screen
   answers "what do I do now?"
4. **1:30 — The magic: Study Plan (90s).** Create "Biology Paper 1" 30 days out.
   Show the phase strip: Learn → Consolidate → Papers → Final. Open a day: 2 topics,
   40 flashcards, closed-book self-test. Show a past-paper day and the marking day.
   Point at the citation under each phase.
5. **3:00 — Daily loop (60s).** Review 3 cards — rate Again/Good/Easy, watch intervals change.
   Tick today's plan task; progress bar moves.
6. **4:00 — Social + polish (45s).** Opt into the leaderboard, add a friend by code,
   show the global board ticking live, flip on dark mode.
7. **4:45 — Close (15s).** "Every feature is built on published learning science. It's live,
   mobile-first, and the data is private per student."

**Judge questions to prepare:**
- *Is the leaderboard fake?* — Real opted-in students are aggregated server-side; simulated
  students keep the board alive for new users. Only totals ever leave the server.
- *Why not just use Anki?* — Anki has no syllabus, exam dates, past papers or plans.
- *How do you stop cheating?* — Study minutes come from actual completed focus sessions and
  card reviews; there's no manual "I studied 5 hours" input.
- *What's the business model?* — Free core; paid tier for AI plan regeneration, tutor
  dashboards and predicted-grade modelling.
- *Privacy?* — Owner-scoped row-level security; leaderboards expose aggregates only;
  one-tap account deletion wipes everything.

---

## 16. What's real vs simulated (be honest with judges)

**Real:** auth, onboarding, syllabus seeding, SM-2 scheduling, learn mode, imports,
past-paper tracking, plan generation, streaks, badges, Classroom sync, account deletion.

**Simulated:** 20 global leaderboard students (clearly a "keep the board alive" device);
no real multi-user friend graph beyond join codes.

**Known gaps / next steps:**
1. `deleteAccount` doesn't yet delete `StudyPlan` / `StudyPlanTask` — add those two calls.
2. Plan tasks are generated once; regenerating after a missed week isn't built.
3. Written-recall marking is exact-match normalised, not semantic.
4. Leaderboard totals recompute per request (fine at classroom scale, needs caching at scale).
5. No tutor/parent view, no predicted-grade model yet, no push notifications.

---

## 17. File map

```
base44/
├── entities/          13 JSON schemas (§7)
├── functions/         optInLeaderboard, getFriendStats, getGlobalLeaderboard,
│                      groupCardsIntoDecks, syncGoogleClassroom, deleteAccount
└── shared/            leaderboardStats.ts

src/
├── App.jsx            routes, providers, auth gate
├── pages/             Login, Register, ForgotPassword, ResetPassword, Onboarding,
│                      Dashboard, Flashcards, Topics, PastPapers, Assignments,
│                      StudyPlans, Pomodoro, Achievements, Leaderboard, Search,
│                      Profile, Privacy, Terms, OAuthConsent, PageNotFound
├── components/        Layout + feature folders (see §10)
├── lib/               studyUtils, syllabus, learnUtils, planBuilder, achievements,
│                      importUtils, alerts, theme, AuthContext, query-client
├── hooks/             useTimer (timestamp-based), use-mobile, use-size
└── index.css          design tokens + dark-mode overrides

public/studystreak.html   standalone offline app (localStorage, ~600 lines)
```

---

### Appendix A — Quick copy for a landing page / submission blurb

> **StudyStreak** — the revision cockpit for A-Level.
> Your whole AQA syllabus, tracked. Flashcards scheduled by spaced repetition.
> Past papers graded against your target. A research-backed plan that counts down to every
> exam. And a streak that makes stopping feel like a bad idea.
> Built for Biology, Chemistry, Physics, Business, Psychology and Economics.

### Appendix B — Tech bullet list

React 18, Vite, React Router 6, Tailwind CSS, shadcn/ui, Recharts, lucide-react,
Base44 (auth, entities, functions, connectors), SM-2 scheduler, deterministic PRNG simulation,
Google Classroom OAuth, LLM card clustering.
