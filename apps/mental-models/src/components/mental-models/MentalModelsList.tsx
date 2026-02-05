import ModelCard from './ModelCard';
import SkeletonGrid from './SkeletonGrid';
import ErrorState from './ErrorState';
import type { MentalModel } from '@cascade/types/mental-model';
import './MentalModelsList.css';

type MentalModelsListProps = {
  models?: MentalModel[];
  isLoading?: boolean;
  error?: string | null;
  onSelect: (model: MentalModel) => void;
  onRetry?: () => void;
};

const MentalModelsList = ({
  models = [],
  isLoading = false,
  error = null,
  onSelect,
  onRetry,
}: MentalModelsListProps) => {
  if (isLoading) return <SkeletonGrid isLoading data-testid="loading-state" />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!models.length)
    return (
      <p data-testid="empty-state" className="no-results">
        No models found
      </p>
    );

  return (
    <div data-testid="mental-models-list" className="models-grid">
      {models.map((model) => (
        <ModelCard key={model.id} model={model} onSelect={onSelect} />
      ))}
    </div>
  );
};

export { MentalModelsList };
export default MentalModelsList;
