'use client';

import Image from 'next/image';

interface LogoProps {
  collapsed?: boolean;
  invert?: boolean;
}

export default function Logo({ collapsed = false, invert = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="CoreVisitor Logo"
        width={32}
        height={32}
        style={{ filter: invert ? 'invert(1)' : 'none' }}
      />
      {!collapsed && (
        <span className="text-lg font-bold">CoreVisitor</span>
      )}
    </div>
  );
}
