'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
];

const OPTIONS = [
  { label: '0 - Not at all', value: 0 },
  { label: '1 - Several days', value: 1 },
  { label: '2 - More than half the days', value: 2 },
  { label: '3 - Nearly every day', value: 3 },
];

export default function AssessmentPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(Array(9).fill(0));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (qIndex: number, value: number) => {
    const next = [...answers];
    next[qIndex] = value;
    setAnswers(next);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, number> = {};
      for (let i = 0; i < answers.length; i++) {
        payload[`q${i + 1}`] = answers[i];
      }

      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      const data = await res.json();
      const score = data.totalScore;
      const severity = data.severity;

      router.push(
        `/result?score=${encodeURIComponent(
          score
        )}&severity=${encodeURIComponent(severity)}`
      );
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '2rem',
        backgroundColor: '#0f172a',
        color: '#e5e7eb',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          backgroundColor: '#020617',
          padding: '2rem',
          borderRadius: '1rem',
          boxShadow: '0 0 30px rgba(15,23,42,0.8)',
        }}
      >
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          PHQ-9 Self-Assessment
        </h1>
        <p style={{ marginBottom: '1rem', fontSize: '0.95rem', opacity: 0.8 }}>
          This is a screening tool, not a diagnosis. If you are in crisis or
          feel unsafe, please contact a professional or emergency services
          immediately.
        </p>

        <form onSubmit={handleSubmit}>
          {QUESTIONS.map((q, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid rgba(148,163,184,0.2)',
              }}
            >
              <p
                style={{
                  marginBottom: '0.5rem',
                  fontWeight: 500,
                }}
              >
                {idx + 1}. {q}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                {OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.9rem',
                      backgroundColor:
                        answers[idx] === opt.value
                          ? 'rgba(59,130,246,0.2)'
                          : 'rgba(15,23,42,0.8)',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '999px',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name={`q${idx + 1}`}
                      value={opt.value}
                      checked={answers[idx] === opt.value}
                      onChange={() => handleChange(idx, opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {error && (
            <p
              style={{
                color: '#f97373',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: submitting ? '#4b5563' : '#3b82f6',
              color: '#f9fafb',
              padding: '0.7rem 1.5rem',
              borderRadius: '999px',
              border: 'none',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </form>
      </div>
    </main>
  );
}
