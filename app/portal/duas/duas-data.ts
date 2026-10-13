// Du'as for both cities, with when to read each one and why.
// Shared by the portal page and the PDF builder.

import {
  BAQI,
  ENTER_MASJID,
  LEAVE_MASJID,
  SALAM_ABU_BAKR,
  SALAM_PROPHET,
  SALAM_UMAR,
  SALAWAT,
} from '../beloveds-home/beloveds-home-data'
import type { Dua } from '../umrah-guide/umrah-guide-data'

export type DuaEntry = Dua & {
  // When to read it, and the reason it is read then.
  when: string
  source?: string
}

export type DuaSection = {
  id: string
  title: string
  blurb: string
  duas?: DuaEntry[]
  bullets?: string[]
}

const entry = (dua: Dua, when: string, source?: string): DuaEntry => ({ ...dua, when, source })

export const DUAS: DuaSection[] = [
  {
    id: 'journey',
    title: 'The Journey',
    blurb: 'Leaving home and travelling.',
    duas: [
      {
        label: 'Leaving home',
        arabic: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        transliteration: 'Bismillah, tawakkaltu alallah, wa la hawla wa la quwwata illa billah.',
        translation: 'In the name of Allah. I place my trust in Allah, and there is no power and no strength except with Allah.',
        when: 'As you step out of your door, and each time you leave your hotel. The Prophet ﷺ said that the one who says it is told: “You are guided, protected and sufficed.”',
        source: 'Abu Dawud and Tirmidhi.',
      },
      {
        label: 'Boarding transport',
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ',
        transliteration:
          'Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila Rabbina la-munqalibun.',
        translation:
          'Glory be to the One who has subjected this to us, and we could never have done it ourselves. And to our Lord we shall surely return.',
        when: 'When you board the plane, the bus or the train. The Prophet ﷺ said it after saying Allahu Akbar three times.',
        source: 'Qur’an 43:13–14, and Muslim.',
      },
      {
        label: 'Returning home',
        arabic: 'آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ',
        transliteration: 'Ayibuna, ta’ibuna, abiduna, li-Rabbina hamidun.',
        translation: 'We return, repenting, worshipping, and praising our Lord.',
        when: 'On the journey home, after the du’a for travelling. The Prophet ﷺ added it on returning from a journey.',
        source: 'Muslim.',
      },
    ],
  },
  {
    id: 'ihram',
    title: 'Ihram',
    blurb: 'Entering the state of ihram.',
    duas: [
      {
        label: 'The intention for Umrah',
        arabic: 'اللَّهُمَّ إِنِّي أُرِيدُ الْعُمْرَةَ فَيَسِّرْهَا لِي وَتَقَبَّلْهَا مِنِّي',
        transliteration: 'Allahumma inni uridul-umrata fa-yassirha li wa taqabbalha minni.',
        translation: 'O Allah, I intend to perform Umrah, so make it easy for me and accept it from me.',
        when: 'After your two rakats of ihram, before the meeqat. The intention itself is in the heart, and these words are what the scholars teach.',
        source: 'The books of the four schools. The Prophet ﷺ said: “Labbayka ‘Umratan wa Hajjan.” (Muslim)',
      },
      {
        label: 'The Talbiyah',
        arabic:
          'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
        transliteration:
          'Labbayk Allahumma labbayk. Labbayka la sharika laka labbayk. Innal-hamda wan-ni’mata laka wal-mulk, la sharika lak.',
        translation:
          'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise, blessings and sovereignty are Yours. You have no partner.',
        when: 'Straight after the intention, and then often, until you reach the Ka’bah and begin tawaf. It is the answer to Ibrahim’s call to the people to come to the House.',
        source: 'Bukhari and Muslim.',
      },
    ],
  },
  {
    id: 'makkah',
    title: 'Makkah',
    blurb: 'From the doors of the Haram to the end of your Umrah.',
    duas: [
      entry(
        ENTER_MASJID,
        'At the door of Masjid al-Haram, with the right foot. The same words are read at Masjid an-Nabawi.',
        'Muslim, Abu Dawud and Ibn Majah.',
      ),
      {
        label: 'When you first see the Ka’bah',
        arabic:
          'اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً، وَزِدْ مَنْ شَرَّفَهُ وَكَرَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَكْرِيمًا وَتَعْظِيمًا وَبِرًّا',
        transliteration:
          'Allahumma zid hadhal-bayta tashrifan wa ta’zeeman wa takreeman wa mahabah, wa zid man sharrafahu wa karramahu mimman hajjahu awi-’tamarahu tashrifan wa takreeman wa ta’zeeman wa birra.',
        translation:
          'O Allah, increase this House in honour, esteem, nobility and reverence, and increase those who honour and respect it, among those who perform Hajj or Umrah, in honour, nobility, esteem and righteousness.',
        when: 'The moment your eyes fall on the Ka’bah. The scholars say that a du’a made at this first sight is answered, so then ask Allah for the best of this world and the next.',
        source: 'The words are reported from Ibn Jurayj, from the Prophet ﷺ, by al-Shafi’i and al-Bayhaqi. That du’a is answered at the first sight is reported from Abu Umamah and Makhul (al-Tabarani and al-Bayhaqi). The chains are not strong, but al-Nawawi and the scholars of the four schools recommend it.',
      },
      {
        label: 'Beginning each round of tawaf',
        arabic: 'بِسْمِ اللَّهِ، وَاللَّهُ أَكْبَرُ',
        transliteration: 'Bismillah, wallahu akbar.',
        translation: 'In the name of Allah. Allah is the Greatest.',
        when: 'Facing the Black Stone at the start of tawaf and again at the start of each round, raising your hand towards it. The Prophet ﷺ did takbir at the stone.',
        source: 'Bukhari, and al-Bayhaqi from Ibn Umar.',
      },
      {
        label: 'Between the Yemeni Corner and the Black Stone',
        arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
        transliteration: 'Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar.',
        translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.',
        when: 'In every round, on the stretch from the Yemeni Corner to the Black Stone. It was the Prophet’s ﷺ most frequent du’a, and it asks for everything in a few words.',
        source: 'Qur’an 2:201, and Abu Dawud.',
      },
      {
        label: 'Behind Maqam Ibrahim',
        arabic: 'وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
        transliteration: 'Wattakhidhu min maqami Ibrahima musalla.',
        translation: 'And take the Station of Ibrahim as a place of prayer.',
        when: 'After tawaf, as you approach the Maqam, and before praying two rakats. Read Surah al-Kafirun in the first and Surah al-Ikhlas in the second.',
        source: 'Qur’an 2:125, and Muslim in the hadith of Jabir.',
      },
      {
        label: 'Drinking Zamzam',
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ',
        transliteration: 'Allahumma inni as’aluka ilman nafi’a, wa rizqan wasi’a, wa shifa’an min kulli da’.',
        translation: 'O Allah, I ask You for beneficial knowledge, abundant provision, and a cure from every illness.',
        when: 'With each drink of Zamzam. The Prophet ﷺ said: “The water of Zamzam is for whatever it is drunk for.” So drink it with a specific need in your heart.',
        source: 'Ibn Majah and Ahmad. The wording of the du’a is reported by al-Daraqutni and al-Hakim, and the scholars act upon it.',
      },
      {
        label: 'On Safa and Marwa',
        arabic:
          'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ',
        transliteration:
          'La ilaha illallahu wahdahu la sharika lah, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay’in qadir. La ilaha illallahu wahdah, anjaza wa’dah, wa nasara abdah, wa hazamal-ahzaba wahdah.',
        translation:
          'There is no god but Allah alone, with no partner. His is the kingdom and His is the praise, and He has power over all things. There is no god but Allah alone. He fulfilled His promise, gave victory to His servant, and defeated the confederates alone.',
        when: 'Facing the Ka’bah on top of Safa, three times, with a du’a between each. Then the same at Marwa. As you approach Safa, recite “Inna as-Safa wal-Marwata min sha’a’irillah” (2:158) and say “I begin with what Allah began with.”',
        source: 'Muslim, in the hadith of Jabir.',
      },
      {
        label: 'When the Umrah is complete',
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ',
        transliteration: 'Alhamdu lillahil-ladhi bi ni’matihi tatimmus-salihat.',
        translation: 'All praise is for Allah, by whose favour good deeds are completed.',
        when: 'After your hair is cut and you are out of ihram. Give thanks that Allah allowed you to finish, and ask Him to accept it.',
        source: 'Ibn Majah and al-Hakim.',
      },
      entry(LEAVE_MASJID, 'When you leave Masjid al-Haram, with the left foot.', 'Muslim.'),
    ],
  },
  {
    id: 'madinah',
    title: 'Madinah',
    blurb: 'Arriving, entering the Prophet’s ﷺ mosque and standing before him.',
    duas: [
      {
        label: 'Love for Madinah',
        arabic: 'اللَّهُمَّ حَبِّبْ إِلَيْنَا الْمَدِينَةَ كَحُبِّنَا مَكَّةَ أَوْ أَشَدَّ',
        transliteration: 'Allahumma habbib ilaynal-Madinata ka-hubbina Makkata aw ashadd.',
        translation: 'O Allah, make us love Madinah as we love Makkah, or more.',
        when: 'As you arrive in Madinah, and whenever you see it. It was the Prophet’s ﷺ own du’a for the city.',
        source: 'Bukhari and Muslim.',
      },
      {
        label: 'Blessing for Madinah',
        arabic: 'اللَّهُمَّ اجْعَلْ بِالْمَدِينَةِ ضِعْفَيْ مَا جَعَلْتَ بِمَكَّةَ مِنَ الْبَرَكَةِ',
        transliteration: 'Allahumma-j’al bil-Madinati di’fay ma ja’alta bi-Makkata minal-barakah.',
        translation: 'O Allah, place in Madinah twice the blessing that You placed in Makkah.',
        when: 'While in the city. It is the du’a the Prophet ﷺ made for Madinah, so make it for the city and for its people.',
        source: 'Bukhari and Muslim.',
      },
      entry(
        ENTER_MASJID,
        'At the door of Masjid an-Nabawi, with the right foot, and then pray two rakats of Tahiyyat al-Masjid.',
        'Muslim, Abu Dawud and Ibn Majah.',
      ),
      entry(
        SALAM_PROPHET,
        'Standing before the Prophetic Chamber, with a low voice. You can also read it anywhere in the masjid, since the angels convey it to him. The Prophet ﷺ said that Allah returns his soul to him so that he may return the greeting.',
        'The words are from the scholars. The hadith is in Abu Dawud.',
      ),
      {
        label: 'Seeking forgiveness at his door',
        arabic:
          'وَلَوْ أَنَّهُمْ إِذ ظَّلَمُوا أَنفُسَهُمْ جَاءُوكَ فَاسْتَغْفَرُوا اللَّهَ وَاسْتَغْفَرَ لَهُمُ الرَّسُولُ لَوَجَدُوا اللَّهَ تَوَّابًا رَّحِيمًا',
        transliteration:
          'Wa law annahum idh zalamu anfusahum ja’uka fastaghfarullaha wastaghfara lahumur-rasulu la-wajadullaha tawwaban rahima.',
        translation:
          'If, when they wronged themselves, they had come to you and asked Allah’s forgiveness, and the Messenger had asked forgiveness for them, they would have found Allah Accepting of repentance and Merciful.',
        when: 'After your greeting. The scholars, including al-Nawawi and Ibn Kathir, cite this verse as the basis for coming to the Prophet ﷺ to repent. Recite it, then ask Allah for forgiveness and ask the Prophet ﷺ to seek it for you.',
        source: 'Qur’an 4:64.',
      },
      entry(
        SALAWAT,
        'Abundantly at the Prophetic Chamber, in the Rawdah and everywhere in Madinah. It is the form of salawat the Prophet ﷺ taught, and the one read in every prayer.',
        'Bukhari and Muslim.',
      ),
      entry(
        SALAM_ABU_BAKR,
        'After the Prophet ﷺ, moving slightly to the right to stand before Abu Bakr. Ibn Umar used to greet them both after the Prophet ﷺ, in a few short words.',
        'Ibn Umar’s greeting is in the Muwatta of Imam Malik. The longer wording is from the scholars.',
      ),
      entry(SALAM_UMAR, 'Then move once more to the right, and greet Umar.', 'Ibn Umar’s greeting is in the Muwatta of Imam Malik. The longer wording is from the scholars.'),
      {
        label: 'The master of seeking forgiveness',
        arabic:
          'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        transliteration:
          'Allahumma anta Rabbi, la ilaha illa ant. Khalaqtani wa ana abduk, wa ana ala ahdika wa wa’dika mastata’t. A’udhu bika min sharri ma sana’t. Abu’u laka bi ni’matika alayya, wa abu’u bi dhanbi, faghfir li, fa innahu la yaghfirudh-dhunuba illa ant.',
        translation:
          'O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.',
        when: 'In the Rawdah, when you sit to pray and make du’a. The Prophet ﷺ called it the master of seeking forgiveness, and said that whoever says it with certainty and dies that day will enter Paradise.',
        source: 'Bukhari.',
      },
      entry(
        BAQI,
        'At the gate of al-Baqi’ and again as you pass among its graves. The Prophet ﷺ said these words at al-Baqi’, and taught his Companions to greet the graves in this way.',
        'Muslim, from Aisha and Buraydah. The wording joins the two narrations.',
      ),
      entry(LEAVE_MASJID, 'When you leave Masjid an-Nabawi, with the left foot.', 'Muslim.'),
    ],
  },
  {
    id: 'times',
    title: 'When Du’as Are Answered',
    blurb: 'Times and places in which to ask for the most.',
    bullets: [
      'The traveller’s du’a. The Prophet ﷺ said that three du’as are not rejected: the du’a of the parent, of the fasting person, and of the traveller. (al-Bayhaqi. In Abu Dawud and Tirmidhi, the du’a of the oppressed is named in place of the fasting person.) You are a traveller from the day you leave home until you return.',
      'Between the adhan and the iqamah. “A du’a made between the adhan and the iqamah is not rejected.” (Abu Dawud and Tirmidhi) Both masjids give you this moment five times a day.',
      'In sujud. “The closest a servant is to his Lord is when he is in prostration, so make plenty of du’a in it.” (Muslim)',
      'In the last third of the night. Allah descends to the lowest heaven and asks who is calling on Him so that He may answer. (Bukhari and Muslim) Wake before Fajr in the haramayn, even if only for a few minutes.',
      'When you first see the Ka’bah. Du’a is accepted at that moment, so ask Allah for the best of this world and the next before you begin tawaf. (Reported from Abu Umamah and Makhul, and collected by al-Tabarani and al-Bayhaqi. The chains are not strong, but al-Nawawi and the scholars of the four schools recommend it.)',
      'On the day of Jumu’ah. There is an hour in which a Muslim who asks Allah for good is given it. (Bukhari and Muslim) Many scholars place it after Asr.',
      'At the Multazam, between the Black Stone and the door of the Ka’bah. The Companions pressed their chests and faces to it and made du’a. (Abu Dawud and Ibn Majah)',
      'During tawaf, at Safa and Marwa, behind Maqam Ibrahim and while drinking Zamzam. These are places in which the scholars say du’a is answered, so do not spend them idle.',
      'In the Rawdah, and at the Prophetic Chamber. Many scholars recommend asking Allah for what you need here, and asking the Prophet ﷺ to intercede for you.',
      'For others, before you leave each place: your family, those who asked you to pray for them, and the Ummah. The Prophet ﷺ said that an angel says “and for you the same” to the one who prays for his brother in his absence. (Muslim)',
    ],
  },
]
