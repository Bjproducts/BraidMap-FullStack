'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HomeSearchBarProps {
  cities: string[];
}

export function HomeSearchBar({ cities }: HomeSearchBarProps) {
  const [query, setQuery]   = useState('');
  const [city, setCity]     = useState('');
  const router              = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city) params.set('city', city);
    const qs = params.toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push((`/directory${qs ? `?${qs}` : ''}`) as any);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col gap-2 sm:flex-row"
      role="search"
    >
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search styles (e.g., knotless braids, locs…)"
        className="flex-1 rounded-md border border-paper/20 bg-paper/10 px-4 py-3 font-sans text-sm text-paper placeholder-paper/30 outline-none transition-colors focus:border-paper/50"
        aria-label="Search styles"
      />
      <select
        value={city}
        onChange={e => setCity(e.target.value)}
        className="rounded-md border border-paper/20 bg-ink px-3 py-3 font-sans text-sm text-paper outline-none transition-colors focus:border-paper/50 sm:w-40"
        aria-label="Filter by city"
      >
        <option value="">All of BC</option>
        {cities.map(c => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-paper px-5 py-3 font-sans text-sm font-semibold text-ink transition-opacity hover:opacity-85"
      >
        Search →
      </button>
    </form>
  );
}
