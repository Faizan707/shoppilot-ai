import type { IconType } from 'react-icons';
import { FiInbox } from 'react-icons/fi';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: IconType;
}

export function EmptyState({ title, description, action, icon: Icon = FiInbox }: EmptyStateProps) {
  return (
    <div className="text-center py-5 px-3">
      <div className="empty-icon mx-auto mb-3">
        <Icon size={26} />
      </div>
      <h3 className="h5 fw-semibold mb-1">{title}</h3>
      {description && <p className="text-muted mb-3">{description}</p>}
      {action}
    </div>
  );
}
