'use client';

import { ReactNode, useState, useEffect, Fragment, forwardRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { VirtuosoGrid } from 'react-virtuoso';

// 0.5: 화면에 요소의 절반이 보이면 감지
// 0: 화면에 요소의 조금이라도 보이면 감지
// 1: 화면에 요소의 완전히 보이면 감지
const INFINITY_SCROLL_THRESHOLD = 0.5;

interface VirtuoInfinityScrollProps<T> {
    /** 렌더링할 데이터 리스트 */
    list?: T[];
    /** 각 아이템을 렌더링하는 함수 */
    item: (itemData: T, index: number) => ReactNode;
    /** 데이터가 없을 때 사용할 문구 */
    emptyText: string;
    /** 무한스크롤 감지 */
    onInView: () => void;
    /** 더 불러올 데이터가 있는지 확인 */
    hasMore?: boolean;
}

export default function VirtuoInfinityScroll<T>({
  list,
  item,
  emptyText,
  onInView,
  hasMore = true,
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
    <Fragment>
      <VirtuosoGrid
        totalCount={list.length}
        useWindowScroll
        computeItemKey={(index) => index} // TODO: 아이템 키 설정
        components={{
          List: forwardRef<HTMLDivElement>((props, ref) => (
            <div {...props} ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" />
          )),
          Item: forwardRef<HTMLDivElement>((props, ref) => (
            <div {...props} ref={ref} />
          ))
        }}
        itemContent={(index) => item(list[index], index)}
      />
      {hasMore ? <div ref={observerRef} className="h-10 w-full" /> : null}
    </Fragment>
  );
}
