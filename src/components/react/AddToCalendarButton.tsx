import { useState } from 'react';
import GeoButton from './GeoButton';
import './AddToCalendarButton.css';

interface AddToCalendarButtonProps {
  eventTitle: string;
  eventDescription?: string;
  location: string;
  startDate: string; // ISO format or Date string
  endDate?: string; // ISO format or Date string
  variant?: 'primary' | 'secondary' | 'warning';
}

export default function AddToCalendarButton({
  eventTitle,
  eventDescription = '',
  location,
  startDate,
  endDate,
  variant = 'primary',
}: AddToCalendarButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Format dates for different calendar services
  const formatGoogleDate = (date: string): string => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const formatICSDate = (date: string): string => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatGoogleDate(startDate);
  const end = endDate ? formatGoogleDate(endDate) : formatGoogleDate(new Date(new Date(startDate).getTime() + 4 * 60 * 60 * 1000).toISOString());

  // Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${start}/${end}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location)}`;

  // Outlook Calendar URL
  const outlookCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventTitle)}&startdt=${new Date(startDate).toISOString()}&enddt=${new Date(endDate || startDate).toISOString()}&body=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(location)}`;

  // Yahoo Calendar URL
  const yahooCalendarUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${encodeURIComponent(eventTitle)}&st=${start}&et=${end}&desc=${encodeURIComponent(eventDescription)}&in_loc=${encodeURIComponent(location)}`;

  // AOL Calendar URL (uses same format as Yahoo since AOL calendar is powered by Yahoo)
  const aolCalendarUrl = `https://calendar.aol.com/?v=60&view=d&type=20&title=${encodeURIComponent(eventTitle)}&st=${start}&et=${end}&desc=${encodeURIComponent(eventDescription)}&in_loc=${encodeURIComponent(location)}`;

  const handleDownloadICS = () => {
    const icsStart = formatICSDate(startDate);
    const icsEnd = endDate ? formatICSDate(endDate) : formatICSDate(new Date(new Date(startDate).getTime() + 4 * 60 * 60 * 1000).toISOString());

    // Create ICS file content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Rachel & Tim Wedding//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${icsStart}`,
      `DTEND:${icsEnd}`,
      `DTSTAMP:${formatICSDate(new Date().toISOString())}`,
      `UID:${Date.now()}@rachelandtim.fun`,
      `SUMMARY:${eventTitle}`,
      `DESCRIPTION:${eventDescription.replace(/\n/g, '\\n')}`,
      `LOCATION:${location}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Wedding tomorrow!',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    // Create blob and download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rachel-and-tim-wedding.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDropdown(false);
  };

  return (
    <div className="add-to-calendar-wrapper">
      <GeoButton onClick={() => setShowDropdown(!showDropdown)} variant={variant}>
        📅 Add to Calendar
      </GeoButton>
      
      {showDropdown && (
        <div className="calendar-dropdown geo-box-raised">
          <button
            className="calendar-option"
            onClick={() => {
              window.open(googleCalendarUrl, '_blank');
              setShowDropdown(false);
            }}
          >
            <span className="calendar-icon">📅</span>
            Google Calendar
          </button>
          
          <button
            className="calendar-option"
            onClick={() => {
              window.open(outlookCalendarUrl, '_blank');
              setShowDropdown(false);
            }}
          >
            <span className="calendar-icon">📧</span>
            Outlook Calendar
          </button>
          
          <button
            className="calendar-option"
            onClick={() => {
              window.open(yahooCalendarUrl, '_blank');
              setShowDropdown(false);
            }}
          >
            <span className="calendar-icon">📮</span>
            Yahoo Calendar
          </button>
          
          <button
            className="calendar-option"
            onClick={() => {
              window.open(aolCalendarUrl, '_blank');
              setShowDropdown(false);
            }}
          >
            <span className="calendar-icon">💿</span>
            AOL Calendar
          </button>
          
          <button
            className="calendar-option"
            onClick={handleDownloadICS}
          >
            <span className="calendar-icon">💾</span>
            Download ICS (Apple/Other)
          </button>
          
          <button
            className="calendar-option calendar-cancel"
            onClick={() => setShowDropdown(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// Made with Bob