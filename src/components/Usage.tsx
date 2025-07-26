import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Badge, Table, Row, Col, ProgressBar } from 'react-bootstrap';
import api from '../services/api';
import { Usage as UsageModel, CostsApiResponse } from '../models/usage';
import { ProjectsManager, ProjectsResponse } from '../models/projects';

const Usage: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageModel | null>(null);
  const [projectsManager, setProjectsManager] = useState<ProjectsManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // First, fetch projects
      console.log('Fetching projects...');
      const projectsResponse = await api.get<ProjectsResponse>('/projects');
      const projectsManager = new ProjectsManager(projectsResponse.data.data);
      setProjectsManager(projectsManager);
      
      // Then, fetch usage data
      console.log('Fetching usage data...');
      const endTime = Math.floor(Date.now() / 1000);
      const startTime = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
      
      const usageResponse = await api.get<CostsApiResponse>('/costs', {
        params: {
          start_time: startTime,
          end_time: endTime,
          group_by: 'project_id',
          limit: 31,
          bucket_width: '1d'
        }
      });

      const usage = new UsageModel(usageResponse.data);
      setUsageData(usage);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
          <p className="mt-2">Kullanım verileri yükleniyor...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Hata!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!usageData || usageData.isEmpty()) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          <Alert.Heading>Veri Bulunamadı</Alert.Heading>
          <p>Son 30 günde kullanım verisi bulunamadı.</p>
        </Alert>
      </Container>
    );
  }

  const totalCost = usageData.getTotalCost();
  const projects = usageData.getProjectsByCost();
  const usageByModel = usageData.getUsageByModel();

  return (
    <Container className="mt-4">
      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Toplam Maliyet</Card.Title>
              <h3 className="text-primary">{formatCurrency(totalCost)}</h3>
              <small className="text-muted">Son 30 gün</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Proje Sayısı</Card.Title>
              <h3 className="text-success">{usageData.getProjectCount()}</h3>
              <small className="text-muted">Aktif projeler</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Model Kullanımı</Card.Title>
              <h3 className="text-info">{Object.keys(usageByModel).length}</h3>
              <small className="text-muted">Farklı modeller</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Model Usage Breakdown */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Model Kullanım Dağılımı</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {Object.entries(usageByModel).map(([model, amount]) => (
              <Col key={model} md={6} lg={4} className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">{model}</span>
                  <span>{formatCurrency(amount)}</span>
                </div>
                <ProgressBar 
                  now={(amount / totalCost) * 100} 
                  className="mt-1"
                  variant="info"
                />
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Projects Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Projelere Göre Kullanım</h5>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={fetchData}
            >
              Yenile
            </button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Proje Adı</th>
                  <th>Proje ID</th>
                  <th>Toplam Maliyet</th>
                  <th>Günlük Ortalama</th>
                  <th>Model Kullanımı</th>
                  <th>Gün Sayısı</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const dailyCosts = project.daily_costs;
                  const averageDailyCost = dailyCosts.length > 0 
                    ? project.total_cost / dailyCosts.length 
                    : 0;
                  
                  // Get unique models used in this project
                  const projectModels = Object.keys(project.models_used);
                  
                  // Get project name from projects manager
                  const projectName = projectsManager?.getProjectName(project.project_id) || project.project_id;

                  return (
                    <tr key={project.project_id}>
                      <td>
                        <div>
                          <strong>{projectName}</strong>
                          {projectsManager?.getProject(project.project_id)?.description && (
                            <div className="text-muted small">
                              {projectsManager.getProject(project.project_id)?.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <code className="small">{project.project_id}</code>
                      </td>
                      <td>
                        <strong>{formatCurrency(project.total_cost)}</strong>
                        <div className="small text-muted">
                          {((project.total_cost / totalCost) * 100).toFixed(1)}% toplam
                        </div>
                      </td>
                      <td>{formatCurrency(averageDailyCost)}</td>
                      <td>
                        {projectModels.map(model => (
                          <Badge key={model} bg="secondary" className="me-1">
                            {model}
                          </Badge>
                        ))}
                      </td>
                      <td>{dailyCosts.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <div className="mt-3 text-muted small">
            Son 30 günlük kullanım verileri - {formatDate(new Date())} tarihine kadar
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Usage; 