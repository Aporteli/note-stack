export type BulkQuestion = {
  number: number;
  prompt: string;
  options: { text: string; correct: boolean }[];
};

export type BulkParse = {
  questions: BulkQuestion[];
  errors: string[];
};

const QUESTION_LINE = /^(\d+)[.)]\s*(.*)$/;
const OPTION_LINE = /^([A-D])[.)]\s*(.+)$/i;
const ANSWER_LINE = /^ANSWER:\s*([A-D])\s*$/i;
const LETTERS = ["A", "B", "C", "D"] as const;

type Draft = {
  number: number;
  prompt: string[];
  options: { letter: string; text: string }[];
};

function label(number: number) {
  return `Question ${number}`;
}

function finish(draft: Draft, answer: string | null, questions: BulkQuestion[], errors: string[]) {
  const prompt = draft.prompt.join("\n").trim();
  if (!prompt) {
    errors.push(`${label(draft.number)} is missing its text.`);
    return;
  }

  const letters = draft.options.map((option) => option.letter);
  const complete =
    letters.length === 4 && letters.every((letter, index) => letter === LETTERS[index]);
  if (!complete) {
    const found = letters.length ? letters.join(", ") : "none";
    errors.push(
      `${label(draft.number)} needs answers A, B, C, and D in that order. Found ${found}.`,
    );
    return;
  }

  if (!answer) {
    errors.push(`${label(draft.number)} is missing ANSWER.`);
    return;
  }

  const seen = new Set<string>();
  for (const option of draft.options) {
    const key = option.text.toLowerCase();
    if (seen.has(key)) {
      errors.push(`${label(draft.number)} has two answers with the same text.`);
      return;
    }
    seen.add(key);
  }

  questions.push({
    number: draft.number,
    prompt,
    options: draft.options.map((option) => ({
      text: option.text,
      correct: option.letter === answer,
    })),
  });
}

/** Numbered questions, four answers A–D, and an ANSWER line. Georgian text is kept as written. */
export function parseBulkQuiz(raw: string): BulkParse {
  const lines = raw
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n");

  const questions: BulkQuestion[] = [];
  const errors: string[] = [];
  let draft: Draft | null = null;

  function close(answer: string | null) {
    if (!draft) return;
    finish(draft, answer, questions, errors);
    draft = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const numbered = line.match(QUESTION_LINE);
    const option = line.match(OPTION_LINE);
    const looksLikeAnswer = /^ANSWER\b/i.test(line);

    if (numbered && !option) {
      close(null);
      const text = numbered[2].trim();
      draft = {
        number: Number(numbered[1]),
        prompt: text ? [text] : [],
        options: [],
      };
      continue;
    }

    if (looksLikeAnswer) {
      const answer = line.match(ANSWER_LINE);
      if (!draft) {
        errors.push(`“${line}” is not under a numbered question.`);
        continue;
      }
      if (!answer) {
        errors.push(`${label(draft.number)} must end with ANSWER: A, B, C, or D.`);
        draft = null;
        continue;
      }
      close(answer[1].toUpperCase());
      continue;
    }

    if (option) {
      if (!draft) {
        errors.push(`“${line}” is not under a numbered question.`);
        continue;
      }
      draft.options.push({
        letter: option[1].toUpperCase(),
        text: option[2].trim(),
      });
      continue;
    }

    if (!draft) {
      errors.push(`“${line}” is not a numbered question.`);
      continue;
    }

    if (draft.options.length > 0) {
      errors.push(`${label(draft.number)} has a line that is not an answer or ANSWER.`);
      draft = null;
      continue;
    }

    draft.prompt.push(line);
  }

  close(null);
  return { questions, errors };
}
