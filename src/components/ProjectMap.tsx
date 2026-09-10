import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from 'react-leaflet';
import { useEffect } from 'react';
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

function MapCenterUpdater({ projects }: { projects: Project[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (projects.length === 1 && Array.isArray(projects[0].coordinates) && projects[0].coordinates.length > 0) {
      const coords = projects[0].coordinates;
      // If polyline, use first point. If point, use it directly.
      const target = typeof coords[0] === 'number' ? coords : coords[0];
      map.flyTo(target as [number, number], 16, { duration: 1.5 });
    } else if (projects.length > 1) {
      map.flyTo(dhakaCenter, 12, { duration: 1.5 });
    }
  }, [projects, map]);
  
  return null;
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
        <MapCenterUpdater projects={projects} />
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          maxZoom={21}
        />

        {projects.map((project) => {
          const color = projectColor(project.type);
          const hasPolyline = project.geometryType === 'polyline' && Array.isArray(project.coordinates) && project.coordinates.length > 1;

          return (
            <div key={project.id}>
              {hasPolyline ? (
                <Polyline
                  positions={project.coordinates!}
                  pathOptions={{ color, weight: project.conflictLevel === 'High' ? 6 : 4, opacity: 0.9 }}
                >
                  <Popup minWidth={260}>
                    <div className="map-popup">
                      <span className="map-popup-id">{project.id}</span>
                      <h3>{project.name}</h3>
                      <p>{project.road}, {project.area}</p>
                      <div className="map-popup-status">
                        <StatusBadge status={project.status} />
                        <StatusBadge status={`${project.conflictLevel} conflict`} />
                      </div>
                      <ProgressBar value={project.progress} compact />
                    </div>
                  </Popup>
                </Polyline>
              ) : (
                <CircleMarker
                  center={project.coordinates?.[0] || [project.latitude, project.longitude]}
                  radius={project.conflictLevel === 'High' ? 12 : 9}
                  pathOptions={{
                    color: '#ffffff',
                    weight: 3,
                    fillColor: color,
                    fillOpacity: 0.95,
                  }}
                >
                  <Popup minWidth={260}>
                    <div className="map-popup">
                      <span className="map-popup-id">{project.id}</span>
                      <h3>{project.name}</h3>
                      <p>{project.road}, {project.area}</p>
                      <div className="map-popup-status">
                        <StatusBadge status={project.status} />
                        <StatusBadge status={`${project.conflictLevel} conflict`} />
                      </div>
                      <ProgressBar value={project.progress} compact />
                    </div>
                  </Popup>
                </CircleMarker>
              )}
            </div>
          );
        })}
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
