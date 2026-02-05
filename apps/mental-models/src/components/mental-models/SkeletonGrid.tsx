type SkeletonGridProps = {
  isLoading: boolean;
  count?: number;
};

const SkeletonGrid = ({ isLoading, count = 6 }: SkeletonGridProps) => {
  if (!isLoading) return null;

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse"
      data-testid="skeleton-grid"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} data-testid="skeleton-card" className="bg-muted rounded-2xl h-32" />
      ))}
    </div>
  );
};

export default SkeletonGrid;
