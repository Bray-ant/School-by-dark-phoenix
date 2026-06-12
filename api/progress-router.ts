import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { lessonProgress, generatorStats, exerciseAttempts } from "@db/schema";
import { eq, and } from "drizzle-orm";

export const progressRouter = createRouter({
  // Get all lesson progress for current user
  getLessonProgress: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const progress = await db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, ctx.user.id));
    return progress;
  }),

  // Mark a lesson as complete
  completeLesson: authedQuery
    .input(
      z.object({
        lessonId: z.string(),
        chapterType: z.enum(["tech-mech", "dc-circuit"]),
        timeSpentSeconds: z.number().optional(),
        score: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, ctx.user.id),
            eq(lessonProgress.lessonId, input.lessonId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(lessonProgress)
          .set({
            completed: 1,
            timeSpentSeconds: input.timeSpentSeconds ?? existing[0].timeSpentSeconds,
            score: input.score ?? existing[0].score,
          })
          .where(eq(lessonProgress.id, existing[0].id));
        return { updated: true };
      }

      await db.insert(lessonProgress).values({
        userId: ctx.user.id,
        lessonId: input.lessonId,
        chapterType: input.chapterType,
        completed: 1,
        timeSpentSeconds: input.timeSpentSeconds ?? 0,
        score: input.score,
      });
      return { created: true };
    }),

  // Update generator stats
  updateGeneratorStats: authedQuery
    .input(
      z.object({
        topic: z.string(),
        difficulty: z.number().min(1).max(7),
        correct: z.boolean(),
        timeMs: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(generatorStats)
        .where(
          and(
            eq(generatorStats.userId, ctx.user.id),
            eq(generatorStats.topic, input.topic)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        const row = existing[0];
        const currentStreak = row.currentStreak ?? 0;
        const bestStreak = row.bestStreak ?? 0;
        const completed = row.completed ?? 0;
        const correct = row.correct ?? 0;
        const totalTimeMs = row.totalTimeMs ?? 0;
        const newStreak = input.correct ? currentStreak + 1 : 0;
        const newBest = Math.max(newStreak, bestStreak);
        await db
          .update(generatorStats)
          .set({
            completed: completed + 1,
            correct: correct + (input.correct ? 1 : 0),
            totalTimeMs: totalTimeMs + input.timeMs,
            currentStreak: newStreak,
            bestStreak: newBest,
          })
          .where(eq(generatorStats.id, row.id));
        return { updated: true };
      }

      await db.insert(generatorStats).values({
        userId: ctx.user.id,
        topic: input.topic,
        difficulty: input.difficulty,
        completed: 1,
        correct: input.correct ? 1 : 0,
        totalTimeMs: input.timeMs,
        currentStreak: input.correct ? 1 : 0,
        bestStreak: input.correct ? 1 : 0,
      });
      return { created: true };
    }),

  // Get generator stats
  getGeneratorStats: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const stats = await db
      .select()
      .from(generatorStats)
      .where(eq(generatorStats.userId, ctx.user.id));
    return stats;
  }),

  // Record exercise attempt
  recordExerciseAttempt: authedQuery
    .input(
      z.object({
        exerciseId: z.string(),
        correct: z.boolean(),
        timeSpentSeconds: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(exerciseAttempts).values({
        userId: ctx.user.id,
        exerciseId: input.exerciseId,
        correct: input.correct ? 1 : 0,
        timeSpentSeconds: input.timeSpentSeconds,
      });
      return { recorded: true };
    }),

  // Get exercise attempts
  getExerciseAttempts: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const attempts = await db
      .select()
      .from(exerciseAttempts)
      .where(eq(exerciseAttempts.userId, ctx.user.id));
    return attempts;
  }),

  // Get dashboard summary
  getDashboardSummary: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [lessons] = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, ctx.user.id));
    const [completed] = await db
      .select({ count: sql<number>`count(*)` })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, ctx.user.id),
          eq(lessonProgress.completed, 1)
        )
      );
    const [genStats] = await db
      .select({
        totalSolved: sql<number>`sum(${generatorStats.completed})`,
        totalCorrect: sql<number>`sum(${generatorStats.correct})`,
        bestStreak: sql<number>`max(${generatorStats.bestStreak})`,
      })
      .from(generatorStats)
      .where(eq(generatorStats.userId, ctx.user.id));
    const [exAttempts] = await db
      .select({ count: sql<number>`count(*)` })
      .from(exerciseAttempts)
      .where(eq(exerciseAttempts.userId, ctx.user.id));

    return {
      lessonsCompleted: completed?.count ?? 0,
      lessonsStarted: lessons?.count ?? 0,
      generatorSolved: genStats?.totalSolved ?? 0,
      generatorCorrect: genStats?.totalCorrect ?? 0,
      bestStreak: genStats?.bestStreak ?? 0,
      exerciseAttempts: exAttempts?.count ?? 0,
    };
  }),
});

import { sql } from "drizzle-orm";
