// The step-by-step Umrah guide. Shared by the portal page and the PDF builder.

export type Dua = {
  label: string
  arabic: string
  transliteration: string
  translation: string
}

export type UmrahImage = { src: string; alt: string; credit?: string; href?: string }

export type UmrahStep = {
  heading: string
  images?: UmrahImage[]
  paragraphs?: string[]
  bullets?: string[]
  duas?: Dua[]
}

export type UmrahPart = {
  id: string
  title: string
  blurb: string
  steps: UmrahStep[]
}

const img = (name: string, alt: string): UmrahImage => ({ src: `/images/umrah/${name}.jpg`, alt })

const ENTER_MASJID: Dua = {
  label: 'Du’a for entering the masjid',
  arabic: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
  transliteration: 'Bismillah, was-salatu was-salamu ala Rasulillah. Allahumma-ftah li abwaba rahmatik.',
  translation: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open for me the doors of Your mercy.',
}

export const UMRAH_SUMMARY = [
  'Enter ihram and make the intention for Umrah',
  'Recite the Talbiyah',
  'Tawaf around the Ka’bah, seven rounds from the Black Stone',
  'Pray two rakats behind Maqam Ibrahim, then drink Zamzam',
  'Sa’ee between Safa and Marwa, seven lengths',
  'Shave or trim the hair and leave ihram',
]

export const UMRAH_GUIDE: UmrahPart[] = [
  {
    id: 'preparation',
    title: 'Preparation',
    blurb: 'Getting ready at home, and what ihram is.',
    steps: [
      {
        heading: 'Before leaving home',
        bullets: [
          'Trim your nails',
          'Remove unnecessary hair',
          'Perform the major wash (ghusl)',
          'Apply perfume or itr (men only), and only before you enter ihram',
          'Pray two units of voluntary prayer at your local masjid and ask Allah for an easy journey',
        ],
      },
      {
        heading: 'What is ihram?',
        paragraphs: ['Ihram is a sacred state you enter for Umrah. It requires three things:'],
        bullets: ['Special clothes (for men)', 'A special intention', 'The Talbiyah'],
      },
      {
        heading: 'Ihram clothing',
        images: [
          img('ihram-kit', 'An ihram set: two white cloths, belt and sandals'),
          img('ihram-men', 'A man in ihram'),
          img('ihram-women', 'Women’s clothing for ihram'),
        ],
        bullets: [
          'Men wear two pieces of unstitched cloth: one wrapped around the waist (izar) and one draped over the upper body (rida). No hat, and no stitched clothing.',
          'Women wear their normal modest clothes. There is no special garment, but it is preferred to wear lighter coloured clothing and the face is not covered.',
        ],
        paragraphs: [
          'During tawaf, men uncover the right shoulder by passing the rida under the right arm and over the left shoulder. This is called idtiba. Put the rida back over both shoulders when you pray.',
        ],
      },
      {
        heading: 'When do I start ihram?',
        images: [
          img('meeqat-map', 'Map of the meeqat on the road to Makkah'),
        ],
        paragraphs: [
          'You can start ihram at any time before the meeqat. The meeqat are the places designated as borders that people travelling to Makkah may not cross without being in ihram.',
        ],
      },
    ],
  },
  {
    id: 'ihram',
    title: 'Entering Ihram',
    blurb: 'The prayer, the intention and the Talbiyah.',
    steps: [
      {
        heading: 'Put on the physical ihram',
        paragraphs: [
          'Men first wear the two pieces of ihram cloth. Women will already be in their clothes for ihram.',
        ],
      },
      {
        heading: 'Pray two rakats',
        paragraphs: [
          'Pray two units of prayer, like any two rakat nafl prayer. In your heart, intend: “I am performing two units of nafl for ihram.”',
          'After these two rakats, men remove their hat and get ready to enter the full ritual state of ihram.',
        ],
      },
      {
        heading: 'Make the intention',
        paragraphs: [
          'You must enter the ritual state of ihram before the meeqat. You do so by making the intention, followed by the Talbiyah.',
          '“O Allah! I am intending to perform Umrah, so make it easy for me and accept it from me.”',
          'Then recite the Talbiyah.',
        ],
      },
      {
        heading: 'The Talbiyah',
        paragraphs: [
          'Recite it often from now until you begin tawaf. Men say it aloud and women say it quietly.',
        ],
        duas: [
          {
            label: 'Talbiyah',
            arabic:
              'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
            transliteration:
              'Labbayk Allahumma labbayk, labbayka la sharika laka labbayk. Innal-hamda wan-ni’mata laka wal-mulk, la sharika lak.',
            translation:
              'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and bounties are Yours, and all sovereignty. You have no partner.',
          },
        ],
      },
      {
        heading: 'What is forbidden in ihram',
        bullets: [
          'Applying any form of perfume or fragrance',
          'Cutting or plucking any of your hair',
          'Cutting your nails (hands or feet)',
          'For men, wearing any stitched clothing',
          'For men, covering the head',
          'For women, covering the face',
          'Quarrelling or fighting (there is no penalty, but it is sinful)',
        ],
        paragraphs: [
          'If you are unsure whether something is allowed, ask your guides before doing it.',
        ],
      },
    ],
  },
  {
    id: 'arrival',
    title: 'Arriving in Makkah',
    blurb: 'Settling in and heading to the Haram.',
    steps: [
      {
        heading: 'Entering Masjid al-Haram',
        images: [
          img('haram-map', 'Plan of Masjid al-Haram'),
          img('haram-night', 'Masjid al-Haram at night'),
        ],
        paragraphs: [
          'Enter with the right foot, reciting salawat and the du’a below. Keep the Talbiyah going until you reach the Ka’bah. Be gentle in the crowds and keep close to your group.',
          'Du’a is accepted when you first see the Ka’bah. So when it comes into view, stop for a moment, lower your gaze, send salawat and ask Allah for the best of this world and the next. Do this before you begin tawaf.',
          'Source: This is reported from Abu Umamah and from Makhul, in narrations collected by al-Tabarani and al-Bayhaqi, which also list du’a being answered when the iqamah is called and when rain falls. The chains are not strong, but al-Nawawi and the scholars of the four schools recommend it, and the Ka’bah is among the greatest of the places where du’a is made.',
        ],
        duas: [ENTER_MASJID],
      },
    ],
  },
  {
    id: 'umrah',
    title: 'The Rites of Umrah',
    blurb: 'Tawaf, two rakats, Zamzam, Sa’ee and the haircut.',
    steps: [
      {
        heading: 'Tawaf',
        images: [
          img('tawaf-diagram', 'Seven rounds of tawaf, starting at the Black Stone'),
          img('kaabah-mataf', 'Pilgrims performing tawaf around the Ka’bah'),
        ],
        paragraphs: [
          'Find the Black Stone corner. Make wudu first if you need to. Stop the Talbiyah as you begin.',
          'Tawaf is seven rounds of the Ka’bah, anticlockwise, with the Ka’bah on your left. Each round starts and ends at the Black Stone.',
        ],
        bullets: [
          'Line up with the Black Stone and, from where you stand, point towards it and say “Bismillahi Allahu akbar”. Do not push to reach it.',
          'For men, idtiba: keep the right shoulder uncovered for all seven rounds.',
          'For men, raml (stomping): walk briskly with short, firm steps in the first three rounds only, where the crowd allows.',
          'Make du’a, recite Quran or say dhikr as you wish. You do not need a fixed text.',
          'Between the Yemeni corner and the Black Stone, many recite the du’a below (2:201).',
        ],
        duas: [
          {
            label: 'Du’a between the Yemeni corner and the Black Stone (2:201)',
            arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
            transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar.',
            translation: 'Our Lord, give us good in this world and good in the next, and protect us from the punishment of the Fire.',
          },
        ],
      },
      {
        heading: 'Two rakats behind Maqam Ibrahim',
        images: [
          img('maqam-ibrahim', 'The Station of Ibrahim'),
          img('prayer-behind-maqam', 'Pilgrims praying after tawaf'),
        ],
        paragraphs: [
          'After the seventh round, cover your shoulder again and pray two units of nafl. If the area behind Maqam Ibrahim is full, pray further back, anywhere in the Haram. Do not block the mataf.',
        ],
      },
      {
        heading: 'Drink Zamzam',
        images: [
          img('zamzam', 'Sign pointing to Zamzam water'),
          img('zamzam-taps', 'Zamzam taps in the Haram'),
        ],
        paragraphs: [
          'Drink Zamzam water, make du’a and have a short rest if you need one. The Prophet ﷺ said that the water of Zamzam is for whatever it is drunk for.',
        ],
      },
      {
        heading: 'Sa’ee between Safa and Marwa',
        images: [
          img('safa', 'The rock of Safa'),
        ],
        paragraphs: [
          'Go to Safa. As you approach it, recite the verse below (2:158).',
          'Sa’ee is seven lengths: Safa to Marwa is one, Marwa to Safa is two, and so on, so you finish on Marwa at length seven.',
        ],
        bullets: [
          'At Safa, face the Ka’bah, raise your hands and make du’a.',
          'Walk towards Marwa. Men jog lightly between the two green lights.',
          'You can make any du’a and dhikr while walking.',
          'Wudu is not required for Sa’ee, but it is better to have it.',
          'Optional: pray two rakats at Marwa when you finish.',
        ],
        duas: [
          {
            label: 'Qur’an 2:158',
            arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ',
            transliteration: 'Innas-safa wal-marwata min sha’a’irillah.',
            translation: 'Indeed, Safa and Marwa are from the signs of Allah.',
          },
        ],
      },
      {
        heading: 'Shave or trim your hair',
        images: [
          img('haircut', 'Shaving the head'),
          img('barber', 'A barber shop near the Haram'),
        ],
        bullets: [
          'Men shave the whole head (this is better) or shorten the hair all over.',
          'Women trim about a fingertip’s length from the ends of their hair.',
        ],
        paragraphs: [
          'Your Umrah is now complete and you are out of ihram. May Allah accept it from you.',
        ],
      },
    ],
  },
]
