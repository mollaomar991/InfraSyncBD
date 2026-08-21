import { useMemo, useState } from 'react';
import ListGroup from '../components/ListGroup';
import PageHeader from '../components/PageHeader';
import Panel from '../components/Panel';
import ProjectMap from '../components/ProjectMap';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';

function MapPage() {
  const [category, setCategory] = useState('All');
  const [searchText, setSearchText] = useState('');
  const { projects, currentUser } = useApp();

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
          `${project.name} ${project.road} ${project.area}`
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
        description="View real Dhaka locations for infrastructure projects. Authorized users see project coordination information while citizens see only public project and road-status details."
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

        <ProjectMap projects={filteredProjects} />
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
              {currentUser?.role !== 'citizen' && (
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
