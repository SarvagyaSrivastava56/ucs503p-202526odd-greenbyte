# 📅 Dynamic Calendar Feature

## Overview

A fully-featured, Google Calendar-style event calendar built with `react-big-calendar` and `date-fns`. Provides an intuitive way to view and interact with campus events.

## Features

### 🎨 **Multiple View Modes**

1. **Month View** - Traditional calendar grid showing all events in a month
2. **Week View** - Detailed weekly schedule with time slots
3. **Day View** - Hourly breakdown of a single day
4. **Agenda View** - List format showing upcoming events

### 🎯 **Interactive Features**

- **Click Events** - Click any event to see full details in a modal
- **Color-Coded Categories** - Each event category has a distinct color:
  - 🎵 Music: Purple
  - 💻 Tech: Cyan
  - 🎨 Art: Orange
  - ⚽ Sports: Green
  - 🛠️ Workshop: Pink
  - 🤝 Social: Red
  - 🎤 Conference: Indigo
  - 🎉 Party: Orange
  - 🤝 Networking: Teal

- **Navigation Controls**:
  - Previous/Next buttons
  - "Today" quick jump
  - Month/Year display
  - View mode tabs

- **Real-time Updates** - Events automatically refresh when data changes

### 📊 **Dashboard Stats**

Top of the page shows:
- Total number of events
- Events this month
- Number of categories
- Total capacity across all events

### 🔍 **Event Details Modal**

When clicking an event, you'll see:
- Event banner image
- Full title and description
- Date and time information
- Venue/Location (with online link if applicable)
- Attendance progress bar
- Category and pricing badges
- Tags
- "View Full Details" button to go to event page

## Technical Implementation

### Libraries Used

```json
{
  "react-big-calendar": "^1.x.x",
  "date-fns": "^3.6.0"
}
```

### Key Components

1. **CalendarPage** (`/src/app/calendar/page.tsx`)
   - Main calendar component
   - Real-time Firebase integration
   - Custom styling and theming

2. **Custom Toolbar**
   - Navigation buttons
   - View mode switcher
   - Month/Year display

3. **Event Style Getter**
   - Dynamic color assignment
   - Category-based styling

### Data Flow

```
Firebase Firestore
    ↓
onSnapshot listener
    ↓
Transform to Calendar Events
    ↓
react-big-calendar
    ↓
User Interaction
    ↓
Event Details Modal
```

## Usage

### Accessing the Calendar

1. Navigate to `/calendar` in the app
2. Or click "Calendar" in the sidebar navigation

### Viewing Events

- **Month View**: See all events in a monthly grid
- **Week View**: View a detailed weekly schedule
- **Day View**: See hourly breakdown of a single day
- **Agenda View**: List of upcoming events

### Interacting with Events

1. Click any event tile to open details modal
2. View full event information
3. Click "View Full Details" to go to event page
4. Click outside modal or X to close

### Navigation

- Use **Previous/Next** arrows to move through time
- Click **Today** to jump to current date
- Switch views using the **Month/Week/Day/Agenda** tabs

## Styling

### Custom CSS Classes

The calendar is styled using custom CSS that integrates with the app's theme:

- Uses CSS variables for colors (`hsl(var(--primary))`)
- Responsive design
- Dark mode compatible
- Smooth transitions and hover effects

### Color Scheme

Event colors automatically adjust based on:
- Event category
- Theme (light/dark mode)
- Hover state (increased opacity)

## Permissions

### Who Can Access?

- ✅ **All logged-in users** can view the calendar
- ✅ **Society admins** see "Create Event" button
- ❌ **Non-logged users** see sign-in prompt

### What Can Users Do?

**Students:**
- View all published events
- Click events for details
- Navigate through dates
- Switch view modes

**Society Admins:**
- All student features
- Quick "Create Event" button
- Access to society dashboard

## Firebase Integration

### Real-time Listeners

```typescript
const eventsQuery = query(
  collection(firestore, 'events'),
  where('status', '==', 'published')
);

onSnapshot(eventsQuery, (snapshot) => {
  // Auto-updates when events change
});
```

### Event Transformation

Events are transformed from Firestore format to calendar format:

```typescript
{
  id: string,
  title: string,
  start: Date,
  end: Date,
  resource: EventType  // Original event data
}
```

## Responsive Design

- **Desktop**: Full calendar with sidebar
- **Tablet**: Collapsible views
- **Mobile**: Optimized touch interactions

## Future Enhancements

Potential additions:
- [ ] Filter by category
- [ ] Filter by society
- [ ] Search events
- [ ] Export to Google Calendar/iCal
- [ ] Drag-and-drop event rescheduling (admin)
- [ ] Create event from calendar (admin)
- [ ] RSVP directly from calendar
- [ ] Show user's RSVPed events differently

## Troubleshooting

### Calendar not loading?
- Check Firebase connection
- Verify you're logged in
- Check browser console for errors

### Events not showing?
- Ensure events have valid `startAt` and `endAt` dates
- Check event status is 'published'
- Verify date range you're viewing

### Styling issues?
- Clear browser cache
- Check CSS variables are defined
- Verify theme is loaded

## Keyboard Shortcuts

(Planned)
- `←` Previous period
- `→` Next period
- `T` Today
- `M` Month view
- `W` Week view
- `D` Day view
- `A` Agenda view

---

**Built with ❤️ using React Big Calendar, Firebase, and shadcn/ui**

