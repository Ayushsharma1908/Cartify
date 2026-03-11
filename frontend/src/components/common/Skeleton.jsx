import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-card">
      <div className="skeleton aspect-square" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-24 rounded" />
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card space-y-4">
      <div className="flex justify-between">
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>
      <div className="skeleton h-16 w-full rounded" />
      <div className="flex justify-between">
        <div className="skeleton h-5 w-24 rounded" />
        <div className="skeleton h-5 w-28 rounded" />
      </div>
    </div>
  );
}

export default function Spinner({ size = 'md' }) {
  const sizeClass = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return (
    <div className={`${sizeClass} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
}
