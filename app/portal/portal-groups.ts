// The portal's pages, grouped into categories. Shared by the nav and the category overview pages.

export type PortalTab = { path: string; label: string; blurb: string }
export type PortalGroup = { path: string; label: string; intro: string; tabs: PortalTab[] }

export const GROUPS: PortalGroup[] = [
  {
    path: '/trip',
    label: 'My Trip',
    intro: 'Everything about your booking and the journey itself.',
    tabs: [
      { path: '', label: 'My Booking', blurb: 'Your booking and trip details.' },
      { path: '/itinerary', label: 'Itinerary', blurb: 'Flights, hotels and the plan for each day.' },
      { path: '/checklist', label: 'Checklist', blurb: 'What to pack and prepare before you travel.' },
      { path: '/documents', label: 'Travel Documents', blurb: 'Your tickets, visas and other documents.' },
    ],
  },
  {
    path: '/guides',
    label: 'Guides',
    intro: 'Step-by-step guidance for the acts of worship on your journey.',
    tabs: [
      { path: '/umrah-guide', label: 'Umrah Guide', blurb: 'From preparing at home to completing your Umrah in Makkah.' },
      {
        path: '/beloveds-home',
        label: 'The Beloved’s ﷺ Home',
        blurb: 'The etiquette of Madinah, and visiting the Prophet ﷺ and giving salam.',
      },
      { path: '/duas', label: 'Duas', blurb: 'Every du’a to read in Makkah and Madinah, with when and why to read each one.' },
    ],
  },
  {
    path: '/sacred-sites',
    label: 'Sacred Sites',
    intro: 'The blessed places you will visit in Makkah and Madinah, and their stories.',
    tabs: [
      { path: '/historical-sites/madinah', label: 'Madinah Sites', blurb: 'Places from the seerah in Madinah.' },
      { path: '/historical-sites/makkah', label: 'Makkah Sites', blurb: 'Places from the seerah in Makkah.' },
      { path: '/haramayn', label: 'Haramayn', blurb: 'Masjid al-Haram, the Ka’bah, Masjid an-Nabawi and the Rawdah.' },
    ],
  },
  {
    path: '/resources',
    label: 'Resources',
    intro: 'Extra material to learn from and take with you.',
    tabs: [
      { path: '/webinars', label: 'Webinars', blurb: 'Preparation sessions with your guides.' },
      { path: '/pdf', label: 'PDF', blurb: 'Build a PDF of the guides and your trip to read offline.' },
    ],
  },
]
