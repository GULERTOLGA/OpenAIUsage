import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Badge, Table, Form, Pagination } from 'react-bootstrap';
import api from '../services/api';

interface Project {
  id: string;
  object: string;
  created: number;
  updated: number;
  title?: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  archived: boolean;
  organization_id: string;
  permission?: string;
  status?: string;
  created_at?: number;
  archived_at?: number | null;
}

interface ProjectsResponse {
  data: Project[];
  object: string;
  has_more: boolean;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get<ProjectsResponse>('/projects');
      setProjects(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('An error occurred while loading projects.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (project: Project) => {
    if (project.archived) {
      return <Badge bg="secondary">Archived</Badge>;
    }
    if (project.status === 'active') {
      return <Badge bg="success">Active</Badge>;
    }
    return <Badge bg="primary">Active</Badge>;
  };

  const getPermissionBadge = (permission?: string) => {
    switch (permission) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'read_write':
        return <Badge bg="warning" text="dark">Write</Badge>;
      case 'read_only':
        return <Badge bg="info">Read Only</Badge>;
      default:
        return <Badge bg="light" text="dark">Unknown</Badge>;
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => {
    const searchLower = searchTerm.toLowerCase();
    const projectName = (project.title || project.name || '').toLowerCase();
    const projectId = project.id.toLowerCase();
    const projectDesc = (project.description || '').toLowerCase();
    
    return projectName.includes(searchLower) || 
           projectId.includes(searchLower) || 
           projectDesc.includes(searchLower);
  });

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading projects...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Projects</h4>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={fetchProjects}
            >
              Refresh
            </button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Search Filter */}
          <div className="mb-3">
            <Form.Control
              type="text"
              placeholder="Search in projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Project Name</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Permission</th>
                  <th>Created</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {currentProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div>
                        <strong>{project.title || project.name || 'Unnamed Project'}</strong>
                        {project.description && (
                          <div className="text-muted small">{project.description}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <code className="small">{project.id}</code>
                    </td>
                    <td>{getStatusBadge(project)}</td>
                    <td>{getPermissionBadge(project.permission)}</td>
                    <td>{formatDate(project.created || project.created_at || 0)}</td>
                    <td>{formatDate(project.updated || project.created_at || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <span className="me-2">
                  Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
                </span>
                <span className="text-muted">
                  ({filteredProjects.length} projects found)
                </span>
              </div>
              <Pagination>
                <Pagination.First 
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === currentPage}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                })}
                
                <Pagination.Next 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}

          {totalPages <= 1 && (
            <div className="mt-2 text-muted small">
              Total {filteredProjects.length} projects found.
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Projects; 