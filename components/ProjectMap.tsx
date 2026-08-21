import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from 'react-leaflet';
import type { Project } from '../types';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
import styles from './ProjectMap.module.css';

interface ProjectMapProps {
  projects: Project[];
  compact?: boolean;
}

const dhakaCenter: [number, number] = [23.8103, 90.4125];

const categoryColors: Record<string, string> = {
  Road: '#ef4444',
  Water: '#06b6d4',
  Gas: '#f97316',
  Electricity: '#eab308',
  Fiber: '#8b5cf6',
  Drainage: '#14b8a6',
};

function projectColor(type: string) {
  const category = Object.keys(categoryColors).find((key) =>
    type.toLowerCase().includes(key.toLowerCase()),
  );

  return category ? categoryColors[category] : '#64748b';
}

function ProjectMap({ projects, compact = false }: ProjectMapProps) {
  const heightClass = compact ? `${styles.map} map-compact` : styles.map;

  return (
    <div className={styles.mapFrame}>
      <MapContainer
        center={dhakaCenter}
        zoom={12}
        scrollWheelZoom
        className={heightClass}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {projects.map((project) => (
          <CircleMarker
            key={project.id}
            center={[project.latitude, project.longitude]}
            radius={project.conflictLevel === 'High' ? 12 : 9}
            pathOptions={{
              color: '#ffffff',
              weight: 3,
              fillColor: projectColor(project.type),
              fillOpacity: 0.95,
            }}
          >
            <Popup minWidth={260}>
              <div className="map-popup">
                <span className="map-popup-id">{project.id}</span>
                <h3>{project.name}</h3>
                <p>
                  {project.road}, {project.area}
                </p>
                <div className="map-popup-status">
                  <StatusBadge status={project.status} />
                  <StatusBadge status={`${project.conflictLevel} conflict`} />
                </div>
                <ProgressBar value={project.progress} compact />
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className={styles.legend}>
        <strong>Infrastructure layers</strong>
        <div className={styles.legendGrid}>
          {Object.entries(categoryColors).map(([label, color]) => (
            <div className={styles.legendItem} key={label}>
              <span
                className={styles.legendDot}
                style={{ backgroundColor: color }}
              />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectMap;
