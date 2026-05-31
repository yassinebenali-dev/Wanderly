import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Budget, BudgetCategory } from '@/hooks/useBudget';
import { DollarSign, Save, Loader2, PiggyBank, AlertTriangle, Plus, Minus } from 'lucide-react';
function BudgetEmptyState({
  destination,
  totalBudget,
  onInit,
}: {
  destination: string;
  totalBudget?: number;
  onInit: (total: number) => void;
}) {
  const [manualBudget, setManualBudget] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  if (totalBudget) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <PiggyBank className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Budget Plan Yet</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          Plan how to spend your ${totalBudget} budget for {destination}
        </p>
        <Button variant="hero" onClick={() => onInit(totalBudget)} className="rounded-full">
          <PiggyBank className="h-4 w-4" />
          Plan My Budget
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <PiggyBank className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        What's your budget for {destination}?
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-sm">
        You didn't set a budget during your search. Enter your total trip budget and we'll help you allocate it smartly.
      </p>

      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1500"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = parseInt(inputValue);
                if (!val || val <= 0) {
                  setError('Please enter a valid budget amount');
                  return;
                }
                onInit(val);
              }
            }}
            className="pl-7 pr-4 py-3 w-44 bg-muted/40 rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-card transition-all"
          />
        </div>
        <Button
          variant="hero"
          className="rounded-xl"
          onClick={() => {
            const val = parseInt(inputValue);
            if (!val || val <= 0) {
              setError('Please enter a valid budget amount');
              return;
            }
            onInit(val);
          }}
        >
          <PiggyBank className="h-4 w-4" />
          Plan Budget
        </Button>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      <div className="flex flex-wrap justify-center gap-2 mt-4">
        <p className="text-xs text-muted-foreground w-full mb-1">Quick select:</p>
        {[500, 1000, 1500, 2000, 3000].map((amount) => (
          <button
            key={amount}
            onClick={() => onInit(amount)}
            className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors text-muted-foreground"
          >
            ${amount}
          </button>
        ))}
      </div>
    </div>
  );
}

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

// Individual category row with local input state
function CategoryRow({
  category,
  totalBudget,
  onUpdate,
}: {
  category: BudgetCategory;
  totalBudget: number;
  onUpdate: (name: string, amount: number) => void;
}) {
  const [inputValue, setInputValue] = useState(String(category.allocated));

  // Sync if parent changes (e.g. on load)
  useEffect(() => {
    setInputValue(String(category.allocated));
  }, [category.allocated]);

  const catPercentage = totalBudget > 0
    ? Math.round((category.allocated / totalBudget) * 100)
    : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue);
    const val = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setInputValue(String(val));
    onUpdate(category.name, val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleStep = (delta: number) => {
    const current = parseInt(inputValue) || 0;
    const next = Math.max(0, current + delta);
    setInputValue(String(next));
    onUpdate(category.name, next);
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <span className="font-medium text-foreground">{category.name}</span>
        </div>
        <span className="text-xs text-muted-foreground">{catPercentage}% of total</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Minus button */}
        <button
          onClick={() => handleStep(-50)}
          className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Minus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Input */}
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">$</span>
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onFocus={(e) => e.target.select()}
            className="w-full pl-7 pr-3 py-2.5 bg-muted/40 rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-card transition-all text-center"
          />
        </div>

        {/* Plus button */}
        <button
          onClick={() => handleStep(50)}
          className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>

      <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${category.color}`}
          style={{ width: `${Math.min(catPercentage, 100)}%` }}
        />
      </div>
    </div>
  );
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
    <BudgetEmptyState
      destination={destination}
      totalBudget={totalBudget}
      onInit={onInit}
    />
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

      {/* Warning */}
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
        {budget.categories.map((category) => (
          <CategoryRow
            key={category.name}
            category={category}
            totalBudget={budget.total_budget}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}