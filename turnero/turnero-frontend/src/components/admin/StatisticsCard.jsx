import React from 'react';
import '/src/components/styles/statisticsCard.css';


const StatisticsCard = ({ title, value, icon, bgColor = 'bg-primary' }) => {
  return (
    <div className={`statistics-card ${bgColor}`}>
      <div>
        <h5 className="card-title">{title}</h5>
        <p className="card-text fs-4">{value}</p>
      </div>
      {icon && <div className="icon">{icon}</div>}
    </div>
  );
};

export default StatisticsCard;
