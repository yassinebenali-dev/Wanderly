import { Button } from '@/components/ui/button';
import { Checklist } from '@/hooks/useChecklist';
import {
  FileText, Shirt, Heart, Smartphone, CreditCard,
  CheckSquare, Square, Loader2, Sparkles, Save,
  AlertCircle, Info, CheckCircle
} from 'lucide-react';

interface ChecklistViewProps {
  destination: string;
  interests?: string[];
  budget?: number;
  savedDestinationId?: number;
  checklist: Checklist | null;
  loading: boolean;
  onGenerate: () => void;
  onSave: () => void;
  onToggle: (categoryName: string, itemId: string) => void;
  saving: boolean;
  saved: boolean;
  showSaveButton?: boolean;
}

const iconMap: Record<string, any> = {
  'file-text': FileText,
  'shirt': Shirt,
  'heart': Heart,
  'smartphone': Smartphone,
  'credit-card': CreditCard,
};

const priorityConfig = {
  high: { color: 'text-red-500', bg: 'bg-red-50', icon: AlertCircle, label: 'High' },
  medium: { color: 'text-amber-500', bg: 'bg-amber-50', icon: Info, label: 'Medium' },
  low: { color: 'text-green-500', bg: 'bg-green-50', icon: CheckCircle, label: 'Low' },
};

export function ChecklistView({
  destination,
  checklist,
  loading,
  onGenerate,
  onSave,
  onToggle,
  saving,
  saved,
  savedDestinationId,
  showSaveButton = false,
}: ChecklistViewProps) {

  const getProgress = () => {
    if (!checklist) return { total: 0, checked: 0 };
    const allItems = checklist.categories.flatMap(c => c.items);
    return {
      total: allItems.length,
      checked: allItems.filter(i => i.checked).length,
    };
  };

  const { total, checked } = getProgress();
  const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

  if (!checklist && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Checklist Yet</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          Generate a personalized preparation checklist for your trip to {destination}
        </p>
        <Button variant="hero" onClick={onGenerate} className="rounded-full">
          <Sparkles className="h-4 w-4" />
          Generate Checklist
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Generating your preparation checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Preparation Checklist for {destination}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {checked}/{total} items completed
          </p>
        </div>
        <div className="flex gap-2">
          {savedDestinationId && showSaveButton && checklist && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Save Checklist
            </Button>
          )}
          {saved && (
            <span className="text-sm text-primary font-medium">✓ Saved!</span>
          )}
          <Button
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={onGenerate}
            disabled={loading}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            Regenerate
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-semibold text-foreground">{percentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {checklist!.categories.map((category) => {
          const IconComponent = iconMap[category.icon] || FileText;
          const categoryChecked = category.items.filter(i => i.checked).length;

          return (
            <div key={category.name} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">{category.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {categoryChecked}/{category.items.length}
                </span>
              </div>

              <div className="divide-y divide-border/30">
                {category.items.map((item) => {
                  const priority = priorityConfig[item.priority] || priorityConfig.medium;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors cursor-pointer ${item.checked ? 'opacity-60' : ''}`}
                      onClick={() => onToggle(category.name, item.id)}
                    >
                      {item.checked
                        ? <CheckSquare className="h-5 w-5 text-primary flex-shrink-0" />
                        : <Square className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      }
                      <span className={`flex-1 text-sm ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {item.text}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${priority.bg} ${priority.color}`}>
                        {priority.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}