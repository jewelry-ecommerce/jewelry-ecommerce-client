import { describe, expect, it } from "vitest";
import { VALIDATION_MESSAGES } from "@/utils/constants/common.constant";
import { getCheckoutValidationSchema } from "./checkout.constant";

describe("getCheckoutValidationSchema email", () => {
  it("does not require email on retail / pre-order lần 2", async () => {
    const schema = getCheckoutValidationSchema(false, false, true, false);
    await expect(schema.validateAt("email", { email: "" })).resolves.toBe("");
  });

  it("requires a valid email on pre-order lần 1", async () => {
    const schema = getCheckoutValidationSchema(false, false, false, true);
    await expect(schema.validateAt("email", { email: "" })).rejects.toThrow(VALIDATION_MESSAGES.required);
    await expect(schema.validateAt("email", { email: "not-an-email" })).rejects.toThrow(VALIDATION_MESSAGES.email);
    await expect(schema.validateAt("email", { email: "khach@example.com" })).resolves.toBe("khach@example.com");
  });

  it("does not require collab partner sharing consent on pre-order lần 1", async () => {
    const schema = getCheckoutValidationSchema(false, false, false, true);
    await expect(schema.validateAt("consentCollabPartnerSharing", { consentCollabPartnerSharing: false })).resolves.toBe(false);
    await expect(schema.validateAt("consentCollabPartnerSharing", { consentCollabPartnerSharing: true })).resolves.toBe(true);
  });
});
