import {
  AdminConfig,
  ExamTrendItem,
  LeaderboardEntry,
  MockTestDefinition,
  QuizQuestion,
} from '../../src/types/exam.js';

export const VERIFIED_PYQ_BANK: QuizQuestion[] = [
  {
    id: 'pyq-polity-1',
    questionEn:
      'Which Article of the Indian Constitution empowers the President to proclaim a Financial Emergency?',
    questionHi:
      'भारतीय संविधान का कौन सा अनुच्छेद राष्ट्रपति को वित्तीय आपातकाल की घोषणा करने का अधिकार देता है?',
    optionsEn: ['Article 352', 'Article 356', 'Article 360', 'Article 368'],
    optionsHi: ['अनुच्छेद 352', 'अनुच्छेद 356', 'अनुच्छेद 360', 'अनुच्छेद 368'],
    correctIndex: 2,
    correctExplanationEn:
      'Article 360 empowers the President of India to proclaim a Financial Emergency if financial stability or credit of India is threatened. It has never been imposed in India so far.',
    correctExplanationHi:
      'अनुच्छेद 360 भारत के राष्ट्रपति को वित्तीय आपातकाल की घोषणा करने की शक्ति देता है यदि भारत की वित्तीय स्थिरता या साख को खतरा हो। भारत में इसे अभी तक कभी लागू नहीं किया गया है।',
    wrongOptionsAnalysis: [
      {
        optionIndex: 0,
        optionTextEn: 'Article 352',
        optionTextHi: 'अनुच्छेद 352',
        whyIncorrectEn: 'Article 352 deals with National Emergency, not Financial Emergency.',
        whyIncorrectHi: 'अनुच्छेद 352 राष्ट्रीय आपातकाल से संबंधित है, वित्तीय आपातकाल से नहीं।',
        addonFactEn:
          'National Emergency under Art. 352 has been declared 3 times: 1962 (China), 1971 (Pakistan), and 1975 (Internal Disturbance).',
        addonFactHi:
          'अनुच्छेद 352 के तहत राष्ट्रीय आपातकाल 3 बार घोषित किया गया है: 1962 (चीन), 1971 (पाकिस्तान) और 1975 (आंतरिक अशांति)।',
      },
      {
        optionIndex: 1,
        optionTextEn: 'Article 356',
        optionTextHi: 'अनुच्छेद 356',
        whyIncorrectEn: 'Article 356 covers State Emergency (President’s Rule) upon failure of constitutional machinery.',
        whyIncorrectHi: 'अनुच्छेद 356 राज्यों में संवैधानिक तंत्र विफल होने पर राष्ट्रपति शासन से संबंधित है।',
        addonFactEn:
          'President’s Rule was first imposed in Punjab (PEPSU) in 1951. Parliamentary approval is needed within 2 months.',
        addonFactHi:
          'राष्ट्रपति शासन पहली बार 1951 में पंजाब (PEPSU) में लगाया गया था। इसके लिए 2 महीने के भीतर संसद की मंजूरी जरूरी है।',
      },
      {
        optionIndex: 3,
        optionTextEn: 'Article 368',
        optionTextHi: 'अनुच्छेद 368',
        whyIncorrectEn: 'Article 368 governs the procedure to amend the Constitution.',
        whyIncorrectHi: 'अनुच्छेद 368 संविधान में संशोधन करने की प्रक्रिया से संबंधित है।',
        addonFactEn:
          'Amendment procedure under Art. 368 (Part XX) was borrowed from the Constitution of South Africa.',
        addonFactHi:
          'अनुच्छेद 368 (भाग XX) के तहत संविधान संशोधन की प्रक्रिया दक्षिण अफ्रीका के संविधान से ली गई है।',
      },
    ],
    memoryTrickEn: 'Add +4 rule: 352 (National) + 4 = 356 (State) + 4 = 360 (Financial).',
    memoryTrickHi: '+4 नियम याद रखें: 352 (राष्ट्रीय) + 4 = 356 (राज्य) + 4 = 360 (वित्तीय)।',
    keyFactsEn: [
      'Part XVIII of the Constitution (Articles 352–360) covers Emergency Provisions.',
      'Financial Emergency proclamation must be approved by both Houses within 2 months by simple majority.',
    ],
    keyFactsHi: [
      'संविधान का भाग XVIII (अनुच्छेद 352–360) आपातकालीन प्रावधानों से संबंधित है।',
      'वित्तीय आपातकाल की घोषणा को 2 महीने के भीतर दोनों सदनों द्वारा साधारण बहुमत से अनुमोदित किया जाना चाहिए।',
    ],
    sourceRef: 'SSC CGL 2023 Tier-1 · Shift 2 & Laxmikanth Ch. 16',
    examRelevance: 'SSC CGL, CHSL, RRB NTPC, CDS, State PCS',
    subject: 'Indian Polity',
    topic: 'Emergency Provisions',
    difficulty: 'Easy',
    sourceType: 'VERIFIED_PYQ',
    pyqYear: 2023,
    pyqShift: 'SSC CGL Tier-1 Shift 2',
    frequencyScore: 96,
    proofreadPasses: 3,
    proofreadSummary: 'Verified against Official SSC Key & Constitution Part XVIII',
    explanationImageUrl: '/src/assets/images/diagram_polity_emergency_1795460234830.jpg',
    explanationImageCaption: 'Constitutional Emergency Articles Comparison (Art. 352 vs 356 vs 360)',
  },
  {
    id: 'pyq-history-1',
    questionEn: 'Who presided over the historic 1929 Lahore Session of the Indian National Congress where Poorna Swaraj was declared?',
    questionHi: 'भारतीय राष्ट्रीय कांग्रेस के ऐतिहासिक 1929 लाहौर अधिवेशन की अध्यक्षता किसने की थी जहाँ पूर्ण स्वराज की घोषणा हुई थी?',
    optionsEn: ['Motilal Nehru', 'Jawaharlal Nehru', 'Sardar Vallabhbhai Patel', 'Subhas Chandra Bose'],
    optionsHi: ['मोतीलाल नेहरू', 'जवाहरलाल नेहरू', 'सरदार वल्लभभाई पटेल', 'सुभाष चंद्र बोस'],
    correctIndex: 1,
    correctExplanationEn:
      'Jawaharlal Nehru presided over the December 1929 Lahore Session of INC, where the Poorna Swaraj (Complete Independence) resolution was passed and 26 January 1930 was celebrated as the first Independence Day.',
    correctExplanationHi:
      'जवाहरलाल नेहरू ने दिसंबर 1929 के लाहौर अधिवेशन की अध्यक्षता की थी, जहाँ पूर्ण स्वराज का प्रस्ताव पारित हुआ और 26 जनवरी 1930 को पहला स्वतंत्रता दिवस मनाया गया।',
    wrongOptionsAnalysis: [
      {
        optionIndex: 0,
        optionTextEn: 'Motilal Nehru',
        optionTextHi: 'मोतीलाल नेहरू',
        whyIncorrectEn: 'Motilal Nehru presided over the 1928 Calcutta Session and drafted the Nehru Report (1928).',
        whyIncorrectHi: 'मोतीलाल नेहरू ने 1928 के कलकत्ता अधिवेशन की अध्यक्षता की और नेहरू रिपोर्ट (1928) तैयार की थी।',
        addonFactEn:
          'Nehru Report (1928) demanded Dominion Status; the 1929 Lahore Session escalated the demand to Complete Independence.',
        addonFactHi:
          'नेहरू रिपोर्ट (1928) ने डोमिनियन स्टेटस की मांग की थी; 1929 के लाहौर अधिवेशन ने इसे पूर्ण स्वराज में बदल दिया।',
      },
      {
        optionIndex: 2,
        optionTextEn: 'Sardar Vallabhbhai Patel',
        optionTextHi: 'सरदार वल्लभभाई पटेल',
        whyIncorrectEn: 'Sardar Patel presided over the 1931 Karachi Session, not the 1929 Lahore Session.',
        whyIncorrectHi: 'सरदार पटेल ने 1931 के कराची अधिवेशन की अध्यक्षता की थी, 1929 के लाहौर अधिवेशन की नहीं।',
        addonFactEn:
          'The 1931 Karachi Session under Patel adopted the landmark Resolution on Fundamental Rights and National Economic Programme.',
        addonFactHi:
          'पटेल की अध्यक्षता में 1931 के कराची अधिवेशन में मौलिक अधिकारों और राष्ट्रीय आर्थिक कार्यक्रम का प्रस्ताव पारित हुआ था।',
      },
      {
        optionIndex: 3,
        optionTextEn: 'Subhas Chandra Bose',
        optionTextHi: 'सुभाष चंद्र बोस',
        whyIncorrectEn: 'Subhas Chandra Bose presided over the 1938 Haripura and 1939 Tripuri sessions.',
        whyIncorrectHi: 'सुभाष चंद्र बोस ने 1938 के हरिपुरा और 1939 के त्रिपुरी अधिवेशन की अध्यक्षता की थी।',
        addonFactEn:
          'At Haripura (1938), Bose set up the National Planning Committee chaired by Jawaharlal Nehru.',
        addonFactHi:
          'हरिपुरा (1938) में बोस ने जवाहरलाल नेहरू की अध्यक्षता में राष्ट्रीय योजना समिति का गठन किया था।',
      },
    ],
    memoryTrickEn: '1928 Motilal (Calcutta) -> 1929 Son Jawahar (Lahore, Ravi bank) -> 1931 Patel (Karachi).',
    memoryTrickHi: '1928 मोतीलाल (कलकत्ता) -> 1929 पुत्र जवाहर (लाहौर, रावी तट) -> 1931 पटेल (कराची)।',
    keyFactsEn: [
      'Tricolour flag was unfurled on the banks of the River Ravi on 31 December 1929.',
      '26 January was chosen for Republic Day (1950) to honour 26 January 1930 Poorna Swaraj Day.',
    ],
    keyFactsHi: [
      '31 दिसंबर 1929 को रावी नदी के तट पर तिरंगा फहराया गया था।',
      '26 जनवरी 1930 के पूर्ण स्वराज दिवस के सम्मान में 26 जनवरी (1950) को गणतंत्र दिवस चुना गया।',
    ],
    sourceRef: 'RRB NTPC CBT-1 2022 & SSC CHSL 2024',
    examRelevance: 'SSC, RRB NTPC, UPSC CDS, Police, Teaching',
    subject: 'Modern History',
    topic: 'INC Sessions',
    difficulty: 'Easy',
    sourceType: 'VERIFIED_PYQ',
    pyqYear: 2024,
    pyqShift: 'SSC CHSL Tier-1 Shift 1',
    frequencyScore: 94,
    proofreadPasses: 3,
    proofreadSummary: 'Verified against INC Official Session Archives & RRB Key',
    explanationImageUrl: '/src/assets/images/history_timeline_visual_1795459480019.jpg',
    explanationImageCaption: 'Indian Historical & Freedom Struggle Chronology Visual',
  },
  {
    id: 'pyq-science-1',
    questionEn: 'Which cell organelle is known as the "suicidal bag" of the cell due to its digestive hydrolytic enzymes?',
    questionHi: 'पाचक हाइड्रोलिटिक एंजाइमों के कारण किस कोशिकांग को कोशिका की "आत्मघाती थैली" कहा जाता है?',
    optionsEn: ['Mitochondria', 'Ribosome', 'Lysosome', 'Golgi Apparatus'],
    optionsHi: ['माइटोकॉन्ड्रिया', 'राइबोसोम', 'लाइसोसोम', 'गॉल्जीकाय'],
    correctIndex: 2,
    correctExplanationEn:
      'Lysosomes contain powerful hydrolytic enzymes capable of digesting worn-out organelles or the cell itself when damaged, earning them the name "suicidal bags of the cell". Discovered by Christian de Duve.',
    correctExplanationHi:
      'लाइसोसोम में शक्तिशाली हाइड्रोलिटिक एंजाइम होते हैं जो क्षतिग्रस्त होने पर खराब कोशिकांगों या पूरी कोशिका को पचा सकते हैं, इसलिए इन्हें "आत्मघाती थैली" कहते हैं। इसकी खोज क्रिश्चियन डी डूवे ने की थी।',
    wrongOptionsAnalysis: [
      {
        optionIndex: 0,
        optionTextEn: 'Mitochondria',
        optionTextHi: 'माइटोकॉन्ड्रिया',
        whyIncorrectEn: 'Mitochondria is the "Powerhouse of the cell", synthesizing ATP via aerobic respiration.',
        whyIncorrectHi: 'माइटोकॉन्ड्रिया को कोशिका का "पावरहाउस" कहा जाता है क्योंकि यह ATP का निर्माण करता है।',
        addonFactEn:
          'Mitochondria (along with Chloroplasts in plants) has its own circular DNA and 70S ribosomes.',
        addonFactHi:
          'माइटोकॉन्ड्रिया (और पौधों में क्लोरोप्लास्ट) का अपना स्वयं का DNA और 70S राइबोसोम होता है।',
      },
      {
        optionIndex: 1,
        optionTextEn: 'Ribosome',
        optionTextHi: 'राइबोसोम',
        whyIncorrectEn: 'Ribosomes are the "Protein factories" of the cell and lack a lipid membrane.',
        whyIncorrectHi: 'राइबोसोम कोशिका की "प्रोटीन फैक्ट्री" कहलाते हैं और ये झिल्ली रहित होते हैं।',
        addonFactEn:
          'Discovered by George Palade; Prokaryotes have 70S ribosomes while Eukaryotes have 80S ribosomes.',
        addonFactHi:
          'इसकी खोज जॉर्ज पैलाडे ने की; प्रोकैरियोट्स में 70S और यूकैरियोट्स में 80S राइबोसोम होते हैं।',
      },
      {
        optionIndex: 3,
        optionTextEn: 'Golgi Apparatus',
        optionTextHi: 'गॉल्जीकाय',
        whyIncorrectEn: 'Golgi apparatus acts as the "Traffic Police / Packaging unit" of the cell, forming lysosomes.',
        whyIncorrectHi: 'गॉल्जीकाय कोशिका की "पैकेजिंग यूनिट / ट्रैफिक पुलिस" है और यही लाइसोसोम बनाता है।',
        addonFactEn:
          'Discovered by Camillo Golgi in 1898; in plant cells, Golgi bodies are called Dictyosomes.',
        addonFactHi:
          'कैमिलो गॉल्जी ने 1898 में इसकी खोज की; पादप कोशिकाओं में इन्हें डिक्टियोसोम कहा जाता है।',
      },
    ],
    memoryTrickEn: 'Lyso = Lysis (break down) -> Suicidal bag. Ribo = Protein. Mito = Mighty Power.',
    memoryTrickHi: 'Lyso मतलब तोड़ना (Lysis) = आत्मघाती थैली। Ribo = प्रोटीन। Mito = पावरहाउस।',
    keyFactsEn: [
      'Lysosomes maintain an acidic pH (~4.5–5.0) for enzyme activation.',
      'Mature mammalian RBCs lack nucleus, mitochondria, and lysosomes.',
    ],
    keyFactsHi: [
      'लाइसोसोम एंजाइम सक्रियण के लिए अम्लीय pH (~4.5–5.0) बनाए रखते हैं।',
      'स्तनधारियों की परिपक्व लाल रक्त कणिकाओं (RBC) में केंद्रक, माइटोकॉन्ड्रिया और लाइसोसोम नहीं होते।',
    ],
    sourceRef: 'RRB Group D 2022 & SSC GD 2024',
    examRelevance: 'RRB NTPC, Group D, SSC GD, MTS, CGL, CTET',
    subject: 'General Science',
    topic: 'Cell Biology',
    difficulty: 'Easy',
    sourceType: 'VERIFIED_PYQ',
    pyqYear: 2024,
    pyqShift: 'SSC GD Shift 3',
    frequencyScore: 95,
    proofreadPasses: 3,
    proofreadSummary: 'Verified against NCERT Class 9 Ch. 5 & RRB Official Key',
    explanationImageUrl: '/src/assets/images/diagram_cell_science_1795460232640.jpg',
    explanationImageCaption: 'Eukaryotic Cell Organelles Diagram — Lysosome, Mitochondria, Ribosome & Golgi',
  },
  {
    id: 'pyq-geo-1',
    questionEn: 'Which river is known as "Dakshin Ganga" (Ganga of the South) due to its large size and extent?',
    questionHi: 'अपने विशाल आकार और विस्तार के कारण किस नदी को "दक्षिण गंगा" कहा जाता है?',
    optionsEn: ['Krishna', 'Kaveri', 'Godavari', 'Mahanadi'],
    optionsHi: ['कृष्णा', 'कावेरी', 'गोदावरी', 'महानदी'],
    correctIndex: 2,
    correctExplanationEn:
      'Godavari (1,465 km) is the largest Peninsular river in India, originating from Trimbakeshwar (Nashik, Maharashtra), and is called Dakshin Ganga or Vridha Ganga.',
    correctExplanationHi:
      'गोदावरी (1,465 किमी) भारत की सबसे बड़ी प्रायद्वीपीय नदी है, जो त्र्यंबकेश्वर (नासिक, महाराष्ट्र) से निकलती है। इसे दक्षिण गंगा या वृद्ध गंगा कहा जाता है।',
    wrongOptionsAnalysis: [
      {
        optionIndex: 0,
        optionTextEn: 'Krishna',
        optionTextHi: 'कृष्णा',
        whyIncorrectEn: 'Krishna is the 2nd largest east-flowing peninsular river, originating at Mahabaleshwar.',
        whyIncorrectHi: 'कृष्णा दूसरी सबसे बड़ी पूर्व की ओर बहने वाली प्रायद्वीपीय नदी है, जो महाबलेश्वर से निकलती है।',
        addonFactEn:
          'Nagarjuna Sagar Dam and Srisailam Dam are built on the Krishna River; Tungabhadra and Bhima are its key tributaries.',
        addonFactHi:
          'नागार्जुन सागर बांध और श्रीशैलम बांध कृष्णा नदी पर बने हैं; तुंगभद्रा और भीमा इसकी प्रमुख सहायक नदियाँ हैं।',
      },
      {
        optionIndex: 1,
        optionTextEn: 'Kaveri',
        optionTextHi: 'कावेरी',
        whyIncorrectEn: 'Kaveri is called "Ganga of South India" (दक्षिण भारत की गंगा) for religious sanctity, whereas Godavari is "Dakshin Ganga".',
        whyIncorrectHi: 'कावेरी को धार्मिक पवित्रता के कारण "दक्षिण भारत की गंगा" कहते हैं, जबकि गोदावरी "दक्षिण गंगा" है।',
        addonFactEn:
          'Kaveri originates at Talakaveri (Brahmagiri hills, Karnataka) and receives rain from both SW and NE monsoons.',
        addonFactHi:
          'कावेरी तालकावेरी (ब्रह्मगिरि पहाड़ियाँ, कर्नाटक) से निकलती है और इसे दक्षिण-पश्चिम तथा उत्तर-पूर्व दोनों मानसून से जल मिलता है।',
      },
      {
        optionIndex: 3,
        optionTextEn: 'Mahanadi',
        optionTextHi: 'महानदी',
        whyIncorrectEn: 'Mahanadi flows mainly through Chhattisgarh and Odisha and is famous for the Hirakud Dam.',
        whyIncorrectHi: 'महानदी मुख्य रूप से छत्तीसगढ़ और ओडिशा में बहती है और हीराकुंड बांध के लिए प्रसिद्ध है।',
        addonFactEn:
          'Hirakud Dam on Mahanadi (Odisha) is the longest earthen dam in the world (~25.8 km).',
        addonFactHi:
          'महानदी पर बना हीराकुंड बांध (ओडिशा) विश्व का सबसे लंबा मिट्टी का बांध (~25.8 किमी) है।',
      },
    ],
    memoryTrickEn: 'Godavari = Biggest/Oldest = Vridha Ganga / Dakshin Ganga (No "Bharat"). Kaveri = Dakshin Bharat ki Ganga.',
    memoryTrickHi: 'गोदावरी = सबसे बड़ी = वृद्ध गंगा / दक्षिण गंगा। कावेरी = दक्षिण भारत की गंगा (पवित्रता के आधार पर)।',
    keyFactsEn: [
      'Godavari tributaries: Purna, Pranhita, Indravati, Sabari, Manjra.',
      'Polavaram Project is constructed on the Godavari River in Andhra Pradesh.',
    ],
    keyFactsHi: [
      'गोदावरी की सहायक नदियाँ: पूर्णा, प्राणहिता, इंद्रावती, शबरी, मंजरा।',
      'पोलावरम परियोजना आंध्र प्रदेश में गोदावरी नदी पर बनाई गई है।',
    ],
    sourceRef: 'SSC CGL 2022 & State PCS Prelims',
    examRelevance: 'SSC CGL, CHSL, RRB, CDS, State PCS',
    subject: 'Geography',
    topic: 'Indian River Systems',
    difficulty: 'Medium',
    sourceType: 'VERIFIED_PYQ',
    pyqYear: 2022,
    pyqShift: 'SSC CGL Tier-1 Shift 1',
    frequencyScore: 91,
    proofreadPasses: 3,
    proofreadSummary: 'Verified against NCERT Class 11 India Physical Environment',
    explanationImageUrl: '/src/assets/images/diagram_indian_rivers_1795460232922.jpg',
    explanationImageCaption: 'Peninsular River Basins — Godavari, Krishna, Kaveri & Mahanadi',
  },
  {
    id: 'pyq-quant-1',
    questionEn: 'If x + 1/x = 5, what is the value of x³ + 1/x³?',
    questionHi: 'यदि x + 1/x = 5 है, तो x³ + 1/x³ का मान क्या होगा?',
    optionsEn: ['110', '125', '140', '115'],
    optionsHi: ['110', '125', '140', '115'],
    correctIndex: 0,
    correctExplanationEn:
      'Using the identity: if x + 1/x = k, then x³ + 1/x³ = k³ − 3k. Putting k = 5: 5³ − 3(5) = 125 − 15 = 110.',
    correctExplanationHi:
      'बीजगणितीय सूत्र के अनुसार: यदि x + 1/x = k हो, तो x³ + 1/x³ = k³ − 3k होता है। k = 5 रखने पर: 5³ − 3(5) = 125 − 15 = 110।',
    wrongOptionsAnalysis: [
      {
        optionIndex: 1,
        optionTextEn: '125',
        optionTextHi: '125',
        whyIncorrectEn: '125 is simply k³ (5³); students often forget to subtract the 3k term.',
        whyIncorrectHi: '125 केवल k³ (5³) है; छात्र अक्सर −3k घटाना भूल जाते हैं।',
        addonFactEn:
          'For x² + 1/x², the shortcut is k² − 2 (here 25 − 2 = 23).',
        addonFactHi:
          'x² + 1/x² के लिए शॉर्टकट k² − 2 है (यहाँ 25 − 2 = 23)।',
      },
      {
        optionIndex: 2,
        optionTextEn: '140',
        optionTextHi: '140',
        whyIncorrectEn: '140 comes from k³ + 3k (125 + 15), which is the formula when x − 1/x = 5 for finding x³ − 1/x³.',
        whyIncorrectHi: '140, k³ + 3k (125 + 15) से आता है, जो x − 1/x = k होने पर x³ − 1/x³ निकालने का सूत्र है।',
        addonFactEn:
          'Remember sign flip rule: (+) to (+) subtracts (−3k); (−) to (−) adds (+3k).',
        addonFactHi:
          'चिन्ह नियम याद रखें: (+) से (+) जाने पर घटता है (−3k); (−) से (−) जाने पर जुड़ता है (+3k)।',
      },
      {
        optionIndex: 3,
        optionTextEn: '115',
        optionTextHi: '115',
        whyIncorrectEn: '115 arises from subtracting 2k instead of 3k (125 − 10 = 115).',
        whyIncorrectHi: '115 तब आता है जब 3k के बजाय गलती से 2k घटा दिया जाए (125 − 10 = 115)।',
        addonFactEn:
          'For x⁴ + 1/x⁴ when k = 5: (k² − 2)² − 2 = 23² − 2 = 527.',
        addonFactHi:
          'यदि k = 5 हो तो x⁴ + 1/x⁴ = (k² − 2)² − 2 = 23² − 2 = 527।',
      },
    ],
    memoryTrickEn: 'Cube k and subtract 3k: 5³ − 15 = 110 in 2 seconds.',
    memoryTrickHi: 'k का घन करें और 3k घटाएं: 5³ − 15 = 110 (2 सेकंड में हल)।',
    keyFactsEn: [
      'If x + 1/x = k, x³ + 1/x³ = k³ − 3k.',
      'If x − 1/x = k, x³ − 1/x³ = k³ + 3k.',
    ],
    keyFactsHi: [
      'यदि x + 1/x = k, तो x³ + 1/x³ = k³ − 3k।',
      'यदि x − 1/x = k, तो x³ − 1/x³ = k³ + 3k।',
    ],
    sourceRef: 'SSC CGL Tier-1 & Tier-2 High-Frequency Algebra PYQ',
    examRelevance: 'SSC CGL, CHSL, CPO, RRB NTPC',
    subject: 'Quantitative Aptitude',
    topic: 'Algebraic Identities',
    difficulty: 'Medium',
    sourceType: 'VERIFIED_PYQ',
    pyqYear: 2024,
    pyqShift: 'SSC CGL Tier-1 Shift 4',
    frequencyScore: 98,
    proofreadPasses: 3,
    proofreadSummary: 'Math Verified across 3 Algebraic Checks',
    visualDiagram: {
      layout: 'formula_steps',
      titleEn: 'Cube Identity Shortcut Steps',
      titleHi: 'घन सूत्र शॉर्टकट चरण',
      nodes: [
        { label: 'Step 1 · Given', detail: 'x + 1/x = k = 5' },
        { label: 'Step 2 · Identity', detail: 'x³ + 1/x³ = k³ − 3k', highlight: true },
        { label: 'Step 3 · Compute', detail: '5³ − 3(5) = 125 − 15 = 110', highlight: true },
      ],
    },
  },
  {
    id: 'pyq-economy-1',
    questionEn: 'Which rate is the interest rate at which the Reserve Bank of India (RBI) lends short-term funds to commercial banks against government securities?',
    questionHi: 'वह कौन सी दर है जिस पर भारतीय रिजर्व बैंक (RBI) सरकारी प्रतिभूतियों के बदले वाणिज्यिक बैंकों को अल्पकालिक ऋण देता है?',
    optionsEn: ['Reverse Repo Rate', 'Repo Rate', 'Cash Reserve Ratio (CRR)', 'Statutory Liquidity Ratio (SLR)'],
    optionsHi: ['रिवर्स रेपो रेट', 'रेपो रेट', 'नकद आरक्षित अनुपात (CRR)', 'वैधानिक तरलता अनुपात (SLR)'],
    correctIndex: 1,
    correctExplanationEn:
      'Repo Rate (Repurchase Option Rate) is the policy rate at which RBI lends short-term money to commercial banks against approved government securities. Increasing Repo Rate controls inflation by tightening liquidity.',
    correctExplanationHi:
      'रेपो रेट वह नीतिगत दर है जिस पर RBI सरकारी प्रतिभूतियों के बदले वाणिज्यिक बैंकों को अल्पकालिक ऋण देता है। मुद्रास्फीति को नियंत्रित करने के लिए RBI रेपो रेट बढ़ाता है।',
    wrongOptionsAnalysis: [
      {
        optionIndex: 0,
        optionTextEn: 'Reverse Repo Rate',
        optionTextHi: 'रिवर्स रेपो रेट',
        whyIncorrectEn: 'Reverse Repo Rate is the rate at which RBI borrows/absorbs excess liquidity from commercial banks.',
        whyIncorrectHi: 'रिवर्स रेपो रेट वह दर है जिस पर RBI वाणिज्यिक बैंकों से अतिरिक्त नकदी उधार लेता है।',
        addonFactEn:
          'In 2022, RBI introduced the Standing Deposit Facility (SDF) as the floor of the Liquidity Adjustment Facility (LAF) corridor.',
        addonFactHi:
          '2022 में RBI ने तरलता समायोजन सुविधा (LAF) के निचले स्तर के रूप में स्थायी जमा सुविधा (SDF) शुरू की।',
      },
      {
        optionIndex: 2,
        optionTextEn: 'Cash Reserve Ratio (CRR)',
        optionTextHi: 'नकद आरक्षित अनुपात (CRR)',
        whyIncorrectEn: 'CRR is the minimum percentage of NDTL that banks must keep as cash exclusively with the RBI.',
        whyIncorrectHi: 'CRR, NDTL का वह न्यूनतम प्रतिशत है जिसे बैंकों को नकद रूप में RBI के पास रखना अनिवार्य है।',
        addonFactEn:
          'Commercial banks earn ZERO interest on CRR balances maintained with the RBI.',
        addonFactHi:
          'RBI के पास रखे गए CRR पर वाणिज्यिक बैंकों को शून्य (0%) ब्याज मिलता है।',
      },
      {
        optionIndex: 3,
        optionTextEn: 'Statutory Liquidity Ratio (SLR)',
        optionTextHi: 'वैधानिक तरलता अनुपात (SLR)',
        whyIncorrectEn: 'SLR is the minimum reserve banks maintain with themselves in cash, gold, or unencumbered government securities.',
        whyIncorrectHi: 'SLR वह न्यूनतम हिस्सा है जो बैंक नकद, सोना या सरकारी प्रतिभूतियों के रूप में अपने पास रखते हैं।',
        addonFactEn:
          'SLR is governed by Section 24 of the Banking Regulation Act, 1949 (max limit 40%).',
        addonFactHi:
          'SLR बैंकिंग विनियमन अधिनियम 1949 की धारा 24 के तहत आता है (अधिकतम सीमा 40%)।',
      },
    ],
    memoryTrickEn: 'Repo = RBI lends to Banks. Reverse = RBI absorbs from Banks. CRR = Cash with RBI. SLR = Self Liquid Reserve.',
    memoryTrickHi: 'Repo = RBI बैंक को दे। Reverse = RBI बैंक से ले। CRR = कैश RBI के पास। SLR = बैंक के खुद के पास।',
    keyFactsEn: [
      'Monetary Policy Committee (MPC) has 6 members (3 RBI + 3 Govt nominees), chaired by RBI Governor.',
      'Bank Rate applies to long-term lending without collateral.',
    ],
    keyFactsHi: [
      'मौद्रिक नीति समिति (MPC) में 6 सदस्य (3 RBI + 3 सरकार) होते हैं, जिसके अध्यक्ष RBI गवर्नर होते हैं।',
      'बैंक रेट बिना गारंटी के दीर्घकालिक ऋण पर लागू होती है।',
    ],
    sourceRef: 'IBPS PO Prelims 2023 & SSC CPO 2024',
    examRelevance: 'IBPS PO, SBI Clerk, SSC CGL, RBI Grade B',
    subject: 'Indian Economy',
    topic: 'RBI Monetary Policy',
    difficulty: 'Easy',
    sourceType: 'VERIFIED_PYQ',
    pyqYear: 2024,
    pyqShift: 'IBPS PO Prelims Shift 2',
    frequencyScore: 93,
    proofreadPasses: 3,
    proofreadSummary: 'Verified against RBI Monetary Policy Glossary',
    explanationImageUrl: '/src/assets/images/diagram_rbi_policy_1795460233033.jpg',
    explanationImageCaption: 'RBI Monetary Policy Flow — Repo, Reverse Repo, CRR & SLR',
  },
  {
    id: 'pyq-reasoning-1',
    questionEn: 'Find the missing number in the series: 7, 15, 31, 63, 127, ?',
    questionHi: 'श्रृंखला में लुप्त संख्या ज्ञात कीजिए: 7, 15, 31, 63, 127, ?',
    optionsEn: ['253', '255', '254', '257'],
    optionsHi: ['253', '255', '254', '257'],
    correctIndex: 1,
    correctExplanationEn:
      'Pattern: Each term = (Previous term × 2) + 1. Check: 7×2+1=15, 15×2+1=31, 31×2+1=63, 63×2+1=127, so 127×2+1 = 255. Also equals 2ⁿ − 1 (2⁸ − 1 = 255).',
    correctExplanationHi:
      'पैटर्न: प्रत्येक पद = (पिछला पद × 2) + 1। जांच: 7×2+1=15, 15×2+1=31, 31×2+1=63, 63×2+1=127, अतः 127×2+1 = 255। यह 2ⁿ − 1 (2⁸ − 1 = 255) के भी बराबर है।',
    wrongOptionsAnalysis: [
      {
        optionIndex: 0,
        optionTextEn: '253',
        optionTextHi: '253',
        whyIncorrectEn: '253 equals 127×2 − 1, reversing the +1 pattern.',
        whyIncorrectHi: '253, 127×2 − 1 के बराबर है, जिसमें +1 के बजाय −1 कर दिया गया।',
        addonFactEn:
          'Differences also double: +8, +16, +32, +64, so next difference is +128 (127 + 128 = 255).',
        addonFactHi:
          'अंतर भी दोगुना हो रहा है: +8, +16, +32, +64, अतः अगला अंतर +128 होगा (127 + 128 = 255)।',
      },
      {
        optionIndex: 2,
        optionTextEn: '254',
        optionTextHi: '254',
        whyIncorrectEn: '254 is simply 127 × 2 without adding 1.',
        whyIncorrectHi: '254 केवल 127 × 2 है, जिसमें 1 जोड़ना छूट गया।',
        addonFactEn:
          'Every number in 2ⁿ − 1 series is always ODD (7, 15, 31, 63, 127, 255); eliminate even options immediately!',
        addonFactHi:
          '2ⁿ − 1 श्रृंखला की हर संख्या हमेशा विषम (Odd) होती है; सम (Even) विकल्प 254 को तुरंत हटा दें!',
      },
      {
        optionIndex: 3,
        optionTextEn: '257',
        optionTextHi: '257',
        whyIncorrectEn: '257 equals 2⁸ + 1 instead of 2⁸ − 1.',
        whyIncorrectHi: '257, 2⁸ + 1 है जबकि श्रृंखला 2⁸ − 1 पर आधारित है।',
        addonFactEn:
          'Numbers like 3, 7, 15, 31, 63, 127, 255, 511, 1023 are classic SSC/RRB 2ⁿ − 1 traps—memorize up to 2¹⁰ = 1024.',
        addonFactHi:
          '3, 7, 15, 31, 63, 127, 255, 511, 1023 SSC/RRB में बार-बार आने वाली 2ⁿ − 1 श्रृंखला है। 2¹⁰ = 1024 तक याद रखें।',
      },
    ],
    memoryTrickEn: 'Look at 7, 15, 31: instantly recognize 2ⁿ − 1 (odd numbers just below powers of 2).',
    memoryTrickHi: '7, 15, 31 देखते ही पहचानें कि ये 2ⁿ − 1 (2 की घात से 1 कम) हैं।',
    keyFactsEn: [
      'Memorize 2⁵=32, 2⁶=64, 2⁷=128, 2⁸=256, 2⁹=512, 2¹⁰=1024 for number series.',
    ],
    keyFactsHi: [
      'संख्या श्रृंखला के लिए 2⁵=32, 2⁶=64, 2⁷=128, 2⁸=256, 2⁹=512, 2¹⁰=1024 याद रखें।',
    ],
    sourceRef: 'RRB ALP & SSC MTS 2023',
    examRelevance: 'SSC CGL, CHSL, MTS, RRB NTPC, Police',
    subject: 'Reasoning',
    topic: 'Number Series',
    difficulty: 'Easy',
    sourceType: 'VERIFIED_PYQ',
    pyqYear: 2023,
    pyqShift: 'RRB ALP Shift 2',
    frequencyScore: 92,
    proofreadPasses: 3,
    proofreadSummary: 'Verified Series Logic & Difference Progression',
  },
];

export const EXAM_TRENDS_DATA: ExamTrendItem[] = [
  {
    exam: 'SSC',
    subject: 'Indian Polity',
    topic: 'Fundamental Rights & Emergency Articles',
    last5YrFrequency: 48,
    last10YrFrequency: 91,
    avgQuestionsPerShift: 2.1,
    difficultyTrend: 'Moderate',
    priority: 'High Yield',
  },
  {
    exam: 'SSC',
    subject: 'Quantitative Aptitude',
    topic: 'Algebraic Identities & Trigonometry',
    last5YrFrequency: 64,
    last10YrFrequency: 132,
    avgQuestionsPerShift: 3.4,
    difficultyTrend: 'Moderate',
    priority: 'High Yield',
  },
  {
    exam: 'SSC',
    subject: 'English / Vocab',
    topic: 'One-Word Substitution & Editorial Idioms',
    last5YrFrequency: 57,
    last10YrFrequency: 118,
    avgQuestionsPerShift: 4.0,
    difficultyTrend: 'Easy',
    priority: 'High Yield',
  },
  {
    exam: 'Railway',
    subject: 'General Science',
    topic: 'Cell Biology, Periodic Table & Optics',
    last5YrFrequency: 72,
    last10YrFrequency: 145,
    avgQuestionsPerShift: 4.8,
    difficultyTrend: 'Moderate',
    priority: 'High Yield',
  },
  {
    exam: 'Railway',
    subject: 'Modern History',
    topic: 'INC Sessions & Gandhian Era Movements',
    last5YrFrequency: 39,
    last10YrFrequency: 82,
    avgQuestionsPerShift: 1.9,
    difficultyTrend: 'Easy',
    priority: 'Core',
  },
  {
    exam: 'Banking',
    subject: 'Indian Economy',
    topic: 'RBI Monetary Policy, Repo/SDF & Union Budget',
    last5YrFrequency: 54,
    last10YrFrequency: 102,
    avgQuestionsPerShift: 3.2,
    difficultyTrend: 'Tough',
    priority: 'High Yield',
  },
  {
    exam: 'Defence',
    subject: 'Geography',
    topic: 'Indian River Systems, Passes & Monsoon',
    last5YrFrequency: 44,
    last10YrFrequency: 89,
    avgQuestionsPerShift: 2.8,
    difficultyTrend: 'Moderate',
    priority: 'High Yield',
  },
  {
    exam: 'State PCS',
    subject: 'Current Affairs',
    topic: 'Constitutional Amendments, Schemes & Summits',
    last5YrFrequency: 61,
    last10YrFrequency: 110,
    avgQuestionsPerShift: 5.5,
    difficultyTrend: 'Moderate',
    priority: 'High Yield',
  },
];

export const MOCK_TESTS_BANK: MockTestDefinition[] = [
  {
    id: 'mock-ssc-cgl-tier1',
    title: 'SSC CGL Tier-1 High-Yield Full Sprint',
    exam: 'SSC',
    durationMinutes: 15,
    positiveMarks: 2,
    negativeMarks: 0.5,
    sections: ['Polity & History', 'Science & Geo', 'Quantitative Aptitude', 'Reasoning'],
    questions: VERIFIED_PYQ_BANK,
  },
  {
    id: 'mock-rrb-ntpc-cbt1',
    title: 'RRB NTPC CBT-1 General Awareness + Math Mock',
    exam: 'Railway',
    durationMinutes: 12,
    positiveMarks: 1,
    negativeMarks: 0.33,
    sections: ['General Science', 'Modern History', 'Reasoning', 'Economy'],
    questions: [
      VERIFIED_PYQ_BANK[2],
      VERIFIED_PYQ_BANK[1],
      VERIFIED_PYQ_BANK[5],
      VERIFIED_PYQ_BANK[0],
      VERIFIED_PYQ_BANK[3],
    ],
  },
  {
    id: 'mock-ibps-ga-sprint',
    title: 'Banking & Defence GS + Quant Mini-Mock',
    exam: 'Banking',
    durationMinutes: 10,
    positiveMarks: 1,
    negativeMarks: 0.25,
    sections: ['RBI & Economy', 'Polity', 'Quant', 'Geography'],
    questions: [
      VERIFIED_PYQ_BANK[4],
      VERIFIED_PYQ_BANK[0],
      VERIFIED_PYQ_BANK[4],
      VERIFIED_PYQ_BANK[3],
    ].filter((q, idx, arr) => arr.findIndex((x) => x.id === q.id) === idx),
  },
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Ananya Verma', city: 'Prayagraj, UP', targetExam: 'SSC', xp: 2840, accuracy: 94.2, streakDays: 21 },
  { rank: 2, name: 'Rohan Deshmukh', city: 'Pune, MH', targetExam: 'Defence', xp: 2690, accuracy: 91.8, streakDays: 17, isFriend: true },
  { rank: 3, name: 'Priya Kumari', city: 'Patna, BR', targetExam: 'Railway', xp: 2510, accuracy: 89.5, streakDays: 14 },
  { rank: 4, name: 'Vikram Singh', city: 'Jaipur, RJ', targetExam: 'State PCS', xp: 2320, accuracy: 88.0, streakDays: 11, isFriend: true },
  { rank: 5, name: 'Aarav Sharma (You)', city: 'Lucknow, UP', targetExam: 'SSC', xp: 1980, accuracy: 86.4, streakDays: 9, isCurrentUser: true },
  { rank: 6, name: 'Neha Nair', city: 'Kochi, KL', targetExam: 'Banking', xp: 1840, accuracy: 84.1, streakDays: 8, isFriend: true },
  { rank: 7, name: 'Deepak Yadav', city: 'Indore, MP', targetExam: 'Police', xp: 1710, accuracy: 81.9, streakDays: 6 },
];

export const FORMULA_VAULT_ITEMS = [
  {
    subject: 'Indian Polity',
    title: 'Key Constitutional Articles Quick Sheet',
    items: [
      { label: 'Art. 14–18', value: 'Right to Equality (17: Untouchability, 18: Titles)' },
      { label: 'Art. 21A', value: 'Right to Elementary Education (86th Amendment, 2002)' },
      { label: 'Art. 32', value: 'Constitutional Remedies — 5 Writs (Heart & Soul: Ambedkar)' },
      { label: 'Art. 40 / 44 / 50', value: 'Panchayats / Uniform Civil Code / Judiciary Separation' },
      { label: 'Art. 110 / 112', value: 'Money Bill (Speaker certifies) / Annual Financial Statement' },
    ],
  },
  {
    subject: 'Quantitative Aptitude',
    title: 'High-Yield Algebra & Percentage Shortcuts',
    items: [
      { label: 'x + 1/x = k', value: 'x² + 1/x² = k² − 2  |  x³ + 1/x³ = k³ − 3k' },
      { label: 'Successive %', value: 'Net change = a + b + (ab / 100)%' },
      { label: 'CI − SI (2 yrs)', value: 'Difference = P × (R / 100)²' },
      { label: 'Average Speed', value: 'Equal distance: 2xy / (x + y)' },
      { label: 'sin²θ + cos²θ = 1', value: 'sec²θ − tan²θ = 1  |  cosec²θ − cot²θ = 1' },
    ],
  },
  {
    subject: 'Modern History',
    title: 'Chronology Anchor Dates (1905–1947)',
    items: [
      { label: '1905 / 1906', value: 'Partition of Bengal / Muslim League Founded (Dhaka)' },
      { label: '1916', value: 'Lucknow Pact (INC + League) & Home Rule League' },
      { label: '1920 / 1922', value: 'Non-Cooperation Movement / Chauri Chaura Suspension' },
      { label: '1930 / 1931', value: 'Dandi March (12 Mar) / Gandhi-Irwin Pact & Karachi Session' },
      { label: '1942 / 1946', value: 'Quit India (8 Aug, Do or Die) / Cabinet Mission Plan' },
    ],
  },
];

export const INITIAL_ADMIN_CONFIG: AdminConfig = {
  earlyAccessFreeMode: true,
  strictThreePassProofreading: true,
  whatsappMorningTime: '09:00',
  whatsappAutoDispatchEnabled: true,
  whatsappRecipientCount: 1420,
  lastWhatsappDispatchAt: null,
};
