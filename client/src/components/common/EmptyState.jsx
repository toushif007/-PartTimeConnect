import React from 'react';
import { FolderSearch } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No items found',
  description = 'There are no records matching your query at this time.',
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={32} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--slate-800)', marginBottom: '0.4rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
