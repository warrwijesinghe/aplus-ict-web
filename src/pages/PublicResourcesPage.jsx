import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { queryKeys } from '../api/query-keys.js';
import { resourceApi } from '../api/resource.api.js';
import { serviceUrls } from '../api/service-urls.js';
import { useAuth } from '../auth/auth-context.jsx';
import { EmptyState, InlineError, LoadingSkeleton } from '../components/common/States.jsx';
import { usePageSeo } from '../seo/use-page-seo.js';

const resourceTypeLabels = {
  syllabus: 'Syllabus',
  teachers_guide: 'Teachers Guide',
  past_paper: 'Past Paper',
  short_note: 'Short Note',
  mind_map: 'Mind Map',
  term_paper: 'Term Paper'
};

const labelFor = (value) =>
  resourceTypeLabels[value] ||
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const levelLabel = (value) => value === 'al' ? 'A/L ICT' : value === 'ol' ? 'O/L ICT' : value === 'school' ? 'School ICT' : value;

const mediumLabel = (value) => {
  if (value === 'all') return 'All media';
  return value.charAt(0).toUpperCase() + value.slice(1) + ' medium';
};

const fileSize = (bytes) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '';
  return value >= 1024 * 1024
    ? (value / (1024 * 1024)).toFixed(1) + ' MB'
    : Math.ceil(value / 1024) + ' KB';
};

const initialFilters = {
  search: '',
  academicLevel: '',
  medium: '',
  resourceType: '',
  accessPolicy: ''
};

const mergeFilterOptions = (defaults, dynamic = []) => [...new Set([...defaults, ...dynamic])];

const DownloadAction = ({ item }) => {
  const { isAuthenticated } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  const downloadPaidFile = async () => {
    setError('');
    setIsDownloading(true);
    try {
      const file = await resourceApi.download(item.id);
      const url = window.URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.filename || item.title + '.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message || 'The resource could not be downloaded.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (item.accessPolicy === 'free')
    return (
      <a className="button" href={resourceApi.publicDownloadUrl(item.id)}>
        Download free
      </a>
    );

  if (!isAuthenticated)
    return (
      <a
        className="button secondary"
        href={serviceUrls.auth + '/api/v1/auth/google?returnTo=/resources'}
      >
        Sign in to access
      </a>
    );

  return (
    <div className="locked-download-action">
      <button className="button" disabled={isDownloading} onClick={downloadPaidFile} type="button">
        {isDownloading ? 'Preparing download...' : 'Download paid resource'}
      </button>
      {error ? <p className="download-error">{error}</p> : null}
    </div>
  );
};

const ResourceCard = ({ item }) => (
  <article className="resource-card">
    <div className="resource-card-topline">
      <span className="resource-type">{labelFor(item.resourceType)}</span>
      <span className={'access-badge ' + item.accessPolicy}>
        {item.accessPolicy === 'free' ? 'Free' : 'Paid'}
      </span>
    </div>
    <h2>{item.title}</h2>
    <p className="resource-description">{item.description || 'ICT learning material.'}</p>
    <ul className="resource-meta">
      <li>{levelLabel(item.academicLevel)}</li>
      <li>{mediumLabel(item.medium)}</li>
      {item.filename ? <li>{item.filename}</li> : null}
      {fileSize(item.sizeBytes) ? <li>{fileSize(item.sizeBytes)}</li> : null}
    </ul>
    <DownloadAction item={item} />
  </article>
);

const FilterSelect = ({ label, name, options, value, onChange, format = labelFor }) => (
  <label>
    {label}
    <select name={name} onChange={onChange} value={value}>
      <option value="">All {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {format(option)}
        </option>
      ))}
    </select>
  </label>
);

export const PublicResourcesPage = () => {
  usePageSeo({ path: '/resources' });
  const [filters, setFilters] = useState(initialFilters);
  const query = useQuery({
    queryKey: queryKeys.content.publicDownloads(filters),
    queryFn: ({ signal }) =>
      resourceApi.publicDownloads(
        Object.fromEntries(Object.entries(filters).filter(([, value]) => value)),
        signal
      )
  });
  const data = query.data?.data;
  const items = data?.items || [];
  // Keep A/L and O/L options visible even before the first resource for one
  // level is published. API-supplied values extend these sensible defaults.
  const available = {
    academicLevels: mergeFilterOptions(['al', 'ol'], data?.filters?.academicLevels),
    media: mergeFilterOptions(['sinhala', 'english'], data?.filters?.media?.filter((medium) => medium !== 'tamil' && medium !== 'all')),
    resourceTypes: mergeFilterOptions(
      Object.keys(resourceTypeLabels),
      data?.filters?.resourceTypes
    ),
    accessPolicies: mergeFilterOptions(['free', 'paid'], data?.filters?.accessPolicies)
  };

  const updateFilter = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <>
      <section className="resources-heading">
        <p className="eyebrow">Free ICT learning resources</p>
        <h1>Free Resources for Smarter ICT Learning</h1>
        <p>
          Access useful ICT notes, lesson materials, past-paper support, and revision resources organised by grade and syllabus area.
        </p>
      </section>

      <section aria-label="Resource filters" className="resource-filter-panel">
        <div className="resource-filter-intro">
          <h2>Find the resource you need</h2>
          <p>
            Use one or more filters. Published resource types appear here automatically.
          </p>
        </div>
        <div className="resource-filter-grid">
          <label className="resource-search">
            Search
            <input
              name="search"
              onChange={updateFilter}
              placeholder="For example, Grade 10 spreadsheets"
              type="search"
              value={filters.search}
            />
          </label>
          <FilterSelect
            format={levelLabel}
            label="Learning level"
            name="academicLevel"
            onChange={updateFilter}
            options={available.academicLevels}
            value={filters.academicLevel}
          />
          <FilterSelect
            format={mediumLabel}
            label="Medium"
            name="medium"
            onChange={updateFilter}
            options={available.media}
            value={filters.medium}
          />
          <FilterSelect
            label="Resource type"
            name="resourceType"
            onChange={updateFilter}
            options={available.resourceTypes}
            value={filters.resourceType}
          />
          <FilterSelect
            format={(value) => (value === 'free' ? 'Free downloads' : 'Paid downloads')}
            label="Access"
            name="accessPolicy"
            onChange={updateFilter}
            options={available.accessPolicies}
            value={filters.accessPolicy}
          />
        </div>
        <button className="filter-reset" onClick={() => setFilters(initialFilters)} type="button">
          Clear filters
        </button>
      </section>

      {query.isPending ? <LoadingSkeleton label="Loading resources" /> : null}
      {query.isError ? <InlineError error={query.error} onRetry={query.refetch} /> : null}
      {query.isSuccess && items.length ? (
        <section className="resource-grid" aria-live="polite">
          {items.map((item) => (
            <ResourceCard item={item} key={item.id} />
          ))}
        </section>
      ) : null}
      {query.isSuccess && !items.length ? (
        <EmptyState title="No resources match those filters">
          <p>Clear your filters or choose the school ICT grade range that fits you.</p>
          <button
            className="button secondary"
            onClick={() => setFilters(initialFilters)}
            type="button"
          >
            Clear filters
          </button>
          <p className="pathway-links"><Link to="/school-ict">Grades 6–9</Link><Link to="/ol-ict">Grades 10–11</Link><Link to="/al-ict">Grades 12–13</Link></p>
        </EmptyState>
      ) : null}

      <section className="resources-cta"><div><p className="eyebrow">Keep learning</p><h2>Choose your school ICT grade</h2></div><p className="pathway-links"><Link className="button secondary" to="/school-ict">Grades 6–9</Link><Link className="button secondary" to="/ol-ict">O/L ICT</Link><Link className="button secondary" to="/al-ict">A/L ICT</Link></p></section>
    </>
  );
};
