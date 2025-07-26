import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner, Badge, Table, Row, Col, ProgressBar, ButtonGroup, Button } from 'react-bootstrap';
import api from '../services/api';
import { Usage as UsageModel, CostsApiResponse } from '../models/usage';
import { ProjectsManager, ProjectsResponse } from '../models/projects';
import { DateRange, getDateRanges, formatDateRange } from '../utils/dateUtils';

const Usage: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageModel | null>(null);
  const [projectsManager, setProjectsManager] = useState<ProjectsManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const [dateRanges] = useState<DateRange[]>(getDateRanges());

  useEffect(() => {
    // Default to "This Month" option
    const defaultRange = dateRanges.find(range => range.label === "This Month");
    setSelectedDateRange(defaultRange || null);
  }, [dateRanges]);

  useEffect(() => {
    if (selectedDateRange) {
      fetchData();
    }
  }, [selectedDateRange]);

  const fetchData = async () => {
    if (!selectedDateRange) return;
    
    try {
      setLoading(true);
      
      // First, fetch projects
      console.log('Fetching projects...');
      const projectsResponse = await api.get<ProjectsResponse>('/projects');
      const projectsManager = new ProjectsManager(projectsResponse.data.data);
      setProjectsManager(projectsManager);
      
      // Then, fetch usage data
      console.log('Fetching usage data...');
      const daysDiff = Math.ceil((selectedDateRange.endTime - selectedDateRange.startTime) / (24 * 60 * 60));
      const limit = Math.max(daysDiff, 31); // At least 31 days, maximum selected range
      
      const usageResponse = await api.get<CostsApiResponse>('/costs', {
        params: {
          start_time: selectedDateRange.startTime,
          end_time: selectedDateRange.endTime,
          group_by: 'project_id',
          limit: limit,
          bucket_width: '1d'
        }
      });

      const usage = new UsageModel(usageResponse.data);
      setUsageData(usage);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('An error occurred while loading data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateInput: string | Date): string => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
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
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading usage data...</p>
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

  if (!usageData || usageData.isEmpty()) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          <Alert.Heading>No Data Found</Alert.Heading>
          <p>
            {selectedDateRange 
              ? `No usage data found for ${selectedDateRange.label} period.`
              : 'No usage data found for the selected period.'
            }
          </p>
        </Alert>
      </Container>
    );
  }

  const totalCost = usageData.getTotalCost();
  const projects = usageData.getProjectsByCost();
  const usageByModel = usageData.getUsageByModel();

  return (
    <Container className="mt-4">
      {/* Date Range Selector */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-2">Date Range</h5>
              {selectedDateRange && (
                <small className="text-muted">
                  {formatDateRange(selectedDateRange.startDate, selectedDateRange.endDate)}
                </small>
              )}
            </div>
            <ButtonGroup>
              {dateRanges.map((range) => (
                <Button
                  key={range.label}
                  variant={selectedDateRange?.label === range.label ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setSelectedDateRange(range)}
                >
                  {range.label}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </Card.Body>
      </Card>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Cost</Card.Title>
              <h3 className="text-primary">{formatCurrency(totalCost)}</h3>
              <small className="text-muted">
                {selectedDateRange?.label || 'Selected period'}
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
                          <Card.Title>Project Count</Card.Title>
            <h3 className="text-success">{usageData.getProjectCount()}</h3>
            <small className="text-muted">Active projects</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
                          <Card.Title>Model Usage</Card.Title>
            <h3 className="text-info">{Object.keys(usageByModel).length}</h3>
            <small className="text-muted">Different models</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      

      {/* Projects Table */}
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Usage by Projects</h5>
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={fetchData}
            >
              Refresh
            </button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-dark">
                <tr>
                  <th>Project Name</th>
                  <th>Project ID</th>
                  <th>Total Cost</th>
                  <th>Daily Average</th>
                  <th>Model Usage</th>
                  <th>Days Count</th>
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
                          {((project.total_cost / totalCost) * 100).toFixed(1)}% of total
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
            {selectedDateRange && (
              <>
                Usage data for {formatDateRange(selectedDateRange.startDate, selectedDateRange.endDate)} period
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Usage; 