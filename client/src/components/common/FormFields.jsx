import { Search } from 'lucide-react';

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {Icon && (
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-gray-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
    {description && <p className="text-gray-400 text-sm mb-4 max-w-sm">{description}</p>}
    {action}
  </div>
);

export const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field pl-9 py-2 text-sm"
    />
  </div>
);

export const SelectField = ({ label, name, value, onChange, options, required, error, className = '' }) => (
  <div className={className}>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <select name={name} value={value} onChange={onChange}
      className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''}`}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required, error, disabled, className = '', ...rest }) => (
  <div className={className}>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required} disabled={disabled}
      className={`input-field ${error ? 'border-red-500 focus:ring-red-500' : ''} ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}`}
      {...rest}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export const TextareaField = ({ label, name, value, onChange, placeholder, required, error, rows = 3, className = '' }) => (
  <div className={className}>
    {label && <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>}
    <textarea
      name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required} rows={rows}
      className={`input-field resize-none ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);
