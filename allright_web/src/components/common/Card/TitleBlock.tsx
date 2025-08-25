interface TitleBlockProps {
  author: string;
  location: string; // TODO: 네이버 API 연동하여 실제 근무 헬스장 위치 지정
  className?: string;
}

export const TitleBlock = ({ author, location, className = '' }: TitleBlockProps) => {
  return (
    <div className={`${className}`}>
      <p className="text-lg font-semibold mb-2">
        {author}
      </p>
      <p className="text-sm">
        {location}
      </p>
    </div>
  );
};