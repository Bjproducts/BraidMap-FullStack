'use client';

import { useState, useEffect } from 'react';
import { GateModal } from '@/components/ui/GateModal';

interface HomeGateTriggerProps {
  totalCount?: number;
}

export function HomeGateTrigger({ totalCount = 121 }: HomeGateTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GateModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      totalCount={totalCount}
    />
  );
}
