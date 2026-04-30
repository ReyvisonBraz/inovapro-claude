import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  isDragging?: boolean;
}

function SortableItem({ id, children, isDragging }: SortableItemProps) {
  return (
    <div
      className={`${isDragging ? 'opacity-50 z-[1000]' : ''}`}
    >
      {children}
    </div>
  );
}

interface DraggableGridProps {
  items: { id: string; content: React.ReactElement }[];
  onReorder: (items: { id: string; content: React.ReactElement }[]) => void;
  storageKey: string;
}

const STORAGE_KEY_PREFIX = 'v1_stat_cards_';

export const DraggableGrid: React.FC<DraggableGridProps> = ({
  items,
  onReorder,
  storageKey,
}) => {
  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${storageKey}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === items.length) {
          const validIds = new Set(items.map((item) => item.id));
          const allIdsValid = parsed.every((item: { id: string }) => validIds.has(item.id));
          if (allIdsValid) {
            onReorder(parsed);
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [items, onReorder, storageKey]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          layout
        >
          <SortableItem id={item.id}>
            {item.content}
          </SortableItem>
        </motion.div>
      ))}
    </div>
  );
};