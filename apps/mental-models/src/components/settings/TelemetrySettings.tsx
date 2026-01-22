// Telemetry visibility and inspection for admins

import { useState, useEffect } from 'react';
import { hasRole } from '../../utils/auth';
import './TelemetrySettings.css';

interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

export const TelemetrySettings: React.FC = () => {
  const [enabled, setEnabled] = useState(true);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [filter, setFilter] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(hasRole('admin'));
    loadEvents();

    // Listen for new events in development
    if (import.meta.env.DEV) {
      const originalLog = console.log;
      console.log = (...args) => {
        if (args[0] === '[Analytics]') {
          const event: TelemetryEvent = {
            event: args[1],
            properties: args[2],
            timestamp: Date.now(),
          };
          setEvents((prev) => [event, ...prev].slice(0, 100));
        }
        originalLog(...args);
      };
    }
  }, []);

  const loadEvents = () => {
    // Load recent events from localStorage or session
    const stored = sessionStorage.getItem('recent_telemetry_events');
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load telemetry events:', error);
      }
    }
  };

  const toggleTelemetry = () => {
    const newState = !enabled;
    setEnabled(newState);
    localStorage.setItem('telemetry_enabled', newState.toString());
  };

  const clearEvents = () => {
    setEvents([]);
    sessionStorage.removeItem('recent_telemetry_events');
  };

  const filteredEvents = events.filter((event) =>
    event.event.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="telemetry-settings">
        <p>Admin access required to view telemetry settings.</p>
      </div>
    );
  }

  return (
    <div className="telemetry-settings">
      <header className="telemetry-header">
        <h2>Telemetry Inspector</h2>
        <p>View and manage analytics event tracking</p>
      </header>

      <section className="telemetry-section">
        <div className="telemetry-controls">
          <div className="control-item">
            <label className="toggle-switch">
              <input type="checkbox" checked={enabled} onChange={toggleTelemetry} />
              <span className="toggle-slider"></span>
            </label>
            <span className="control-label">
              {enabled ? 'Telemetry Enabled' : 'Telemetry Disabled'}
            </span>
          </div>

          <button onClick={clearEvents} className="clear-btn">
            Clear Events
          </button>
        </div>
      </section>

      <section className="telemetry-section">
        <h3>Recent Events ({filteredEvents.length})</h3>

        <div className="event-filter">
          <input
            type="text"
            placeholder="Filter events..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="event-list">
          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <p>No telemetry events captured yet.</p>
              <p className="hint">Interact with the app to see events here.</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-header">
                  <span className="event-name">{event.event}</span>
                  <span className="event-time">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {event.properties && (
                  <div className="event-properties">
                    <pre>{JSON.stringify(event.properties, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="telemetry-section">
        <h3>Event Types Tracked</h3>
        <div className="event-types">
          <span className="event-type">page_view</span>
          <span className="event-type">mental_model_viewed</span>
          <span className="event-type">narrative_viewed</span>
          <span className="event-type">search_performed</span>
          <span className="event-type">filter_applied</span>
          <span className="event-type">bookmark_added</span>
          <span className="event-type">bookmark_removed</span>
          <span className="event-type">note_created</span>
          <span className="event-type">export_triggered</span>
          <span className="event-type">modal_opened</span>
          <span className="event-type">citation_clicked</span>
          <span className="event-type">hero_cta_clicked</span>
        </div>
      </section>
    </div>
  );
};
