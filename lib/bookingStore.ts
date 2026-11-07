export type StoredBooking = {
  id: string;
  requestId?: string;
  createdAt: string;
  status: "received";
  reason: string;
  toothId: string | null;
  date: string;
  time: string;
  fullName: string;
  phone: string;
  email: string | null;
  note: string | null;
};

const bookings: StoredBooking[] = [];

export const createBooking = (
  data: Omit<StoredBooking, "id" | "createdAt" | "status">
): StoredBooking => {
  if (data.requestId) {
    const existing = bookings.find((b) => b.requestId === data.requestId);
    if (existing) return existing;
  }
  const record: StoredBooking = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "received"
  };
  bookings.unshift(record);
  if (bookings.length > 500) bookings.length = 500;
  return record;
};

export const listBookings = (): StoredBooking[] => [...bookings];
