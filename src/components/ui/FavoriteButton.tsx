'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/utils/cn';
import { toggleFavorite } from '@/lib/actions/favorites';
import { toast } from './Toast';

interface FavoriteButtonProps {
  stylistId: string;
  initialFavorited: boolean;
  className?: string;
}

export function FavoriteButton({
  stylistId,
  initialFavorited,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const result = await toggleFavorite(stylistId);
      if (result.error) {
        toast(result.error, 'error');
        return;
      }
      setFavorited(result.favorited);
      toast(
        result.favorited ? 'Saved to favourites' : 'Removed from favourites',
        'success',
      );
    });
  }

  return (
    <button
      onClick={handleClick}
      aria-label={favorited ? 'Remove from favourites' : 'Save to favourites'}
      aria-pressed={favorited}
      disabled={isPending}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-md border text-sm transition-colors',
        'disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
        favorited
          ? 'border-ink bg-ink text-paper'
          : 'border-g200 bg-paper text-g400 hover:border-g400 hover:text-ink',
        className,
      )}
    >
      {favorited ? '♥' : '♡'}
    </button>
  );
}
