import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { getEvents } from './api';

export default function MyCalendar({ token }) {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]);

    useEffect(() => {
        getEvents(token).then(res => setEvents(res.data));
    }, [token]);

    const tileContent = ({ date, view }) => {
        const dayEvents = events.filter(e => new Date(e.date).toDateString() === date.toDateString());
        return dayEvents.map(e => <div key={e.id} style={{ color: e.is_shared ? 'green':'blue' }}>{e.title}</div>);
    };

    return <Calendar onChange={setDate} value={date} tileContent={tileContent} />;
}
