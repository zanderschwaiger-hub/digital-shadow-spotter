/**
 * Pillar progression enforcement tests (end-to-end against the live backend).
 *
 * Verifies that the database — not just the client — blocks out-of-order
 * pillar completion attempts.
 *
 * To run:
 *   1. Create a confirmed test user in Lovable Cloud and set:
 *        TEST_USER_EMAIL=...  TEST_USER_PASSWORD=...
 *      (Email auto-confirm must be ON, OR confirm the user manually first.)
 *   2. bunx vitest run src/test/pillar-order.e2e.test.ts
 *
 * Skipped automatically if the env vars are missing.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

const skip = !email || !password;
const d = skip ? describe.skip : describe;

d("pillar_progress sequential ordering (DB enforcement)", () => {
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  let userId: string;

  beforeAll(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email!,
      password: password!,
    });
    if (error) throw error;
    userId = data.user!.id;
    // Clean slate
    await supabase.from("pillar_progress").delete().eq("user_id", userId);
  });

  afterAll(async () => {
    await supabase.from("pillar_progress").delete().eq("user_id", userId);
    await supabase.auth.signOut();
  });

  const insertPillar = (i: number) =>
    supabase.from("pillar_progress").insert({
      user_id: userId,
      pillar_index: i,
      completed: true,
      completed_at: new Date().toISOString(),
    });

  it("BLOCKS inserting pillar 5 before pillars 1-4", async () => {
    const { error } = await insertPillar(5);
    expect(error, "Out-of-order insert should be rejected by DB").not.toBeNull();
  });

  it("BLOCKS jumping straight to pillar 12", async () => {
    const { error } = await insertPillar(12);
    expect(error, "Skip-to-12 insert should be rejected by DB").not.toBeNull();
  });

  it("BLOCKS reverse-order inserts (12 down to 2)", async () => {
    let blockedCount = 0;
    for (let i = 12; i >= 2; i--) {
      const { error } = await insertPillar(i);
      if (error) blockedCount++;
    }
    expect(blockedCount, "All 11 reverse inserts should be blocked").toBe(11);
  });

  it("BLOCKS complete_baseline() when fewer than 12 pillars present", async () => {
    // Insert only pillar 1 sequentially
    await insertPillar(1);
    const { error } = await supabase.rpc("complete_baseline");
    expect(error, "complete_baseline must reject incomplete progress").not.toBeNull();
  });

  it("ALLOWS sequential 1..12 inserts followed by complete_baseline()", async () => {
    await supabase.from("pillar_progress").delete().eq("user_id", userId);
    for (let i = 1; i <= 12; i++) {
      const { error } = await insertPillar(i);
      expect(error, `Sequential insert at pillar ${i} should succeed`).toBeNull();
    }
    const { error } = await supabase.rpc("complete_baseline");
    expect(error, "complete_baseline should succeed with all 12 pillars").toBeNull();
  });
});
