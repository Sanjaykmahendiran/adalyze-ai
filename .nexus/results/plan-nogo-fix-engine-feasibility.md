# Nexus Locked Specification — Fix Engine Feasibility POC

## Meta
- Goal: End-to-end feasibility validation for Adalyze Fix Engine pipeline
- Root Objective: De-risk the full build by proving all integration points work with a real No-Go ad
- Engagement: poc
- Complexity: Medium
- Pipeline: environment setup → feasibility → architect → lead → dev
- Validation Level: build-only
- Quality Bar: feasibility (prove it works, not production-ready)
- Planned: 2026-04-05
- Branch: feature/nogo-fix-engine
- Hosting: cPanel (shared hosting)

## Infrastructure Context

**Adalyze runs on cPanel shared hosting.** This constrains the architecture:

| Constraint | Reality | Impact |
|------------|---------|--------|
| PHP execution time | Likely capped at 30s by hosting provider | Async polling pattern mandatory |
| Background workers | No daemon processes on cPanel | Cron jobs only (cPanel Cron Jobs) |
| Composer | May or may not be available | Raw PHP cURL as fallback |
| Outbound HTTPS | Usually allowed, must verify | Blocking if restricted |
| File storage | `public_html/` tree | Generated images served from here |
| Deployment | FTP/SFTP or cPanel File Manager | No CI/CD |
| SSH access | Depends on hosting plan | Needed for Composer, optional otherwise |

## The Pipeline Under Validation

```
Step 1: Claude Vision API
  Input:  Original ad image (URL) + No-Go analysis (JSON)
  Action: Extract Brand DNA + generate structured fix specification
  Output: JSON { copy_fixes, visual_direction, color_palette, layout_changes, cta_changes }

Step 2: Google AI — Nano Banana Pro
  Input:  Fix specification (structured text prompt) + original ad as reference image
  Action: Generate fixed ad image
  Output: Base64 PNG image

Step 3: Re-Analysis via analyze.php
  Input:  Generated image URL + original ad metadata (user_id, industry, platform, etc.)
  Action: Run full Go/No-Go analysis on the fixed image
  Output: New ApiResponse with updated go_no_go verdict and scores
```

**Production architecture (async, cPanel-compatible):**
```
POST fix.php (start)
  → Creates fix_job record in DB (status: "pending")
  → Returns { fix_id, status: "pending" } immediately

Cron job (process_fixes.php) runs every 30s:
  → Picks up pending jobs
  → Step 1: Claude API → save fix spec → status: "spec_ready"
  → Step 2: Nano Banana → save image to uploads/fixes/ → status: "image_ready"
  → Step 3: Re-analyze → save score → status: "complete"

GET fix_status.php?fix_id=xxx
  → Frontend polls every 3s
  → Returns current step + progress
```

## Requirements (IN SCOPE)

### Phase 0: Environment Setup & Rollback Preparation

#### P0.1: Development Environment
- P0.1.1: Create subdomain `dev.adalyzeai.xyz` in cPanel → points to `/public_html/dev/`
- P0.1.2: Clone full app files to `/public_html/dev/`
- P0.1.3: Create `adalyze_dev` database with same schema as production
- P0.1.4: Seed dev DB with 2-3 real No-Go ads for testing
- P0.1.5: Configure dev environment to use `adalyze_dev` database
- P0.1.6: Verify dev subdomain serves the app correctly
- P0.1.7: Set up separate cron jobs targeting dev directory

#### P0.2: cPanel Server Capabilities
- P0.2.1: Check PHP version via `phpinfo()` or cPanel PHP Selector
- P0.2.2: Verify cURL extension is enabled (`php -m | grep curl`)
- P0.2.3: Test outbound HTTPS to `api.anthropic.com` (PHP cURL test script)
- P0.2.4: Test outbound HTTPS to `generativelanguage.googleapis.com` (PHP cURL test script)
- P0.2.5: Check `max_execution_time` actual limit (`ini_get()`)
- P0.2.6: Verify cron job access in cPanel (Cron Jobs section)
- P0.2.7: Test file write permissions in uploads directory (`is_writable()`)
- P0.2.8: Check SSH/Terminal access availability
- P0.2.9: Check if Composer is available (`which composer` via Terminal)
- P0.2.10: Check MySQL/MariaDB version (`SELECT VERSION()`)
- P0.2.11: Check available disk space for dev copy (cPanel → Disk Usage)

#### P0.3: Rollback Mechanism
- P0.3.1: Create `fix_config.php` with `$FIX_ENGINE_ENABLED = true/false` kill switch
- P0.3.2: All new fix.php endpoints check this flag first — return "feature unavailable" if false
- P0.3.3: DB-level toggle: `settings` table row `fix_engine_enabled = 0/1` (instant via phpMyAdmin)
- P0.3.4: Document rollback procedure:
  - Step 1: Set DB flag to 0 (instant — via phpMyAdmin)
  - Step 2: Delete fix.php, fix_status.php, process_fixes.php from App/
  - Step 3: Remove cron job for process_fixes.php
  - Step 4: Optionally drop fix_jobs table and delete uploads/fixes/ images
- P0.3.5: Verify rollback leaves zero trace in the existing Go/No-Go feature
- P0.3.6: Fix Engine touches ZERO existing files — all new files only

#### P0.4: API Credential Setup
- P0.4.1: Provision Anthropic API key for Adalyze (or reuse existing)
- P0.4.2: Provision Google AI API key with Nano Banana Pro image generation enabled
- P0.4.3: Store keys in a PHP config file OUTSIDE web root (not in public_html/)
- P0.4.4: Verify keys work from the cPanel server (not just local machine)

### Phase 1: Research (AI Pipeline Feasibility)

#### F1: Claude Vision Fix Spec Generation
- F1.1: Call Claude API (vision) from a test script with a real No-Go ad image + analysis JSON
- F1.2: Validate that Claude extracts meaningful Brand DNA (colors, typography, tone, layout)
- F1.3: Validate that the fix spec is structured JSON using Claude's structured output mode
- F1.4: Validate fix spec addresses the specific issues from the No-Go analysis
- F1.5: Test with 3 different ad types (product, B2B lead gen, text-heavy)
- F1.6: Measure latency and token cost per call
- F1.7: Use Claude Sonnet 4.6 with `structured-outputs` beta header for guaranteed JSON
- F1.8: Estimate total POC cost across all test runs

#### F2: Nano Banana Image Generation
- F2.1: Call Google AI Nano Banana Pro API with the fix spec from F1
- F2.2: Validate output image quality — is it ad-grade or amateur? (human judgment, ≥2/3 evaluators)
- F2.3: Validate text rendering accuracy in generated image (CTA, headlines)
- F2.4: Validate brand color accuracy vs the fix spec
- F2.5: Pass original ad image as reference input alongside text prompt (critical for brand consistency)
- F2.6: Measure latency, cost, and resolution options
- F2.7: Test safety filter behavior with ad content (finance, health, beauty)
- F2.8: Test HTML-to-screenshot as parallel fallback approach (Claude generates HTML/CSS → Puppeteer screenshot)

#### F3: Re-Analysis Loop
- F3.1: Determine analyze.php's exact input requirements (from frontend code analysis)
- F3.1.1: Determine if analyze.php accepts base64 image data or requires public URL only
- F3.1.2: Investigate `ads_name` field gap — required by analyze.php but missing from ApiResponse
- F3.2: Test calling analyze.php on dev environment with a programmatically-supplied image URL
- F3.3: Determine if re-analysis creates a new ad_upload_id or can annotate the original
- F3.4: Test credit deduction — check balance before/after re-analysis call
- F3.5: Validate the re-analysis response has the same Go/No-Go structure
- F3.6: Determine if test re-analyses can be safely flagged/deleted without corrupting data

#### F4: End-to-End Integration
- F4.1: Run the full 3-step pipeline with one real No-Go ad on dev environment
- F4.2: Measure total latency (Claude + Nano Banana + re-analysis)
- F4.3: Validate the fixed image scores ≥10% higher than the original on re-analysis
- F4.4: Document the complete request/response chain for fix.php design
- F4.5: Test cron-based step processing (each step in one cron tick, under max_execution_time)

## Anti-Requirements
1. MUST NOT write production code — this is validation only (all work on dev.adalyzeai.xyz)
2. MUST NOT modify any existing Adalyze code or endpoints
3. MUST NOT call analyze.php on production in a way that corrupts existing user data
4. MUST NOT expose API keys in test scripts committed to git
5. MUST NOT auto-loop — single pass only for POC
6. MUST NOT deploy anything to production during POC — dev subdomain only
7. MUST NOT touch existing database tables — only create new tables in adalyze_dev

## Rollback Strategy

| Layer | Mechanism | Speed | How |
|-------|-----------|-------|-----|
| Feature flag (code) | `fix_config.php` → `$FIX_ENGINE_ENABLED = false` | Instant | Edit file in cPanel File Manager |
| Feature flag (DB) | `settings.fix_engine_enabled = 0` | Instant | One SQL query in phpMyAdmin |
| File removal | Delete fix.php, fix_status.php, process_fixes.php | 2 minutes | cPanel File Manager |
| Cron removal | Remove process_fixes.php cron entry | 1 minute | cPanel → Cron Jobs |
| Data cleanup | Drop fix_jobs table, delete uploads/fixes/ | 5 minutes | phpMyAdmin + File Manager |
| Full rollback | All above | < 10 minutes | Zero trace left |

**Key guarantee:** Fix Engine adds new files only. Zero existing files modified. Rollback = delete the new stuff.

## Success Metrics

| Metric | Pass Criteria |
|--------|--------------|
| Dev environment | dev.adalyzeai.xyz serves the app with separate DB |
| Server capabilities | PHP 7.4+, cURL enabled, outbound HTTPS works, cron available |
| Claude fix spec quality | Structured JSON with actionable fixes addressing ≥80% of No-Go issues |
| Nano Banana image quality | ≥2/3 human evaluators rate as "professional or better" |
| Re-analysis score improvement | Fixed image scores ≥10% higher than original |
| Total pipeline latency | < 60 seconds end-to-end (acceptable for async UX with progress) |
| API accessibility from server | Both Claude and Google AI reachable from cPanel server |
| Rollback | Kill switch works — feature disappears instantly with flag toggle |

## Agent Dispatch Plan

### Phase 0: Environment & Infrastructure (parallel — 2 agents)

| Agent | Type | Task |
|-------|------|------|
| Infrastructure Architect | `nexus:level-1c:infrastructure-architect` | Design dev environment setup on cPanel: subdomain config, DB cloning, cron setup, file structure, API key storage pattern |
| Quality Architect | `nexus:level-1c:quality-architect` | Design rollback mechanism: kill switch implementation, DB flag, file isolation verification, rollback testing procedure |

### Phase 1: Research (parallel — 3 agents, depends on Phase 0)

| Agent | Type | Task |
|-------|------|------|
| AI Engineering SME #1 | `nexus:level-1a:ai-engineering-sme` | Claude vision API: prompt design for Brand DNA extraction + fix spec, structured output mode, Sonnet 4.6 recommendation, PHP cURL call pattern |
| AI Engineering SME #2 | `nexus:level-1a:ai-engineering-sme` | Nano Banana Pro API: input format with reference image, output format, text rendering capabilities, safety filters, HTML-to-screenshot fallback assessment |
| Codebase Analyst | `nexus:level-1a:codebase-analyst` | analyze.php contract: exact request/response shapes, ads_name gap, image URL handling, credit behavior, re-analysis data model implications |

### Phase 2: Architecture (depends on Phase 1)

| Agent | Type | Task |
|-------|------|------|
| POC Architect | `nexus:level-1c:poc-architect` | Design test harness: 3 independent validation scripts + 1 integration script + 1 cron simulation script, all targeting dev environment |

### Phase 3: Build (depends on Phase 2)

| Agent | Type | Task |
|-------|------|------|
| POC Builder #1 | `nexus:level-3:poc-builder` | Script 1: Claude vision fix spec generation with real No-Go ad data |
| POC Builder #2 | `nexus:level-3:poc-builder` | Script 2: Nano Banana Pro image generation from fix spec + reference image |
| POC Builder #3 | `nexus:level-3:poc-builder` | Script 3: Re-analysis call with generated image on dev environment |
| POC Builder #4 | `nexus:level-3:poc-builder` | Script 4: Full pipeline chain with cron-step simulation + latency measurement |
| POC Builder #5 | `nexus:level-3:poc-builder` | Script 5: HTML-to-screenshot fallback test (parallel approach) |

### Phase 4: Verdict (depends on Phase 3)

| Agent | Type | Task |
|-------|------|------|
| Feasibility Analyst | `nexus:level-1a:feasibility-analyst` | Final GO/NO-GO verdict: all POC results vs success metrics, Nano Banana vs HTML fallback comparison, cPanel compatibility confirmed |

## Execution Order

```
Phase 0 (parallel — environment setup):
  ├─ Infrastructure Architect (dev environment on cPanel)
  └─ Quality Architect (rollback mechanism)

Phase 1 (parallel — research, depends on Phase 0):
  ├─ AI Engineering SME #1 (Claude vision)
  ├─ AI Engineering SME #2 (Nano Banana Pro)
  └─ Codebase Analyst (analyze.php contract)

Phase 2 (sequential, depends on all Phase 1):
  └─ POC Architect (test harness design)

Phase 3 (sequential, depends on Phase 2):
  ├─ POC Builder #1: Claude fix spec test
  ├─ POC Builder #2: Nano Banana image gen test
  ├─ POC Builder #3: Re-analysis loop test
  ├─ POC Builder #4: Full pipeline integration test
  └─ POC Builder #5: HTML-to-screenshot fallback test

Phase 4 (sequential, depends on all Phase 3):
  └─ Feasibility Analyst: Final verdict
```

## Summary
- Total agents: 12 dispatches across 5 phases (Phase 0–4)
- Phase 0 secures dev environment + rollback before any AI testing
- Biggest risk: Nano Banana image quality (F2.2, F2.3, F2.4)
- Fallback: HTML-to-screenshot approach tested in parallel (POC Builder #5)
- Kill switch: Dual-layer (code + DB flag) — instant rollback
- All work on dev.adalyzeai.xyz — production untouched
- Branch: feature/nogo-fix-engine
- No production code — validation scripts only
