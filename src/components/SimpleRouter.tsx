import React from 'react';
import Projects from './Projects';
import Usage from './Usage';
import ChangePassword from './ChangePassword';

interface SimpleRouterProps {
  currentPage: string;
}

const SimpleRouter: React.FC<SimpleRouterProps> = ({ currentPage }) => {
  switch (currentPage) {
    case 'projects':
      return <Projects />;
    case 'usage':
      return <Usage />;
    case 'change-password':
      return <ChangePassword />;
    default:
      return null;
  }
};

export default SimpleRouter; 