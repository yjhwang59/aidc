"use client";

export type ServiceOption = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMin: number;
};

type ServiceSelectorProps = {
  services: ServiceOption[];
  selectedId: string | null;
  onSelect: (serviceId: string) => void;
};

export function ServiceSelector({
  services,
  selectedId,
  onSelect,
}: ServiceSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const isSelected = selectedId === service.id;
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              isSelected
                ? "border-accent bg-accent/5 ring-1 ring-accent"
                : "border-brand-100 bg-white hover:border-brand-200"
            }`}
          >
            <p className="font-semibold text-brand-900">{service.title}</p>
            {service.description && (
              <p className="mt-1 text-sm text-brand-600 line-clamp-2">
                {service.description}
              </p>
            )}
            <p className="mt-2 text-xs text-brand-500">
              約 {service.durationMin} 分鐘
            </p>
          </button>
        );
      })}
    </div>
  );
}
