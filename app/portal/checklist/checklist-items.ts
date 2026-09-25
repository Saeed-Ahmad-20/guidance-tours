// Item keys are stored against each passenger's ticks, so rename a label
// freely but keep its key. Removing an item simply stops showing it.

export type ChecklistItem = {
  key: string
  label: string
  detail?: string
  // Ticked automatically from what's already in the portal, not by hand.
  auto?: 'passport_uploaded' | 'visa_and_ticket'
}

export type ChecklistSection = { title: string; items: ChecklistItem[] }

export const CHECKLIST: ChecklistSection[] = [
  {
    title: 'Travel documents',
    items: [
      { key: 'passport_uploaded', label: 'Passport photo page uploaded to the portal', auto: 'passport_uploaded' },
      { key: 'visa_and_ticket', label: 'E-visa and flight ticket issued', detail: 'Find them in the Travel Documents tab.', auto: 'visa_and_ticket' },
      { key: 'docs_saved', label: 'E-visa and flight ticket saved on your phone and printed' },
      { key: 'passport_copy', label: 'Photo of your passport saved on your phone, separate from the passport' },
      { key: 'insurance', label: 'Travel insurance arranged', detail: 'Make sure it covers medical treatment in Saudi Arabia.' },
      { key: 'emergency_contacts', label: 'Emergency contacts written down', detail: 'Include the Guidance Tours WhatsApp: 07983 432 900.' },
    ],
  },
  {
    title: 'Health',
    items: [
      { key: 'first_aid', label: 'Painkillers, plasters and blister care' },
      { key: 'sun', label: 'Sunglasses and a refillable water bottle' },
    ],
  },
  {
    title: 'Ihram and clothing',
    items: [
      { key: 'ihram', label: 'Men: two ihram sheets and an ihram belt' },
      { key: 'women_clothing', label: 'Women: loose, modest clothing, abayas and hijabs' },
      { key: 'shoes', label: 'Comfortable, broken-in walking shoes' },
      { key: 'sandals', label: 'Sandals and a small bag to carry them in the masjid' },
    ],
  },
  {
    title: 'Money and phone',
    items: [
      { key: 'riyals', label: 'Some Saudi riyals in cash' },
      { key: 'bank', label: 'Bank card working abroad (Fee-free to use abroad)' },
      { key: 'roaming', label: 'Phone roaming or a Saudi SIM / eSIM arranged' },
      { key: 'nusuk', label: 'Nusuk app installed and account set up', detail: 'Used to book your visit to the Rawdah in Madinah.' },
      { key: 'charger', label: 'Phone charger and a power bank', detail: 'Power banks must go in your cabin bag, not your suitcase.' },
    ],
  },
  {
    title: 'Spiritual preparation',
    items: [
      { key: 'webinar', label: 'Watched the pre-departure webinar', detail: 'In the Webinars tab.' },
      { key: 'umrah_steps', label: 'Learnt the steps of Umrah' },
      { key: 'duas', label: 'Personal list of duas, including requests from family and friends' },
    ],
  },
  {
    title: 'Packing and departure',
    items: [
      { key: 'baggage', label: 'Suitcases within 2 × 23kg hold and 7kg cabin' },
      { key: 'itinerary_read', label: 'Read your itinerary', detail: 'Your flight leaves Manchester at 13:30 on Sun 25 Oct.' },
      { key: 'airport_travel', label: 'Travel to Manchester Airport arranged' },
    ],
  },
]

export const CHECKLIST_KEYS = new Set(
  CHECKLIST.flatMap(s => s.items.filter(i => !i.auto).map(i => i.key))
)
