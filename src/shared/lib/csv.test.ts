import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("joins rows with CRLF and prefixes a UTF-8 BOM", () => {
    const csv = toCsv([
      ["a", "b"],
      ["1", "2"],
    ]);
    expect(csv).toBe("﻿a,b\r\n1,2");
  });

  it("quotes fields containing commas, quotes, or newlines", () => {
    const csv = toCsv([["hello, world", 'say "hi"', "line\nbreak"]]);
    expect(csv).toBe('﻿"hello, world","say ""hi""","line\nbreak"');
  });

  it("renders null and undefined as empty strings", () => {
    const csv = toCsv([[null, undefined, 0]]);
    expect(csv).toBe("﻿,,0");
  });
});
