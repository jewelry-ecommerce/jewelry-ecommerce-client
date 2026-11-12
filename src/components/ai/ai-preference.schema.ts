import { z } from "zod";
import { formatPrice } from "@/utils/constants/common.constant";
import { AI_BUDGET_DEFAULT, AI_BUDGET_MAX, AI_BUDGET_MIN, AI_OCCASIONS, AI_RECIPIENT_MAX_LENGTH } from "@/utils/api/ai/ai.constant";
import type { AiPreferenceValues } from "@/utils/api/ai/ai.interface";

export const aiPreferenceSchema = z.object({
  occasion: z.string().trim().min(1, "Vui lòng chọn dịp.").refine(
    (value) => (AI_OCCASIONS as readonly string[]).includes(value),
    "Vui lòng chọn dịp.",
  ),
  styles: z.array(z.string()),
  budget: z.number().min(AI_BUDGET_MIN, `Ngân sách tối thiểu ${formatPrice(AI_BUDGET_MIN)}.`).max(
    AI_BUDGET_MAX,
    `Ngân sách tối đa ${formatPrice(AI_BUDGET_MAX)}.`,
  ),
  recipient: z.string().trim().max(AI_RECIPIENT_MAX_LENGTH, "Người nhận tối đa 80 ký tự."),
});

export const AI_PREFERENCE_DEFAULTS: AiPreferenceValues = {
  occasion: "",
  styles: [],
  budget: AI_BUDGET_DEFAULT,
  recipient: "",
};
