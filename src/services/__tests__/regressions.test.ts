// src/services/__tests__/regressions.test.ts
// Structural regression tests — guard against re-introduction of known anti-patterns.
// These tests do not test service logic; they read raw source files.

import * as fs from "fs";
import * as path from "path";

describe("AP-001: paymentHistoryTable — userId must not be read at module scope", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../../app/myaccount/_components/paymentHistoryTable.tsx"),
    "utf-8"
  );

  it("test_AP001_userId_not_read_at_module_scope", () => {
    const exportFnIndex = source.search(/export\s+(default\s+)?function/);
    const moduleScope = exportFnIndex === -1 ? source : source.slice(0, exportFnIndex);
    expect(moduleScope).not.toMatch(/Cookies\.get/);
  });

  it("test_AP001_userId_read_inside_component_function_body", () => {
    const exportFnIndex = source.search(/export\s+(default\s+)?function/);
    if (exportFnIndex === -1) {
      return;
    }
    const componentBody = source.slice(exportFnIndex);
    expect(componentBody).toMatch(/Cookies\.get/);
  });
});
