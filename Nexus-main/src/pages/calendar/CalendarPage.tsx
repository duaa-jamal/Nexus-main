import '../../styles/calendar.css';
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Plus, X, Check, Clock } from 'lucide-react';

// ── Types ──
interface MeetingRequest {
  id: string;
  title: string;
  from: string;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
}

// ── Seed data ──────────────────────────────────────────────────────────────
const initialEvents: EventInput[] = [
  {
    id: '1',
    title: 'Investor Call – Arham Ventures',
    start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T10:00:00',
    end:   new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T11:00:00',
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  {
    id: '2',
    title: 'Due Diligence Review',
    start: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0] + 'T14:00:00',
    end:   new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0] + 'T15:30:00',
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
];

const initialRequests: MeetingRequest[] = [
  {
    id: 'r1',
    title: 'Product Demo Session',
    from: 'Sarah (Investor)',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toLocaleDateString(),
    time: '3:00 PM',
    status: 'pending',
  },
  {
    id: 'r2',
    title: 'Partnership Discussion',
    from: 'Ahmed (Entrepreneur)',
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString(),
    time: '11:00 AM',
    status: 'pending',
  },
];

// ── Modal ──────────────────────────────────────────────────────────────────
interface AddEventModalProps {
  selectedDate: string;
  onClose: () => void;
  onSave: (title: string, start: string, end: string) => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ selectedDate, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime]     = useState('10:00');

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title, `${selectedDate}T${startTime}:00`, `${selectedDate}T${endTime}:00`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Add Availability Slot</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Available for calls"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="text"
              value={selectedDate}
              readOnly
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} leftIcon={<Plus size={16} />}>Save Slot</Button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
export const CalendarPage: React.FC = () => {
  const [events, setEvents]         = useState<EventInput[]>(initialEvents);
  const [requests, setRequests]     = useState<MeetingRequest[]>(initialRequests);
  const [showModal, setShowModal]   = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [clickedEvent, setClickedEvent] = useState<EventInput | null>(null);

  // Click on empty date cell → open add-slot modal
  const handleDateSelect = (arg: DateSelectArg) => {
    setSelectedDate(arg.startStr.split('T')[0]);
    setShowModal(true);
  };

  // Click on existing event → show quick info
  const handleEventClick = (arg: EventClickArg) => {
    setClickedEvent({
      id:    arg.event.id,
      title: arg.event.title,
      start: arg.event.startStr,
      end:   arg.event.endStr,
      backgroundColor: arg.event.backgroundColor,
    });
  };

  const handleSaveEvent = (title: string, start: string, end: string) => {
    const newEvent: EventInput = {
      id: Date.now().toString(),
      title,
      start,
      end,
      backgroundColor: '#7c3aed',
      borderColor: '#7c3aed',
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleRequest = (id: string, action: 'accepted' | 'declined') => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: action } : r)
    );

    // If accepted → add to calendar
    if (action === 'accepted') {
      const req = requests.find(r => r.id === id);
      if (req) {
        setEvents(prev => [
          ...prev,
          {
            id: `accepted-${id}`,
            title: `${req.title} (${req.from})`,
            start: new Date().toISOString().split('T')[0] + 'T' + convertTo24(req.time),
            backgroundColor: '#10b981',
            borderColor: '#10b981',
          },
        ]);
      }
    }
  };

  const convertTo24 = (time12: string) => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes]   = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = String(+hours + 12);
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours}:${minutes}:00`;
  };

  const statusBadge = (status: MeetingRequest['status']) => {
    if (status === 'accepted') return <Badge variant="success" size="sm">Accepted</Badge>;
    if (status === 'declined') return <Badge variant="error"  size="sm">Declined</Badge>;
    return <Badge variant="warning" size="sm">Pending</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Calendar</h1>
          <p className="text-gray-600">Manage your availability and scheduled meetings</p>
        </div>
        <Button
          leftIcon={<Plus size={18} />}
          onClick={() => {
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setShowModal(true);
          }}
        >
          Add Slot
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* ── Calendar ── */}
        <div className="xl:col-span-3">
          <Card>
            <CardBody>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left:   'prev,next today',
                  center: 'title',
                  right:  'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={events}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="auto"
                eventDisplay="block"
              />
            </CardBody>
          </Card>
        </div>

        {/* ── Right panel ── */}
        <div className="xl:col-span-1 space-y-4">

          {/* Meeting Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">Meeting Requests</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {requests.length === 0 && (
                <p className="text-sm text-gray-500">No pending requests.</p>
              )}
              {requests.map(req => (
                <div key={req.id} className="border border-gray-100 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{req.title}</p>
                      <p className="text-xs text-gray-500">{req.from}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{req.date} · {req.time}</p>
                    </div>
                    {statusBadge(req.status)}
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleRequest(req.id, 'accepted')}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                      >
                        <Check size={13} /> Accept
                      </button>
                      <button
                        onClick={() => handleRequest(req.id, 'declined')}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                      >
                        <X size={13} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Confirmed Meetings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-primary-600" />
                <h2 className="text-base font-semibold text-gray-900">Confirmed</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              {events.filter(e => e.backgroundColor === '#10b981' || e.backgroundColor === '#7c3aed' || e.backgroundColor === '#0ea5e9').map((ev, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-md bg-gray-50">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: ev.backgroundColor as string }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{ev.title as string}</p>
                    <p className="text-xs text-gray-500">
                      {typeof ev.start === 'string' ? ev.start.replace('T', ' · ').slice(0, 18) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Clicked event detail */}
          {clickedEvent && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h2 className="text-base font-semibold text-gray-900">Event Detail</h2>
                  <button onClick={() => setClickedEvent(null)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                </div>
              </CardHeader>
              <CardBody className="space-y-1 text-sm text-gray-700">
                <p><span className="font-medium">Title:</span> {clickedEvent.title as string}</p>
                <p><span className="font-medium">Start:</span> {typeof clickedEvent.start === 'string' ? clickedEvent.start.replace('T', ' ') : ''}</p>
                <p><span className="font-medium">End:</span>   {typeof clickedEvent.end   === 'string' ? clickedEvent.end.replace('T', ' ')   : ''}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <AddEventModal
          selectedDate={selectedDate}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEvent}
        />
      )}
    </div>
  );
};