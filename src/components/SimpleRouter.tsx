import React from 'react';
import Projects from './Projects';

interface SimpleRouterProps {
  currentPage: string;
}

const SimpleRouter: React.FC<SimpleRouterProps> = ({ currentPage }) => {
  switch (currentPage) {
    case 'projects':
      return <Projects />;
    default:
      return null;
  }
};

export default SimpleRouter; 