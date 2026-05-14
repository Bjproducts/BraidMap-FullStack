#!/usr/bin/env tsx
/**
 * seed-stylists.ts — Import the original BraidMap stylist dataset into Supabase.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage
 * ─────────────────────────────────────────────────────────────────────────────
 *   npm run db:seed                          # normal run
 *   npm run db:seed -- --dry-run             # validate only, no writes
 *   npm run db:seed -- --data=<path>         # custom JSON source path
 *   npm run db:seed -- --batch-size=25       # override default batch size (50)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Required env vars (loaded from .env.local automatically)
 * ─────────────────────────────────────────────────────────────────────────────
 *   NEXT_PUBLIC_SUPABASE_URL       Project URL (e.g. https://xxx.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY      Service-role key — bypasses RLS for seeding
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Idempotency guarantee
 * ─────────────────────────────────────────────────────────────────────────────
 *   Safe to run multiple times. Existing records are detected by both slug
 *   (unique constraint) and UUID (deterministic from BM-XXXX id). Already-
 *   present records are skipped; only genuinely new records are inserted.
 *   Re-running after a partial failure picks up exactly where it left off.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

import { validateRecord, transformRecord } from './transform';
import type { SourceData, SourceStylist, StylistInsert } from './types';

// ── .env.local loader ────────────────────────────────────────────────────────
//
// Node 20 supports --env-file natively, but reading it here means the script
// works equally well when called directly (tsx seed-stylists.ts) or via npm
// scripts that don't pass --env-file. Existing process.env values are never
// overridden, so real CI environment variables always win.

function loadEnvFile(envPath: string): void {
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const raw = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes (single or double)
      const val = raw.replace(/^(['"])(.*)\1$/, '$2');
      if (key && !(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {
    // .env.local not found — rely on real env vars
  }
}

// ── CLI options ───────────────────────────────────────────────────────────────

interface CliOptions {
  dataPath: string;
  dryRun: boolean;
  batchSize: number;
}

function parseCliOptions(): CliOptions {
  // __dirname equivalent in ESM
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const defaultDataPath = resolve(scriptDir, 'data', 'braidmap_data.json');

  let dataPath  = defaultDataPath;
  let dryRun    = false;
  let batchSize = 50;

  for (const arg of process.argv.slice(2)) {
    if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg.startsWith('--data=')) {
      dataPath = resolve(process.cwd(), arg.slice('--data='.length));
    } else if (arg.startsWith('--batch-size=')) {
      const n = parseInt(arg.slice('--batch-size='.length), 10);
      if (!Number.isNaN(n) && n > 0) batchSize = n;
    }
  }

  return { dataPath, dryRun, batchSize };
}

// ── Terminal colours ──────────────────────────────────────────────────────────

const CLR = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
} as const;

const log   = (msg: string) => console.log(msg);
const ok    = (msg: string) => console.log(`${CLR.green}✓${CLR.reset}  ${msg}`);
const warn  = (msg: string) => console.log(`${CLR.yellow}⚠${CLR.reset}  ${msg}`);
const fail  = (msg: string) => console.error(`${CLR.red}✗${CLR.reset}  ${msg}`);
const info  = (msg: string) => console.log(`${CLR.cyan}→${CLR.reset}  ${msg}`);
const dim   = (msg: string) => console.log(`${CLR.dim}${msg}${CLR.reset}`);
const bold  = (msg: string) => console.log(`${CLR.bold}${msg}${CLR.reset}`);
const hr    = ()            => console.log(CLR.dim + '─'.repeat(62) + CLR.reset);
const blank = ()            => console.log('');

// ── Batch helper ──────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

// ── Supabase URL normalisation ────────────────────────────────────────────────
//
// .env.example has the URL with "/rest/v1/" appended. createClient needs the
// bare project origin. We normalise silently so both forms work.

function normaliseSupabaseUrl(raw: string): string {
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/(rest|auth|storage)\/v\d.*$/, '');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const t0 = Date.now();

  loadEnvFile(resolve(process.cwd(), '.env.local'));

  const opts = parseCliOptions();

  hr();
  bold('  BraidMap — Stylist Seed Script');
  hr();
  blank();

  if (opts.dryRun) {
    warn('DRY RUN — no data will be written to the database');
    blank();
  }

  // ── Step 1: Validate environment ──────────────────────────────────────────

  const rawUrl        = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (!rawUrl) {
    fail('NEXT_PUBLIC_SUPABASE_URL is not set.');
    fail('Add it to .env.local or export it in your shell.');
    process.exit(1);
  }
  if (!serviceRoleKey) {
    fail('SUPABASE_SERVICE_ROLE_KEY is not set.');
    fail('The seed script must bypass RLS — the service role key is required.');
    fail('Never use this key in browser-side code or commit it to source control.');
    process.exit(1);
  }

  const supabaseUrl = normaliseSupabaseUrl(rawUrl);
  ok(`Supabase project: ${supabaseUrl}`);

  // ── Step 2: Load source JSON ──────────────────────────────────────────────

  blank();
  info(`Loading source data from:\n  ${opts.dataPath}`);
  blank();

  let sourceData: SourceData;
  try {
    const raw = readFileSync(opts.dataPath, 'utf-8');
    sourceData = JSON.parse(raw) as SourceData;
  } catch (e) {
    fail(`Could not read data file: ${opts.dataPath}`);
    if (e instanceof Error) fail(e.message);
    process.exit(1);
  }

  if (!Array.isArray(sourceData.stylists)) {
    fail('Expected top-level key "stylists" to be an array in the JSON file.');
    process.exit(1);
  }

  ok(`Loaded ${sourceData.stylists.length} source records`);

  // ── Step 3: Validate all source records ───────────────────────────────────

  blank();
  info('Validating source records…');

  const allValidationErrors = sourceData.stylists.flatMap(
    (raw, i) => validateRecord(raw, i),
  );

  if (allValidationErrors.length > 0) {
    blank();
    fail(`Validation failed — ${allValidationErrors.length} error(s) found:`);
    blank();
    for (const e of allValidationErrors) {
      fail(`  [index ${e.index}] ${e.bmId}  field="${e.field}"  ${e.message}`);
    }
    blank();
    fail('Fix all validation errors before seeding. Aborting.');
    process.exit(1);
  }

  ok(`All ${sourceData.stylists.length} records passed validation`);

  // ── Step 4: Transform records ─────────────────────────────────────────────

  blank();
  info('Transforming records (slug generation, tag normalisation, UUID derivation)…');

  const localSlugs = new Set<string>();
  const dbSlugs    = new Set<string>(); // populated after DB fetch; empty here for now

  const allWarnings: string[] = [];
  const transformed = (sourceData.stylists as SourceStylist[]).map(raw => {
    const result = transformRecord(raw, localSlugs, dbSlugs);
    for (const w of result.warnings) {
      allWarnings.push(`${raw.id}: ${w}`);
    }
    return result;
  });

  ok(`Transformed ${transformed.length} records`);

  if (allWarnings.length > 0) {
    blank();
    warn(`${allWarnings.length} transformation warning(s):`);
    for (const w of allWarnings) dim(`  ${w}`);
  }

  // Slug preview
  blank();
  dim('  Slug sample (first 8):');
  for (const { bmId, record } of transformed.slice(0, 8)) {
    dim(`    ${bmId.padEnd(8)}  "${record.name}"  →  /${record.slug}`);
  }

  // Tag preview
  blank();
  const allTags = [...new Set(transformed.flatMap(t => t.record.tags))].sort();
  dim(`  Normalised tags (${allTags.length}):  ${allTags.join(', ')}`);

  // ── Dry-run exit ──────────────────────────────────────────────────────────

  if (opts.dryRun) {
    blank();
    hr();
    bold('  DRY RUN complete');
    hr();
    log(`  Source records:    ${sourceData.stylists.length}`);
    log(`  Ready to insert:   ${transformed.length}`);
    log(`  Warnings:          ${allWarnings.length}`);
    log(`  Validation errors: 0`);
    log(`  Elapsed:           ${((Date.now() - t0) / 1000).toFixed(2)}s`);
    hr();
    blank();
    ok('No errors. Remove --dry-run to write to the database.');
    blank();
    return;
  }

  // ── Step 5: Connect to Supabase ───────────────────────────────────────────

  blank();
  info('Connecting to Supabase…');

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession:   false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Connectivity check
  const { error: pingError } = await supabase
    .from('stylists')
    .select('id')
    .limit(1);

  if (pingError) {
    fail(`Database connection failed: ${pingError.message}`);
    if (pingError.code) fail(`  Code: ${pingError.code}`);
    fail('Check your NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }

  ok('Connected to Supabase');

  // ── Step 6: Fetch existing records from DB ────────────────────────────────

  blank();
  info('Fetching existing stylists from database…');

  const { data: existingRows, error: fetchError } = await supabase
    .from('stylists')
    .select('id, slug, name');

  if (fetchError) {
    fail(`Failed to fetch existing stylists: ${fetchError.message}`);
    process.exit(1);
  }

  const existingSlugs = new Set((existingRows ?? []).map(r => r.slug as string));
  const existingUuids = new Set((existingRows ?? []).map(r => r.id as string));

  ok(`${existingSlugs.size} existing stylist(s) found in database`);

  // ── Step 7: Partition: to insert vs to skip ───────────────────────────────

  const toInsert: StylistInsert[] = [];
  const toSkip:   Array<{ bmId: string; name: string; reason: string }> = [];

  for (const { record, bmId } of transformed) {
    if (existingUuids.has(record.id)) {
      toSkip.push({ bmId, name: record.name, reason: `UUID ${record.id} already exists` });
    } else if (existingSlugs.has(record.slug)) {
      toSkip.push({ bmId, name: record.name, reason: `slug "${record.slug}" already exists` });
    } else {
      toInsert.push(record);
    }
  }

  blank();
  info(`To insert: ${toInsert.length}`);
  info(`To skip:   ${toSkip.length}  (already in database)`);

  if (toSkip.length > 0) {
    blank();
    warn(`Skipping ${toSkip.length} record(s):`);
    for (const s of toSkip) {
      dim(`  ${s.bmId.padEnd(8)}  "${s.name}" — ${s.reason}`);
    }
  }

  if (toInsert.length === 0) {
    blank();
    ok('Nothing to insert — all records already exist in the database.');
    ok('The seed is complete.');
    blank();
    return;
  }

  // ── Step 8: Batch insert ──────────────────────────────────────────────────

  blank();
  info(
    `Inserting ${toInsert.length} record(s) in batches of ${opts.batchSize}…`,
  );
  blank();

  const batches           = chunk(toInsert, opts.batchSize);
  let   totalInserted     = 0;
  const batchErrors: Array<{ batchNum: number; records: string[]; error: string }> = [];

  for (let i = 0; i < batches.length; i++) {
    const batch    = batches[i]!;
    const batchNum = i + 1;
    const rangeStart = i * opts.batchSize + 1;
    const rangeEnd   = rangeStart + batch.length - 1;

    process.stdout.write(
      `  ${CLR.dim}Batch ${batchNum}/${batches.length}${CLR.reset}` +
      `  (records ${rangeStart}–${rangeEnd})  … `,
    );

    const { error } = await supabase.from('stylists').insert(batch);

    if (error) {
      process.stdout.write(`${CLR.red}FAILED${CLR.reset}\n`);
      const names = batch.map(r => r.name);
      batchErrors.push({ batchNum, records: names, error: error.message });
      fail(`    Error: ${error.message}`);
      if (error.details) fail(`    Details: ${error.details}`);
      if (error.hint)    fail(`    Hint: ${error.hint}`);
    } else {
      process.stdout.write(`${CLR.green}OK${CLR.reset}  (+${batch.length})\n`);
      totalInserted += batch.length;
    }
  }

  // ── Step 9: Final summary ─────────────────────────────────────────────────

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);

  blank();
  hr();
  bold('  Seed Summary');
  hr();
  log(`  Source records:    ${sourceData.stylists.length}`);
  log(`  Inserted:          ${CLR.green}${totalInserted}${CLR.reset}`);
  log(`  Skipped:           ${CLR.yellow}${toSkip.length}${CLR.reset}  (already existed)`);
  log(`  Failed batches:    ${batchErrors.length > 0 ? CLR.red : ''}${batchErrors.length}${CLR.reset}`);
  log(`  Warnings:          ${allWarnings.length}`);
  log(`  Elapsed:           ${elapsed}s`);
  hr();
  blank();

  if (batchErrors.length > 0) {
    fail(`${batchErrors.length} batch(es) failed. Records NOT inserted:`);
    blank();
    for (const e of batchErrors) {
      fail(`  Batch ${e.batchNum}: ${e.error}`);
      for (const name of e.records) dim(`    • ${name}`);
    }
    blank();
    warn('Re-run `npm run db:seed` to retry. Already-inserted records will be skipped.');
    blank();
    process.exit(1);
  }

  if (totalInserted > 0) {
    ok(`${totalInserted} stylist(s) successfully seeded into Supabase.`);
  }

  blank();
}

// ── Entry ─────────────────────────────────────────────────────────────────────

main().catch(err => {
  console.error('');
  fail('Unexpected fatal error:');
  fail(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exit(1);
});
