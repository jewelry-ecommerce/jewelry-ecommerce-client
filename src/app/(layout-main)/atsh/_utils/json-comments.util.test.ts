import { describe, expect, it } from "vitest";
import { stripJsonComments } from "./json-comments.util";

describe("stripJsonComments", () => {
  it("removes trailing line comments", () => {
    const input = `{
      "type": "atsh-brothers" // comment
    }`;

    expect(JSON.parse(stripJsonComments(input))).toEqual({
      type: "atsh-brothers",
    });
  });

  it("preserves double slashes inside string values", () => {
    const input = `{ "url": "https://example.com/a//b" }`;

    expect(JSON.parse(stripJsonComments(input))).toEqual({ url: "https://example.com/a//b" });
  });
});
