import { useQuery } from '@tanstack/react-query';
import { FiArrowRight, FiShield, FiTruck, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ProductCard } from '../../components/ProductCard';
import { queryKeys } from '../../hooks/queryKeys';
import { fetchProducts } from '../../services/api';

const featuredParams = { featured: true, limit: 8, sort: 'popular' as const };

export function Home() {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.products.list(featuredParams),
    queryFn: () => fetchProducts(featuredParams),
    retry: 1,
  });

  const featured = data?.items ?? [];

  return (
    <div>
      <section className="hero-section text-white">
        <div className="container py-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge hero-badge mb-3">
                <FiZap size={14} className="me-1" />
                Smart shopping, simplified
              </span>
              <h1 className="display-5 fw-bold mb-3" style={{ letterSpacing: '-0.04em' }}>
                ShopPilot AI
              </h1>
              <p className="lead mb-4 opacity-90" style={{ maxWidth: '34rem' }}>
                Premium products, fast delivery, and cash on delivery — built for modern shopping across Pakistan.
              </p>
              <Link to="/shop" className="btn btn-light btn-lg fw-semibold" style={{ color: '#0f766e' }}>
                Browse Shop
                <FiArrowRight size={18} className="ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row g-3 mb-5">
          {[
            { icon: FiTruck, title: 'Fast Delivery', text: 'Reliable shipping with transparent tracking updates.' },
            { icon: FiShield, title: 'Secure Checkout', text: 'Protected sessions and verified order processing.' },
            { icon: FiZap, title: 'Quality Picks', text: 'Hand-picked products from top categories.' },
          ].map(({ icon: Icon, title, text }) => (
            <div className="col-md-4" key={title}>
              <div className="feature-card h-100 p-4">
                <Icon className="text-primary mb-2" size={28} />
                <h3 className="h6 fw-semibold">{title}</h3>
                <p className="text-muted small mb-0">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="h3 fw-bold mb-0">Featured Products</h2>
          <Link to="/shop" className="btn btn-outline-primary btn-sm">
            View all
          </Link>
        </div>

        {isPending && <LoadingSpinner label="Loading featured products..." />}
        {isError && (
          <EmptyState title="Unable to load products" description="Could not load featured products." />
        )}
        {!isPending && !isError && featured.length === 0 && (
          <EmptyState title="No featured products yet" description="Check back soon for new arrivals." />
        )}
        {!isPending && !isError && featured.length > 0 && (
          <div className="row g-4">
            {featured.map((product) => (
              <div className="col-6 col-md-4 col-lg-3" key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
