import { motion } from 'framer-motion';
import { PawPrint, Loader2 } from 'lucide-react';

/**
 * Shared loading primitives for the whole app.
 *
 *  <Loader />                 – inline spinner (buttons, small areas)
 *  <SectionLoader />          – centered block loader for a page/card region
 *  <OverlayLoader />          – blocking overlay while an action completes
 *  <TableSkeleton />          – shimmering rows while a table loads
 *  <CardSkeleton />           – shimmering card while a grid loads
 *  <ListSkeleton />           – shimmering stacked rows
 *  <StatSkeleton />           – shimmering KPI tile
 *
 * The full-screen brand loader used for route transitions lives in GlobalLoader.jsx.
 */

// ─── Shimmer base ─────────────────────────────────────────────
const shimmer =
  'relative overflow-hidden bg-slate-200/70 before:absolute before:inset-0 ' +
  'before:-translate-x-full before:animate-[shimmer_1.6s_infinite] ' +
  'before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent';

export function Shimmer({ className = '', style }) {
  return <div className={`${shimmer} ${className}`} style={style} aria-hidden="true" />;
}

// ─── Inline spinner ───────────────────────────────────────────
const SIZES = { xs: 'w-3.5 h-3.5', sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-9 h-9', xl: 'w-12 h-12' };

export default function Loader({ size = 'md', className = '', label }) {
  return (
    <span role="status" aria-live="polite" className={`inline-flex items-center gap-2 ${className}`}>
      <Loader2 className={`${SIZES[size] || SIZES.md} animate-spin text-medical-blue`} />
      {label && <span className="text-sm font-semibold text-gray-500">{label}</span>}
      <span className="sr-only">{label || 'Loading'}</span>
    </span>
  );
}

// ─── Centered block loader (page / card region) ───────────────
export function SectionLoader({ label = 'Loading…', sub, minHeight = 'min-h-[260px]', className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`${minHeight} w-full flex flex-col items-center justify-center gap-5 ${className}`}
    >
      <div className="relative">
        {/* Pulsing halo */}
        <motion.span
          className="absolute inset-0 rounded-3xl bg-medical-blue/15"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-medical-blue to-blue-700 text-white flex items-center justify-center shadow-lg shadow-medical-blue/25"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
            <PawPrint className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </div>

      <div className="text-center">
        <p className="text-sm font-bold text-gray-700 tracking-wide">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>

      {/* Indeterminate progress bar */}
      <div className="relative w-40 h-1 rounded-full bg-slate-200 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-medical-blue to-cyan-400"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

// ─── Blocking overlay (submit / delete in-flight) ─────────────
export function OverlayLoader({ label = 'Please wait…', sub }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="status"
      aria-live="assertive"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.92, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 px-8 py-7 w-full max-w-xs"
      >
        <SectionLoader label={label} sub={sub} minHeight="min-h-0" />
      </motion.div>
    </motion.div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5, className = '' }) {
  return (
    <div role="status" aria-live="polite" className={`w-full ${className}`}>
      <span className="sr-only">Loading table data</span>
      <div className="flex gap-3 px-4 py-3.5 rounded-t-lg bg-medical-blue/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Shimmer key={i} className="h-3.5 flex-1 rounded-full" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 px-4 py-4 border-b border-gray-100 items-center">
          {Array.from({ length: cols }).map((_, c) => (
            <Shimmer key={c} className={`h-3.5 flex-1 rounded-full ${c === 0 ? 'opacity-90' : 'opacity-60'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ lines = 4, className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-3xl bg-white p-8 shadow-xl border-2 border-gray-100 ${className}`}
    >
      <span className="sr-only">Loading card</span>
      <div className="flex items-center justify-between mb-6">
        <Shimmer className="w-12 h-12 rounded-2xl" />
        <div className="text-right space-y-2">
          <Shimmer className="h-6 w-20 rounded-lg ml-auto" />
          <Shimmer className="h-3 w-16 rounded-full ml-auto" />
        </div>
      </div>
      <Shimmer className="h-5 w-2/3 rounded-lg mb-2" />
      <Shimmer className="h-3 w-full rounded-full mb-7" />
      <div className="space-y-3 mb-8">
        {Array.from({ length: lines }).map((_, i) => (
          <Shimmer key={i} className="h-3.5 rounded-full" style={{ width: `${90 - i * 8}%` }} />
        ))}
      </div>
      <Shimmer className="h-12 w-full rounded-2xl" />
    </div>
  );
}

export function ListSkeleton({ rows = 3, className = '' }) {
  return (
    <div role="status" aria-live="polite" className={`space-y-3 ${className}`}>
      <span className="sr-only">Loading list</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-white">
          <Shimmer className="w-11 h-11 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-3.5 w-1/3 rounded-full" />
            <Shimmer className="h-3 w-2/3 rounded-full" />
          </div>
          <Shimmer className="h-7 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4, className = '' }) {
  return (
    <div role="status" aria-live="polite" className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      <span className="sr-only">Loading statistics</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="space-y-2.5 flex-1">
            <Shimmer className="h-3 w-24 rounded-full" />
            <Shimmer className="h-8 w-16 rounded-lg" />
            <Shimmer className="h-2.5 w-20 rounded-full" />
          </div>
          <Shimmer className="w-12 h-12 rounded-2xl shrink-0" />
        </div>
      ))}
    </div>
  );
}
