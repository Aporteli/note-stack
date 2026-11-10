import { DIAGRAM_LIMITS } from "@/components/diagram/limits";

export function clipTitle(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, DIAGRAM_LIMITS.title);
}
