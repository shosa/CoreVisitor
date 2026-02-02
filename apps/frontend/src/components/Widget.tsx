'use client';

import { ReactNode } from 'react';

interface WidgetProps {
  title?: string | ReactNode;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function Widget({ title, children, action, className = '' }: WidgetProps) {
  return (
    <div className={`card p-6 h-full flex flex-col ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}
