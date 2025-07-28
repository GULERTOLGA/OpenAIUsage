declare module 'react-data-grid' {
  import { ComponentType, ReactNode } from 'react';

  export interface Column<T = any> {
    key: string;
    name: string;
    width?: number;
    renderCell?: (props: { row: T }) => ReactNode;
    sortable?: boolean;
    resizable?: boolean;
  }

  export interface DataGridProps<T = any> {
    columns: Column<T>[];
    rows: T[];
    className?: string;
    style?: React.CSSProperties;
    defaultColumnOptions?: {
      sortable?: boolean;
      resizable?: boolean;
    };
  }

  const DataGrid: ComponentType<DataGridProps>;
  export default DataGrid;
} 