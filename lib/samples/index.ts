import { budgetMeetingScenario } from "@/lib/samples/budget-meeting";
import { aichiAssemblyScenario } from "@/lib/samples/aichi-assembly";
import { studentDebateScenario } from "@/lib/samples/student-debate";
import { hiroyukiDaigoDebateScenario } from "@/lib/samples/hiroyuki-daigo-debate";
import type { Scenario } from "@/lib/samples/types";

export type { Scenario } from "@/lib/samples/types";

export const SCENARIOS: Scenario[] = [
  budgetMeetingScenario,
  aichiAssemblyScenario,
  studentDebateScenario,
  hiroyukiDaigoDebateScenario,
];

export function getScenario(id: string): Scenario {
  return SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0];
}
