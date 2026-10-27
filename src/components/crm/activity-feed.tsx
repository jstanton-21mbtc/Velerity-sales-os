import { formatDate } from "@/lib/utils";
import { Phone, Mail, Calendar, FileText, CheckSquare } from "lucide-react";
import type { ActivityType } from "@prisma/client";

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Calendar,
  NOTE: FileText,
  TASK: CheckSquare,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  CALL: "bg-blue-100 text-blue-600",
  EMAIL: "bg-violet-100 text-violet-600",
  MEETING: "bg-emerald-100 text-emerald-600",
  NOTE: "bg-amber-100 text-amber-600",
  TASK: "bg-slate-100 text-slate-600",
};

type Activity = {
  id: string;
  type: ActivityType;
  subject: string;
  body: string | null;
  occurredAt: Date;
  user: { name: string | null; email: string };
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        No activities yet — log a call, email, or meeting below.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = ACTIVITY_ICONS[activity.type];
        const colorClass = ACTIVITY_COLORS[activity.type];
        return (
          <div key={activity.id} className="flex gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-medium text-slate-900 text-sm leading-tight">
                  {activity.subject}
                </p>
                <span className="text-slate-400 text-xs shrink-0">
                  {formatDate(activity.occurredAt)}
                </span>
              </div>
              {activity.body && (
                <p className="text-slate-500 text-sm mt-0.5 whitespace-pre-wrap leading-relaxed">
                  {activity.body}
                </p>
              )}
              <p className="text-slate-400 text-xs mt-1">
                {activity.user.name ?? activity.user.email} ·{" "}
                {activity.type.charAt(0) + activity.type.slice(1).toLowerCase()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
