import { useContext } from 'react';
import { BagContext } from '@/contexts/BagContext';

export function useBag() {
  const context = useContext(BagContext);
  if (!context) throw new Error('useBag must be used within BagProvider');
  return context;
}
