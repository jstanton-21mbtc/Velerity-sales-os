import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, ChevronRight, GraduationCap, CheckCircle2, Trophy } from "lucide-react";

export default async function TrainingPage() {
  const session = await requireSession();

  const modules = await prisma.trainingModule.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: { select: { questions: true } },
      progress: {
        where: { userId: session.id },
      },
    },
  });

  const completedCount = modules.filter((m) => m.progress[0]?.completed).length;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
        <BookOpen className="w-4 h-4" />
        <Link href="/academy" className="hover:text-slate-600">Server Academy</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>Rep Training</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-slate-900">Rep Training</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Complete quizzes to build hardware fluency and earn your Velerity certification.
            Pass threshold is 70%.
          </p>
        </div>
        {completedCount > 0 && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
            <Trophy className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-sm font-bold text-indigo-900">{completedCount}/{modules.length}</p>
              <p className="text-xs text-indigo-600">completed</p>
            </div>
          </div>
        )}
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No training modules yet. Run <code className="font-mono text-xs">npx tsx prisma/seed.ts</code></p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module) => {
            const progress = module.progress[0];
            const completed = progress?.completed ?? false;
            const score = progress?.score ?? null;
            return (
              <Link
                key={module.id}
                href={`/academy/training/${module.slug}`}
                className={`block bg-white border rounded-xl p-5 hover:shadow-sm transition-all group ${
                  completed ? "border-emerald-200" : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-slate-300 rounded-full shrink-0" />
                      )}
                      <h3 className={`font-semibold group-hover:text-blue-600 transition-colors ${
                        completed ? "text-emerald-900" : "text-slate-900"
                      }`}>
                        {module.title}
                      </h3>
                    </div>
                    {module.description && (
                      <p className="text-slate-500 text-sm ml-7">{module.description}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2 ml-7">
                      {module._count.questions} question{module._count.questions !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="ml-4 text-right shrink-0">
                    {score !== null ? (
                      <div>
                        <p className={`text-xl font-bold ${completed ? "text-emerald-600" : "text-amber-600"}`}>
                          {score}%
                        </p>
                        <p className={`text-xs ${completed ? "text-emerald-500" : "text-amber-500"}`}>
                          {completed ? "Passed" : "Retry"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        Not started
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {score !== null && (
                  <div className="mt-3 ml-7">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${completed ? "bg-emerald-500" : "bg-amber-400"}`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {modules.length > 0 && completedCount === modules.length && (
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
          <Trophy className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
          <h3 className="font-bold text-indigo-900 text-lg mb-1">All modules complete!</h3>
          <p className="text-indigo-700 text-sm">
            You've completed the Velerity Server Academy certification track.
          </p>
        </div>
      )}
    </div>
  );
}
