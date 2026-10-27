import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronRight, GraduationCap, CheckCircle2 } from "lucide-react";
import { QuizClient } from "./quiz-client";

export default async function TrainingModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const session = await requireSession();
  const { moduleId } = await params;

  const module = await prisma.trainingModule.findUnique({
    where: { slug: moduleId },
    include: {
      questions: { orderBy: { order: "asc" } },
      progress: { where: { userId: session.id } },
    },
  });

  if (!module) notFound();

  const progress = module.progress[0];

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <BookOpen className="w-4 h-4" />
        <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/academy/training" className="hover:text-slate-600">Training</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium">{module.title}</span>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <h1 className="text-2xl font-bold text-slate-900">{module.title}</h1>
            </div>
            {module.description && (
              <p className="text-slate-500 text-sm">{module.description}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {module.questions.length} question{module.questions.length !== 1 ? "s" : ""} · Pass at 70%
            </p>
          </div>
          {progress?.completed && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-900">{progress.score}%</p>
                <p className="text-xs text-emerald-600">Passed</p>
              </div>
            </div>
          )}
        </div>

        {module.questions.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>No questions in this module yet.</p>
          </div>
        ) : (
          <QuizClient
            moduleId={module.id}
            moduleSlug={module.slug}
            moduleTitle={module.title}
            questions={module.questions}
          />
        )}
      </div>
    </div>
  );
}
