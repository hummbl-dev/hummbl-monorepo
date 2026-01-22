// Chat Error component for error display
// Migrated from hummbl-io with enhanced UX and TypeScript strict mode

interface ChatErrorProps {
  error: string;
  onClear: () => void;
}

export function ChatError({ error, onClear }: ChatErrorProps) {
  return (
    <div className="chat-error">
      <div className="chat-error-content">
        <span className="chat-error-icon">⚠️</span>
        <span className="chat-error-message">{error}</span>
        <button onClick={onClear} className="chat-error-close" aria-label="Clear error">
          ✕
        </button>
      </div>
    </div>
  );
}
