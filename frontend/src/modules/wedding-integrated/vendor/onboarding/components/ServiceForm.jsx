import { Plus, Trash2 } from "lucide-react";

const ServiceForm = ({ services = [], onAdd, onRemove, onUpdate }) => {
  const lastService = services[services.length - 1];
  const isLastServiceEmpty = lastService ? !lastService.name.trim() : false;

  return (
    <div className="space-y-4">
      {services.map((service, index) => (
        <div
          key={index}
          className="p-4 rounded-2xl bg-muted/50 border border-border space-y-3 animate-wedding-fade-up"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Service {index + 1}
            </span>
            {services.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={service.name}
            onChange={(e) => onUpdate(index, "name", e.target.value)}
            placeholder="Service name (e.g. Pre-Wedding Shoot)"
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <textarea
            rows={2}
            value={service.description}
            onChange={(e) => onUpdate(index, "description", e.target.value)}
            placeholder="Brief description of what this service includes..."
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        disabled={isLastServiceEmpty}
        className={`w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
          isLastServiceEmpty 
            ? "opacity-50 cursor-not-allowed text-muted-foreground bg-muted/20" 
            : "text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-muted/10"
        }`}
      >
        <Plus className="w-4 h-4" />
        Add Another Service
      </button>
    </div>
  );
};

export default ServiceForm;
