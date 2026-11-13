import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '../../lib/toast';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { queryKeys } from '../../hooks/queryKeys';
import { useDebounce } from '../../hooks/useDebounce';
import { fetchCustomers, toggleCustomerActive } from '../../services/api';
import type { PaginationMeta, User } from '../../types';
import { getErrorMessage } from '../../utils/errors';

export function ManageCustomers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: queryKeys.admin.customers(page, debouncedSearch),
    queryFn: () => fetchCustomers(page, 20, debouncedSearch || undefined),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => toggleCustomerActive(id, isActive),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData<{ items: User[]; meta: PaginationMeta }>(
        queryKeys.admin.customers(page, debouncedSearch),
        (current) => {
          if (!current) return current;
          return {
            ...current,
            items: current.items.map((c) => (c._id === id ? updated : c)),
          };
        }
      );
      toast.success('Customer updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Update failed'));
    },
  });

  const loading = customersQuery.isPending;
  const customers = customersQuery.data?.items ?? [];
  const meta = customersQuery.data?.meta;

  const toggleActive = (customer: User) => {
    toggleMutation.mutate({ id: customer._id, isActive: !customer.isActive });
  };

  return (
    <div className="admin-page">
      <input
        className="form-control mb-3"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {loading && <LoadingSpinner label="Loading customers..." />}
      {!loading && customers.length === 0 && <EmptyState title="No customers found" />}
      {!loading && customers.length > 0 && (
        <div className="table-responsive card border-0 shadow-sm">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td className="fw-semibold">{customer.name}</td>
                  <td>{customer.email}</td>
                  <td className="small text-muted">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={`badge ${customer.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => void toggleActive(customer)}
                    >
                      {customer.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {meta && <Pagination meta={meta} onPageChange={setPage} />}
    </div>
  );
}
