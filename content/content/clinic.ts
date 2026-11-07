export type HoursRow = { day: number; open?: string; close?: string };

export const clinic = {
  isSample: true,
  name: "Halden Dental Studio",
  shortName: "Halden",
  city: "Harborough",
  country: "United Kingdom",
  tagline: "Point to the tooth. We'll take it from there.",
  phone: "+44 20 7946 0958",
  urgentPhone: "+44 20 7946 0959",
  whatsapp: "+44 20 7946 0960",
  email: "reception@haldendental.example",
  addressLines: ["Unit 4, 128 Fenwick Row", "Harborough HB3 2QL"],
  address: "Unit 4, 128 Fenwick Row, Harborough HB3 2QL",
  mapUrl: "https://maps.google.com/?q=128+Fenwick+Row+Harborough",
  directionsUrl: "https://maps.google.com/dir/?api=1&destination=128+Fenwick+Row+Harborough",
  site: "https://halden-dental.example",
  hours: [
    { day: 0 },
    { day: 1, open: "09:00", close: "18:00" },
    { day: 2, open: "09:00", close: "18:00" },
    { day: 3, open: "09:00", close: "18:00" },
    { day: 4, open: "09:00", close: "18:00" },
    { day: 5, open: "09:00", close: "14:00" },
    { day: 6 }
  ] as HoursRow[]
};

export type Clinic = typeof clinic;
