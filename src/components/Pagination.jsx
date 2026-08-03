// Reusable pagination. Shows Prev / page numbers / Next; hides itself when there's ≤1 page.
export default function Pagination({ page, total, perPage = 10, onChange }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const go = (p) => onChange(Math.min(Math.max(1, p), totalPages));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <button onClick={() => go(page - 1)} disabled={page === 1}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-50 hover:bg-gray-50">
        Prev
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => go(p)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            p === page ? 'bg-medical-blue text-white' : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}>
          {p}
        </button>
      ))}
      <button onClick={() => go(page + 1)} disabled={page === totalPages}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 disabled:opacity-50 hover:bg-gray-50">
        Next
      </button>
    </div>
  );
}
