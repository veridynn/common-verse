import { expect, it } from "vitest";
import { registrationHref } from "./registration";

it("accepts existing links and adds HTTPS to bare registration domains", () => {
  expect(registrationHref("google.de", "de")).toBe("https://google.de/");
  expect(registrationHref(" google.de ", "de")).toBe("https://google.de/");
  expect(registrationHref("tickets.example.org/register?event=42", "en")).toBe(
    "https://tickets.example.org/register?event=42",
  );
  expect(registrationHref("https://example.org/register", "de")).toBe(
    "https://example.org/register",
  );
  expect(registrationHref("/contact", "ar")).toBe("/ar/contact");
});

it("keeps unsafe, malformed and missing registration targets unavailable", () => {
  for (const value of [
    null,
    "",
    "   ",
    "javascript:alert(1)",
    "data:text/html,test",
    "//evil.test",
    "\\evil.test",
    "not a link",
    "example.org@evil.test",
  ])
    expect(registrationHref(value, "de")).toBeUndefined();
});
