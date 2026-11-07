export type StoredEnquiry = {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  message: string;
};

// In-memory store for the preview. Replace with the database before launch.
const enquiries: StoredEnquiry[] = [];

export const createEnquiry = (data: Omit<StoredEnquiry, "id" | "createdAt">): StoredEnquiry => {
  const record: StoredEnquiry = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  enquiries.unshift(record);
  if (enquiries.length > 500) enquiries.length = 500;
  return record;
};
