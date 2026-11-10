import { SIDES, type Side } from "@/components/diagram/types";

export function isSide(value: string | null | undefined): value is Side {
  return SIDES.some((side) => side === value);
}
