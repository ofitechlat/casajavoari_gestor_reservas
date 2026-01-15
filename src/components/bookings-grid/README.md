# Headless Bookings Grid - Usage Examples

## Basic Usage (Composed Component)

The simplest way to use the grid:

```tsx
import { BookingsGrid } from "@/components/bookings-grid";

<BookingsGrid
  date={new Date()}
  bookings={bookings}
  spaces={spaces}
  startHour={7}
  endHour={20}
  onBookingClick={(booking) => console.log(booking)}
/>
```

---

## Headless API (Full Customization)

Use the primitive components for complete control:

```tsx
import {
  BookingsGridProvider,
  BookingsGridRoot,
  BookingsGridHeader,
  BookingsGridTimeSlots,
  BookingsGridCells,
  BookingsGridBookings,
} from "@/components/bookings-grid";

<BookingsGridProvider
  date={selectedDate}
  bookings={bookings}
  spaces={spaces}
  startHour={7}
  endHour={20}
>
  <BookingsGridRoot>
    <BookingsGridHeader />
    <BookingsGridTimeSlots />
    <BookingsGridCells />
    <BookingsGridBookings />
  </BookingsGridRoot>
</BookingsGridProvider>
```

---

## Custom Booking Cells

Render your own booking cells:

```tsx
<BookingsGridProvider date={date} bookings={bookings} spaces={spaces}>
  <BookingsGridRoot>
    <BookingsGridHeader />
    <BookingsGridTimeSlots />
    <BookingsGridCells />
    <BookingsGridBookings
      renderBooking={(booking) => (
        <div className="h-full bg-purple-500/20 rounded-lg p-2">
          <h3 className="font-bold">{booking.title}</h3>
          <p className="text-xs">{booking.contact?.name}</p>
        </div>
      )}
      onBookingClick={(booking) => openModal(booking)}
    />
  </BookingsGridRoot>
</BookingsGridProvider>
```

---

## Custom Headers

Customize space headers:

```tsx
<BookingsGridHeader
  renderSpaceHeader={(space, index) => (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: space.color }}
      />
      <span className="font-semibold">{space.name}</span>
    </div>
  )}
/>
```

---

## Custom Time Slots

Format time slots differently:

```tsx
<BookingsGridTimeSlots
  renderTimeSlot={(slot) => (
    <div className="text-center">
      <div className="text-lg font-bold">{slot.hour}</div>
      <div className="text-xs text-muted-foreground">
        {slot.minute === 0 ? "00" : slot.minute}
      </div>
    </div>
  )}
/>
```

---

## Access Context Data

Use the context hook in custom components:

```tsx
import { useBookingsGridContext } from "@/components/bookings-grid";

function CustomComponent() {
  const { gridBookings, spaces, timeSlots } = useBookingsGridContext();
  
  return (
    <div>
      <p>Total bookings: {gridBookings.length}</p>
      <p>Total spaces: {spaces.length}</p>
    </div>
  );
}
```

---

## Complete Custom Example

```tsx
import {
  BookingsGridProvider,
  BookingsGridRoot,
  BookingsGridHeader,
  BookingsGridTimeSlots,
  BookingsGridCells,
  BookingsGridBookings,
  useBookingsGridContext,
} from "@/components/bookings-grid";

function CustomBookingsView() {
  return (
    <BookingsGridProvider
      date={new Date()}
      bookings={bookings}
      spaces={spaces}
      startHour={8}
      endHour={18}
      intervalMinutes={30} // 30-minute slots
    >
      <BookingsGridRoot className="shadow-xl">
        {/* Custom header with icons */}
        <BookingsGridHeader
          renderTimeHeader={() => <Clock className="w-4 h-4" />}
          renderSpaceHeader={(space) => (
            <Badge variant="outline">{space.name}</Badge>
          )}
        />
        
        {/* Custom time slots */}
        <BookingsGridTimeSlots
          renderTimeSlot={(slot) => (
            <span className="font-mono text-xs">
              {String(slot.hour).padStart(2, "0")}:
              {String(slot.minute).padStart(2, "0")}
            </span>
          )}
        />
        
        {/* Grid cells with hover effect */}
        <BookingsGridCells className="hover:bg-muted/50" />
        
        {/* Custom booking cells */}
        <BookingsGridBookings
          renderBooking={(booking) => (
            <CustomBookingCard booking={booking} />
          )}
          onBookingClick={handleBookingClick}
        />
      </BookingsGridRoot>
    </BookingsGridProvider>
  );
}

function CustomBookingCard({ booking }) {
  return (
    <div className="h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-3 border-l-4 border-blue-500">
      <h4 className="font-bold text-sm">{booking.title}</h4>
      <p className="text-xs text-muted-foreground">
        {format(booking.startTime, "HH:mm")} - {format(booking.endTime, "HH:mm")}
      </p>
      {booking.contact && (
        <div className="mt-2 flex items-center gap-1">
          <Avatar className="w-4 h-4">
            <AvatarFallback>{booking.contact.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-xs">{booking.contact.name}</span>
        </div>
      )}
    </div>
  );
}
```

---

## API Reference

### BookingsGridProvider

Context provider that manages grid state.

**Props:**
- `date: Date` - Selected date to display
- `bookings: Booking[]` - Array of bookings
- `spaces: Space[]` - Array of spaces/rooms
- `startHour?: number` - Start hour (default: 7)
- `endHour?: number` - End hour (default: 20)
- `intervalMinutes?: number` - Time slot interval (default: 60)
- `children: ReactNode` - Child components

### BookingsGridRoot

Grid container component.

**Props:**
- `className?: string` - Additional CSS classes
- `children: ReactNode` - Child components

### BookingsGridHeader

Header row with space names.

**Props:**
- `className?: string` - Additional CSS classes
- `renderTimeHeader?: () => ReactNode` - Custom time header renderer
- `renderSpaceHeader?: (space, index) => ReactNode` - Custom space header renderer

### BookingsGridTimeSlots

Time slot column.

**Props:**
- `className?: string` - Additional CSS classes
- `renderTimeSlot?: (slot, index) => ReactNode` - Custom time slot renderer

### BookingsGridCells

Empty grid cells for structure.

**Props:**
- `className?: string` - Additional CSS classes

### BookingsGridBookings

Booking cells overlay.

**Props:**
- `className?: string` - Additional CSS classes
- `renderBooking?: (booking, index) => ReactNode` - Custom booking renderer
- `onBookingClick?: (booking) => void` - Click handler

### useBookingsGridContext

Hook to access grid context.

**Returns:**
```typescript
{
  date: Date;
  bookings: Booking[];
  spaces: Space[];
  timeSlots: TimeSlot[];
  gridBookings: BookingGridItem[];
  startHour: number;
  endHour: number;
  intervalMinutes: number;
  totalRows: number;
  totalColumns: number;
}
```
