"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useToast } from "@/components/providers/ToastProvider";

export interface FocusSession {
  id: string;
  label: string | null;
  taskId: string | null;
  durationMin: number;
  sessionType: string;
  completedAt: string;
}

export interface PlannerItem {
  id: string;
  title: string;
  date: string;
  zone: string;
  sortOrder: number;
  startTime: string | null;
  endTime: string | null;
  completed: boolean;
  recurrence?: string | null;
  taskId: string | null;
  linkedTaskId?: string | null;
}

export interface HabitCheck {
  id: string;
  date: string;
}

export interface Habit {
  id: string;
  title: string;
  currentStreak: number;
  longestStreak: number;
  checks: HabitCheck[];
}

export interface WeeklyGoal {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  weekStart: string;
  linkedHabitId: string | null;
}

export interface TimeEntry {
  id: string;
  label: string;
  durationMin: number;
  date: string;
  taskId: string | null;
}

interface ProductivityState {
  focusSessions: FocusSession[];
  weekSessions: FocusSession[];
  plannerItems: PlannerItem[];
  habits: Habit[];
  weeklyGoals: WeeklyGoal[];
  timeEntries: TimeEntry[];
  loading: boolean;
  error: boolean;
  selectedDate: string;
  weekStartDate: string;
  fetchAll: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  setWeekStartDate: (date: string) => void;
  fetchPlannerForWeek: (startDate: string) => Promise<void>;
  addFocusSession: (session: Omit<FocusSession, "id" | "completedAt">) => Promise<Record<string, unknown> | null>;
  addPlannerItem: (item: { title: string; date?: string; zone?: string; startTime?: string; endTime?: string; recurrence?: string; taskId?: string; linkedTaskId?: string }) => Promise<void>;
  updatePlannerItem: (item: { id: string } & Partial<PlannerItem>) => Promise<void>;
  deletePlannerItem: (id: string) => Promise<void>;
  reorderPlannerItems: (items: Array<{ id: string; sortOrder: number; zone?: string }>) => Promise<void>;
  addHabit: (title: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCheck: (habitId: string) => Promise<void>;
  addWeeklyGoal: (goal: { title: string; targetCount: number; linkedHabitId?: string }) => Promise<void>;
  updateWeeklyGoal: (goal: { id: string; currentCount?: number; title?: string; targetCount?: number }) => Promise<void>;
  deleteWeeklyGoal: (id: string) => Promise<void>;
  addTimeEntry: (entry: { label: string; durationMin: number; date?: string; taskId?: string }) => Promise<void>;
}

const ProductivityContext = createContext<ProductivityState | null>(null);

export function useProductivity() {
  const ctx = useContext(ProductivityContext);
  if (!ctx) throw new Error("useProductivity must be used within ProductivityProvider");
  return ctx;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getMondayStr(dateStr?: string) {
  const d = dateStr ? new Date(dateStr + "T00:00:00") : new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

export function ProductivityProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [weekSessions, setWeekSessions] = useState<FocusSession[]>([]);
  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDate, setSelectedDateState] = useState(todayStr());
  const [weekStartDate, setWeekStartDateState] = useState(getMondayStr());

  const fetchAll = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/productivity");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFocusSessions(data.focusSessions || []);
      setWeekSessions(data.weekSessions || []);
      setPlannerItems(data.plannerItems || []);
      setHabits(data.habits || []);
      setWeeklyGoals(data.weeklyGoals || []);
      setTimeEntries(data.timeEntries || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlannerForDate = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/productivity/planner?date=${date}`);
      if (!res.ok) throw new Error();
      const items = await res.json();
      setPlannerItems(items);
    } catch {
      toast("Failed to load planner items", "error");
    }
  }, [toast]);

  const setSelectedDate = useCallback((date: string) => {
    setSelectedDateState(date);
    fetchPlannerForDate(date);
  }, [fetchPlannerForDate]);

  const fetchPlannerForWeek = useCallback(async (startDate: string) => {
    try {
      const endDate = addDays(startDate, 6);
      const res = await fetch(`/api/productivity/planner?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error();
      const items = await res.json();
      setPlannerItems(items);
    } catch {
      toast("Failed to load planner items", "error");
    }
  }, [toast]);

  const setWeekStartDate = useCallback((date: string) => {
    setWeekStartDateState(date);
    fetchPlannerForWeek(date);
  }, [fetchPlannerForWeek]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Also fetch week planner items on initial load
  useEffect(() => { fetchPlannerForWeek(weekStartDate); }, [fetchPlannerForWeek, weekStartDate]);

  const addFocusSession = useCallback(async (session: Omit<FocusSession, "id" | "completedAt">) => {
    try {
      const res = await fetch("/api/productivity/focus-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setFocusSessions((prev) => [created, ...prev]);
      setWeekSessions((prev) => [created, ...prev]);
      return created;
    } catch {
      toast("Failed to save session", "error");
      return null;
    }
  }, [toast]);

  const addPlannerItem = useCallback(async (item: { title: string; date?: string; zone?: string; startTime?: string; endTime?: string; recurrence?: string; taskId?: string; linkedTaskId?: string }) => {
    try {
      const res = await fetch("/api/productivity/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, date: item.date || selectedDate }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setPlannerItems((prev) => [...prev, created]);
    } catch {
      toast("Failed to add item", "error");
    }
  }, [selectedDate, toast]);

  const updatePlannerItem = useCallback(async (item: { id: string } & Partial<PlannerItem>) => {
    const prev = plannerItems;
    setPlannerItems((items) => items.map((i) => (i.id === item.id ? { ...i, ...item } : i)));
    try {
      const res = await fetch("/api/productivity/planner", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPlannerItems(prev);
      toast("Failed to update item", "error");
    }
  }, [plannerItems, toast]);

  const deletePlannerItem = useCallback(async (id: string) => {
    const prev = plannerItems;
    setPlannerItems((items) => items.filter((i) => i.id !== id));
    try {
      const res = await fetch("/api/productivity/planner", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setPlannerItems(prev);
      toast("Failed to delete item", "error");
    }
  }, [plannerItems, toast]);

  const reorderPlannerItems = useCallback(async (items: Array<{ id: string; sortOrder: number; zone?: string }>) => {
    setPlannerItems((prev) =>
      prev.map((p) => {
        const update = items.find((i) => i.id === p.id);
        return update ? { ...p, sortOrder: update.sortOrder, zone: update.zone || p.zone } : p;
      })
    );
    try {
      const res = await fetch("/api/productivity/planner/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast("Failed to reorder", "error");
      fetchPlannerForDate(selectedDate);
    }
  }, [selectedDate, fetchPlannerForDate, toast]);

  const addHabit = useCallback(async (title: string) => {
    try {
      const res = await fetch("/api/productivity/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setHabits((prev) => [...prev, { ...created, checks: [] }]);
    } catch {
      toast("Failed to add habit", "error");
    }
  }, [toast]);

  const deleteHabit = useCallback(async (id: string) => {
    const prev = habits;
    setHabits((h) => h.filter((i) => i.id !== id));
    try {
      const res = await fetch("/api/productivity/habits", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setHabits(prev);
      toast("Failed to delete habit", "error");
    }
  }, [habits, toast]);

  const toggleHabitCheck = useCallback(async (habitId: string) => {
    try {
      const res = await fetch(`/api/productivity/habits/${habitId}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setHabits((prev) => prev.map((h) => (h.id === habitId ? updated : h)));
      // Refresh goals in case linked
      const goalsRes = await fetch("/api/productivity/goals");
      if (goalsRes.ok) {
        const goals = await goalsRes.json();
        setWeeklyGoals(goals);
      }
    } catch {
      toast("Failed to update habit", "error");
    }
  }, [toast]);

  const addWeeklyGoal = useCallback(async (goal: { title: string; targetCount: number; linkedHabitId?: string }) => {
    try {
      const res = await fetch("/api/productivity/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setWeeklyGoals((prev) => [...prev, created]);
    } catch {
      toast("Failed to add goal", "error");
    }
  }, [toast]);

  const updateWeeklyGoal = useCallback(async (goal: { id: string; currentCount?: number; title?: string; targetCount?: number }) => {
    const prev = weeklyGoals;
    setWeeklyGoals((goals) => goals.map((g) => (g.id === goal.id ? { ...g, ...goal } : g)));
    try {
      const res = await fetch("/api/productivity/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      });
      if (!res.ok) throw new Error();
    } catch {
      setWeeklyGoals(prev);
      toast("Failed to update goal", "error");
    }
  }, [weeklyGoals, toast]);

  const deleteWeeklyGoal = useCallback(async (id: string) => {
    const prev = weeklyGoals;
    setWeeklyGoals((g) => g.filter((i) => i.id !== id));
    try {
      const res = await fetch("/api/productivity/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setWeeklyGoals(prev);
      toast("Failed to delete goal", "error");
    }
  }, [weeklyGoals, toast]);

  const addTimeEntry = useCallback(async (entry: { label: string; durationMin: number; date?: string; taskId?: string }) => {
    try {
      const res = await fetch("/api/productivity/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTimeEntries((prev) => [created, ...prev]);
    } catch {
      toast("Failed to add time entry", "error");
    }
  }, [toast]);

  return (
    <ProductivityContext.Provider
      value={{
        focusSessions,
        weekSessions,
        plannerItems,
        habits,
        weeklyGoals,
        timeEntries,
        loading,
        error,
        selectedDate,
        weekStartDate,
        fetchAll,
        setSelectedDate,
        setWeekStartDate,
        fetchPlannerForWeek,
        addFocusSession,
        addPlannerItem,
        updatePlannerItem,
        deletePlannerItem,
        reorderPlannerItems,
        addHabit,
        deleteHabit,
        toggleHabitCheck,
        addWeeklyGoal,
        updateWeeklyGoal,
        deleteWeeklyGoal,
        addTimeEntry,
      }}
    >
      {children}
    </ProductivityContext.Provider>
  );
}
