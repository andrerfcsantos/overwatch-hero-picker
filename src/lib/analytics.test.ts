import { describe, expect, test } from "vite-plus/test";
import type { CaptureResult } from "posthog-js/dist/module.slim";

import {
  createSampler,
  isStacklessThirdPartyException,
  redactUrl,
  scrubSecrets,
} from "./analytics";

function exceptionEvent(list: unknown): CaptureResult {
  return {
    uuid: "test",
    event: "$exception",
    properties: { $exception_list: list },
  } as CaptureResult;
}

describe("isStacklessThirdPartyException", () => {
  test("drops a synthetic exception with no stack frames", () => {
    const event = exceptionEvent([
      {
        type: "NetworkError",
        value: "Failed to execute 'importScripts' on 'WorkerGlobalScope'",
        mechanism: { synthetic: true, handled: false },
      },
    ]);
    expect(isStacklessThirdPartyException(event)).toBe(true);
  });

  test("drops a synthetic exception whose stacktrace has an empty frame list", () => {
    const event = exceptionEvent([
      { mechanism: { synthetic: true }, stacktrace: { frames: [] } },
    ]);
    expect(isStacklessThirdPartyException(event)).toBe(true);
  });

  test("keeps a synthetic exception that still carries frames", () => {
    const event = exceptionEvent([
      {
        mechanism: { synthetic: true },
        stacktrace: { frames: [{ filename: "app.js", lineno: 1 }] },
      },
    ]);
    expect(isStacklessThirdPartyException(event)).toBe(false);
  });

  test("keeps a real error with frames", () => {
    const event = exceptionEvent([
      {
        mechanism: { synthetic: false },
        stacktrace: { frames: [{ filename: "app.js", lineno: 1 }] },
      },
    ]);
    expect(isStacklessThirdPartyException(event)).toBe(false);
  });

  test("keeps the event when any exception in the list is symbolicated", () => {
    const event = exceptionEvent([
      { mechanism: { synthetic: true } },
      { stacktrace: { frames: [{ filename: "app.js", lineno: 1 }] } },
    ]);
    expect(isStacklessThirdPartyException(event)).toBe(false);
  });

  test("ignores non-exception events", () => {
    const event = {
      uuid: "test",
      event: "hero_randomized",
      properties: {},
    } as CaptureResult;
    expect(isStacklessThirdPartyException(event)).toBe(false);
  });

  test("ignores an exception event with an empty list", () => {
    expect(isStacklessThirdPartyException(exceptionEvent([]))).toBe(false);
  });
});

describe("redactUrl", () => {
  test("hides share payloads and both room keys", () => {
    expect(
      redactUrl(
        "https://owheropicker.com/overlay?d=EgMH____P58&size=xl&room=abcDEF_123-xyz&key=F8",
      ),
    ).toBe(
      "https://owheropicker.com/overlay?d=REDACTED&size=xl&room=REDACTED&key=F8",
    );
    expect(
      redactUrl("https://owheropicker.com/overlay/companion?view=Zz9_-abc#top"),
    ).toBe("https://owheropicker.com/overlay/companion?view=REDACTED#top");
  });

  test("leaves look-alike params alone", () => {
    const url = "https://owheropicker.com/?id=1&preview=2&roomy=3";
    expect(redactUrl(url)).toBe(url);
  });
});

describe("scrubSecrets", () => {
  test("redacts links in any string property, including autocapture's", () => {
    const properties = {
      $current_url: "https://owheropicker.com/overlay?d=abc&room=SECRET",
      $elements_chain:
        'a.action-button:attr__href="https://owheropicker.com/overlay?d=abc&room=SECRET"nth-child="3"',
      label: "Open in new tab",
      count: 3,
    };
    scrubSecrets(properties);
    expect(properties.$current_url).toBe(
      "https://owheropicker.com/overlay?d=REDACTED&room=REDACTED",
    );
    expect(properties.$elements_chain).not.toContain("SECRET");
    expect(properties.label).toBe("Open in new tab");
    expect(properties.count).toBe(3);
  });
});

describe("scrubSecrets in nested payloads", () => {
  test("redacts URLs inside Web Vitals metrics and exception lists", () => {
    const url = "https://owheropicker.com/overlay?d=abc&room=SECRET";
    const properties: Record<string, unknown> = {
      $web_vitals_FCP_event: { name: "FCP", value: 120, $current_url: url },
      $exception_list: [
        {
          value: `Failed at ${url}`,
          stacktrace: { frames: [{ filename: url }] },
        },
      ],
    };
    // Cycles must not hang the scrubber.
    properties.self = properties;
    scrubSecrets(properties);
    expect(JSON.stringify({ ...properties, self: undefined })).not.toContain(
      "SECRET",
    );
  });
});

describe("createSampler", () => {
  test("sends the first occurrence, then every nth, each weighted by what it stands for", () => {
    const sample = createSampler(3);
    const results = Array.from({ length: 8 }, () => sample());
    expect(results).toEqual([
      { sample_weight: 1, page_occurrence: 1 },
      null,
      null,
      { sample_weight: 3, page_occurrence: 4 },
      null,
      null,
      { sample_weight: 3, page_occurrence: 7 },
      null,
    ]);
  });

  test("weights of sent events add up to every occurrence they cover", () => {
    const sample = createSampler(10);
    let total = 0;
    for (let i = 0; i < 101; i++) total += sample()?.sample_weight ?? 0;
    expect(total).toBe(101);
  });

  test("an interval of one sends everything", () => {
    const sample = createSampler(1);
    expect([sample(), sample()]).toEqual([
      { sample_weight: 1, page_occurrence: 1 },
      { sample_weight: 1, page_occurrence: 2 },
    ]);
  });
});
