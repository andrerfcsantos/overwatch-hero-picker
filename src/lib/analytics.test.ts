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
  /** A random source that replays `values`, for deterministic tests. */
  function replay(values: number[]): () => number {
    let i = 0;
    return () => values[i++];
  }

  test("always sends the first occurrence, with weight 1", () => {
    const sample = createSampler(10, () => 0.99);
    expect(sample()).toEqual({ sample_weight: 1, page_occurrence: 1 });
    expect(sample()).toBeNull();
  });

  test("keeps later occurrences with probability 1/every, weighted by the interval", () => {
    // 0.05 * 10 < 1 is kept; 0.1 * 10 = 1 is the first value dropped.
    const sample = createSampler(10, replay([0.05, 0.1, 0.0999, 0.5]));
    expect([sample(), sample(), sample(), sample(), sample()]).toEqual([
      { sample_weight: 1, page_occurrence: 1 },
      { sample_weight: 10, page_occurrence: 2 },
      null,
      { sample_weight: 10, page_occurrence: 4 },
      null,
    ]);
  });

  test("weights sum to about the true count, even for short visits", () => {
    // Many 8-roll visits, the typical length: a fixed stride would report 1
    // roll for each.
    let total = 0;
    const visits = 20_000;
    for (let v = 0; v < visits; v++) {
      const sample = createSampler(10);
      for (let roll = 0; roll < 8; roll++)
        total += sample()?.sample_weight ?? 0;
    }
    expect(total / visits).toBeGreaterThan(7.6);
    expect(total / visits).toBeLessThan(8.4);
  });

  test("an interval of one sends everything", () => {
    const sample = createSampler(1);
    expect([sample(), sample()]).toEqual([
      { sample_weight: 1, page_occurrence: 1 },
      { sample_weight: 1, page_occurrence: 2 },
    ]);
  });
});
