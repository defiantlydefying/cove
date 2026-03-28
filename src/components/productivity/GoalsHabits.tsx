"use client";

import { useState } from "react";
import { useProductivity } from "./ProductivityContext";
import HabitItem from "./HabitItem";
import GoalItem from "./GoalItem";

export default function GoalsHabits() {
  const {
    habits,
    weeklyGoals,
    addHabit,
    deleteHabit,
    toggleHabitCheck,
    addWeeklyGoal,
    updateWeeklyGoal,
    deleteWeeklyGoal,
  } = useProductivity();

  const [showHabitForm, setShowHabitForm] = useState(false);
  const [newHabit, setNewHabit] = useState("");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(3);
  const [linkedHabitId, setLinkedHabitId] = useState("");

  const handleAddHabit = () => {
    const title = newHabit.trim();
    if (!title) return;
    addHabit(title);
    setNewHabit("");
    setShowHabitForm(false);
  };

  const handleAddGoal = () => {
    const title = newGoalTitle.trim();
    if (!title || newGoalTarget < 1) return;
    addWeeklyGoal({
      title,
      targetCount: newGoalTarget,
      linkedHabitId: linkedHabitId || undefined,
    });
    setNewGoalTitle("");
    setNewGoalTarget(3);
    setLinkedHabitId("");
    setShowGoalForm(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-cove-card rounded-xl border border-cove-border">
      {/* Daily Habits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-cove-charcoal">
            Daily Habits
          </h3>
          {!showHabitForm && (
            <button
              onClick={() => setShowHabitForm(true)}
              className="px-2.5 py-1 text-[11px] font-medium text-cove-accent border border-cove-accent/25 rounded-lg hover:bg-cove-accent/5 transition-colors"
            >
              + Add habit
            </button>
          )}
        </div>

        {habits.length === 0 && !showHabitForm && (
          <p className="text-xs text-cove-muted py-3 text-center">
            No habits yet. Add one to start tracking.
          </p>
        )}

        {habits.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onToggle={toggleHabitCheck}
                onDelete={deleteHabit}
              />
            ))}
          </div>
        )}

        {showHabitForm && (
          <div className="mt-2 p-3 bg-cove-offwhite/50 rounded-lg border border-cove-border/50">
            <input
              type="text"
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddHabit();
                if (e.key === "Escape") { setShowHabitForm(false); setNewHabit(""); }
              }}
              placeholder="Habit name (e.g. Read 20 min)"
              maxLength={100}
              autoFocus
              className="w-full px-3 py-2 text-sm bg-cove-card border border-cove-border rounded-lg focus:border-cove-accent focus:outline-none focus:ring-1 focus:ring-cove-accent/30 text-cove-charcoal placeholder:text-cove-muted"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => { setShowHabitForm(false); setNewHabit(""); }}
                className="px-3 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddHabit}
                disabled={!newHabit.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors disabled:opacity-40"
              >
                Add Habit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-cove-border" />

      {/* Weekly Goals */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-cove-charcoal">
            Weekly Goals
          </h3>
          {!showGoalForm && (
            <button
              onClick={() => setShowGoalForm(true)}
              className="px-2.5 py-1 text-[11px] font-medium text-cove-accent border border-cove-accent/25 rounded-lg hover:bg-cove-accent/5 transition-colors"
            >
              + Add goal
            </button>
          )}
        </div>

        {weeklyGoals.length === 0 && !showGoalForm && (
          <p className="text-xs text-cove-muted py-3 text-center">
            No goals this week. Set a target to work towards.
          </p>
        )}

        {weeklyGoals.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {weeklyGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onUpdate={updateWeeklyGoal}
                onDelete={deleteWeeklyGoal}
              />
            ))}
          </div>
        )}

        {showGoalForm && (
          <div className="mt-2 p-3 bg-cove-offwhite/50 rounded-lg border border-cove-border/50">
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddGoal();
                  if (e.key === "Escape") { setShowGoalForm(false); setNewGoalTitle(""); }
                }}
                placeholder="Goal name (e.g. Exercise 3x)"
                maxLength={100}
                autoFocus
                className="w-full px-3 py-2 text-sm bg-cove-card border border-cove-border rounded-lg focus:border-cove-accent focus:outline-none focus:ring-1 focus:ring-cove-accent/30 text-cove-charcoal placeholder:text-cove-muted"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-cove-muted whitespace-nowrap">Target:</label>
                <input
                  type="number"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(parseInt(e.target.value, 10) || 1)}
                  min={1}
                  max={99}
                  className="w-16 px-2 py-1.5 text-xs text-center bg-cove-card border border-cove-border rounded-lg focus:border-cove-accent focus:outline-none text-cove-charcoal"
                />
                {habits.length > 0 && (
                  <>
                    <label className="text-xs text-cove-muted whitespace-nowrap ml-2">Link to habit:</label>
                    <select
                      value={linkedHabitId}
                      onChange={(e) => setLinkedHabitId(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-xs bg-cove-card border border-cove-border rounded-lg focus:border-cove-accent focus:outline-none text-cove-charcoal"
                    >
                      <option value="">None</option>
                      {habits.map((h) => (
                        <option key={h.id} value={h.id}>{h.title}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => { setShowGoalForm(false); setNewGoalTitle(""); }}
                className="px-3 py-1.5 text-xs text-cove-muted hover:text-cove-charcoal transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!newGoalTitle.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white bg-cove-accent rounded-lg hover:bg-cove-accent-hover transition-colors disabled:opacity-40"
              >
                Add Goal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
