'use client';

import { ReactNode, useState, useEffect, forwardRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { VirtuosoGrid } from 'react-virtuoso';

const INFINITY_SCROLL_THRESHOLD = 0.5;

interface VirtuoInfinityScrollProps<T> {
  list?: T[];
  item: (itemData: T, index: number) => ReactNode;
  emptyText: string;
  onInView: () => void;
  hasMore?: boolean;
  layout?: 'grid' | 'flex';
}

export default function VirtuoInfinityScroll<T>({
  list,
  item,
  emptyText,
  onInView,
  hasMore = true,
  layout = 'grid',
}: VirtuoInfinityScrollProps<T>) {
  const [isFetching, setIsFetching] = useState(false);
  const { ref: observerRef, inView } = useInView({
    threshold: INFINITY_SCROLL_THRESHOLD,
  });

  useEffect(() => {
    if (inView && hasMore && !isFetching) {
      setIsFetching(true);
      onInView();
    }
  }, [inView, hasMore, isFetching, onInView]);

  useEffect(() => {
    if (list) {
      setIsFetching(false);
    }
  }, [list]);

  if (!list || list.length === 0) {
    return (
      <div className="flex-auto rounded-lg bg-[#28282a] px-[3.75rem] py-[3.75rem] text-center">
        {emptyText}
      </div>
    );
  }

  return (
    <>
      <VirtuosoGrid
        totalCount={list.length}
        useWindowScroll
        computeItemKey={(index) => index}
        components={{
          List: forwardRef<HTMLDivElement>((props, ref) => (
            <div
              {...props}
              ref={ref}
              className={
                layout === 'grid'
                  ? 'grid grid-cols-1 tab:grid-cols-2 pc:grid-cols-3 gap-4'
                  : 'flex flex-col gap-4'
              }
            />
          )),
          Item: forwardRef<HTMLDivElement>((props, ref) => (
            <div {...props} ref={ref} />
          )),
        }}
        itemContent={(index) => item(list[index], index)}
      />
      {hasMore ? <div ref={observerRef} className="h-10 w-full" /> : null}
    </>
  );
}
