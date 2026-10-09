export type HaramSection = {
  id: 'masjid-al-haram' | 'kaabah' | 'masjid-an-nabawi' | 'rawdah'
  title: string
  city: 'Makkah' | 'Madinah'
  image: { src: string; credit: string; href: string }
  intro: string
  topics: { heading: string; paragraphs: string[] }[]
}

const commons = (src: string, credit: string, file: string) => ({
  src: `/images/sites/${src}.jpg`,
  credit,
  href: `https://commons.wikimedia.org/wiki/File:${file}`,
})

export const HARAMAYN: HaramSection[] = [
  {
    id: 'masjid-al-haram',
    title: 'Masjid al-Haram',
    city: 'Makkah',
    image: commons('masjid-al-haram', 'Wurzelgnohm · CC0', 'Masjidul-HaramAerialView_(cropped).jpg'),
    intro:
      'The Sacred Mosque in Makkah, which surrounds the Ka’bah, and the direction of prayer for all Muslims. It is the most virtuous mosque on earth and the destination of Hajj and Umrah.',
    topics: [
      {
        heading: 'Sanctity of the Haram',
        paragraphs: [
          'Allah made Makkah a sanctuary (haram). The Prophet ﷺ said: “Allah made Makkah sacred the day He created the heavens and the earth.” (Bukhari and Muslim). Within its boundaries, it is forbidden to hunt, to uproot its plants, or to fight. Allah says: “Whoever enters it shall be safe.” (3:97)',
          'This sanctity answers the supplication of Ibrahim ﷺ: “My Lord, make this a secure city.” (14:35). The scholars teach that sins committed in the Haram carry a heavier weight, and good deeds are magnified, so the pilgrim guards his tongue, eyes and heart with extra care.',
        ],
      },
      {
        heading: 'Virtue of Prayer Here',
        paragraphs: [
          'The Prophet ﷺ said: “A prayer in this mosque of mine is better than a thousand prayers in any other mosque, except Masjid al-Haram, and a prayer in Masjid al-Haram is better than a hundred thousand prayers elsewhere.” (Ahmad and Ibn Majah).',
        ],
      },
      {
        heading: 'History of the Mosque',
        paragraphs: [
          'In the time of the Prophet ﷺ, the Ka’bah was surrounded by an open area for tawaf, with houses around it. When Umar ibn al-Khattab became caliph, he bought some of those houses and built a low wall around the Ka’bah. Uthman expanded it further and added colonnades.',
          'It was enlarged under the Umayyads and again under the Abbasids, especially al-Mansur and al-Mahdi. In the 16th century, the Ottoman Sultan Selim II commissioned the architect Sinan to rebuild it with arcades and domes, much of which survived into the modern era. The Saudi expansions of the 20th and 21st centuries have made it the largest mosque in the world.',
        ],
      },
      {
        heading: 'Within the Haram',
        paragraphs: [
          'Within the mosque are the Ka’bah, the Black Stone, the Maqam Ibrahim, the well of Zamzam and, connected to the Haram, the route between Safa and Marwa. The scholars call these the sha’a’ir, the signs of Allah: “Whoever honours the symbols of Allah, indeed, it is from the piety of hearts.” (22:32)',
          'The rites of Umrah are performed here: ihram, tawaf, two rakats behind the Maqam, drinking Zamzam, Sa’i and shaving or trimming the hair.',
        ],
      },
      {
        heading: 'Etiquette',
        paragraphs: [
          'When entering, step in with the right foot and say: “Bismillah, wa-s-salatu wa-s-salamu ala Rasulillah. Allahumma-ftah li abwaba rahmatik.” On first seeing the Ka’bah, it is recommended to make du’a, as this is a time when supplications are accepted. Early scholars, including Sa’id ibn al-Musayyib and Mujahid, are reported to have said that du’a is answered at the sight of the House.',
          'Be gentle in the crowds, avoid pushing, lower your gaze, and remember that you are in the House of Allah.',
        ],
      },
    ],
  },
  {
    id: 'kaabah',
    title: 'The Ka’bah',
    city: 'Makkah',
    image: commons('kaabah', 'Adli Wahid · CC BY-SA 4.0', 'The_Kaaba_during_Hajj_-_edited.jpg'),
    intro:
      'The House of Allah, the qiblah of the Muslims and the first house set up for the worship of Allah. Muslims face it in prayer and circle it in tawaf, but they worship Allah alone.',
    topics: [
      {
        heading: 'Names and Meaning',
        paragraphs: [
          'It is called al-Bayt al-Haram (the Sacred House), al-Bayt al-Atiq (the Ancient House, 22:29) and the Ka’bah, meaning cube. Allah says: “Indeed, the first House established for mankind was that at Bakkah, blessed and a guidance for the worlds.” (3:96)',
          'The Muslim creed is clear that the Ka’bah is a direction and a sign, not an object of worship. The Muslim turns to it in prayer in obedience to Allah’s command, and worships Allah alone, just as the angels circle the Throne.',
        ],
      },
      {
        heading: 'Origins and Ibrahim ﷺ',
        paragraphs: [
          'The Qur’an tells that Ibrahim and Ismail ﷺ raised its foundations: “And [mention] when Abraham was raising the foundations of the House and [with him] Ishmael, [saying], ‘Our Lord, accept [this] from us.’” (2:127)',
          'Some reports say that the angels, or Adam ﷺ, built the House first and that Ibrahim ﷺ rebuilt it on its earlier foundations.',
        ],
      },
      {
        heading: 'Rebuildings Through History',
        paragraphs: [
          'Five years before the first revelation, when the Prophet ﷺ was about thirty-five, the Quraysh rebuilt the Ka’bah after a flood damaged it. Each tribe wanted the honour of placing the Black Stone, and the dispute grew so heated that they came close to fighting. The eldest among them proposed that they accept as judge the first man to enter through the gate of Banu Shaybah. That man was Muhammad ﷺ. When they saw him they said: “This is al-Amin (the Trustworthy). We are satisfied. This is Muhammad.” He had long been known among them by this name for his honesty, and for never lying or betraying a trust, so they trusted him even before prophethood. He spread out a cloth, placed the stone on it, and had a leader of each tribe lift an edge, then set it in place himself, ending the dispute without bloodshed. Because their lawful funds ran short, the Quraysh left part of the House outside the walls, which is now the Hijr or Hateem.',
          'The Prophet ﷺ told Aisha (may Allah be pleased with her) that had her people not so recently left disbelief, he would have rebuilt it on the foundations of Ibrahim ﷺ, with the Hijr inside and two doors, at ground level (Bukhari and Muslim). Abdullah ibn az-Zubayr rebuilt it in this way, but al-Hajjaj later returned it to the Quraysh form. It is reported that Imam Malik advised the caliph against repeated alteration so that the House would not become a plaything for kings.',
          'The present building is essentially that of the Ottoman Sultan Murad IV, who rebuilt it in 1630 after floods damaged the walls.',
        ],
      },
      {
        heading: 'Structure',
        paragraphs: [
          'The Ka’bah is roughly 13 metres high and 11 by 12 metres at the base. It is covered with the kiswah, a black silk cloth embroidered with gold calligraphy, replaced each year. The door is set about two metres above the ground, and the interior contains three pillars and hanging lamps.',
          'Its four corners are known as the Black Stone corner (al-Hajar al-Aswad), the Yemeni corner (ar-Rukn al-Yamani), the Iraqi and the Shami corners. On the northern side is the semicircular wall of the Hijr, and above it the golden waterspout, the Mizab.',
        ],
      },
      {
        heading: 'The Black Stone and the Yemeni Corner',
        paragraphs: [
          'The Prophet ﷺ said: “The Black Stone descended from Paradise, whiter than milk, and the sins of the sons of Adam made it black.” (Tirmidhi). The Prophet ﷺ kissed it, and Umar did the same, saying: “I know that you are a stone, which neither harms nor benefits, and had I not seen the Prophet ﷺ kiss you, I would not have kissed you.” (Bukhari and Muslim)',
          'The traditional understanding is that kissing it is a following of the Sunnah and an honouring of what Allah has honoured, not a belief that the stone has power of itself, as benefit and harm are in Allah’s hand alone. If it is too crowded, the Sunnah is to point towards it with the hand and say “Allahu akbar”. The Yemeni corner is touched, not kissed, and between it and the Black Stone the Prophet ﷺ used to recite: “Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.” (2:201)',
        ],
      },
      {
        heading: 'The Multazam',
        paragraphs: [
          'The Multazam is the section of wall between the Black Stone and the door. It is reported that the Companions, including Ibn Abbas, pressed their chests and faces against it while making du’a. The scholars regard it as a place where supplication is especially hoped to be accepted, though the Hadith reporting the Prophet ﷺ doing so is graded weak by some. If the crowd makes it difficult, supplication from a distance is sufficient.',
        ],
      },
      {
        heading: 'Tawaf',
        paragraphs: [
          'Tawaf is seven circuits, anticlockwise, beginning and ending at the Black Stone. The Prophet ﷺ said: “Tawaf around the House is like prayer, except that Allah has permitted speech in it.” (Tirmidhi), so the tongue should be busy with dhikr, du’a and the Qur’an. In the first tawaf, men uncover the right shoulder (idtiba’) and walk briskly in the first three circuits (raml) according to the majority.',
        ],
      },
    ],
  },
  {
    id: 'masjid-an-nabawi',
    title: 'Masjid an-Nabawi',
    city: 'Madinah',
    image: commons('masjid-nabawi', 'Muhammad Mahdi Karim · GFDL 1.2', 'Masjid_Nabawi_The_Prophet%27s_Mosque,_Madina.jpg'),
    intro:
      'The Prophet’s Mosque in Madinah, where he ﷺ rests in the chamber of Aisha (may Allah be pleased with her). Muslims travel to it to pray in his mosque and to send blessings and peace upon him.',
    topics: [
      {
        heading: 'Virtue of the Mosque',
        paragraphs: [
          'The Prophet ﷺ said: “One prayer in this mosque of mine is better than a thousand prayers elsewhere, except Masjid al-Haram.” (Bukhari and Muslim). He also said: “Do not set out on a journey except to three mosques: Masjid al-Haram, this mosque of mine, and Masjid al-Aqsa.” (Bukhari and Muslim)',
          'Scholars such as al-Nawawi, al-Subki and Ibn Hajar al-Asqalani explained that this hadith concerns travelling to a mosque in the hope of a special reward for prayer in it. It does not forbid travelling to visit the Prophet ﷺ, scholars, or to seek knowledge. The Companions and those who followed them travelled to Madinah to visit him ﷺ.',
        ],
      },
      {
        heading: 'Visiting the Prophet ﷺ',
        paragraphs: [
          'The four madhhabs agree that visiting the Prophet ﷺ (ziyarah) is recommended. Many Hanafi and Maliki scholars describe it as one of the most emphasised acts, close to being obligatory. Qadi Iyad wrote that visiting him ﷺ is a Sunnah of the Muslims on which there is agreement, and a virtuous act that is encouraged.',
          'Scholars including al-Nawawi and Ibn Kathir cite Allah’s words: “And if, when they wronged themselves, they had come to you, [O Muhammad], and asked forgiveness of Allah and the Messenger had asked forgiveness for them, they would have found Allah Accepting of repentance and Merciful.” (4:64). The Prophet ﷺ said: “Whoever sends salam upon me, Allah returns my soul to me so that I may return his greeting.” (Abu Dawud)',
          'The scholars also cite his words: “The prophets are alive in their graves, praying.” (Abu Ya’la and al-Bayhaqi, with a chain that Ibn Hajar graded as sound). On this basis, they hold that the Prophet ﷺ hears the greeting of those who stand before him, and that angels convey the salam of those who are far away.',
        ],
      },
      {
        heading: 'Etiquette of the Visit',
        paragraphs: [
          'Allah teaches respect in the presence of His Messenger ﷺ: “Do not raise your voices above the voice of the Prophet.” (49:2). So the visitor lowers the voice, keeps calm, stands a respectful distance away facing the grave, and greets the Prophet ﷺ: “Peace be upon you, O Messenger of Allah; peace be upon you, O Prophet of Allah.” Then, moving aside slightly, he greets Abu Bakr and Umar (may Allah be pleased with them).',
          'The visitor sends abundant salawat on the Prophet ﷺ and asks Allah for forgiveness and for the best of this world and the next. It is a time to renew love for him and to resolve to follow his Sunnah. Do not push, take photographs of the grave area, or linger in a way that blocks others.',
        ],
      },
      {
        heading: 'Tawassul and Seeking Blessing',
        paragraphs: [
          'Traditional scholars teach that it is permissible to ask Allah by the rank of the Prophet ﷺ (tawassul), since Allah alone gives and withholds, and the Prophet ﷺ is the means by which Allah’s mercy reaches us. Their evidence includes the hadith of the blind man whom the Prophet ﷺ taught to say: “O Allah, I ask You and turn to You by Your Prophet Muhammad, the Prophet of mercy.” (Tirmidhi and Ahmad).',
          'They also cite Umar, who during a drought asked Allah by the supplication of the Prophet’s ﷺ uncle, al-Abbas (Bukhari), and the Companions’ seeking blessing (tabarruk) from the Prophet’s ﷺ hair, his wudu water and his sweat. The condition is that all the ultimate benefit and harm remain with Allah alone.',
        ],
      },
      {
        heading: 'The Chamber and the Green Dome',
        paragraphs: [
          'The Prophet ﷺ passed away in the room of Aisha (may Allah be pleased with her) and was buried there, with Abu Bakr and Umar later buried beside him. The chambers of his wives lay just outside the mosque. During the reign of al-Walid, in about 88 AH, the governor of Madinah, Umar ibn Abd al-Aziz, incorporated them into the mosque.',
          'The Green Dome was built over the chamber in the Mamluk and Ottoman periods and painted green in 1837. The scholars regard the place of his burial as the most excellent spot on earth, a point of agreement noted by Qadi Iyad and others, although the majority hold that Makkah as a city is more virtuous than Madinah, while the Malikis hold that Madinah is.',
        ],
      },
      {
        heading: 'History of the Chamber',
        paragraphs: [
          'In the Prophet’s ﷺ time, the chamber was a simple room belonging to Aisha (may Allah be pleased with her), built of palm trunks and mud brick with a roof of palm fronds. Its door opened onto the mosque, and the Prophet ﷺ would put his head out of it to Aisha while he was in i’tikaf. When he passed away in 11 AH, the Companions disagreed about where to bury him, until Abu Bakr narrated that he had heard the Prophet ﷺ say that a prophet is buried where he dies (Tirmidhi and Ibn Majah). The grave was therefore dug in the room itself.',
          'Abu Bakr was buried beside him in 13 AH, and Umar in 23 AH, with Aisha’s permission. She continued to live in the room, and after Umar was buried there, she began to wear her full covering when she entered. The scholars note that the three graves are arranged side by side, in the order of the Prophet ﷺ, Abu Bakr and Umar.',
          'In about 88 AH, the governor of Madinah, Umar ibn Abd al-Aziz, incorporated the wives’ rooms into the mosque. He built a five-sided wall around the chamber, deliberately not squared to the qiblah, so that no one could pray facing the grave as if it were the qiblah. A second wall was later built around the first, and the graves are not visible from the mosque.',
          'It is reported that in the 6th century AH, when a plot to steal the Prophet’s ﷺ body was uncovered, the ruler Nur ad-Din Zangi ordered a trench dug around the chamber and filled with molten lead, so that the graves would be secure. The wooden dome above it was first built by the Mamluk sultan Qalawun in 678 AH, and, after a fire in 886 AH, Sultan Qaytbay rebuilt the chamber and the mosque. The Ottoman sultan Mahmud II built the present dome in 1818 and had it painted green in 1837. The brass grille that visitors face was added by the Ottomans.',
        ],
      },
      {
        heading: 'Within the Mosque',
        paragraphs: [
          'The mosque contains the Rawdah, the minbar and mihrab of the Prophet ﷺ, the place of the palm trunk that wept when the Prophet ﷺ left it, and the platform of Ahl as-Suffah. The gate of Jibril (Bab Jibril) is named after the angel who is reported to have come to the Prophet ﷺ at it, and the Gate of Peace (Bab as-Salam) is the traditional entrance for visiting.',
        ],
      },
    ],
  },
  {
    id: 'rawdah',
    title: 'Rawdah Sharif',
    city: 'Madinah',
    image: commons('rawdah', 'آرمین · CC0', 'Green_Dome_of_Al-Masjed_Al-Nabawi.jpg'),
    intro:
      'The small, blessed area inside Masjid an-Nabawi that the Prophet ﷺ called a garden from the gardens of Paradise. It lies between his chamber, where he rests, and his minbar.',
    topics: [
      {
        heading: 'The Hadith of the Rawdah',
        paragraphs: [
          'The Prophet ﷺ said: “Between my house and my minbar is a garden from the gardens of Paradise, and my minbar is upon my pool (al-Hawd).” (Bukhari and Muslim). The scholars understand it in two ways, and many hold both: that it is a garden of Paradise in the Hereafter, and that it is a place where mercy descends and remembrance is sweet in this life, so that those who sit here are as if in the gardens of Paradise.',
          'Its length runs from the room of Aisha (may Allah be pleased with her) to the minbar, and it is marked by its green carpet while the rest of the mosque is red. Its precise extent has been fixed by the scholars of Madinah across the centuries, and the pillars mark its boundaries.',
        ],
      },
      {
        heading: 'Ahl as-Suffah',
        paragraphs: [
          'When entering the Rawdah, you walk past the area of Ahl as-Suffah. They were poor Companions, many of them migrants with no home, family or wealth in Madinah. They lived on a raised platform (suffah) at the back of the mosque and devoted themselves to learning the Qur’an and the Prophet’s ﷺ teachings. Abu Hurayrah (may Allah be pleased with him) was among them, and he became the greatest narrator of hadith.',
          'The Prophet ﷺ cared deeply for them. When charity (sadaqah) came to him, he sent it all to them, and when a gift came, he shared it with them. Allah commanded him: “And keep yourself patient with those who call upon their Lord morning and evening, seeking His countenance.” (18:28). The scholars of tasawwuf and fiqh alike point to them as a model of poverty with contentment, devotion and the pursuit of knowledge.',
        ],
      },
      {
        heading: 'Pillars of the Rawdah',
        paragraphs: [
          'Several pillars within the Rawdah carry names, reflecting events of the Prophet’s ﷺ time. The pillar of Abu Lubabah (the pillar of repentance) is where Abu Lubabah ibn Abd al-Mundhir tied himself in remorse until Allah accepted his repentance. The pillar of Aisha, also called the pillar of the lots, is linked to a report that if people knew its virtue they would draw lots to pray there. Others include the pillar of the delegations (al-Wufud), where the Prophet ﷺ received envoys, the pillar of the guards (al-Hars), and the pillar of Jibril.',
          'Near the minbar is the place where the palm trunk stood that the Prophet ﷺ used to lean on when preaching. When the minbar was made and he left the trunk, it moaned like a camel, until he came down and embraced it (Bukhari). Scholars cite this as a sign of the love that even creation has for the Messenger ﷺ.',
        ],
      },
      {
        heading: 'Praying and Making Du’a Here',
        paragraphs: [
          'It is recommended to pray two rakats in the Rawdah if you can, and to make du’a, send abundant salawat upon the Prophet ﷺ, and ask Allah for forgiveness. Do not delay, since the area is small and many others are waiting.',
          'Entry is usually by timed permit, with different times for men and women. Be patient and gentle in the crowds, do not push or pray for a long time, and respect those around you. If you cannot reach the Rawdah, a prayer anywhere in the mosque carries the great reward of Masjid an-Nabawi.',
        ],
      },
      {
        heading: 'Greeting the Prophet ﷺ After the Rawdah',
        paragraphs: [
          'After praying in the Rawdah, visitors go to greet the Prophet ﷺ at his chamber, then Abu Bakr and Umar (may Allah be pleased with them). The etiquette of this visit and the position of the scholars on ziyarah are described in the Masjid an-Nabawi section above.',
        ],
      },
    ],
  },
]
