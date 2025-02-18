import React from 'react';

const StatisticsCard = ({ title, value, icon, bgColor = 'bg-primary' }) => {
  return (
    <div className={`card text-white ${bgColor} mb-3`}>
      <div className="card-body d-flex align-items-center justify-content-between">
        <div>
          <h5 className="card-title">{title}</h5>
          <p className="card-text fs-4">{value}</p>
        </div>
        {icon && <div className="fs-1">{icon}</div>}
      </div>
    </div>
  );
};

export default StatisticsCard;
