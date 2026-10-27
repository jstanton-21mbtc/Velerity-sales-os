"use client";

import { useState, useTransition } from "react";
import { saveQuizResult } from "@/app/(app)/academy/training/actions";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import Link from "next/link";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctIdx: number;
  explanation: string | null;
  order: number;
};

export function QuizClient({
  moduleId,
  moduleSlug,
  moduleTitle,
  questions,
}: {
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  questions: Question[];
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [finalResult, setFinalResult] = useState<{ passed: boolean; pct: number } | null>(null);

  const question = questions[currentIdx];
  const isCorrect = answered && selectedIdx === question?.correctIdx;
  const score = answers.filter(Boolean).length;

  function handleSelect(idx: number) {
    if (answered) return;
    setSelectedIdx(idx);
    setAnswered(true);
  }

  function handleNext() {
    if (!answered) return;
    const newAnswers = [...answers, selectedIdx === question.correctIdx];

    if (currentIdx < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIdx((i) => i + 1);
      setSelectedIdx(null);
      setAnswered(false);
    } else {
      // finish
      setAnswers(newAnswers);
      setFinished(true);
      startTransition(async () => {
        const result = await saveQuizResult(moduleId, newAnswers.filter(Boolean).length, questions.length);
        setFinalResult(result);
      });
    }
  }

  function handleRetry() {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setAnswered(false);
    setAnswers([]);
    setFinished(false);
    setFinalResult(null);
  }

  if (finished) {
    const finalScore = answers.filter(Boolean).length;
    const pct = finalResult?.pct ?? Math.round((finalScore / questions.length) * 100);
    const passed = finalResult?.passed ?? pct >= 70;
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
          passed ? "bg-emerald-100" : "bg-amber-100"
        }`}>
          {passed ? (
            <Trophy className="w-10 h-10 text-emerald-600" />
          ) : (
            <RotateCcw className="w-10 h-10 text-amber-600" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-1">{pct}%</h2>
        <p className="text-lg font-semibold mb-1 text-slate-700">
          {finalScore} / {questions.length} correct
        </p>
        <p className={`text-sm font-medium mb-6 ${passed ? "text-emerald-600" : "text-amber-600"}`}>
          {passed ? "Passed! Module complete." : "Not quite — 70% required to pass."}
        </p>

        {/* Per-question summary */}
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 mb-6 text-left">
          {questions.map((q, i) => (
            <div key={q.id} className="flex items-start gap-3 px-4 py-3">
              {answers[i] ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-slate-700">{q.question}</p>
                {!answers[i] && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Correct: <span className="text-emerald-700 font-medium">{q.options[q.correctIdx]}</span>
                    {q.explanation && <> · {q.explanation}</>}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 hover:border-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
          <Link
            href="/academy/training"
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            All modules
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${(currentIdx / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-400 shrink-0">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {/* Question */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-4">
        <p className="font-semibold text-slate-900 text-base leading-relaxed mb-5">
          {question.question}
        </p>

        <div className="space-y-2.5">
          {question.options.map((opt, i) => {
            let className =
              "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ";
            if (!answered) {
              className +=
                selectedIdx === i
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-slate-200 hover:border-slate-300 text-slate-700";
            } else {
              if (i === question.correctIdx) {
                className += "border-emerald-500 bg-emerald-50 text-emerald-900 font-medium";
              } else if (i === selectedIdx && i !== question.correctIdx) {
                className += "border-red-400 bg-red-50 text-red-800";
              } else {
                className += "border-slate-100 text-slate-400";
              }
            }

            return (
              <button key={i} onClick={() => handleSelect(i)} className={className}>
                <span className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 ${
                      !answered
                        ? selectedIdx === i
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-slate-300 text-slate-500"
                        : i === question.correctIdx
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : i === selectedIdx
                        ? "border-red-400 bg-red-400 text-white"
                        : "border-slate-200 text-slate-400"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {answered && (
        <div
          className={`rounded-xl p-4 mb-4 flex items-start gap-3 ${
            isCorrect
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`text-sm font-semibold ${isCorrect ? "text-emerald-900" : "text-red-800"}`}>
              {isCorrect ? "Correct!" : `Incorrect — correct answer: ${question.options[question.correctIdx]}`}
            </p>
            {question.explanation && (
              <p className={`text-sm mt-1 ${isCorrect ? "text-emerald-700" : "text-red-700"}`}>
                {question.explanation}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          disabled={!answered || isPending}
          className="flex items-center gap-1.5 px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium rounded-lg transition-colors"
        >
          {currentIdx < questions.length - 1 ? "Next question" : "Finish quiz"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
