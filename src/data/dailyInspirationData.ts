export type Discipline = 'Mathematics' | 'Physics' | 'Philosophy' | 'Science & Innovation' | 'Personal Development';

export interface Quote {
  id: string;
  text: string;
  author: string;
  authorShortBio: string;
  discipline: Discipline;
  year?: string;
  reflection: string;
  tags: string[];
}

export interface DailyChallenge {
  id: string;
  question: string;
  answer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  estimatedTime: string;
}

export const disciplineColors: Record<Discipline, string> = {
  Mathematics: '#8b5cf6',
  Physics: '#3b82f6',
  Philosophy: '#f59e0b',
  'Science & Innovation': '#10b981',
  'Personal Development': '#ec4899',
};

export const disciplineIcons: Record<Discipline, string> = {
  Mathematics: 'Sigma',
  Physics: 'Atom',
  Philosophy: 'BookOpen',
  'Science & Innovation': 'Cpu',
  'Personal Development': 'TrendingUp',
};

// Deterministically select a quote based on the date
export const getTodaysQuote = (date?: Date): Quote => {
  const d = date || new Date();
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return quotes[dayOfYear % quotes.length];
};

export const getTodaysChallenge = (date?: Date): DailyChallenge => {
  const d = date || new Date();
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return dailyChallenges[dayOfYear % dailyChallenges.length];
};

export const getDateString = (date?: Date): string => {
  const d = date || new Date();
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getShortDateString = (date?: Date): string => {
  const d = date || new Date();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const quotes: Quote[] = [
  // ============ MATHEMATICS ============
  {
    id: 'q-001',
    text: 'Mathematics is the queen of the sciences and number theory is the queen of mathematics.',
    author: 'Carl Friedrich Gauss',
    authorShortBio: 'German mathematician (1777–1855), the "Prince of Mathematicians," made groundbreaking contributions to number theory, algebra, statistics, and astronomy.',
    discipline: 'Mathematics',
    year: '1801',
    reflection: 'Gauss understood that mathematics sits at the foundation of all scientific understanding. Number theory, though abstract, reveals deep patterns that govern reality. Your study of mathematics connects you to a tradition of inquiry spanning millennia. Every proof you write contributes to this living body of knowledge.',
    tags: ['number theory', 'foundations', 'mathematical thinking'],
  },
  {
    id: 'q-002',
    text: 'Read Euler, read Euler, he is the master of us all.',
    author: 'Pierre-Simon Laplace',
    authorShortBio: 'French mathematician and astronomer (1749–1827), made foundational contributions to probability, statistics, and celestial mechanics.',
    discipline: 'Mathematics',
    reflection: 'Leonhard Euler published over 800 papers and introduced notation we use daily — e, i, π, Σ, f(x). His work on Euler\'s formula and the seven bridges of Königsberg changed how we think about graphs and networks. There is always more to discover by studying the masters.',
    tags: ['euler', 'mathematical history', 'inspiration'],
  },
  {
    id: 'q-003',
    text: 'We must know. We shall know.',
    author: 'David Hilbert',
    authorShortBio: 'German mathematician (1862–1943), one of the most influential mathematicians of the 19th and early 20th centuries, proposed 23 problems that shaped 20th-century mathematics.',
    discipline: 'Mathematics',
    year: '1930',
    reflection: 'Hilbert spoke these words as his retirement address, ending with "We must know. We shall know." Despite Gödel\'s incompleteness theorems showing limits to formal systems, the spirit of inquiry endures. Every unanswered question in mathematics is an invitation to discovery.',
    tags: ['foundations', 'determination', 'mathematical philosophy'],
  },
  {
    id: 'q-004',
    text: 'Mathematics is the art of giving the same name to different things.',
    author: 'Henri Poincaré',
    authorShortBio: 'French mathematician, physicist, and philosopher (1854–1912), pioneer in topology, dynamical systems, and the philosophy of science.',
    discipline: 'Mathematics',
    reflection: 'Poincaré recognized that mathematical abstraction is not about obscuring reality but revealing hidden connections. When you recognize the same pattern in a differential equation, a geometric transformation, and a physical system, you are practicing the art of mathematics at its highest level.',
    tags: ['abstraction', 'mathematical thinking', 'philosophy of math'],
  },
  {
    id: 'q-005',
    text: 'An equation means nothing to me unless it expresses a thought of God.',
    author: 'Srinivasa Ramanujan',
    authorShortBio: 'Indian mathematician (1887–1920), self-taught genius who made extraordinary contributions to number theory, infinite series, and continued fractions with almost no formal training.',
    discipline: 'Mathematics',
    reflection: 'Ramanujan saw beauty and divine order in mathematical patterns. His notebooks, filled without proofs, revealed formulas that mathematicians are still studying a century later. His story reminds us that mathematical intuition can emerge from unexpected places and that passion often outpaces formal education.',
    tags: ['ramanujan', 'intuition', 'mathematical beauty'],
  },
  {
    id: 'q-006',
    text: 'I am not talking about my own contributions. I am talking about the future of mathematics itself.',
    author: 'Emmy Noether',
    authorShortBio: 'German mathematician (1882–1935), described by Einstein as the most important woman in the history of mathematics; her theorem connects symmetries to conservation laws in physics.',
    discipline: 'Mathematics',
    reflection: 'Noether\'s theorem — that every continuous symmetry corresponds to a conservation law — is one of the most profound results in mathematical physics. She worked without pay, without formal title, and without recognition for years. Her story teaches us that the value of mathematics transcends personal glory.',
    tags: ['noether', 'symmetry', 'conservation laws', 'perseverance'],
  },
  {
    id: 'q-007',
    text: 'The only way to learn mathematics is to do mathematics.',
    author: 'Paul Halmos',
    authorShortBio: 'Hungarian-American mathematician (1916–2006), known for contributions to mathematical logic, probability theory, statistics, and operator theory; prolific author and teacher.',
    discipline: 'Mathematics',
    reflection: 'There is no substitute for active engagement. Reading a proof is not the same as constructing one. Watching a solution is not the same as finding it. Every page of scratch paper, every false start, every corrected mistake is part of the learning process. The doing IS the learning.',
    tags: ['active learning', 'practice', 'discipline'],
  },
  {
    id: 'q-008',
    text: 'The greatest enemy of knowledge is not ignorance, it is the illusion of knowledge.',
    author: 'Stephen Hawking',
    authorShortBio: 'British theoretical physicist (1942–2018), known for his work on black holes, Hawking radiation, and A Brief History of Time.',
    discipline: 'Physics',
    reflection: 'In mathematics, it is dangerously easy to feel you understand a concept after reading a proof. True understanding comes when you can reconstruct the argument, explain it to someone else, and apply it in an unfamiliar context. Challenge yourself to explain every step you encounter today.',
    tags: ['knowledge', 'humility', 'deep learning'],
  },
  {
    id: 'q-009',
    text: 'Pure mathematics is, in its way, the poetry of logical ideas.',
    author: 'Albert Einstein',
    authorShortBio: 'German-born theoretical physicist (1879–1955), developed the theory of relativity, one of the two pillars of modern physics; Nobel Prize in Physics 1921.',
    discipline: 'Physics',
    reflection: 'Einstein understood that mathematics is not merely a tool for calculation but an aesthetic endeavor. The elegance of a proof, the surprising connection between distant fields, the economy of a well-chosen definition — these are the qualities that make mathematics beautiful as well as useful.',
    tags: ['beauty', 'elegance', 'mathematical aesthetics'],
  },
  {
    id: 'q-010',
    text: 'What I cannot create, I do not understand.',
    author: 'Richard Feynman',
    authorShortBio: 'American theoretical physicist (1918–1988), Nobel Prize in Physics 1965, known for work in quantum electrodynamics and the Feynman diagram technique.',
    discipline: 'Physics',
    reflection: 'Feynman\'s principle is a powerful standard for self-assessment. Can you derive the formula yourself? Can you construct a counterexample? Can you solve a variation of the problem? If not, you may have an illusion of understanding. Today, try to create something from what you have learned.',
    tags: ['understanding', 'creativity', 'feynman technique'],
  },
  {
    id: 'q-011',
    text: 'If I have seen further, it is by standing on the shoulders of giants.',
    author: 'Isaac Newton',
    authorShortBio: 'English mathematician, physicist, and astronomer (1643–1727), formulated the laws of motion and universal gravitation, co-developed calculus.',
    discipline: 'Physics',
    year: '1676',
    reflection: 'Newton wrote this to Robert Hooke, acknowledging that his discoveries built upon the work of those who came before. Every theorem you prove today rests on centuries of mathematical development. Understanding this lineage deepens your appreciation and strengthens your foundations.',
    tags: ['history', 'foundations', 'intellectual lineage'],
  },
  {
    id: 'q-012',
    text: 'Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.',
    author: 'Marie Curie',
    authorShortBio: 'Polish-French physicist and chemist (1867–1934), first woman to win a Nobel Prize, the only person to win Nobel Prizes in two different scientific fields.',
    discipline: 'Physics',
    reflection: 'Curie\'s words apply directly to mathematics. Many students fear proofs, abstract algebra, or advanced calculus — but fear diminishes with understanding. Each concept you master today removes a barrier to the next. Approach what intimidates you with curiosity rather than dread.',
    tags: ['fear', 'understanding', 'courage', 'curiosity'],
  },
  {
    id: 'q-013',
    text: 'The day science begins to study non-physical phenomena, it will make more progress in one decade than in all the previous centuries of its existence.',
    author: 'Nikola Tesla',
    authorShortBio: 'Serbian-American inventor, electrical engineer, and futurist (1856–1943), known for contributions to the design of the modern alternating current electricity supply system.',
    discipline: 'Science & Innovation',
    reflection: 'Tesla imagined possibilities beyond the accepted boundaries of his time. In mathematics, the most important breakthroughs often come from those willing to ask questions that others consider settled or unimportant. What assumptions are you making today? Which one might you challenge?',
    tags: ['innovation', 'questioning', 'boundary pushing'],
  },
  {
    id: 'q-014',
    text: 'We cannot solve our problems with the same thinking we used when we created them.',
    author: 'Albert Einstein',
    authorShortBio: 'German-born theoretical physicist (1879–1955), developed the theory of relativity; Nobel Prize in Physics 1921.',
    discipline: 'Physics',
    reflection: 'When you are stuck on a problem, the temptation is to try the same approach harder. But mathematical breakthroughs often require a change of perspective — a different coordinate system, a new variable, an analogy from another field. If you are stuck, step back and reconsider your entire approach.',
    tags: ['problem solving', 'creativity', 'perspective'],
  },
  {
    id: 'q-015',
    text: 'It is not that I am so smart, it is just that I stay with problems longer.',
    author: 'Albert Einstein',
    authorShortBio: 'German-born theoretical physicist (1879–1955), Nobel Prize in Physics 1921; widely considered one of the greatest physicists of all time.',
    discipline: 'Physics',
    reflection: 'Persistence is the great equalizer in mathematics. Talent helps, but sustained effort determines long-term achievement. Andrew Wiles worked on Fermat\'s Last Theorem in secret for seven years. The problem that defeats you today may yield tomorrow if you return to it with fresh determination.',
    tags: ['persistence', 'grit', 'problem solving'],
  },
  {
    id: 'q-016',
    text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.',
    author: 'Aristotle',
    authorShortBio: 'Greek philosopher (384–322 BC), student of Plato and teacher of Alexander the Great; his writings covered physics, metaphysics, poetry, theater, music, logic, rhetoric, and more.',
    discipline: 'Philosophy',
    reflection: 'Aristotle understood that character and capability are built through consistent practice. Solving one differential equation does not make you a mathematician. But solving one every day, reviewing your mistakes, seeking deeper understanding — that is how expertise is forged. What habit will you strengthen today?',
    tags: ['habits', 'discipline', 'excellence', 'consistency'],
  },
  {
    id: 'q-017',
    text: 'The only true wisdom is in knowing you know nothing.',
    author: 'Socrates',
    authorShortBio: 'Greek philosopher (c. 470–399 BC), one of the founders of Western philosophy, known for the Socratic method of questioning.',
    discipline: 'Philosophy',
    reflection: 'Socratic humility is the foundation of genuine learning. The more mathematics you study, the more you realize how vast the unknown is. This is not discouraging — it is exciting. Every frontier of ignorance is an opportunity for discovery. Stay humble, stay curious, and keep asking questions.',
    tags: ['humility', 'curiosity', 'socratic method'],
  },
  {
    id: 'q-018',
    text: 'I think, therefore I am.',
    author: 'René Descartes',
    authorShortBio: 'French philosopher, mathematician, and scientist (1596–1650), developed analytic geometry, connecting algebra and Euclidean geometry.',
    discipline: 'Philosophy',
    year: '1637',
    reflection: 'Descartes founded analytic geometry by showing that geometric shapes could be described by algebraic equations. This bridge between algebra and geometry transformed mathematics. Your work today may seem narrow — a single problem, a single concept — but it connects to a vast and living tradition of human thought.',
    tags: ['descartes', 'analytic geometry', 'rational thinking'],
  },
  {
    id: 'q-019',
    text: 'Science is organized knowledge. Wisdom is organized life.',
    author: 'Immanuel Kant',
    authorShortBio: 'German philosopher (1724–1804), central figure in modern philosophy, known for works on epistemology, ethics, and metaphysics.',
    discipline: 'Philosophy',
    reflection: 'Mathematics gives you organized knowledge — precise definitions, rigorous proofs, systematic methods. But wisdom comes from how you apply that knowledge, how you organize your learning, your time, and your priorities. Study hard, but also reflect on what you are building toward.',
    tags: ['wisdom', 'organization', 'life philosophy'],
  },
  {
    id: 'q-020',
    text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.',
    author: 'Alan Turing',
    authorShortBio: 'English mathematician, computer scientist, and cryptanalyst (1912–1954), father of theoretical computer science and artificial intelligence; cracked the Enigma code during WWII.',
    discipline: 'Science & Innovation',
    reflection: 'Turing\'s modest assessment of the future of computing was profoundly accurate. In your studies, you cannot see the full path ahead — and that is okay. Focus on what is in front of you: the next problem, the next proof, the next concept. Progress comes from doing the work that is visible now.',
    tags: ['turing', 'focus', 'present moment', 'action'],
  },
  {
    id: 'q-021',
    text: 'That brain of mine is something more than merely mortal; as time will show.',
    author: 'Ada Lovelace',
    authorShortBio: 'English mathematician and writer (1815–1852), considered the first computer programmer for her work on Charles Babbage\'s Analytical Engine.',
    discipline: 'Science & Innovation',
    reflection: 'Lovelace saw possibilities in computing that even Babbage had not imagined. She understood that machines could manipulate not just numbers but any symbols. Her confidence was not arrogance — it was the recognition that mathematical thinking, combined with imagination, can anticipate the future. Trust your mathematical instincts.',
    tags: ['lovelace', 'confidence', 'imagination', 'computing'],
  },
  {
    id: 'q-022',
    text: 'Information is the resolution of uncertainty.',
    author: 'Claude Shannon',
    authorShortBio: 'American mathematician, electrical engineer, and cryptographer (1916–2001), founder of information theory, which underpins all modern digital communication.',
    discipline: 'Science & Innovation',
    reflection: 'Shannon\'s definition of information transformed our understanding of communication, computation, and complexity. In mathematics, every solved problem resolves uncertainty and builds information. The confusion you feel before understanding is not failure — it is the state that understanding will resolve.',
    tags: ['information theory', 'uncertainty', 'clarity'],
  },
  {
    id: 'q-023',
    text: 'I counted everything. I counted the steps to the road, the steps up to church, the number of dishes and silverware I washed... anything that could be counted, I did.',
    author: 'Katherine Johnson',
    authorShortBio: 'American mathematician (1918–2020), NASA mathematician whose orbital mechanics calculations were critical to the success of the first U.S. crewed spaceflights.',
    discipline: 'Science & Innovation',
    reflection: 'Johnson\'s obsessive counting as a child was the foundation of the mathematical intuition that would send astronauts to the moon. She checked computer calculations by hand — and found errors that machines missed. Precision, patience, and the willingness to verify every detail: these are the marks of a true mathematician.',
    tags: ['precision', 'verification', 'nasa', 'diligence'],
  },
  {
    id: 'q-024',
    text: 'The most powerful force in the universe is compound interest.',
    author: 'Albert Einstein',
    authorShortBio: 'German-born theoretical physicist (1879–1955); Nobel Prize in Physics 1921; the compound interest quote is widely attributed to him.',
    discipline: 'Physics',
    reflection: 'Whether or not Einstein said this, the mathematical principle is profound. Small, consistent improvements compound over time into extraordinary results. Solving one extra problem per day, reviewing for an extra 15 minutes, asking one more question — these small habits multiply into mastery. Start compounding today.',
    tags: ['compounding', 'consistency', 'growth', 'habits'],
  },
  {
    id: 'q-025',
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    author: 'James Clear',
    authorShortBio: 'American author and speaker, known for Atomic Habits, which has sold over 15 million copies worldwide.',
    discipline: 'Personal Development',
    reflection: 'Goals set direction, but systems create results. A goal to "understand linear algebra" is useless without a system: daily problem sets, weekly review, concept mapping, and spaced repetition. Build systems that make progress automatic, not dependent on willpower. What system will you build today?',
    tags: ['systems', 'habits', 'atomic habits', 'process'],
  },
  {
    id: 'q-026',
    text: 'In a growth mindset, challenges are exciting rather than threatening.',
    author: 'Carol Dweck',
    authorShortBio: 'American psychologist (born 1946), Stanford professor known for research on mindset; her book Mindset has influenced education worldwide.',
    discipline: 'Personal Development',
    reflection: 'Dweck\'s research shows that viewing ability as developable rather than fixed leads to greater achievement. When you encounter a difficult proof, you have a choice: see it as evidence of insufficient talent, or as an opportunity to grow. The second perspective is not just more pleasant — it produces better results.',
    tags: ['growth mindset', 'challenges', 'psychology'],
  },
  {
    id: 'q-027',
    text: 'Grit is passion and perseverance for long-term goals.',
    author: 'Angela Duckworth',
    authorShortBio: 'American psychologist and professor at University of Pennsylvania, known for research on grit, self-control, and achievement.',
    discipline: 'Personal Development',
    reflection: 'Duckworth\'s research found that grit — sustained passion and perseverance — predicts success better than talent alone. Mathematical mastery is not achieved in weeks or months. It requires years of dedicated effort. But the good news is that grit can be developed. Every study session today strengthens your mathematical grit.',
    tags: ['grit', 'perseverance', 'long-term', 'achievement'],
  },
  {
    id: 'q-028',
    text: 'If you can\'t fly then run, if you can\'t run then walk, if you can\'t walk then crawl, but whatever you do you have to keep moving forward.',
    author: 'Martin Luther King Jr.',
    authorShortBio: 'American Baptist minister and activist (1929–1968), leader in the civil rights movement; Nobel Peace Prize laureate 1964.',
    discipline: 'Personal Development',
    reflection: 'Progress in mathematics is rarely linear. Some days you will solve problems quickly; other days, a single concept may take hours. The key is forward motion, however small. Reading one page, understanding one definition, completing one exercise — these small steps accumulate into genuine mastery over time.',
    tags: ['perseverance', 'progress', 'resilience'],
  },
  {
    id: 'q-029',
    text: 'The best time to plant a tree was 20 years ago. The second best time is now.',
    author: 'Chinese Proverb',
    authorShortBio: 'Ancient Chinese proverb emphasizing the importance of starting immediately rather than dwelling on missed opportunities.',
    discipline: 'Personal Development',
    reflection: 'It is easy to feel behind in mathematics — to see peers who started earlier or progressed faster. But mathematical learning is not a race. The only relevant comparison is between yourself today and yourself yesterday. Start where you are. Use what you have. Do what you can.',
    tags: ['starting', 'action', 'no regrets', 'present'],
  },
  {
    id: 'q-030',
    text: 'In mathematics you don\'t understand things. You just get used to them.',
    author: 'John von Neumann',
    authorShortBio: 'Hungarian-American mathematician (1903–1957), made major contributions to quantum mechanics, game theory, computer science, and statistics.',
    discipline: 'Mathematics',
    reflection: 'Von Neumann\'s provocative statement captures something real about mathematical intuition. Initial exposure to a new concept can feel opaque. But with repeated engagement — solving problems, seeing applications, making connections — what once seemed alien becomes natural. Give yourself time to "get used to" new ideas.',
    tags: ['intuition', 'familiarity', 'learning process'],
  },
  {
    id: 'q-031',
    text: 'To understand geometry, one must first understand nothing.',
    author: 'Max Planck',
    authorShortBio: 'German theoretical physicist (1858–1947), originator of quantum theory, which revolutionized human understanding of atomic and subatomic processes; Nobel Prize in Physics 1918.',
    discipline: 'Physics',
    reflection: 'Planck\'s journey to quantum theory began with a problem that classical physics could not solve. He was forced to question assumptions that everyone had accepted for decades. In your mathematical studies, sometimes the most important step is to clear your mind of what you think you know and approach a problem with complete openness.',
    tags: ['openness', 'beginner\'s mind', 'quantum theory'],
  },
];

export const dailyChallenges: DailyChallenge[] = [
  {
    id: 'dc-001',
    question: 'A farmer has 17 sheep and all but 9 die. How many are left?',
    answer: '9',
    explanation: 'The phrase "all but 9 die" means that 9 sheep survived. This is a classic test of reading comprehension over mathematical complexity.',
    difficulty: 'Easy',
    category: 'Logic',
    estimatedTime: '1 min',
  },
  {
    id: 'dc-002',
    question: 'What is the sum of all integers from 1 to 100?',
    answer: '5050',
    explanation: 'Gauss famously solved this as a child: pair 1+100, 2+99, 3+98, etc. Each pair sums to 101, and there are 50 pairs: 50 × 101 = 5050.',
    difficulty: 'Easy',
    category: 'Number Theory',
    estimatedTime: '2 min',
  },
  {
    id: 'dc-003',
    question: 'I am a number. If you add 5 to me, multiply by 3, subtract 9, then divide by 3, you get my original value plus 2. What number am I?',
    answer: 'Any number (the equation is an identity)',
    explanation: 'Let x be the number. ((x+5)×3 − 9) / 3 = (3x+15−9)/3 = (3x+6)/3 = x+2. This holds for ALL real numbers!',
    difficulty: 'Medium',
    category: 'Algebra',
    estimatedTime: '3 min',
  },
  {
    id: 'dc-004',
    question: 'A bat and a ball cost $11 total. The bat costs $10 more than the ball. How much does the ball cost?',
    answer: '$0.50 (50 cents)',
    explanation: 'Most people instinctively say $1. But if the ball costs $1, the bat would cost $11, totaling $12. Let the ball cost x: bat = x + 10. So x + (x+10) = 11 → 2x = 1 → x = $0.50.',
    difficulty: 'Easy',
    category: 'Psychology & Math',
    estimatedTime: '2 min',
  },
  {
    id: 'dc-005',
    question: 'What is the only even prime number?',
    answer: '2',
    explanation: 'By definition, a prime number has exactly two divisors: 1 and itself. All even numbers greater than 2 are divisible by 2, making them composite. Therefore, 2 is the only even prime.',
    difficulty: 'Easy',
    category: 'Number Theory',
    estimatedTime: '1 min',
  },
  {
    id: 'dc-006',
    question: 'If it takes 5 machines 5 minutes to make 5 widgets, how long does it take 100 machines to make 100 widgets?',
    answer: '5 minutes',
    explanation: 'Each machine takes 5 minutes to make 1 widget. With 100 machines working in parallel, 100 widgets take the same 5 minutes. This is a test of recognizing proportional relationships.',
    difficulty: 'Easy',
    category: 'Logic',
    estimatedTime: '2 min',
  },
  {
    id: 'dc-007',
    question: 'A lily pad doubles in size every day. If it covers the entire pond on day 30, on what day was the pond half covered?',
    answer: 'Day 29',
    explanation: 'Since the lily pad doubles every day, the pond was half covered the day before it was fully covered: day 30 − 1 = day 29. Exponential growth is often counterintuitive!',
    difficulty: 'Medium',
    category: 'Exponential Growth',
    estimatedTime: '2 min',
  },
  {
    id: 'dc-008',
    question: 'Three people check into a hotel room that costs $30. They each contribute $10. Later, the clerk realizes the room should only cost $25. He gives $5 to the bellboy to return. The bellboy keeps $2 and gives $1 back to each guest. Now each guest paid $9 ($27 total) and the bellboy has $2, which is $29. Where is the missing dollar?',
    answer: 'There is no missing dollar (the accounting is wrong)',
    explanation: 'This is a misdirection! The $27 includes the $25 room + $2 bellboy. The correct accounting: $25 (hotel) + $2 (bellboy) + $3 (returned) = $30. The error is adding $27 + $2 when the $2 is already part of the $27.',
    difficulty: 'Medium',
    category: 'Logic Puzzle',
    estimatedTime: '3 min',
  },
  {
    id: 'dc-009',
    question: 'What is the last digit of 7^2024?',
    answer: '1',
    explanation: 'The last digits of powers of 7 cycle: 7^1=7, 7^2=49(9), 7^3=...3, 7^4=...1, then repeats every 4. 2024 ÷ 4 = 506 remainder 0, so it is at the same position as 7^4, which ends in 1.',
    difficulty: 'Medium',
    category: 'Number Theory',
    estimatedTime: '3 min',
  },
  {
    id: 'dc-010',
    question: 'In a drawer are 10 red socks and 10 blue socks. How many socks must you pull out (in the dark) to guarantee you have a matching pair?',
    answer: '3',
    explanation: 'With 2 socks, you could have one red and one blue. But with 3 socks, by the pigeonhole principle, at least two must be the same color. This is a classic application of the pigeonhole principle!',
    difficulty: 'Easy',
    category: 'Combinatorics',
    estimatedTime: '2 min',
  },
  {
    id: 'dc-011',
    question: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
    answer: '7.5 degrees',
    explanation: 'At 3:15, the minute hand points at 3 (0° from 12). The hour hand moves 30° per hour + 0.5° per minute. At 3:15: 3×30 + 15×0.5 = 90 + 7.5 = 97.5°. Difference: 97.5 − 90 = 7.5°.',
    difficulty: 'Medium',
    category: 'Geometry',
    estimatedTime: '3 min',
  },
  {
    id: 'dc-012',
    question: 'You have a 3-liter jug and a 5-liter jug. How can you measure exactly 4 liters?',
    answer: 'Fill 5L, pour into 3L (leaves 2L). Empty 3L. Pour remaining 2L into 3L. Fill 5L again. Pour from 5L into 3L until full (adds 1L). 5L jug now has 4L.',
    explanation: 'This is the classic water jug problem. The key insight is using the difference: 5 − 3 = 2, then 3 − 2 = 1, and finally 5 − 1 = 4. It demonstrates how thinking in differences can solve seemingly impossible problems.',
    difficulty: 'Medium',
    category: 'Problem Solving',
    estimatedTime: '3 min',
  },
  {
    id: 'dc-013',
    question: 'What is the smallest positive integer that is evenly divisible by all integers from 1 to 10?',
    answer: '2520',
    explanation: 'This is the LCM of 1 through 10. Prime factorizations: 8=2³, 9=3², 5, 7. LCM = 2³ × 3² × 5 × 7 = 8 × 9 × 5 × 7 = 2520.',
    difficulty: 'Medium',
    category: 'Number Theory',
    estimatedTime: '3 min',
  },
  {
    id: 'dc-014',
    question: 'If you fold a piece of paper in half 50 times, how thick would it be? (Assume paper is 0.1mm thick)',
    answer: 'About 112 million kilometers (roughly the distance from Earth to the Sun)',
    explanation: 'Each fold doubles the thickness: 0.1mm × 2^50 ≈ 0.1 × 1.13 × 10^15 mm = 1.13 × 10^11 meters ≈ 112 million km. Exponential growth is extraordinarily powerful!',
    difficulty: 'Easy',
    category: 'Exponential Growth',
    estimatedTime: '2 min',
  },
  {
    id: 'dc-015',
    question: 'Two trains are 200 km apart, traveling toward each other at 50 km/h and 70 km/h. A bee flies back and forth between them at 100 km/h until they collide. How far does the bee travel?',
    answer: '166.67 km',
    explanation: 'Time until collision: 200 / (50+70) = 200/120 = 5/3 hours. Bee distance: 100 × 5/3 = 500/3 ≈ 166.67 km. The elegant shortcut: calculate collision time, then multiply by bee speed. No infinite series needed!',
    difficulty: 'Medium',
    category: 'Calculus & Logic',
    estimatedTime: '3 min',
  },
];

export const getQuotesByDiscipline = (discipline: Discipline): Quote[] =>
  quotes.filter((q) => q.discipline === discipline);

export const getQuotesByAuthor = (author: string): Quote[] =>
  quotes.filter((q) => q.author.toLowerCase().includes(author.toLowerCase()));

export const getAllAuthors = (): string[] =>
  [...new Set(quotes.map((q) => q.author))].sort();

export const getAllDisciplines = (): Discipline[] =>
  [...new Set(quotes.map((q) => q.discipline))];

export const searchQuotes = (query: string): Quote[] => {
  const q = query.toLowerCase();
  return quotes.filter(
    (quote) =>
      quote.text.toLowerCase().includes(q) ||
      quote.author.toLowerCase().includes(q) ||
      quote.discipline.toLowerCase().includes(q) ||
      quote.tags.some((t) => t.toLowerCase().includes(q))
  );
};
