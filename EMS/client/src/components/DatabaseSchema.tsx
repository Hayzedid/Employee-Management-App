import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, Table, Key, Link, Search, Info, BarChart3, Zap } from 'lucide-react';

interface TableInfo {
  table_name: string;
  table_type: string;
  table_schema: string;
}

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string;
  character_maximum_length: number;
  is_primary_key: boolean;
  is_foreign_key: boolean;
}

interface ForeignKey {
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  constraint_name: string;
}

interface IndexInfo {
  tablename: string;
  indexname: string;
  indexdef: string;
}

interface Constraint {
  table_name: string;
  constraint_name: string;
  constraint_type: string;
  check_clause: string;
}

interface SchemaData {
  tables: TableInfo[];
  columns: ColumnInfo[];
  foreign_keys: ForeignKey[];
  indexes: IndexInfo[];
  constraints: Constraint[];
  detailed_columns: ColumnInfo[];
  performance_stats: any[];
  index_stats: any[];
}

const DatabaseSchema: React.FC = () => {
  const [schemaData, setSchemaData] = useState<SchemaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'tables' | 'relationships' | 'indexes' | 'constraints' | 'performance'>('tables');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => {
    fetchSchemaData();
  }, []);

  const fetchSchemaData = async () => {
    try {
      setLoading(true);
      const [schemaResponse, detailsResponse] = await Promise.all([
        axios.get('/api/analytics/schema-info'),
        axios.get('/api/analytics/database-details')
      ]);

      if ((schemaResponse.data as any).success && (detailsResponse.data as any).success) {
        setSchemaData({
          ...(schemaResponse.data as any).data,
          ...(detailsResponse.data as any).data
        });
      } else {
        setError('Failed to fetch schema information');
      }
    } catch (err) {
      setError('Error loading database schema');
      console.error('Schema fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTableColumns = (tableName: string) => {
    if (!schemaData) return [];
    return schemaData.detailed_columns.filter(col => col.table_name === tableName);
  };

  const getTableForeignKeys = (tableName: string) => {
    if (!schemaData) return [];
    return schemaData.foreign_keys.filter(fk => fk.table_name === tableName);
  };

  const getTableIndexes = (tableName: string) => {
    if (!schemaData) return [];
    return schemaData.indexes.filter(idx => idx.tablename === tableName);
  };

  const getTableConstraints = (tableName: string) => {
    if (!schemaData) return [];
    return schemaData.constraints.filter(constraint => constraint.table_name === tableName);
  };

  const filteredTables = schemaData?.tables.filter(table =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const renderTablesView = () => (
    <div className="schema-tables-grid">
      {filteredTables.map(table => {
        const columns = getTableColumns(table.table_name);
        const foreignKeys = getTableForeignKeys(table.table_name);
        const indexes = getTableIndexes(table.table_name);
        const constraints = getTableConstraints(table.table_name);

        return (
          <div 
            key={table.table_name} 
            className={`schema-table-card ${selectedTable === table.table_name ? 'selected' : ''}`}
            onClick={() => setSelectedTable(selectedTable === table.table_name ? null : table.table_name)}
          >
            <div className="table-header">
              <div className="table-title">
                <Table size={20} />
                <h3>{table.table_name}</h3>
              </div>
              <div className="table-stats">
                <span className="stat">{columns.length} columns</span>
                <span className="stat">{foreignKeys.length} FKs</span>
                <span className="stat">{indexes.length} indexes</span>
              </div>
            </div>

            {selectedTable === table.table_name && (
              <div className="table-details">
                <div className="columns-section">
                  <h4><Key size={16} /> Columns</h4>
                  <div className="columns-list">
                    {columns.map(column => (
                      <div key={column.column_name} className="column-item">
                        <div className="column-info">
                          <span className={`column-name ${column.is_primary_key ? 'primary-key' : ''} ${column.is_foreign_key ? 'foreign-key' : ''}`}>
                            {column.column_name}
                          </span>
                          <span className="column-type">{column.data_type}</span>
                          {column.character_maximum_length && (
                            <span className="column-length">({column.character_maximum_length})</span>
                          )}
                        </div>
                        <div className="column-flags">
                          {column.is_primary_key && <span className="flag pk">PK</span>}
                          {column.is_foreign_key && <span className="flag fk">FK</span>}
                          {column.is_nullable === 'NO' && <span className="flag nn">NOT NULL</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {foreignKeys.length > 0 && (
                  <div className="relationships-section">
                    <h4><Link size={16} /> Foreign Keys</h4>
                    <div className="relationships-list">
                      {foreignKeys.map(fk => (
                        <div key={fk.constraint_name} className="relationship-item">
                          <span className="relationship-text">
                            {fk.column_name} → {fk.foreign_table_name}.{fk.foreign_column_name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {indexes.length > 0 && (
                  <div className="indexes-section">
                    <h4><Zap size={16} /> Indexes</h4>
                    <div className="indexes-list">
                      {indexes.map(index => (
                        <div key={index.indexname} className="index-item">
                          <span className="index-name">{index.indexname}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {constraints.length > 0 && (
                  <div className="constraints-section">
                    <h4><Info size={16} /> Constraints</h4>
                    <div className="constraints-list">
                      {constraints.map(constraint => (
                        <div key={constraint.constraint_name} className="constraint-item">
                          <span className="constraint-type">{constraint.constraint_type}</span>
                          <span className="constraint-name">{constraint.constraint_name}</span>
                          {constraint.check_clause && (
                            <div className="constraint-clause">{constraint.check_clause}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderRelationshipsView = () => (
    <div className="relationships-view">
      <div className="relationships-header">
        <h3>Database Relationships</h3>
        <p>Foreign key relationships between tables</p>
      </div>
      <div className="relationships-grid">
        {schemaData?.foreign_keys.map(fk => (
          <div key={fk.constraint_name} className="relationship-card">
            <div className="relationship-source">
              <Table size={16} />
              <span>{fk.table_name}</span>
              <span className="column">{fk.column_name}</span>
            </div>
            <div className="relationship-arrow">
              <Link size={20} />
            </div>
            <div className="relationship-target">
              <Table size={16} />
              <span>{fk.foreign_table_name}</span>
              <span className="column">{fk.foreign_column_name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIndexesView = () => (
    <div className="indexes-view">
      <div className="indexes-header">
        <h3>Database Indexes</h3>
        <p>Performance optimization indexes across all tables</p>
      </div>
      <div className="indexes-list">
        {schemaData?.indexes.map(index => (
          <div key={index.indexname} className="index-card">
            <div className="index-header">
              <div className="index-title">
                <Zap size={16} />
                <span className="index-name">{index.indexname}</span>
              </div>
              <span className="table-name">{index.tablename}</span>
            </div>
            <div className="index-definition">
              <code>{index.indexdef}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConstraintsView = () => (
    <div className="constraints-view">
      <div className="constraints-header">
        <h3>Database Constraints</h3>
        <p>Data integrity rules and validation constraints</p>
      </div>
      <div className="constraints-by-type">
        {['PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE', 'CHECK'].map(type => {
          const constraintsOfType = schemaData?.constraints.filter(c => c.constraint_type === type) || [];
          if (constraintsOfType.length === 0) return null;

          return (
            <div key={type} className="constraint-type-section">
              <h4>{type} Constraints ({constraintsOfType.length})</h4>
              <div className="constraints-list">
                {constraintsOfType.map(constraint => (
                  <div key={constraint.constraint_name} className="constraint-card">
                    <div className="constraint-header">
                      <span className="constraint-name">{constraint.constraint_name}</span>
                      <span className="table-name">{constraint.table_name}</span>
                    </div>
                    {constraint.check_clause && (
                      <div className="constraint-clause">
                        <code>{constraint.check_clause}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderPerformanceView = () => (
    <div className="performance-view">
      <div className="performance-header">
        <h3>Database Performance Statistics</h3>
        <p>Table usage statistics and index performance metrics</p>
      </div>
      
      <div className="performance-sections">
        <div className="table-stats-section">
          <h4>Table Statistics</h4>
          <div className="stats-grid">
            {schemaData?.performance_stats.map(stat => (
              <div key={stat.tablename} className="stat-card">
                <div className="stat-header">
                  <Table size={16} />
                  <span>{stat.tablename}</span>
                </div>
                <div className="stat-metrics">
                  <div className="metric">
                    <span className="label">Live Tuples:</span>
                    <span className="value">{stat.live_tuples?.toLocaleString() || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Inserts:</span>
                    <span className="value">{stat.inserts?.toLocaleString() || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Updates:</span>
                    <span className="value">{stat.updates?.toLocaleString() || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Deletes:</span>
                    <span className="value">{stat.deletes?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="index-stats-section">
          <h4>Index Usage Statistics</h4>
          <div className="index-stats-grid">
            {schemaData?.index_stats.map(stat => (
              <div key={stat.indexname} className="index-stat-card">
                <div className="index-stat-header">
                  <Zap size={16} />
                  <span>{stat.indexname}</span>
                </div>
                <div className="index-stat-metrics">
                  <div className="metric">
                    <span className="label">Reads:</span>
                    <span className="value">{stat.idx_tup_read?.toLocaleString() || 0}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Fetches:</span>
                    <span className="value">{stat.idx_tup_fetch?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <Database className="loading-icon" size={48} />
        <p>Loading database schema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={fetchSchemaData} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="database-schema">
      <div className="schema-header">
        <div className="header-content">
          <div className="title-section">
            <Database size={32} />
            <div>
              <h1>Database Schema</h1>
              <p>Complete PostgreSQL database structure and relationships</p>
            </div>
          </div>
          <div className="schema-stats">
            <div className="stat">
              <span className="stat-value">{schemaData?.tables.length || 0}</span>
              <span className="stat-label">Tables</span>
            </div>
            <div className="stat">
              <span className="stat-value">{schemaData?.foreign_keys.length || 0}</span>
              <span className="stat-label">Relationships</span>
            </div>
            <div className="stat">
              <span className="stat-value">{schemaData?.indexes.length || 0}</span>
              <span className="stat-label">Indexes</span>
            </div>
            <div className="stat">
              <span className="stat-value">{schemaData?.constraints.length || 0}</span>
              <span className="stat-label">Constraints</span>
            </div>
          </div>
        </div>
      </div>

      <div className="schema-controls">
        <div className="view-tabs">
          <button 
            className={`tab-button ${activeView === 'tables' ? 'active' : ''}`}
            onClick={() => setActiveView('tables')}
          >
            <Table size={16} />
            Tables
          </button>
          <button 
            className={`tab-button ${activeView === 'relationships' ? 'active' : ''}`}
            onClick={() => setActiveView('relationships')}
          >
            <Link size={16} />
            Relationships
          </button>
          <button 
            className={`tab-button ${activeView === 'indexes' ? 'active' : ''}`}
            onClick={() => setActiveView('indexes')}
          >
            <Zap size={16} />
            Indexes
          </button>
          <button 
            className={`tab-button ${activeView === 'constraints' ? 'active' : ''}`}
            onClick={() => setActiveView('constraints')}
          >
            <Info size={16} />
            Constraints
          </button>
          <button 
            className={`tab-button ${activeView === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveView('performance')}
          >
            <BarChart3 size={16} />
            Performance
          </button>
        </div>

        {activeView === 'tables' && (
          <div className="search-section">
            <div className="search-input">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="schema-content">
        {activeView === 'tables' && renderTablesView()}
        {activeView === 'relationships' && renderRelationshipsView()}
        {activeView === 'indexes' && renderIndexesView()}
        {activeView === 'constraints' && renderConstraintsView()}
        {activeView === 'performance' && renderPerformanceView()}
      </div>
    </div>
  );
};

export default DatabaseSchema;
