import { CopilotClient } from "./copilot-client";

export default function CopilotPage() {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <CopilotClient />
    </div>
  );
}
