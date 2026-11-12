import { ImSpinner2 } from 'react-icons/im';

interface LoadingSpinnerProps {
  label?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({ label = 'Loading...', fullscreen = false }: LoadingSpinnerProps) {
  return (
    <div className={`d-flex flex-column align-items-center justify-content-center gap-2 ${fullscreen ? 'loading-fullscreen' : 'py-5'}`}>
      <ImSpinner2 className="spin" size={28} />
      <span className="text-muted small">{label}</span>
    </div>
  );
}
