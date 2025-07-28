import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import SimpleRouter from './components/SimpleRouter';
import Login from './components/Login';
import { isAuthenticated, setAuthToken, clearAuthToken, getCurrentUser } from './services/api';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('usage');
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      if (auth) {
        setCurrentUser(getCurrentUser());
      }
    };
    
    checkAuth();
  }, []);

  const handleLoginSuccess = (token: string, username: string) => {
    setAuthToken(token, username);
    setAuthenticated(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    clearAuthToken();
    setAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('usage');
  };

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
  };

  const renderMainContent = () => {
    if (currentPage === 'home') {
      return (
        <Container>
          <div className="text-center">
            <h1 className="display-4 mb-4">Welcome! 👋</h1>
            <p className="lead">
              Welcome to OpenAI Usage API Dashboard.
            </p>
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">Hello World! 🌍</h4>
              <p>
                This is a dashboard application developed to track your OpenAI usage and cost data.
              </p>
              <hr />
              <p className="mb-0">
                You can access any section from the top menu.
              </p>
            </div>
          </div>
        </Container>
      );
    }

    return <SimpleRouter currentPage={currentPage} />;
  };

  // Show login page if not authenticated
  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand 
            href="#usage" 
            onClick={(e) => { e.preventDefault(); handleNavClick('usage'); }}
            style={{ cursor: 'pointer' }}
          >
            <strong>OpenAI Usage Dashboard</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                href="#usage" 
                onClick={(e) => { e.preventDefault(); handleNavClick('usage'); }}
                active={currentPage === 'usage'}
              >
                Usage
              </Nav.Link>
              <Nav.Link 
                href="#projects" 
                onClick={(e) => { e.preventDefault(); handleNavClick('projects'); }}
                active={currentPage === 'projects'}
              >
                Projects
              </Nav.Link>
            </Nav>
            <Nav>
              <Navbar.Text className="me-3">
                Welcome, {currentUser}!
              </Navbar.Text>
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      {renderMainContent()}
    </div>
  );
}

export default App; 