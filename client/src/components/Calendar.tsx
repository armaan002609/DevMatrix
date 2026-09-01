import { useState } from 'react';

export default function Calendar({ events }: { events: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Create an array of days for the grid
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // Empty slots for days before the 1st
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="glass-panel" style={{ padding: '24px', flex: '1 1 350px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-heading)' }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={prevMonth} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '1rem' }}>&larr;</button>
          <button onClick={nextMonth} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '1rem' }}>&rarr;</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
        {dayNames.map(day => (
          <div key={day} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {day}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} style={{ aspectRatio: '1', padding: '4px' }}></div>;
          }

          // Check if there is an event on this day
          const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
          const hasEvent = events.some(e => new Date(e.date).toDateString() === dateStr);
          
          // Check if it's today
          const isToday = new Date().toDateString() === dateStr;

          return (
            <div 
              key={day} 
              style={{ 
                aspectRatio: '1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: hasEvent || isToday ? 600 : 400,
                backgroundColor: isToday ? 'var(--accent-primary)' : hasEvent ? 'var(--accent-secondary)' : 'transparent',
                color: isToday ? '#fff' : hasEvent ? 'var(--accent-primary)' : 'var(--text-primary)',
                border: hasEvent && !isToday ? '1px solid var(--accent-primary)' : '1px solid transparent',
                cursor: hasEvent ? 'pointer' : 'default',
                transition: 'all 0.2s ease'
              }}
              title={hasEvent ? 'Events scheduled on this day' : ''}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
