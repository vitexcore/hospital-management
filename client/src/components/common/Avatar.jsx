import { getInitials, getAvatarUrl } from '../../utils';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-2xl'
  };

  const avatarUrl = getAvatarUrl(user?.avatar);
  const initials = getInitials(user?.firstName, user?.lastName);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`${user?.firstName} ${user?.lastName}`}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling?.classList.remove('hidden'); }}
      />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-blue-700 text-white font-semibold flex items-center justify-center flex-shrink-0 ${className}`}>
      {initials || '?'}
    </div>
  );
};

export default Avatar;
