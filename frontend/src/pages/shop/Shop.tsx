import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiSliders } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CustomSelect } from '../../components/CustomSelect';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Pagination } from '../../components/Pagination';
import { ProductCard } from '../../components/ProductCard';
import { queryKeys } from '../../hooks/queryKeys';
import { useDebounce } from '../../hooks/useDebounce';
import { fetchCategories, fetchProducts } from '../../services/api';
import type { Category, ProductQueryParams } from '../../types';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
];

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = (searchParams.get('sort') as ProductQueryParams['sort']) || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 400);

  const productParams: ProductQueryParams = {
    page,
    limit: 12,
    search: search || undefined,
    category: category || undefined,
    sort,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };

  const categoriesQuery = useQuery({
    queryKey: queryKeys.categories.all(false),
    queryFn: () => fetchCategories(false),
  });

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list(productParams),
    queryFn: () => fetchProducts(productParams),
  });

  useEffect(() => {
    if (debouncedSearch !== search) {
      const next = new URLSearchParams(searchParams);
      if (debouncedSearch) next.set('search', debouncedSearch);
      else next.delete('search');
      next.set('page', '1');
      setSearchParams(next, { replace: true });
    }
  }, [debouncedSearch, search, searchParams, setSearchParams]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setSearchParams(next);
  };

  const products = productsQuery.data?.items ?? [];
  const meta = productsQuery.data?.meta;
  const categories = categoriesQuery.data ?? [];

  return (
    <div className="container py-4 py-lg-5">
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-1">Shop</h1>
        <p className="text-muted mb-0">Browse our full catalog with filters and smart sorting.</p>
      </div>

      <ShopFilters
        categories={categories}
        category={category}
        sort={sort}
        minPrice={minPrice}
        maxPrice={maxPrice}
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        onUpdate={updateParam}
      />

      {productsQuery.isPending && <LoadingSpinner label="Loading products..." />}
      {productsQuery.isError && (
        <EmptyState title="Shop unavailable" description="Failed to load products." />
      )}
      {!productsQuery.isPending && !productsQuery.isError && products.length === 0 && (
        <EmptyState title="No products found" description="Try adjusting your filters or search." />
      )}

      {!productsQuery.isPending && !productsQuery.isError && products.length > 0 && (
        <>
          <div className="row g-4">
            {products.map((product) => (
              <div className="col-6 col-md-4 col-lg-3" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          {meta && <Pagination meta={meta} onPageChange={(p) => updateParam('page', String(p))} />}
        </>
      )}
    </div>
  );
}

function ShopFilters({
  categories,
  category,
  sort,
  minPrice,
  maxPrice,
  searchInput,
  onSearchInput,
  onUpdate,
}: {
  categories: Category[];
  category: string;
  sort: string;
  minPrice: string;
  maxPrice: string;
  searchInput: string;
  onSearchInput: (v: string) => void;
  onUpdate: (key: string, value: string) => void;
}) {
  const categoryOptions = [
    { value: '', label: 'All' },
    ...categories.map((cat) => ({ value: cat._id, label: cat.name })),
  ];

  return (
    <div className="shop-filters mb-4">
      <div className="shop-filters-grid">
        <div className="shop-field shop-field-search">
          <label className="shop-field-label" htmlFor="shop-search">
            Search
          </label>
          <div className="shop-search">
            <FiSearch size={16} className="shop-search-icon" />
            <input
              id="shop-search"
              className="shop-input"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => onSearchInput(e.target.value)}
            />
          </div>
        </div>

        <div className="shop-field">
          <CustomSelect
            label="Category"
            value={category}
            options={categoryOptions}
            onChange={(value) => onUpdate('category', value)}
          />
        </div>

        <div className="shop-field">
          <CustomSelect
            label="Sort"
            value={sort}
            options={sortOptions}
            onChange={(value) => onUpdate('sort', value)}
          />
        </div>

        <div className="shop-field">
          <label className="shop-field-label" htmlFor="min-price">
            Min price
          </label>
          <input
            id="min-price"
            type="number"
            className="shop-input"
            min={0}
            value={minPrice}
            onChange={(e) => onUpdate('minPrice', e.target.value)}
          />
        </div>

        <div className="shop-field">
          <label className="shop-field-label" htmlFor="max-price">
            Max price
          </label>
          <input
            id="max-price"
            type="number"
            className="shop-input"
            min={0}
            value={maxPrice}
            onChange={(e) => onUpdate('maxPrice', e.target.value)}
          />
        </div>
      </div>

      <div className="shop-filters-hint">
        <FiSliders size={14} />
        Refine results using category, price range, and sort order.
      </div>
    </div>
  );
}
