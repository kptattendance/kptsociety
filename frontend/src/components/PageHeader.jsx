// Page title with an optional subtitle and actions (e.g. Excel download)
export default function PageHeader({ eyebrow, title, subtitle, actions, className = "" }) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5 sm:mb-6 ${className}`}
    >
      <div>
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-xl sm:text-3xl font-extrabold text-gray-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
