import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { toast } from '../../lib/toast';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { queryKeys } from '../../hooks/queryKeys';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

export function ManageCategories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const categoriesQuery = useQuery({
    queryKey: queryKeys.admin.categories,
    queryFn: () => fetchCategories(true),
  });

  const invalidateCategories = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all(true) });
    void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all(false) });
  };

  const createMutation = useMutation({
    mutationFn: (categoryName: string) => createCategory({ name: categoryName }),
    onSuccess: () => {
      setName('');
      invalidateCategories();
      toast.success('Category created');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Create failed'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, categoryName }: { id: string; categoryName: string }) =>
      updateCategory(id, { name: categoryName }),
    onSuccess: () => {
      setEditingId(null);
      invalidateCategories();
      toast.success('Category updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Update failed'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      invalidateCategories();
      toast.success('Category deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Delete failed'));
    },
  });

  const loading = categoriesQuery.isPending;
  const categories = categoriesQuery.data ?? [];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate(name);
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({ id, categoryName: editName });
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="admin-page">
      <form className="card border-0 shadow-sm p-3 mb-4" onSubmit={(e) => void handleCreate(e)}>
        <div className="row g-2 align-items-end">
          <div className="col-md-8">
            <label className="form-label" htmlFor="cat-name">
              New category name
            </label>
            <input
              id="cat-name"
              className="form-control"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100">
              Add category
            </button>
          </div>
        </div>
      </form>

      {loading && <LoadingSpinner label="Loading categories..." />}
      {!loading && categories.length === 0 && <EmptyState title="No categories" />}
      {!loading && categories.length > 0 && (
        <div className="table-responsive card border-0 shadow-sm">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    {editingId === cat._id ? (
                      <input
                        className="form-control form-control-sm"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td className="text-muted small">{cat.slug}</td>
                  <td className="text-end">
                    {editingId === cat._id ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary me-1"
                          onClick={() => void handleUpdate(cat._id)}
                        >
                          Save
                        </button>
                        <button type="button" className="btn btn-sm btn-light" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => {
                            setEditingId(cat._id);
                            setEditName(cat.name);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => void handleDelete(cat._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
