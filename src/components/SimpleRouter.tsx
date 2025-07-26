import React from 'react';
import Projects from './Projects';
import Usage from './Usage';

interface SimpleRouterProps {
  currentPage: string;
}

const SimpleRouter: React.FC<SimpleRouterProps> = ({ currentPage }) => {
  switch (currentPage) {
    case 'projects':
      return <Projects />;
    case 'usage':
      return <Usage />;
    default:
      return null;
  }
};

export default SimpleRouter; 