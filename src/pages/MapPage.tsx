import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ListGroup from '../components/ListGroup';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import ProjectMap from '../components/ProjectMap';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

function MapPage() {
  const [searchParams] = useSearchParams();
  const [category, setCategory] = useState('All');
  const [searchText, setSearchText] = useState(searchParams.get('project') || '');
  const { projects, currentUser } = useApp();
  const canSeeConflicts =
    currentUser?.role === 'super_admin' ||
    currentUser?.role === 'department_officer';

  const categories = [
    'All',
    ...Array.from(new Set(projects.map((project) => project.type))),
  ];

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesCategory = category === 'All' || project.type === category;
        const query = searchText.toLowerCase().trim();
        const matchesSearch =
          !query ||
          `${project.id} ${project.name} ${project.road} ${project.area}`
            .toLowerCase()
            .includes(query);

        return matchesCategory && matchesSearch;
      }),
    [category, projects, searchText],
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="LIVE OPENSTREETMAP"
        title="GIS Project Map"
        description="View real Dhaka locations for infrastructure projects. Super Admin and Department Officers can see conflict information, while Contractors and Citizens share the same public project map view."
      />

      <div className="map-layout">
        <Panel title="Map controls" subtitle="A reusable typed ListGroup component">
          <label className="search-field map-search-field">
            <span>Search road, area, or project</span>
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Example: Mirpur 12"
            />
          </label>

          <ListGroup
            heading="Infrastructure layers"
            items={categories}
            selectedItem={category}
            onSelectItem={(item) => setCategory(item)}
          />

          <div className="filter-summary">
            {filteredProjects.length} project marker
            {filteredProjects.length === 1 ? '' : 's'} visible
          </div>
        </Panel>

        <ProjectMap projects={filteredProjects} showConflicts={canSeeConflicts} />
      </div>

      <div className="map-summary-grid">
        {filteredProjects.map((project) => (
          <article className="map-summary-card" key={project.id}>
            <div>
              <span>{project.area}</span>
              <h3>{project.name}</h3>
              <p>{project.road}</p>
            </div>
            <div className="map-summary-status">
              <StatusBadge status={project.status} />
              {canSeeConflicts && (
                <StatusBadge status={`${project.conflictLevel} conflict`} />
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default MapPage;
