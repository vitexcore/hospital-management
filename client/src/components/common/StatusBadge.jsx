import { getStatusColor } from '../../utils';

const StatusBadge = ({ status, size = 'sm' }) => {
  const sizes = { sm: 'text-xs px-2.5 py-0.5', md: 'text-sm px-3 py-1' };
  const label = status?.replace(/-/g, ' ').replace(/_/g, ' ');
  
  return (
    <span className={`badge font-medium capitalize ${getStatusColor(status)} ${sizes[size]}`}>
      {label || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
