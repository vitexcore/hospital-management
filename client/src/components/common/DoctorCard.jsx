import { Link } from 'react-router-dom';
import { Star, Clock, Award, Calendar } from 'lucide-react';
import Avatar from './Avatar';

const DoctorCard = ({ doctor }) => {
  const user = doctor?.user;
  const rating = doctor?.rating || 0;

  return (
    <div className="card-hover group cursor-pointer">
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          <Avatar user={user} size="xl" className="ring-4 ring-blue-50" />
          {doctor?.isAvailable && (
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>
        <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
          Dr. {user?.firstName} {user?.lastName}
        </h3>
        <p className="text-teal-600 font-medium text-sm mt-0.5">{doctor?.specialization}</p>
        <p className="text-gray-400 text-xs mt-0.5">{doctor?.department?.name}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Award size={14} className="text-blue-400" />
            <span>{doctor?.experience || 0} years exp.</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className={i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
            ))}
            <span className="text-xs text-gray-400 ml-1">({doctor?.totalReviews || 0})</span>
          </div>
        </div>

        {doctor?.consultationFee > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="text-gray-400">Fee:</span>
            <span className="font-semibold text-gray-800">${doctor.consultationFee}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Link to={`/doctors/${user?._id}`} className="flex-1 text-center py-2 px-3 text-sm font-medium text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
          View Profile
        </Link>
        <Link to={`/book-appointment?doctor=${user?._id}`} className="flex-1 text-center py-2 px-3 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-1.5">
          <Calendar size={13} />Book
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;
