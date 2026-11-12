import type { PaginationMeta } from '../types';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1).slice(
    Math.max(0, meta.page - 3),
    Math.max(0, meta.page - 3) + 5
  );

  return (
    <nav className="mt-4" aria-label="Pagination">
      <ul className="pagination justify-content-center mb-0">
        <li className={`page-item ${meta.page <= 1 ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
          >
            Previous
          </button>
        </li>
        {pages.map((page) => (
          <li key={page} className={`page-item ${page === meta.page ? 'active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
        <li className={`page-item ${meta.page >= meta.totalPages ? 'disabled' : ''}`}>
          <button
            type="button"
            className="page-link"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
