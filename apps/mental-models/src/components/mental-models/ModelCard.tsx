import type { MentalModel } from '@cascade/types/mental-model';

type ModelCardProps = {
  model: MentalModel;
  onSelect: (model: MentalModel) => void;
};

const ModelCard = ({ model, onSelect }: ModelCardProps) => {
  return (
    <div data-testid="model-card" onClick={() => onSelect(model)} className="model-card">
      {/* Header with code */}
      <div className="model-header">
        <span className="model-code">{model.code}</span>
      </div>

      {/* Title */}
      <h3 className="model-name" data-testid="model-name">
        {model.name}
      </h3>

      {/* Description */}
      {model.description && (
        <p className="model-definition" data-testid="model-description">
          {model.description}
        </p>
      )}

      {/* Example */}
      {model.example && <div className="model-example">{model.example}</div>}

      {/* Footer with metadata */}
      <div className="model-footer">
        <div className="model-meta">
          {model.sources && model.sources.length > 0 && (
            <span className="model-sources" title={model.sources.map((s: { name: string }) => s.name).join(', ')}>
              {model.sources.length} {model.sources.length === 1 ? 'source' : 'sources'}
            </span>
          )}
        </div>
        <button
          className="model-action"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(model);
          }}
          aria-label={`View details for ${model.name}`}
        >
          Details →
        </button>
      </div>
    </div>
  );
};

export default ModelCard;
