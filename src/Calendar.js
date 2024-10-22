import React from 'react';
import './Calendar.css'; // Import the associated CSS file

const Calendar = ({ workExperience }) => {
  // Helper function to generate months
  const generateMonths = () => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months;
  };

  // Helper function to get the year range from the work experience
  const getYearRange = (experience) => {
    const startYear = Math.min(...experience.map(item => new Date(item.startDate).getFullYear()));
    const endYear = Math.max(...experience.map(item => new Date(item.endDate).getFullYear()));
    return { startYear, endYear };
  };

  // Calculate the span for each entry in months
  const calculateMonthSpan = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  };

  // Create Calendar Grid with dynamic job spans
  const { startYear, endYear } = getYearRange(workExperience);
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Professional Journey: Work Experience Timeline</h1>
      </div>
      <div className="calendar-grid">
        {/* Loop over each year */}
        {years.map(year => (
          <React.Fragment key={year}>
            <div className="calendar-year">{year}</div>
            {generateMonths().map((month, index) => (
              <div className="calendar-month" key={`${year}-${month}`}>
                {month}
              </div>
            ))}
            {/* Render experience entries for each year */}
            {workExperience
              .filter(entry => new Date(entry.startDate).getFullYear() <= year && new Date(entry.endDate).getFullYear() >= year)
              .map((entry, idx) => {
                const start = new Date(entry.startDate);
                const end = new Date(entry.endDate);
                const startMonth = year === start.getFullYear() ? start.getMonth() + 1 : 1;
                const endMonth = year === end.getFullYear() ? end.getMonth() + 1 : 12;
                const spanMonths = endMonth - startMonth + 1;

                return (
                  <div
                    className="calendar-entry"
                    key={idx}
                    style={{
                      gridColumn: `${startMonth} / span ${spanMonths}`,
                      gridRow: year - startYear + 1
                    }}
                  >
                    <h4>{entry.title}, {entry.company}</h4>
                    <p>{entry.startDate.slice(0, 4)} - {entry.endDate.slice(0, 4)}</p>
                    <ul>
                      {entry.achievements.map((ach, idx) => (
                        <li key={idx}>{ach}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
