export type Site = {
  name: string
  mapQuery: string
  year: string
  image?: { src: string; credit: string; href: string }
  summary: string
  history: string[]
  keyFacts: string[]
  more?: { label: string; anchor: string }
}

export type CitySites = {
  city: 'Madinah' | 'Makkah'
  intro: string
  podcast?: { title: string; host: string; url: string }
  sites: Site[]
}

// Photos are from Wikimedia Commons; the credit line is shown under each one.
const commons = (src: string, credit: string, file: string) => ({
  src: `/images/sites/${src}.jpg`,
  credit,
  href: `https://commons.wikimedia.org/wiki/File:${file}`,
})

export const siteMapUrl = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export const SITES: CitySites[] = [
  {
    city: 'Madinah',
    intro:
      'The city of the Prophet ﷺ, where he settled after the Hijrah and where the first Muslim community was established.',
    podcast: { title: 'The Blessed City', host: 'Shaykh Waseem Ahmed', url: 'https://www.youtube.com/watch?v=mHPyNOZEDiI' },
    sites: [
      {
        name: 'Masjid an-Nabawi',
        mapQuery: 'Al-Masjid an-Nabawi, Madinah',
        more: { label: 'Read more on Masjid an-Nabawi', anchor: 'masjid-an-nabawi' },
        year: '1 AH · 622 CE',
        image: commons('masjid-nabawi', 'Muhammad Mahdi Karim · GFDL 1.2', 'Masjid_Nabawi_The_Prophet%27s_Mosque,_Madina.jpg'),
        summary: 'The Prophet’s Mosque, the second holiest mosque in Islam.',
        history: [
          'After arriving in Madinah, the Prophet’s ﷺ camel knelt on a plot of land belonging to two orphans, Sahl and Suhayl. He bought the land and began building a mosque there. He worked alongside the Companions, carrying bricks himself. The first mosque was simple: walls of mud brick, palm trunks for pillars and a roof of palm leaves.',
          'It was more than a place of prayer. It was the centre of the new community, used for learning, for meeting delegations, for consultation and for governance. A raised platform at the back, the Suffah, housed poor Companions known as Ahl as-Suffah, who devoted themselves to learning from the Prophet ﷺ.',
          'The mosque was enlarged by the Prophet ﷺ himself after Khaybar, and later by Umar and Uthman. The Umayyad caliph al-Walid added minarets and a more permanent structure, and the Ottoman sultans rebuilt and decorated it extensively. The Green Dome over the Prophet’s ﷺ chamber dates from the early 19th century and was painted green in 1837.',
          'The Saudi expansions of the 20th century, especially the major project completed in the 1990s, made it one of the largest mosques in the world, with retractable umbrellas shading the courtyards.',
        ],
        keyFacts: [
          'The Prophet ﷺ said that one prayer in his mosque is better than a thousand prayers elsewhere, except Masjid al-Haram.',
          'The Prophet ﷺ is buried here, in the chamber of Aisha (may Allah be pleased with her), along with Abu Bakr and Umar.',
          'Features include the Rawdah, the Prophet’s ﷺ minbar and mihrab, and the area of Ahl as-Suffah.',
          'It is one of the three mosques that the Prophet ﷺ said one may travel to for worship.',
        ],
      },
      {
        name: 'Rawdah Sharif',
        mapQuery: 'Rawdah Sharif, Al-Masjid an-Nabawi, Madinah',
        more: { label: 'Read more on the Rawdah Sharif', anchor: 'rawdah' },
        year: '11 AH · 632 CE',
        image: commons('rawdah', 'آرمین · CC0', 'Green_Dome_of_Al-Masjed_Al-Nabawi.jpg'),
        summary: 'The “garden of Paradise” between the Prophet’s ﷺ house and his minbar.',
        history: [
          'The Prophet ﷺ said: “Between my house and my minbar is a garden from the gardens of Paradise.” This small area inside Masjid an-Nabawi is called the Rawdah (the garden). The Companions sought to pray here, and he encouraged them to value it.',
          'To the east of the Rawdah is the room of Aisha (may Allah be pleased with her), where the Prophet ﷺ passed away in 11 AH and was buried. Abu Bakr and Umar (may Allah be pleased with them) were later buried beside him. To the west is the minbar from which he gave the khutbah.',
          'As you enter the Rawdah, you walk past the area of Ahl as-Suffah. These were poor, mostly homeless Companions, such as Abu Hurayrah, who had no family or wealth in Madinah and lived on a raised platform (suffah) in the mosque. They gave their days to learning the Qur’an and the Prophet’s ﷺ teachings, and their nights to worship, while the Prophet ﷺ shared his own food and charity with them. Many of them became great teachers and narrators of hadith, and Allah told His Messenger ﷺ to keep himself patient with those who call upon their Lord morning and evening (18:28). Their example shows that knowledge and devotion matter more than wealth.',
          'The Rawdah is marked by a green carpet, while the rest of the mosque has red carpets. Among its pillars are the pillar of Aisha, the pillar of Abu Lubabah, where he tied himself in repentance, the pillar of the delegations, and the pillar of Tahajjud. Near the minbar is the place of the palm trunk that the Prophet ﷺ used to lean on before the minbar was made; the trunk is reported to have wept when he left it.',
        ],
        keyFacts: [
          'It is a small area of the mosque, so it is usually very crowded.',
          'You pass the area of Ahl as-Suffah on the way in. Pause to remember them.',
          'Visits are done via the Nusuk app.',
          'Pray two rakats here if you can, with calm and respect for others.',
        ],
      },
      {
        name: 'Masjid Quba',
        mapQuery: 'Quba Mosque, Madinah',
        year: '1 AH · 622 CE',
        image: commons('quba', 'Kaliper1 · CC BY-SA 4.0', 'Quba_Mosque_(2024).jpg'),
        summary: 'The first mosque built in Islam.',
        history: [
          'When the Prophet ﷺ migrated from Makkah, he stopped at Quba on the outskirts of Madinah and stayed several days before entering the city. During that time he laid the foundation of this mosque, and the Companions built it with him.',
          'Allah refers to it in the Qur’an as a mosque “founded on taqwa from the first day” (9:108). When the Prophet ﷺ left Quba, he rode into Madinah and the people welcomed him with joy.',
          'The Prophet ﷺ used to visit Quba every week, riding or on foot, and pray two rakats there. The mosque has been rebuilt and expanded many times over the centuries, most recently in the 1980s.',
        ],
        keyFacts: [
          'The Prophet ﷺ said that whoever purifies himself at home, then comes to Masjid Quba and prays in it, has a reward like an Umrah.',
          'The Prophet ﷺ visited Quba every week.',
          'It is about five kilometres from Masjid an-Nabawi.',
        ],
      },
      {
        name: 'Mount Uhud and the Martyrs of Uhud',
        mapQuery: 'Uhud Martyrs Cemetery, Madinah',
        year: '3 AH · 625 CE',
        image: commons('uhud', 'Ahmed · CC BY 4.0', 'Mount_Uhud,_Medina_20241002_091205_889.jpg'),
        summary: 'The site of the Battle of Uhud and the graves of its martyrs.',
        history: [
          'The Battle of Uhud took place in Shawwal, 3 AH, when Quraysh marched on Madinah with around three thousand men to avenge their defeat at Badr. The Prophet ﷺ set out with about a thousand, but around three hundred under Abdullah ibn Ubayy turned back on the way, leaving roughly seven hundred.',
          'The Prophet ﷺ placed fifty archers on the hill now known as Jabal ar-Rumat, led by Abdullah ibn Jubayr, with firm instructions not to leave their position whatever happened. The Muslims were winning, but when many of the archers saw the enemy flee and left their post for the spoils, Khalid ibn al-Walid, who was then still with Quraysh, circled round and attacked from behind.',
          'The Prophet ﷺ was wounded, one of his teeth was broken and he was struck on the face. Around seventy Companions were martyred, among them his uncle Hamza ibn Abd al-Muttalib, the “Lion of Allah”, and Mus’ab ibn Umayr, who had carried the banner.',
          'Hamza and others were buried at the foot of the mountain where they fell. The Prophet ﷺ used to visit the martyrs and pray for them. Surah Al Imran (3:121–175) discusses the battle at length, with lessons about obedience, patience and trust in Allah.',
        ],
        keyFacts: [
          'The Prophet ﷺ said: “Uhud is a mountain that loves us and we love it.”',
          'The cemetery of the martyrs lies at the foot of the mountain.',
          'The hill of the archers stands opposite, across the valley.',
          'The lesson of Uhud is obedience to the Messenger ﷺ, even when victory seems certain.',
        ],
      },
      {
        name: 'Al-Baqi Cemetery',
        mapQuery: 'Al-Baqi Cemetery, Madinah',
        year: 'From 1 AH · 622 CE',
        image: commons('baqi', 'Saleh Al Hussain · CC BY 4.0', 'Al-Baqi_Cemetery_2021.jpg'),
        summary: 'The main cemetery of Madinah, beside Masjid an-Nabawi.',
        history: [
          'Al-Baqi was the burial ground of the people of Madinah from the time of the Prophet ﷺ. The first of the Muhajirun to be buried here was Uthman ibn Madh’un. Jibril commanded the Prophet ﷺ to visit the people of al-Baqi and ask forgiveness for them, and he used to go out at night and say: “Peace be upon you, abode of believers.”',
          'Buried here are thousands of Companions, including Uthman ibn Affan, the Prophet’s ﷺ son Ibrahim, his uncle al-Abbas, his grandson Hasan ibn Ali, and many of his wives, such as Aisha, Hafsa and Umm Salamah. Halimah as-Sa’diyyah, who nursed him as an infant, is also reported to be buried here, as are several early scholars, including Imam Malik.'
        ],
        keyFacts: [
          'The Prophet ﷺ taught the supplication for visiting graveyards here.',
          'The cemetery is entered from the Masjid an-Nabawi side.',
          'Entry is for men only, at set times.',
        ],
      },
      {
        name: 'Masjid al-Jumu’ah',
        year: '1 AH · 622 CE',
        mapQuery: 'Masjid Jumu’ah, Madinah',
        summary: 'Where the Prophet ﷺ led the first Friday prayer in Islam.',
        history: [
          'On his Hijrah, the Prophet ﷺ left Quba on a Friday morning and travelled towards the centre of Madinah. When the time for Jumu’ah came, he was in the valley of Ranuna, in the quarter of the Banu Salim ibn Awf. There he led the first Friday prayer of the Muslims, with around a hundred men, and gave the first khutbah of his that is recorded in Madinah.',
          'A mosque was built on the spot to mark the place. It is known as Masjid al-Jumu’ah and has been rebuilt and renovated several times since. Friday became the weekly gathering of the Muslim community, which the Qur’an commands: “O you who have believed, when the call is made for the prayer on the day of Friday, then proceed to the remembrance of Allah and leave trade.” (62:9)',
          'The Prophet ﷺ called Friday the best day on which the sun rises, a day on which Adam ﷺ was created, and on which there is an hour when du’a is accepted.',
        ],
        keyFacts: [
          'It lies in Wadi Ranuna, between Quba and the centre of Madinah.',
          'It marks the first Jumu’ah prayer, in the first year of the Hijrah.',
          'It is also called the Masjid of the Banu Salim, after the tribe who lived there.',
        ],
      },
      {
        name: 'Masjid al-Qiblatayn',
        mapQuery: 'Masjid al-Qiblatayn, Madinah',
        year: '2 AH · 623 CE',
        image: commons('qiblatayn', 'Bintladen · CC BY-SA 4.0', 'Masjid_al-Qiblatayn.jpg'),
        summary: 'The mosque of the two qiblas, where the direction of prayer changed.',
        history: [
          'For the first sixteen or seventeen months after the Hijrah, the Prophet ﷺ prayed facing Jerusalem (Bayt al-Maqdis). He longed to face the Kaaba, the house of Ibrahim ﷺ, and used to look up at the sky waiting for revelation.',
          'Then Allah revealed: “We have seen the turning of your face towards the heaven, so We will surely turn you to a qiblah with which you will be pleased. So turn your face toward Al-Masjid Al-Haram.” (2:144)',
          'The Prophet ﷺ was visiting the Banu Salimah and leading a prayer in their mosque when the verse came. Reports differ on whether it was Dhuhr or Asr. He and the congregation turned in the middle of the prayer, from north to south, and the mosque became known as the mosque of the two qiblas.',
          'A hadith tells that the news reached the people of Quba during Fajr the next morning, and they turned in the middle of their prayer too, showing how readily the Companions obeyed.',
        ],
        keyFacts: [
          'The change of qiblah marked a turning point in the identity of the Muslim community.',
          'The mosque was built to commemorate the event and has been rebuilt over time.',
          'The change is a test of obedience: the Companions turned without hesitation.',
        ],
      },
      {
        name: 'The Seven Mosques (Masjid al-Fath) and the Battle of the Trench',
        mapQuery: 'Masjid al-Fath, Madinah',
        year: '5 AH · 627 CE',
        image: commons('fath', 'Imam Khairul Annas · CC BY-SA 3.0', 'Sab%27u_Masajid.jpg'),
        summary: 'The site of the Battle of the Trench (Khandaq).',
        history: [
          'In Shawwal 5 AH, a coalition of Quraysh and other Arab tribes, around ten thousand strong, marched on Madinah. They were joined by elements of the Jewish tribe of Banu Qurayza, who broke their treaty with the Muslims during the siege.',
          'On the suggestion of Salman al-Farsi, the Muslims dug a trench across the northern, open side of the city, a tactic unknown in Arabia. The Prophet ﷺ dug alongside the Companions, who numbered about three thousand, and they worked in cold and hunger. When a huge rock resisted their tools, he struck it and it broke apart, and he gave glad tidings of conquests to come.',
          'The siege lasted about a month. Eventually Allah sent a violent wind and armies of angels unseen, as described in Surah al-Ahzab (33:9), which overturned the besiegers’ camps, and they withdrew in disarray. The Prophet ﷺ said: “From now on we will march against them, and they will not march against us.”',
          'Masjid al-Fath stands at the foot of Mount Sala’. The area is known as the Seven Mosques after the small mosques that once stood here, said to mark places where the Prophet ﷺ and his Companions prayed. Only some of them survive today.',
        ],
        keyFacts: [
          'The battle is also called al-Ahzab (the Confederates), after the Qur’anic surah about it.',
          'Mount Sala’ is where the Prophet ﷺ is reported to have made du’a.',
          'It was the last major attempt by Quraysh to destroy the Muslims by force.',
        ],
      },
      {
        name: 'Masjid al-Ghamama',
        mapQuery: 'Masjid al-Ghamama, Madinah',
        year: '9 AH · 630 CE',
        image: commons('ghamama', 'Imam Khairul Annas · CC BY-SA 3.0', 'Masjid_Al_Ghamamah.jpg'),
        summary: 'A mosque near Masjid an-Nabawi, on the old prayer ground.',
        history: [
          'This was part of the open musalla used by the Prophet ﷺ for the Eid prayers outside the city. Abu Bakr, Umar and Uthman are also reported to have prayed Eid here after him.',
          'It is also where the Prophet ﷺ led the funeral prayer, in absentia, for the Negus (an-Najashi) of Abyssinia, who had sheltered the early Muslims and died in 9 AH.',
          'It is linked to a prayer for rain. The name “ghamama” means cloud, and tradition says a cloud shaded the Prophet ﷺ here. The present mosque dates from the Mamluk and Ottoman eras.',
        ],
        keyFacts: [
          'It is a short walk from Masjid an-Nabawi.',
          'It is one of the few places where the Prophet ﷺ led Eid prayers.',
          'The Negus gave refuge to the Muslim migrants to Abyssinia in the early years.',
        ],
      },
    ],
  },
  {
    city: 'Makkah',
    intro:
      'The birthplace of the Prophet ﷺ and the place where revelation began, home to the Kaaba built by Ibrahim and Ismail (peace be upon them).',
    podcast: { title: 'The Sacred Valley: Foundations of Faith', host: 'Shaykh Waseem Ahmed', url: 'https://www.youtube.com/watch?v=qk4cWYZOlwk' },
    sites: [
      {
        name: 'The Ka’bah',
        year: 'Era of Ibrahim ﷺ',
        mapQuery: 'Kaaba, Masjid al-Haram, Makkah',
        more: { label: 'Read more on the Ka’bah and Masjid al-Haram', anchor: 'kaabah' },
        image: commons('kaabah', 'Adli Wahid · CC BY-SA 4.0', 'The_Kaaba_during_Hajj_-_edited.jpg'),
        summary: 'The House of Allah and the qiblah of the Muslims.',
        history: [
          'The Qur’an tells that Ibrahim and Ismail (peace be upon them) raised the foundations of the House at Allah’s command, and that Ibrahim ﷺ called the people to Hajj. It is “the first House established for mankind” (3:96), and ever since, the Muslims have turned towards it in every prayer.',
          'Before the Prophet’s ﷺ mission, the Quraysh rebuilt it after a flood, and the tribes fell into a dispute over who would set the Black Stone in place. They agreed to accept the judgement of the first man to enter the Sacred Mosque, and he was the Prophet ﷺ, then about thirty-five and known to them all as al-Amin, the Trustworthy. He settled the matter by lifting the stone in a cloth with all the tribes. After the conquest of Makkah in 8 AH, he cleansed it of the idols that had been placed around it.',
          'The present building dates essentially from 1630, when the Ottoman sultan Murad IV rebuilt it after flood damage. Each year its black silk covering, the kiswah, is renewed.',
        ],
        keyFacts: [
          'Muslims face the Ka’bah in prayer but worship Allah alone.',
          'Tawaf is seven circuits, starting and ending at the Black Stone.',
          'The Black Stone and Yemeni corner are the two corners touched in tawaf.',
        ],
      },
      {
        name: 'Maqam Ibrahim',
        mapQuery: 'Maqam Ibrahim, Masjid al-Haram, Makkah',
        year: 'Era of Ibrahim ﷺ',
        image: commons('maqam-ibrahim', 'معتز توفيق اغبارية · CC BY-SA 3.0', 'Maqam_Ibrahim,_Makkah.jpg'),
        summary: 'The stone on which Ibrahim ﷺ stood while building the Kaaba.',
        history: [
          'When Ibrahim ﷺ and Ismail ﷺ raised the walls of the Kaaba, Ibrahim ﷺ stood on a stone to build higher while Ismail ﷺ passed him the stones. The stone is said to have softened beneath his feet, and it still carries their impressions.',
          'Allah says: “And [mention] when We made the House a place of return for the people and [a place of] security. And take, [O believers], from the standing place of Abraham a place of prayer.” (2:125) The Prophet ﷺ recited this verse and prayed two rakats behind the Maqam after completing his tawaf.',
          'In the early days the Maqam stood right next to the Kaaba. Umar is reported to have moved it back a little to give the people space to pray. It is now housed in a small glass and brass enclosure in the mataf.',
        ],
        keyFacts: [
          'After tawaf, pilgrims pray two rakats behind it, or anywhere in the Haram if crowded.',
          'It is a sign of Ibrahim’s ﷺ legacy, and a reminder of obedience to Allah.',
          'You will pass it while doing tawaf.',
        ],
      },
      {
        name: 'Zamzam',
        mapQuery: 'Zamzam Well, Masjid al-Haram, Makkah',
        year: 'Era of Ibrahim ﷺ',
        image: commons('zamzam', 'Mardetanha · CC BY-SA 3.0', 'Zamzamwell2.JPG'),
        summary: 'The blessed well beside the Kaaba.',
        history: [
          'Ibrahim ﷺ left his wife Hajar and infant son Ismail ﷺ in the barren valley of Makkah, trusting in Allah. When their water ran out, Hajar ran between the hills of Safa and Marwa searching for help. Then Jibril struck the ground and water gushed forth beneath the feet of baby Ismail ﷺ.',
          'Hajar tried to contain it, saying “zummi, zummi” (stop, stop). The Prophet ﷺ said: “May Allah have mercy on the mother of Ismail. If she had left Zamzam, it would have been a flowing spring.”',
          'The well drew the tribe of Jurhum to settle in Makkah. Later it was buried and lost, until the Prophet’s ﷺ grandfather, Abd al-Muttalib, was guided in a dream to dig it out again.',
          'When the angels opened the chest of the Prophet ﷺ before the Night Journey, they washed his heart with Zamzam water. He drank from it during his Hajj. Today the water is piped to fountains and coolers throughout the Haram.',
        ],
        keyFacts: [
          'The Prophet ﷺ said: “The water of Zamzam is for whatever it is drunk for.”',
          'Drink it with the intention of a need, and make du’a.',
        ],
      },
      {
        name: 'Safa and Marwa',
        mapQuery: 'As-Safa and Al-Marwah, Masjid al-Haram, Makkah',
        year: 'Era of Ibrahim ﷺ',
        image: commons('safa-marwa', 'Tahir mq · CC BY-SA 4.0', 'Mas%27aa3.jpg'),
        summary: 'The two hills between which Hajar ran, and the Sa’i of Umrah.',
        history: [
          'When Hajar’s water ran out in the desert, she left Ismail ﷺ and climbed Safa to look for help, then ran across the valley to Marwa, seven times in all, before Jibril brought forth Zamzam. Her striving, in complete trust in Allah, is remembered every day by those performing the Sa’i.',
          'Allah says: “Indeed, as-Safa and al-Marwah are among the symbols of Allah.” (2:158) When the Prophet ﷺ approached Safa during his Hajj, he recited this verse and said: “We begin with what Allah began with.” He climbed until he could see the Kaaba, faced it, and made du’a, then walked to Marwa and repeated this.',
          'The route, called the Mas’a, runs about 450 metres between the two hills, and is now a covered, air-conditioned gallery, joined to the Haram. Men jog lightly between the green lights, recalling Hajar’s hurried pace, and women walk at a normal pace.',
        ],
        keyFacts: [
          'The Sa’i is seven laps: Safa to Marwa is one, Marwa to Safa is the second, ending at Marwa.',
          'Safa and Marwa are rites of both Umrah and Hajj.',
          'The total distance is about three kilometres.',
        ],
      },
      {
        name: 'Arafah and Jabal ar-Rahmah',
        mapQuery: 'Jabal Rahmah, Arafat, Makkah',
        year: '10 AH · 632 CE',
        image: commons('arafah', 'Fahad Faisal · CC BY-SA 4.0', 'Jabal-e-Rehmat_(Mount_of_Mercy)_Mount_Arafat.jpg'),
        summary: 'The plain of Arafah, the centre of Hajj, and where the Farewell Sermon was given.',
        history: [
          'The Prophet ﷺ said “Hajj is Arafah”. Standing on this plain on the 9th of Dhul Hijjah, from after midday until sunset, is the essence of the pilgrimage. He said that there is no day on which Allah frees more people from the Fire than the Day of Arafah.',
          'In 10 AH the Prophet ﷺ set up his tent at Namirah, then rode into the valley and delivered his Farewell Sermon to well over a hundred thousand Companions. He declared the sanctity of life, wealth and honour, abolished the practices of the days of ignorance, urged kindness to women, told them that no Arab has superiority over a non-Arab except by taqwa, and left them the Book of Allah.',
          'It was here that the verse was revealed: “This day I have perfected for you your religion and completed My favour upon you and have approved for you Islam as religion.” (5:3)',
          'Jabal ar-Rahmah, the Mount of Mercy, rises from the plain. The Prophet ﷺ stood near its base, facing the qiblah, in du’a. He said that the whole of Arafah is a place of standing.',
        ],
        keyFacts: [
          'Missing Arafah means missing Hajj.',
          'Masjid Namirah, where the sermon is delivered each year, lies at its edge.',
          'Climbing the mountain is not a part of Hajj.',
        ],
      },
      {
        name: 'Mina',
        mapQuery: 'Mina, Makkah',
        year: '621–632 CE',
        image: commons('mina', 'Omar Chatriwala of Al Jazeera English · CC BY-SA 2.0', 'Mina%27s_tents_-_Flickr_-_Al_Jazeera_English.jpg'),
        summary: 'The valley of the Hajj rites and the Jamarat.',
        history: [
          'Mina is a valley a few kilometres east of Makkah. During Hajj, pilgrims stay in its vast tent city and stone the three Jamarat pillars, recalling the moment when Ibrahim ﷺ, commanded to sacrifice his son Ismail ﷺ, rejected the whispers of Shaytan.',
          'It was also the setting for the pledges of al-Aqabah. In the eleventh, twelfth and thirteenth years of the prophethood, the Prophet ﷺ met men of Madinah here during the Hajj season. They accepted Islam, and in the third pledge, seventy-three men and two women promised to protect him as they would their own families. This led directly to the Hijrah. Masjid al-Bay’ah marks the place.',
          'In 10 AH, during his only Hajj, the Prophet ﷺ stoned the Jamrat al-Aqabah, sacrificed 63 camels with his own hand, and had his head shaved at Mina.',
        ],
        keyFacts: [
          'Pilgrims spend the 8th and the nights of the 11th and 12th of Dhul Hijjah here.',
          'The Prophet ﷺ gave a sermon here on the Day of Sacrifice.',
          'Masjid al-Khayf and Masjid al-Bay’ah are the best-known mosques.',
        ],
      },
      {
        name: 'Muzdalifah',
        mapQuery: 'Muzdalifah, Makkah',
        year: '10 AH · 632 CE',
        image: commons('muzdalifah', 'Arisdp · CC BY-SA 4.0', 'Fajr_in_Muzdalifah.jpg'),
        summary: 'The plain where pilgrims spend the night after Arafah.',
        history: [
          'After sunset on the Day of Arafah, the Prophet ﷺ travelled to Muzdalifah, calmly, telling the people to be tranquil. There he combined the Maghrib and Isha prayers, with one adhan and two iqamahs, and slept until Fajr.',
          'He prayed Fajr early, then stood facing the qiblah, making du’a and remembering Allah until the sky was bright, before leaving for Mina just before sunrise. Allah says: “…when you depart from Arafat, remember Allah at al-Mash’ar al-Haram.” (2:198)',
          'The Prophet ﷺ allowed the weak and elderly to leave in the second half of the night.',
        ],
        keyFacts: [
          'Pilgrims sleep in the open, with no tents.',
          'Many pilgrims gather pebbles here for the Jamarat, though they can be collected anywhere.',
          'It lies between Arafah and Mina.',
        ],
      },
      {
        name: 'Jabal al-Nur and the Cave of Hira',
        mapQuery: 'Cave of Hira, Makkah',
        year: '610 CE',
        image: commons('hira', 'Sadath i · CC BY-SA 4.0', 'Jabal_al-Nour_And_cave_Hira.jpg'),
        summary: 'Where the first revelation came to the Prophet ﷺ.',
        history: [
          'Before prophethood, the Prophet ﷺ used to retreat to the Cave of Hira on Jabal al-Nur, a few kilometres from Makkah, for days at a time to worship and reflect. Khadijah (may Allah be pleased with her) would prepare provisions for him.',
          'In Ramadan, when he was forty, the angel Jibril came to him in the cave and said “Iqra” (Read). He replied that he could not read. Jibril embraced him tightly three times, then recited the first verses of Surah al-Alaq (96:1–5): “Read in the name of your Lord who created.”',
          'The Prophet ﷺ returned home trembling and said to Khadijah: “Cover me, cover me.” She reassured him, listing his good character, then took him to her cousin Waraqah ibn Nawfal, who recognised the revelation as the same that came to Musa ﷺ.',
        ],
        keyFacts: [
          'The mountain rises about 640 metres, and the climb is steep and takes some hours.',
          'The cave is small, only a few metres long.'
          ],
      },
      {
        name: 'Birthplace of the Prophet ﷺ',
        year: '570 CE',
        mapQuery: 'Makkah Al-Mukarramah Library, Makkah',
        image: commons('birthplace', 'Richard Mortel · CC BY 2.0', 'Site_of_the_birthplace_of_the_Prophet_Muhammad,_Mecca,_Saudi_Arabia.jpg'),
        summary: 'The house in Shi’b Bani Hashim where the Prophet ﷺ was born.',
        history: [
          'The Prophet ﷺ was born in Makkah in the Year of the Elephant, around 570 CE, most commonly said to be on a Monday, the 12th of Rabi al-Awwal. His father, Abdullah, had died before his birth, and his grandfather Abd al-Muttalib named him Muhammad, “The Praised One”. He was nursed for a time by Halimah as-Sa’diyyah among the Banu Sa’d, and his mother Aminah passed away when he was six years old.',
          'He was born in the neighbourhood of Shi’b Bani Hashim, at the foot of the hills east of the Haram. The house later passed to Aqil ibn Abi Talib and then to others, and in the Abbasid period, Khayzuran, the mother of Harun al-Rashid, is reported to have turned it into a place of prayer.',
          'Today the site is occupied by the Makkah al-Mukarramah Library, established in 1370 AH (1951 CE) by Sheikh Abbas Qattan. The original house is no longer standing.',
        ],
        keyFacts: [
          'The exact day of birth is disputed, though Monday and Rabi al-Awwal are agreed.',
          'It lies a short walk from the Haram, near the Marwa side.',
        ],
      },
      {
        name: 'Dar al-Arqam',
        year: 'c. 614–616 CE',
        mapQuery: 'Dar al-Arqam, Makkah',
        summary: 'The house near Safa that was the first school of Islam.',
        history: [
          'In the early years of the call, when the Muslims were few and Quraysh harassed them, the Prophet ﷺ used the house of a young Companion, al-Arqam ibn Abi al-Arqam, as a meeting place. It stood near the hill of Safa, close to the Quraysh gatherings, yet away from their attention.',
          'There the Prophet ﷺ taught the new Muslims the Qur’an, led them in worship and strengthened their faith, and many entered Islam in this house. Among the early Muslims who gathered there were Abu Bakr, Ali, Uthman, Zubayr, Sa’d ibn Abi Waqqas, Ammar ibn Yasir, Suhayb and Bilal.',
          'It is also where Umar ibn al-Khattab declared his Islam, soon after Hamza had embraced it, in answer to the Prophet’s ﷺ prayer that Allah strengthen Islam with him or Abu Jahl (Amr ibn Hisham). When he came, the Muslims left the house and openly prayed at the Kaaba for the first time.',
          'The house passed to al-Arqam’s descendants and was later turned into a mosque. It no longer stands, as the area was absorbed in the expansion of the Haram near Safa, and so there is no building to see.',
        ],
        keyFacts: [
          'It is regarded as the first school of Islam, and its teacher was the Prophet ﷺ himself.',
          'Al-Arqam was a young man from the Banu Makhzum, a rival clan of Quraysh.',
          'The site lies within the expanded Haram area near Safa.',
        ],
      },
      {
        name: 'Jabal Thawr and the Cave of Thawr',
        mapQuery: 'Cave of Thawr, Makkah',
        year: '1 AH · 622 CE',
        image: commons('thawr', 'Abdul Razzaq Phulpot · CC BY-SA 3.0', 'Jabele_thor_-_panoramio.jpg'),
        summary: 'The cave where the Prophet ﷺ and Abu Bakr hid during the Hijrah.',
        history: [
          'When Quraysh plotted to kill the Prophet ﷺ, he left his house by night, leaving Ali ibn Abi Talib in his bed, and went to Abu Bakr as-Siddiq. They left through a back window and headed south, away from Madinah, to mislead their pursuers.',
          'They hid in the cave on Jabal Thawr for three nights. Abdullah ibn Abi Bakr brought news from the city by night, Asma bint Abi Bakr brought food, and the shepherd Amir ibn Fuhayrah led his flock over their tracks to hide their footprints. Quraysh offered a reward of a hundred camels for the Prophet ﷺ.',
          'Their pursuers reached the mouth of the cave. Abu Bakr whispered his fear, and the Prophet ﷺ said: “What do you think of two, when Allah is the third of them?” Allah describes this in the Qur’an: “…when he said to his companion, ‘Do not grieve; indeed Allah is with us.’” (9:40)',
          'After three nights they set out with a guide for Madinah. Suraqah ibn Malik pursued them for the reward, but his horse sank into the ground, and he turned back.',
        ],
        keyFacts: [
          'It lies south of Makkah, in the opposite direction to Madinah.',
          'The Hijrah marks the start of the Islamic calendar.',
          'Asma bint Abi Bakr is known as “Dhat an-Nitaqayn”, the woman of the two belts.',
        ],
      },
      {
        name: 'Jannat al-Mu’alla',
        mapQuery: 'Jannat al-Mu’alla Cemetery, Makkah',
        year: 'c. 619 CE',
        image: commons('mualla', 'King Eliot · CC BY-SA 4.0', 'Jannat_al_Mualla_Graveyard_Makkah.jpg'),
        summary: 'The cemetery of Makkah where Khadijah (may Allah be pleased with her) is buried.',
        history: [
          'Also known as al-Hajun, this is the historic burial ground of Makkah. Khadijah bint Khuwaylid, the Prophet’s ﷺ first wife and the first person to believe in his message, is buried here. She died in the tenth year of the prophethood, three years before the Hijrah, and the Prophet ﷺ himself went down into her grave.',
          'She supported him with her wealth and comfort when he was afraid, and Jibril once brought her greetings of peace from Allah. The Prophet ﷺ remembered her fondly all his life.',
          'Her year of death, and that of Abu Talib, his protector, are called the Year of Sorrow. The cemetery also holds members of his family, including his grandfather Abd al-Muttalib and uncle Abu Talib, and his son al-Qasim is reported to be buried here.',
        ],
        keyFacts: [
          'The graves, like those of al-Baqi, are unmarked.',
          'It lies at the foot of the hill north of the Haram.',
          'Visiting graves is recommended for remembrance of the Hereafter.',
        ],
      },
      {
        name: 'Masjid al-Jinn',
        mapQuery: 'Masjid al-Jinn, Makkah',
        year: 'c. 619 CE',
        image: commons('jinn', 'Richard Mortel · CC BY 2.0', 'Mosque_of_the_Jinn,_Mecca,_Saudi_Arabia_(1).jpg'),
        summary: 'Associated with the jinn who listened to the Prophet ﷺ reciting the Qur’an.',
        history: [
          'The Qur’an tells of a group of jinn who heard the Prophet ﷺ reciting and believed: “Say, [O Muhammad], ‘It has been revealed to me that a group of the jinn listened and said, “Indeed, we have heard a wondrous Qur’an which guides to the right course, so we believed in it.”’” (72:1–2). Surah al-Ahqaf (46:29–32) also refers to this.',
          'The hadith literature mentions two occasions: on the return from Ta’if, when the Prophet ﷺ was praying Fajr at Nakhlah, and another night when he went out with Abdullah ibn Mas’ud and drew a circle around him. Tradition places the second near al-Hajun, and this mosque is associated with it.',
          'The event came during the hardest period of the Prophet’s ﷺ life, after the deaths of Khadijah and Abu Talib and the rejection at Ta’if, and is taken as a sign of Allah’s support.',
        ],
        keyFacts: [
          'It is also known as Masjid al-Haras, and lies near Jannat al-Mu’alla.',
          'The Qur’an has a surah named after the jinn (72).',
        ],
      },
    ],
  },
]
