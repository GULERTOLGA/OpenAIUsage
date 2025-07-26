import React, { useState } from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import SimpleRouter from './components/SimpleRouter';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavClick = (page: string) => {
    setCurrentPage(page);
  };

  const renderMainContent = () => {
    if (currentPage === 'home') {
      return (
        <Container>
          <div className="text-center">
            <h1 className="display-4 mb-4">Hoş Geldiniz! 👋</h1>
            <p className="lead">
              OpenAI Usage API Dashboard'una hoş geldiniz.
            </p>
            <div className="alert alert-info" role="alert">
              <h4 className="alert-heading">Hello World! 🌍</h4>
              <p>
                Bu, OpenAI kullanım ve maliyet verilerinizi takip etmek için geliştirilmiş 
                bir dashboard uygulamasıdır.
              </p>
              <hr />
              <p className="mb-0">
                Üst menüden istediğiniz bölüme erişebilirsiniz.
              </p>
            </div>
          </div>
        </Container>
      );
    }

    return <SimpleRouter currentPage={currentPage} />;
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand 
            href="#home" 
            onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
            style={{ cursor: 'pointer' }}
          >
            <strong>OpenAI Usage Dashboard</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                href="#home" 
                onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
                active={currentPage === 'home'}
              >
                Ana Sayfa
              </Nav.Link>
              <Nav.Link 
                href="#usage" 
                onClick={(e) => { e.preventDefault(); handleNavClick('usage'); }}
                active={currentPage === 'usage'}
              >
                Kullanım
              </Nav.Link>
              <Nav.Link 
                href="#billing" 
                onClick={(e) => { e.preventDefault(); handleNavClick('billing'); }}
                active={currentPage === 'billing'}
              >
                Faturalama
              </Nav.Link>
              <NavDropdown title="Maliyetler" id="costs-nav-dropdown">
                <NavDropdown.Item 
                  href="#costs" 
                  onClick={(e) => { e.preventDefault(); handleNavClick('costs'); }}
                >
                  Maliyet Verileri
                </NavDropdown.Item>
                <NavDropdown.Item 
                  href="#projects" 
                  onClick={(e) => { e.preventDefault(); handleNavClick('projects'); }}
                >
                  Projeler
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item 
                  href="#summary" 
                  onClick={(e) => { e.preventDefault(); handleNavClick('summary'); }}
                >
                  Özet
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
            <Nav>
              <Nav.Link 
                href="#health" 
                onClick={(e) => { e.preventDefault(); handleNavClick('health'); }}
                active={currentPage === 'health'}
              >
                Durum
              </Nav.Link>
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