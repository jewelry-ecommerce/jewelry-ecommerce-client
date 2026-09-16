import { describe, expect, it } from "vitest";

import {
  findRestrictedRouteRule,
  isPathAllowedForTenant,
  isTenantAllowedForRule,
  TENANT_RESTRICTED_ROUTE_RULES,
} from "./tenant-restricted-routes.util";

const atshRule = TENANT_RESTRICTED_ROUTE_RULES.find((rule) => rule.prefix === "/atsh");
const bstCollabRule = TENANT_RESTRICTED_ROUTE_RULES.find((rule) => rule.prefix === "/bst-collab-tinhhasayhi");
const setsRule = TENANT_RESTRICTED_ROUTE_RULES.find((rule) => rule.prefix === "/sets");

describe("tenant-restricted-routes.util", () => {
  it("finds /atsh rule for nested paths", () => {
    expect(findRestrictedRouteRule("/atsh/singer/foo")?.prefix).toBe("/atsh");
    expect(findRestrictedRouteRule("/atsh")?.prefix).toBe("/atsh");
  });

  it("finds /bst-collab-tinhhasayhi rule", () => {
    expect(findRestrictedRouteRule("/bst-collab-tinhhasayhi")?.prefix).toBe("/bst-collab-tinhhasayhi");
  });

  it("returns undefined for unrestricted paths", () => {
    expect(findRestrictedRouteRule("/san-pham")).toBeUndefined();
  });

  it("allows B1 and heartlock tenants for /atsh", () => {
    expect(atshRule).toBeDefined();
    if (!atshRule) return;

    expect(isTenantAllowedForRule("SEVA-RETAIL-B1", atshRule)).toBe(true);
    expect(isTenantAllowedForRule("b1", atshRule)).toBe(true);
    expect(isTenantAllowedForRule("heartlock", atshRule)).toBe(true);
    expect(isTenantAllowedForRule("HEARTLOCK", atshRule)).toBe(true);
    expect(isTenantAllowedForRule("SEVA-RETAIL-HEARTLOCK", atshRule)).toBe(true);
  });

  it("allows same tenants for /bst-collab-tinhhasayhi", () => {
    expect(bstCollabRule).toBeDefined();
    if (!bstCollabRule) return;

    expect(isTenantAllowedForRule("SEVA-RETAIL-B1", bstCollabRule)).toBe(true);
    expect(isTenantAllowedForRule("heartlock", bstCollabRule)).toBe(true);
    expect(isTenantAllowedForRule("SEVA-RETAIL-B2", bstCollabRule)).toBe(false);
  });

  it("only allows Heartlock tenants for /sets", () => {
    expect(setsRule).toBeDefined();
    if (!setsRule) return;

    expect(isTenantAllowedForRule("SEVA-RETAIL-B1", setsRule)).toBe(true);
    expect(isTenantAllowedForRule("heartlock", setsRule)).toBe(true);
    expect(isTenantAllowedForRule("SEVA-RETAIL-B2", setsRule)).toBe(false);
    expect(isTenantAllowedForRule("memorient", setsRule)).toBe(false);
  });

  it("blocks other tenants for /atsh", () => {
    expect(atshRule).toBeDefined();
    if (!atshRule) return;

    expect(isTenantAllowedForRule("SEVA-RETAIL-B2", atshRule)).toBe(false);
    expect(isTenantAllowedForRule(null, atshRule)).toBe(false);
    expect(isTenantAllowedForRule("", atshRule)).toBe(false);
  });

  it("blocks /atsh when tenant is missing", () => {
    expect(isPathAllowedForTenant("/atsh", null)).toBe(false);
    expect(isPathAllowedForTenant("/bst-collab-tinhhasayhi", null)).toBe(false);
  });

  it("allows unrestricted paths regardless of tenant", () => {
    expect(isPathAllowedForTenant("/san-pham", null)).toBe(true);
    expect(isPathAllowedForTenant("/san-pham", "SEVA-RETAIL-B2")).toBe(true);
  });
});
