type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div data-testid="error-state" className="text-center p-6">
    <p data-testid="error-message">{message || 'Error loading models'}</p>
    {onRetry && (
      <button data-testid="retry-button" onClick={onRetry} className="mt-2 text-primary underline">
        Retry
      </button>
    )}
  </div>
);

export default ErrorState;
