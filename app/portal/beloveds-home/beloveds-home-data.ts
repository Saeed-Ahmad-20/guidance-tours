// The Beloved’s Home: etiquette of Madinah and visiting the Prophet ﷺ.
// Follows the position of the four Sunni schools as recorded by al-Qadi Iyad (al-Shifa),
// al-Nawawi (al-Majmu’, al-Idah), Ibn Qudamah (al-Mughni) and Ibn al-Humam (Fath al-Qadir).
// Shared by the portal page and the PDF builder.

import type { Dua, UmrahImage, UmrahPart } from '../umrah-guide/umrah-guide-data'

const photo = (name: string, alt: string, credit: string, file: string): UmrahImage => ({
  src: `/images/sites/${name}.jpg`,
  alt,
  credit,
  href: `https://commons.wikimedia.org/wiki/File:${file}`,
})

export const ENTER_MASJID: Dua = {
  label: 'Du’a for Entering the Masjid',
  arabic: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
  transliteration: 'Bismillah, was-salatu was-salamu ala Rasulillah. Allahumma-ftah li abwaba rahmatik.',
  translation: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, open for me the doors of Your mercy.',
}

export const LEAVE_MASJID: Dua = {
  label: 'Du’a for Leaving the Masjid',
  arabic: 'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
  transliteration: 'Bismillah, was-salatu was-salamu ala Rasulillah. Allahumma inni as’aluka min fadlik.',
  translation: 'In the name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, I ask You of Your bounty.',
}

export const SALAM_PROPHET: Dua = {
  label: 'Greeting the Prophet ﷺ',
  arabic: 'السَّلَامُ عَلَيْكَ يَا رَسُولَ اللَّهِ، السَّلَامُ عَلَيْكَ يَا نَبِيَّ اللَّهِ، السَّلَامُ عَلَيْكَ يَا حَبِيبَ اللَّهِ، السَّلَامُ عَلَيْكَ وَعَلَى آلِكَ وَأَصْحَابِكَ أَجْمَعِينَ',
  transliteration:
    'As-salamu alayka ya Rasulallah. As-salamu alayka ya Nabiyyallah. As-salamu alayka ya Habiballah. As-salamu alayka wa ala alika wa ashabika ajma’in.',
  translation:
    'Peace be upon you, O Messenger of Allah. Peace be upon you, O Prophet of Allah. Peace be upon you, O beloved of Allah. Peace be upon you, and upon your family and all your Companions.',
}

export const SALAM_ABU_BAKR: Dua = {
  label: 'Greeting Abu Bakr al-Siddiq (may Allah be pleased with him)',
  arabic: 'السَّلَامُ عَلَيْكَ يَا أَبَا بَكْرٍ، يَا خَلِيفَةَ رَسُولِ اللَّهِ، السَّلَامُ عَلَيْكَ يَا صِدِّيقُ، رَضِيَ اللَّهُ عَنْكَ وَجَزَاكَ عَنِ الْإِسْلَامِ خَيْرًا',
  transliteration:
    'As-salamu alayka ya Aba Bakr, ya Khalifata Rasulillah. As-salamu alayka ya Siddiq. Radiyallahu anka wa jazaka anil-Islami khayra.',
  translation:
    'Peace be upon you, O Abu Bakr, successor of the Messenger of Allah. Peace be upon you, O Siddiq. May Allah be pleased with you and reward you well for what you did for Islam.',
}

export const SALAM_UMAR: Dua = {
  label: 'Greeting Umar al-Faruq (may Allah be pleased with him)',
  arabic: 'السَّلَامُ عَلَيْكَ يَا عُمَرُ، يَا أَمِيرَ الْمُؤْمِنِينَ، السَّلَامُ عَلَيْكَ يَا فَارُوقُ، رَضِيَ اللَّهُ عَنْكَ وَجَزَاكَ عَنِ الْإِسْلَامِ خَيْرًا',
  transliteration:
    'As-salamu alayka ya Umar, ya Amiral-Mu’minin. As-salamu alayka ya Faruq. Radiyallahu anka wa jazaka anil-Islami khayra.',
  translation:
    'Peace be upon you, O Umar, Commander of the Believers. Peace be upon you, O Faruq. May Allah be pleased with you and reward you well for what you did for Islam.',
}

export const SALAWAT: Dua = {
  label: 'Salawat Ibrahimiyyah',
  arabic:
    'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
  transliteration:
    'Allahumma salli ala Muhammadin wa ala ali Muhammad, kama sallayta ala Ibrahima wa ala ali Ibrahim, innaka Hamidun Majid. Allahumma barik ala Muhammadin wa ala ali Muhammad, kama barakta ala Ibrahima wa ala ali Ibrahim, innaka Hamidun Majid.',
  translation:
    'O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim. Truly You are Praiseworthy and Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim. Truly You are Praiseworthy and Glorious.',
}

export const BAQI: Dua = {
  label: 'Greeting the People of al-Baqi’',
  arabic:
    'السَّلَامُ عَلَيْكُمْ دَارَ قَوْمٍ مُؤْمِنِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
  transliteration:
    'As-salamu alaykum dara qawmin mu’minin, wa inna in sha’Allahu bikum lahiqun. Nas’alullaha lana wa lakumul-afiyah.',
  translation:
    'Peace be upon you, abode of a believing people. We shall, God willing, join you. We ask Allah for well-being for us and for you.',
}

export const BELOVEDS_HOME_SUMMARY = [
  'Make the journey for the sake of the Messenger ﷺ, and renew your intention',
  'Wash, wear your best, apply perfume and send salawat as you walk to the masjid',
  'Enter with the right foot, say the du’a, and pray two rakats of Tahiyyat al-Masjid',
  'Book and visit the Rawdah (Riyad al-Jannah), pray and make du’a',
  'Stand before the chamber with a low voice, and give salam from the heart',
  'Greet Abu Bakr and Umar, ask Allah’s Messenger ﷺ to intercede for you, and leave with humility',
]

export const BELOVEDS_HOME: UmrahPart[] = [
  {
    id: 'prepare',
    title: 'Prepare Yourself',
    blurb: 'Who resides in Madinah, and why it is called Tayyibah.',
    steps: [
      {
        heading: 'Who Rests in This City?',
        images: [
          photo('masjid-nabawi', 'Masjid an-Nabawi, the Prophet’s ﷺ Mosque in Madinah', 'Muhammad Mahdi Karim · GFDL 1.2', 'Masjid_Nabawi_The_Prophet%27s_Mosque,_Madina.jpg'),
        ],
        paragraphs: [
          'Madinah is the city where the Prophet ﷺ made his home, where Islam took its first breaths as a state and a community, and where he rests today in the room of Aisha (may Allah be pleased with her). Before you arrive, reflect on whom you are about to visit, and on the sanctity of the ground that carried him ﷺ, his Companions, and the first generations of the Muslims.',
          'The scholars of every age advised the traveller to fill the road to Madinah with salawat and longing. The nearer one comes, the more the heart should soften, and the more the tongue should slow down.',
        ],
      },
      {
        heading: 'A City Called Tayyibah',
        paragraphs: [
          'The Prophet ﷺ said of Madinah: “Indeed it is Tabah (Tayyibah); it removes impurities as fire removes the dirt from silver.” (Bukhari and Muslim). Among its names are Tabah, Tayyibah, and al-Madinah al-Munawwarah.',
          'He ﷺ prayed: “O Allah, make us love Madinah as we love Makkah, or more.” (Bukhari and Muslim). In another narration he asked Allah to place in Madinah twice the blessing that Ibrahim asked for Makkah (Bukhari and Muslim).',
          'He ﷺ also said: “Whoever is patient with its hardship and difficulty, I will be an intercessor or a witness for him on the Day of Resurrection.” (Muslim). And “Whoever is able to die in Madinah, let him do so, for I will intercede for whoever dies there.” (Tirmidhi and Ahmad).',
        ],
      },
      {
        heading: 'The Promise of Intercession',
        paragraphs: [
          'The Prophet ﷺ said: “Whoever visits my grave, my intercession becomes due (wajabat) for him.” (al-Daraqutni and others). The chains of this narration were discussed by the hadith scholars. Imam al-Subki wrote an entire book on it, Shifa’ al-Siqam, and held that its routes support one another. It was acted upon by the scholars of the four schools, and it is cited together with the Qur’anic verse: “If, when they wronged themselves, they had come to you and asked forgiveness of Allah, and the Messenger asked forgiveness for them, they would have found Allah Accepting of repentance, Merciful.” (4:64).',
          'The scholars, including al-Nawawi, Ibn Qudamah, Ibn al-Humam and al-Qadi Iyad, therefore say that visiting the Prophet ﷺ is a recommended act, and the Hanafi and Maliki scholars describe it as among the most emphasised, close to obligatory.',
        ],
      },
    ],
  },
  {
    id: 'adab',
    title: 'Adab, Adab, Adab',
    blurb: 'Etiquette and manners are the key to what Madinah offers.',
    steps: [
      {
        heading: 'The Intention',
        paragraphs: [
          'The main intention for the journey to Madinah is to visit the final Messenger, our master Muhammad ﷺ. Next is to visit and pray in Masjid an-Nabawi, and, with it, to see the places of the sira and the history of Islam first-hand.',
          'The hadith of the three mosques, “Do not set out on a journey except to three mosques: al-Masjid al-Haram, this mosque of mine, and al-Masjid al-Aqsa” (Bukhari and Muslim), is explained by the scholars as being about travelling to a mosque for the reward of prayer in it. It does not forbid travelling to visit the Prophet ﷺ, the righteous, or to seek knowledge. In any case, the visit to him ﷺ is joined with the visit to his mosque.',
        ],
      },
      {
        heading: 'Upon Arrival',
        bullets: [
          'Go to your hotel and leave your luggage. Rest if you need to.',
          'Perform ghusl, or at least wudu, if you can.',
          'Change into your best clean clothes and apply perfume (itr).',
          'Renew your intention to visit the Messenger of Allah ﷺ.',
          'Keep your word and your behaviour with those around you gentle. You are about to be guests of the Prophet ﷺ.',
        ],
      },
      {
        heading: 'Heading Out for Ziyarah',
        images: [
          photo('nabawi-courtyard', 'The courtyard of Masjid an-Nabawi, shaded by its large umbrellas', 'King Eliot · CC BY-SA 4.0', 'Masjid_e_Nabawi_Courtyard_Umbrellas.jpg'),
        ],
        bullets: [
          'Send salawat on the Prophet ﷺ on your way to the masjid.',
          'Walk calmly, lower your gaze, and keep your voice low.',
          'It will not be as crowded as Makkah, but there is a lot of rush at times. Be patient with everyone.',
          'Do not push, and let the elderly go ahead.',
        ],
      },
      {
        heading: 'The Sanctity of the City',
        paragraphs: [
          'The Prophet ﷺ declared Madinah a sanctuary (haram) between its two lava fields: “Its trees are not to be cut, and its game is not to be hunted.” (Bukhari and Muslim). He also said that whoever intends evil for its people will melt like salt in water (Bukhari and Muslim).',
          'Keep the city clean, avoid harming its trees and animals, and avoid idle talk, arguments and bad language. Treat the people of Madinah, and every pilgrim around you, as the neighbours of the Messenger ﷺ.',
        ],
      },
    ],
  },
  {
    id: 'entering',
    title: 'Entering the Masjid',
    blurb: 'The first thing to do in the Prophet’s ﷺ mosque.',
    steps: [
      {
        heading: 'At the Door',
        paragraphs: [
          'Enter the masjid with the right foot, and recite salawat and the du’a in this way:',
        ],
        duas: [ENTER_MASJID],
      },
      {
        heading: 'Pray Two Rakats First',
        paragraphs: [
          'The first thing to do in the masjid is to observe the correct adab with Allah Almighty, by praying two rakats of Tahiyyat al-Masjid. The Prophet ﷺ said: “When one of you enters the mosque, let him not sit until he has prayed two rakats.” (Bukhari and Muslim).',
          'Pray it outside the times in which prayer is disliked (after Fajr and after Asr, at sunrise and at the zenith), according to your school, and ask your guide if you are unsure. If you enter at such a time, remain standing for a moment in remembrance or sit and recite salawat.',
        ],
      },
      {
        heading: 'The Prophetic Chamber',
        images: [
          photo('bab-as-salam', 'A door at Bab as-Salam, the Gate of Peace', 'بلال الدويك · CC BY-SA 3.0', 'Al-Masjed_Al-Nabawi_Bab_Al-Salam.jpg'),
        ],
        paragraphs: [
          'Then head towards the Prophetic Chamber (al-Hujrah al-Sharifah). Brothers go from Bab as-Salam (the Gate of Peace), which is open almost 24 hours. The sisters’ side is separate. Both can book the Rawdah through the Nusuk app.',
          'You can give salam from anywhere, even outside in the courtyard. But you are about to stand before the Best of Creation and the Noblest of Allah’s Prophets, so let the heart be present, and the heart should be quiet.',
        ],
      },
    ],
  },
  {
    id: 'rawdah',
    title: 'Riyad al-Jannah',
    blurb: 'The garden of Paradise between his house and his minbar.',
    steps: [
      {
        heading: 'What Is the Rawdah?',
        images: [
          photo('rawdah', 'The Green Dome above the Prophet’s ﷺ chamber and the Rawdah', 'آرمین · CC0', 'Green_Dome_of_Al-Masjed_Al-Nabawi.jpg'),
        ],
        paragraphs: [
          'The Prophet ﷺ said: “Between my house and my minbar is a garden from the gardens of Paradise.” (Bukhari and Muslim). It is the space marked by the green carpet, lying between his chamber and his minbar. The scholars understand that it is a garden of Paradise in the Hereafter, and a place where mercy descends in this world.',
        ],
      },
      {
        heading: 'Booking Your Visit',
        bullets: [
          'Visits to the Rawdah must be booked through the Nusuk app. Slots are timed.',
          'Men and women visit at separate times and in separate sections.',
          'Arrive early to your slot, with wudu, and keep your permit on you.',
          'If you cannot get a slot, do not be sad. Any prayer in the Prophet’s mosque is worth a thousand elsewhere (Bukhari and Muslim), and you can still give salam from anywhere in the mosque.',
        ],
      },
      {
        heading: 'What to Do Inside',
        images: [
          photo('rawdah-interior', 'Worshippers praying and reading Qur’an in the Rawdah, beside the minbar', 'Uleke · CC BY-SA 3.0', 'Rawdah_by_Uleke.jpg'),
        ],
        bullets: [
          'Pray two rakats of nafl if there is room, and do not stand in the way of others.',
          'Make abundant salawat, repent, and make du’a for yourself, your family, the Ummah and those who asked you to pray for them.',
          'Thank Allah that He brought you here, and ask Him to bring you back.',
          'Do not push, raise your voice, or take photographs of those praying.',
          'Obey the guards if they ask you to move on. Their request is part of adab.',
        ],
      },
      {
        heading: 'Pillars of the Rawdah',
        images: [
          photo('minbar', 'The minbar of the Prophet’s ﷺ mosque and the mihrab beside it', 'Mondephile · CC BY-SA 3.0', 'Minbar_in_al-Masjid_al-Nabawi.jpg'),
        ],
        paragraphs: [
          'You will pass the platform of Ahl as-Suffah, the poor Companions who lived in the mosque and devoted themselves to knowledge. Within the Rawdah are the pillar of Aisha, the pillar of repentance (Abu Lubabah) and the pillar of the delegations, and beside the minbar is the place of the palm trunk that wept for the Prophet ﷺ. Read about them in the Haramayn section.',
        ],
      },
    ],
  },
  {
    id: 'salam',
    title: 'Giving Salam',
    blurb: 'Greeting the Prophet ﷺ, and Abu Bakr and Umar.',
    steps: [
      {
        heading: 'Why It Matters',
        paragraphs: [
          'The Prophet ﷺ said: “There is no one who greets me except that Allah returns my soul to me, so that I may return his greeting.” (Abu Dawud). He ﷺ also said that Allah has angels travelling the earth who convey to him the salam of his Ummah (Nasa’i and Ahmad).',
          'Therefore, the scholars say that the visitor is not speaking into silence. The Messenger ﷺ is the generous Prophet who hears and answers.',
        ],
      },
      {
        heading: 'Where to Stand',
        paragraphs: [
          'The Prophet ﷺ rests in the chamber of Aisha, with Abu Bakr and Umar (may Allah be pleased with them) beside him. As you walk from Bab as-Salam, you pass the Prophet ﷺ first, then Abu Bakr, then Umar. This is for the men, as they come from Bab as-Salam.',
          'The scholars of the four schools wrote that the visitor stands at a respectful distance, faces the Prophetic Chamber and has his back to the Qiblah. Qadi Iyad relates that Imam Malik said to the caliph al-Mansur: “Why would you turn your face away from him, when he is your means to Allah, and the means of your father Adam, on the Day of Resurrection?” Al-Nawawi and Ibn Qudamah say the same, and Ibn al-Humam in the Hanafi school.',
          'Keep your distance, as the scholars said. Out of respect, the scholars discourage touching, kissing or rubbing the grille and walls, circling the chamber, and bowing or prostrating, since prostration is for Allah alone. Al-Nawawi and the Hanafi jurists state that the adab is to keep your distance and stand as one would before him in his lifetime.',
        ],
      },
      {
        heading: 'How to Give Salam',
        paragraphs: [
          'The correct adab is to give salam from the heart. In your own words, in any language, greet Allah’s Messenger ﷺ the way you feel comfortable. He is the generous Prophet who understands the whispers of the heart. You do not need to memorise lengthy Arabic greetings. Keep your voice low, as Allah says: “Do not raise your voices above the voice of the Prophet.” (49:2).',
          'If you wish to use words, a short form is enough, as is reported from the Companions. The Muwatta of Imam Malik reports that Abdullah ibn Umar would stand at the grave and say: “Peace be upon you, O Messenger of Allah. Peace be upon you, O Abu Bakr. Peace be upon you, O my father.”',
        ],
        duas: [SALAM_PROPHET, SALAWAT],
      },
      {
        heading: 'Conveying Greetings and Asking for Intercession',
        paragraphs: [
          'If people have asked you to convey their greetings, do this now. Say: “O Messenger of Allah, so-and-so, the son of so-and-so, sends you salam and asks for your intercession with your Lord.”',
          'Finally, ask Allah’s Messenger ﷺ to intercede for you. Traditional scholars teach that this is permissible, since Allah alone gives and withholds, and the Prophet ﷺ is the means by whom His mercy reaches us.',
        ],
      },
      {
        heading: 'Abu Bakr and Umar',
        paragraphs: [
          'Then move slightly to the right, so that you are before Sayyiduna Abu Bakr, and greet him. Then move again to the right and greet Sayyiduna Umar (may Allah be pleased with them both). They are the two companions who were closest to the Prophet ﷺ in life, and who lie near him in death.',
        ],
        duas: [SALAM_ABU_BAKR, SALAM_UMAR],
      },
      {
        heading: 'If You Cannot Get Close',
        paragraphs: [
          'Whether you are in the crowd, at the back, in the sisters’ section or even in the courtyard outside, your salam reaches him. Face the chamber if you can, lower your gaze, and say the salam from the heart. Sisters give salam in the same way, from the area designated for them, at their allotted time.',
          'Do not stay too long. Say what you need to, and make way for those behind you.',
        ],
      },
    ],
  },
  {
    id: 'around',
    title: 'Around Madinah',
    blurb: 'The people and places the Prophet ﷺ loved.',
    steps: [
      {
        heading: 'Al-Baqi’',
        images: [
          photo('baqi', 'Al-Baqi’ Cemetery, Madinah', 'Saleh Al Hussain · CC BY 4.0', 'Al-Baqi_Cemetery_2021.jpg'),
        ],
        paragraphs: [
          'Al-Baqi’ is the cemetery beside the mosque, where thousands of Companions, the family of the Prophet ﷺ, many of his wives, his son Ibrahim, his grandson al-Hasan, and Uthman (may Allah be pleased with them) are buried. The Prophet ﷺ used to go there at night and greet its people (Muslim). It is visited by men.',
        ],
        duas: [BAQI],
      },
      {
        heading: 'Uhud',
        images: [
          photo('uhud', 'Mount Uhud, Madinah', 'Ahmed · CC BY 4.0', 'Mount_Uhud,_Medina_20241002_091205_889.jpg'),
        ],
        paragraphs: [
          'The Prophet ﷺ said: “Uhud is a mountain that loves us and we love it.” (Bukhari and Muslim). Here the battle of Uhud took place in 3 AH, and Hamza, the lion of Allah, and the seventy martyrs are buried at its foot. Visit, greet the martyrs, and take lessons from the sira.',
        ],
      },
      {
        heading: 'Masjid Quba',
        images: [
          photo('quba', 'Masjid Quba, the first masjid in Islam', 'Kaliper1 · CC BY-SA 4.0', 'Quba_Mosque_(2024).jpg'),
        ],
        paragraphs: [
          'Masjid Quba is the first masjid built in Islam. The Prophet ﷺ said: “Whoever purifies himself at home, then comes to Masjid Quba and prays in it, will have a reward like that of an Umrah.” (Ibn Majah and Nasa’i). The Prophet ﷺ used to visit it every Saturday.',
        ],
      },
      {
        heading: 'Masjid al-Qiblatayn and the Khandaq Mosques',
        images: [
          photo('qiblatayn', 'Masjid al-Qiblatayn, the Mosque of the Two Qiblahs', 'Bintladen · CC BY-SA 4.0', 'Masjid_al-Qiblatayn.jpg'),
          photo('fath', 'The Seven Mosques (Masjid al-Fath) at the site of the Trench', 'Imam Khairul Annas · CC BY-SA 3.0', 'Sab%27u_Masajid.jpg'),
        ],
        paragraphs: [
          'Masjid al-Qiblatayn is where the Qiblah was changed from Jerusalem to the Ka’bah. The seven mosques of al-Khandaq (the Trench) mark the places where the Companions defended Madinah. The Historical Sites section lists these places with their stories.',
        ],
      },
    ],
  },
  {
    id: 'farewell',
    title: 'Farewell',
    blurb: 'Leaving Madinah with the heart still there.',
    steps: [
      {
        heading: 'Leaving the Masjid',
        paragraphs: ['Leave the masjid with the left foot and say:'],
        duas: [LEAVE_MASJID],
      },
      {
        heading: 'The Farewell Visit',
        bullets: [
          'Before you leave Madinah, return once more to give salam, pray two rakats and make du’a.',
          'Ask Allah to accept your visit, to make it not your last, and to bring you back in safety.',
          'Make du’a for your family, and the Ummah, in particular the people of Palestine, and ask Allah to grant us visitation to Masjid al-Aqsa.',
          'Leave with your good intentions for being a better servant of Allah, a better follower of His Messenger ﷺ, and a better neighbour to the people around you.',
        ],
      },
    ],
  },
]
