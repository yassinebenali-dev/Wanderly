import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Budget, BudgetCategory } from '@/hooks/useBudget';
import { DollarSign, Save, Loader2, PiggyBank, TrendingUp, AlertTriangle } from 'lucide-react';

interface BudgetViewProps {
  destination: string;
  totalBudget?: number;
  savedDestinationId?: number;
  budget: Budget | null;
  loading: boolean;
  onSave: () => void;
  onUpdate: (name: string, amount: number) => void;
  onInit: (total: number) => void;
  saving: boolean;
  saved: boolean;
  showSaveButton?: boolean;
  getTotalAllocated: () => number;
  getRemaining: () => number;
}

export function BudgetView({
  destination,
  totalBudget,
  savedDestinationId,
  budget,
  loading,
  onSave,
  onUpdate,
  onInit,
  saving,
  saved,
  showSaveButton = false,
  getTotalAllocated,
  getRemaining,
}: BudgetViewProps) {

  const totalAllocated = getTotalAllocated();
  const remaining = getRemaining();
  const percentage = budget ? Math.round((totalAllocated / budget.total_budget) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Loading budget...</p>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <PiggyBank className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Budget Plan Yet</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          {totalBudget
            ? `Plan how to spend your $${totalBudget} budget for ${destination}`
            : `No budget was set for this trip. Add a budget to start planning.`}
        </p>
        {totalBudget && (
          <Button variant="hero" onClick={() => onInit(totalBudget)} className="rounded-full">
            <PiggyBank className="h-4 w-4" />
            Plan My Budget
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Budget Plan for {destination}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Total: ${budget.total_budget}
          </p>
        </div>
        <div className="flex gap-2">
          {savedDestinationId && showSaveButton && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Save Budget
            </Button>
          )}
          {saved && (
            <span className="text-sm text-primary font-medium">✓ Saved!</span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
          <p className="text-xl font-bold text-foreground">${budget.total_budget}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Allocated</p>
          <p className="text-xl font-bold text-primary">${totalAllocated}</p>
        </div>
        <div className={`rounded-xl p-4 border text-center ${remaining < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <p className="text-xs text-muted-foreground mb-1">Remaining</p>
          <p className={`text-xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-green-600'}`}>
            ${remaining}
          </p>
        </div>
      </div>

      {/* Warning if over budget */}
      {remaining < 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">You are ${Math.abs(remaining)} over budget!</p>
        </div>
      )}

      {/* Overall Progress */}
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Budget Used</span>
          <span className={`font-semibold ${percentage > 100 ? 'text-red-500' : 'text-foreground'}`}>
            {percentage}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${percentage > 100 ? 'bg-red-500' : 'bg-primary'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {budget.categories.map((category) => {
          const catPercentage = budget.total_budget > 0
            ? Math.round((category.allocated / budget.total_budget) * 100)
            : 0;

          return (
            <div key={category.name} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.icon}</span>
                  <span className="font-medium text-foreground">{category.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{catPercentage}% of total</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  value={category.allocated}
                  min={0}
                  max={budget.total_budget}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    onUpdate(category.name, val);
                  }}
                  className="flex-1 px-3 py-2 bg-muted/40 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${category.color}`}
                  style={{ width: `${Math.min(catPercentage, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}