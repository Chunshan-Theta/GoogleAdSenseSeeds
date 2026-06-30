import { useRef, useState } from 'react';
import Head from 'next/head';
import SocialShare from '../components/SocialShare';

const textQ2 = [
  'Your margin for error is low, so an illness or a day off could interrupt your income and destabilize daily life.',
  'You can shop for groceries without scrutinizing every item, and buying a few extra essentials does not feel stressful.',
  'You can order at restaurants without being ruled by the price tag or regretting every dish you pick.',
  'You can comfortably spend on experiences, travel, or nicer hotels without being talked out of it by the price.',
  'You can realistically afford the home you want, so housing is no longer a major life constraint.',
  'Money has become a tool for shaping the world, changing industries, or supporting research.',
];

const textQ3 = [
  'Increase income, reduce debt, and build a basic emergency fund that can absorb unexpected setbacks.',
  'Invest in your skills and find the overlap between your strengths and market demand to raise active income.',
  'Put money to work, keep acquiring productive assets, and avoid letting lifestyle inflation outpace growth.',
  'Find leverage that helps you break beyond the limits of salary alone and standard investing.',
  'Protect existing wealth and solve the new problems that appear as assets grow.',
  'Build something lasting that continues to create impact even after you step away.',
];

const textQ4 = [
  'Up to TWD 100',
  'Up to TWD 300',
  'Up to TWD 3,000',
  'Up to TWD 30,000',
  'Up to TWD 300,000',
  'Everyday spending has little practical meaning to me now, and I feel no anxiety about the amount.',
];

const textQ5 = [
  'To earn an extra TWD 1,000, I am willing to spend half a day or more on labor or side work.',
  'I am willing to freelance or work overtime for a few thousand TWD of extra income.',
  'If a new opportunity cannot bring in tens of thousands of TWD, I will not trade away valuable time easily.',
  'I focus only on leveraged opportunities that can return hundreds of thousands of TWD or more, and I reject scattered low-pay work.',
  'I no longer trade time for tiny percentage gains and mainly focus on protecting assets at the million-TWD level and above.',
  'I invest my time only in decisions that can create major social impact, not simply in work that makes money.',
];

interface QuestionDef {
  name: string;
  title: string;
  options: { value: number; label: string }[];
}

const WEALTH_QUESTIONS: QuestionDef[] = [
  {
    name: 'q1',
    title: '1. Which range best matches your approximate net worth?',
    options: [
      { value: 1, label: 'A. Less than TWD 300,000' },
      { value: 2, label: 'B. TWD 300,000 to 3 million' },
      { value: 3, label: 'C. TWD 3 million to 30 million' },
      { value: 4, label: 'D. TWD 30 million to 300 million' },
      { value: 5, label: 'E. TWD 300 million to 3 billion' },
      { value: 6, label: 'F. More than TWD 3 billion' },
    ],
  },
  {
    name: 'q2',
    title: '2. In daily spending and lifestyle, which level of freedom fits you best right now?',
    options: [
      {
        value: 1,
        label:
          'A. Your margin for error is low, so an illness or a day off could interrupt your income and destabilize daily life.',
      },
      {
        value: 2,
        label:
          'B. You can shop for groceries without scrutinizing every item, and buying a few extra essentials does not feel stressful.',
      },
      {
        value: 3,
        label:
          'C. You can order at restaurants without being ruled by the price tag or regretting every dish you pick.',
      },
      {
        value: 4,
        label:
          'D. You can comfortably spend on experiences, travel, or nicer hotels without being talked out of it by the price.',
      },
      {
        value: 5,
        label:
          'E. You can realistically afford the home you want, so housing is no longer a major life constraint.',
      },
      {
        value: 6,
        label: 'F. Money has become a tool for shaping the world, changing industries, or supporting research.',
      },
    ],
  },
  {
    name: 'q3',
    title: '3. What is the main mission you most need to focus on at this stage?',
    options: [
      {
        value: 1,
        label:
          'A. Increase income, reduce debt, and build a basic emergency fund that can absorb unexpected setbacks.',
      },
      {
        value: 2,
        label:
          'B. Invest in your skills and find the overlap between your strengths and market demand to raise active income.',
      },
      {
        value: 3,
        label:
          'C. Put money to work, keep acquiring productive assets, and avoid letting lifestyle inflation outpace growth.',
      },
      {
        value: 4,
        label:
          'D. Find leverage that helps you break beyond the limits of salary alone and standard investing.',
      },
      {
        value: 5,
        label: 'E. Protect existing wealth and solve the new problems that appear as assets grow.',
      },
      {
        value: 6,
        label: 'F. Build something lasting that continues to create impact even after you step away.',
      },
    ],
  },
  {
    name: 'q4',
    title:
      '4. For everyday expenses, what amount can you spend without feeling anxiety or guilt?',
    options: [
      { value: 1, label: 'A. Up to TWD 100' },
      { value: 2, label: 'B. Up to TWD 300' },
      { value: 3, label: 'C. Up to TWD 3,000' },
      { value: 4, label: 'D. Up to TWD 30,000' },
      { value: 5, label: 'E. Up to TWD 300,000' },
      {
        value: 6,
        label:
          'F. Everyday spending has little practical meaning to me now, and I feel no anxiety about the amount.',
      },
    ],
  },
  {
    name: 'q5',
    title:
      '5. When a new money-making opportunity appears, which instinct best matches your current trade-off between income and time?',
    options: [
      {
        value: 1,
        label:
          'A. To earn an extra TWD 1,000, I am willing to spend half a day or more on labor or side work.',
      },
      {
        value: 2,
        label: 'B. I am willing to freelance or work overtime for a few thousand TWD of extra income.',
      },
      {
        value: 3,
        label:
          'C. If a new opportunity cannot bring in tens of thousands of TWD, I will not trade away valuable time easily.',
      },
      {
        value: 4,
        label:
          'D. I focus only on leveraged opportunities that can return hundreds of thousands of TWD or more, and I reject scattered low-pay work.',
      },
      {
        value: 5,
        label:
          'E. I no longer trade time for tiny percentage gains and mainly focus on protecting assets at the million-TWD level and above.',
      },
      {
        value: 6,
        label:
          'F. I invest my time only in decisions that can create major social impact, not simply in work that makes money.',
      },
    ],
  },
];

const HAPPINESS_QUESTIONS: QuestionDef[] = [
  {
    name: 'h1',
    title: '1. How much pressure and choice do you have in your daily life?',
    options: [
      {
        value: 1,
        label:
          '1 point: Life feels extremely pressured, even basic choices are stripped away, and survival anxiety dominates each day.',
      },
      {
        value: 2,
        label:
          '2 points: You are barely holding things together. Daily life is manageable, but any surprise could trigger a crisis.',
      },
      {
        value: 3,
        label:
          '3 points: Life is becoming steadier. The worst pressure has eased, but earning money still dominates your focus.',
      },
      {
        value: 4,
        label:
          '4 points: You have breathing room. Money works like seasoning that improves life, and you have more choices.',
      },
      {
        value: 5,
        label:
          '5 points: Life feels abundant and secure. Money no longer creates meaningful limits in how you live.',
      },
    ],
  },
  {
    name: 'h2',
    title: '2. How healthy are your relationships and close connections?',
    options: [
      {
        value: 1,
        label:
          '1 point: You feel isolated, have no close friends, and your family relationships are highly conflicted.',
      },
      {
        value: 2,
        label:
          '2 points: Relationships feel distant. You may know one or two people casually, but opening up feels difficult.',
      },
      {
        value: 3,
        label:
          '3 points: Social life is functional. You have two or three people you can occasionally talk to, and family ties are average.',
      },
      {
        value: 4,
        label:
          '4 points: You have stable support. There are several close friends, and your relationship with family or a partner is solid.',
      },
      {
        value: 5,
        label:
          '5 points: Your connections are deep. You have five or more people you can truly rely on for strong emotional support.',
      },
    ],
  },
  {
    name: 'h3',
    title: '3. How stable are your inner sense of achievement and motivation?',
    options: [
      {
        value: 1,
        label:
          '1 point: You feel deeply empty, have no idea what drives you each day, and feel intensely lost.',
      },
      {
        value: 2,
        label:
          '2 points: Motivation depends on external pressure. Without money pressure or outside force, drive quickly fades.',
      },
      {
        value: 3,
        label:
          '3 points: You are occasionally uncertain. The broad direction is clear, but sometimes you wonder whether your work matters.',
      },
      {
        value: 4,
        label:
          '4 points: Your goals are clear. You have stable sources of accomplishment and know what you are pursuing right now.',
      },
      {
        value: 5,
        label:
          '5 points: You feel inwardly fulfilled, driven by a strong and clear sense of mission in life.',
      },
    ],
  },
  {
    name: 'h4',
    title: '4. While pursuing your goals, how is your health holding up?',
    options: [
      {
        value: 1,
        label:
          '1 point: Your body is severely depleted. You have sacrificed health for money and may already face irreversible damage or serious chronic illness.',
      },
      {
        value: 2,
        label:
          '2 points: Warning signs are flashing. You often stay up late, feel exhausted, and ignore obvious physical issues.',
      },
      {
        value: 3,
        label:
          '3 points: Health is average. There is no major illness, but exercise is lacking and your energy can dip.',
      },
      {
        value: 4,
        label:
          '4 points: You take care of yourself. Regular exercise and decent sleep keep your body able to support what you want to do.',
      },
      {
        value: 5,
        label:
          '5 points: You are vibrant and healthy, maintain body and mind well, and have plenty of energy to enjoy life.',
      },
    ],
  },
  {
    name: 'h5',
    title: '5. How fully do you control the way your time is allocated?',
    options: [
      {
        value: 1,
        label:
          '1 point: You feel trapped. Your time is completely taken over, and your best hours are sold away with almost no room left for yourself.',
      },
      {
        value: 2,
        label:
          '2 points: You can only squeeze out tiny pockets of time after work or on weekends for what matters to you.',
      },
      {
        value: 3,
        label:
          '3 points: There is some balance. You have a degree of free time, but your best hours are still mostly controlled by work or obligations.',
      },
      {
        value: 4,
        label:
          '4 points: You are highly self-directed and can decide most of your schedule around what matters most.',
      },
      {
        value: 5,
        label:
          '5 points: Your time is fully yours. You control your calendar and can direct your energy toward what you truly love.',
      },
    ],
  },
];

type StatusType = 'lag' | 'lead' | 'match';

interface FeedbackProps {
  title: string;
  standardText: string;
  status: StatusType;
  userText: string;
  advice: string;
}

function computeFeedback(
  baseVal: number,
  userVal: number,
  texts: string[],
  lagAdv: string,
  leadAdv: string,
  matchAdv: string
): Omit<FeedbackProps, 'title'> {
  const standardText = texts[baseVal - 1] ?? '';
  const userText = texts[userVal - 1] ?? '';
  if (userVal < baseVal) {
    return { standardText, status: 'lag', userText, advice: lagAdv };
  }
  if (userVal > baseVal) {
    return { standardText, status: 'lead', userText, advice: leadAdv };
  }
  return { standardText, status: 'match', userText, advice: matchAdv };
}

function FeedbackCard({ title, standardText, status, userText, advice }: FeedbackProps) {
  return (
    <div className="result-item">
      <div className="result-item-title">{title}</div>
      <div className="standard-box">
        <strong>The asset-aligned benchmark is:</strong>
        <br />
        {standardText}
      </div>
      <div className="advice-box">
        {status === 'match' ? (
          <span className="status-match">
            ✅ Your choice is fully aligned with your current asset stage.
            <br />
            Recommendation: {advice}
          </span>
        ) : (
          <span className={status === 'lag' ? 'status-lag' : 'status-lead'}>
            ⚠️ Your choice: {userText}
            <br />
            Recommendation: {advice}
          </span>
        )}
      </div>
    </div>
  );
}

type Answers = Record<string, number>;

const REQUIRED_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'h1', 'h2', 'h3', 'h4', 'h5'];

export default function Home() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'Wealth & Fulfillment Assessment';
  const siteDesc =
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'Review your financial mindset and life balance from every angle.';
  const shareText =
    process.env.NEXT_PUBLIC_SHARE_TEXT ||
    'Use this assessment to review your asset stage, fulfillment score, and the next adjustment that matters most.';
  const shareModuleDescription =
    process.env.NEXT_PUBLIC_SHARE_MODULE_DESCRIPTION ||
    'Share this assessment with friends while keeping it easy to embed on future pages.';

  const setAnswer = (name: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (REQUIRED_KEYS.some((k) => !answers[k])) {
      alert('Please complete all 10 questions before viewing your analysis.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const q1 = answers.q1 ?? 0;
  const totalHappiness = ['h1', 'h2', 'h3', 'h4', 'h5'].reduce(
    (sum, k) => sum + (answers[k] ?? 0),
    0
  );
  const avgH = totalHappiness / 5;

  const renderQuestions = (questions: QuestionDef[]) =>
    questions.map((q) => (
      <div key={q.name} className="question">
        <div className="question-title">{q.title}</div>
        <div className="options-group">
          {q.options.map((opt) => (
            <label
              key={opt.value}
              className={`option-label${answers[q.name] === opt.value ? ' selected' : ''}`}
              onClick={() => setAnswer(q.name, opt.value)}
            >
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    ));

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDesc} />
      </Head>

      <div className="container">
        <h1>{siteTitle}</h1>
        <p className="subtitle">{siteDesc}</p>
        <div className="notice">
          💡 Tip: In the first section, read every option carefully and choose the highest or most comfortable state you can honestly sustain right now. That helps the system place you in the most accurate wealth stage.
        </div>

        <div className="section-title">Part 1: Identify your current asset stage</div>
        {renderQuestions(WEALTH_QUESTIONS)}

        <div className="section-title">Part 2: Measure your fulfillment score</div>
        <p style={{ fontSize: '14.5px', color: 'var(--text-light)', marginBottom: '25px' }}>
          Use the concrete indicators below to assess your life across five core dimensions:
        </p>
        {renderQuestions(HAPPINESS_QUESTIONS)}

        <button type="button" className="submit-btn" onClick={handleSubmit}>
          Submit and view your full comparison analysis
        </button>

        {submitted && (
          <div id="result-section" ref={resultRef}>
            <div className="result-title">Your personalized assessment and recommendations</div>
            <p style={{ fontSize: '15px', marginBottom: '25px' }}>
              The system uses your <strong>net worth tier</strong> as the baseline and compares each part
              of your mindset against what best fits your current asset stage.
            </p>

            <FeedbackCard
              title="Daily freedom comparison"
              {...computeFeedback(
                q1,
                answers.q2 ?? 0,
                textQ2,
                'Your lifestyle quality or mindset may still be stuck in the fear of an earlier stage. Loosen your grip a little, learn to enjoy the wealth you worked hard to build, and stop overreacting to minor everyday costs.',
                'Your spending freedom is ahead of your asset level. Be careful that lifestyle inflation is not outrunning asset growth, or your finances may become fragile.',
                'Your sense of control over daily life fits your asset scale well. Keep maintaining this healthy spending mindset.'
              )}
            />

            <FeedbackCard
              title="Main mission comparison"
              {...computeFeedback(
                q1,
                answers.q3 ?? 0,
                textQ3,
                'You may still be spending energy on tasks from a previous stage. That can keep you stuck. Update your strategy and focus on what matters most at your current level.',
                'You may be trying to skip levels. Chasing leverage or large-scale impact too early, without a solid base, can expose you to unnecessary risk.',
                'You are highly clear on the most important task for this stage, which helps you move forward efficiently.'
              )}
            />

            <FeedbackCard
              title="Spending mindset comparison"
              {...computeFeedback(
                q1,
                answers.q4 ?? 0,
                textQ4,
                'You may still feel guilty about small amounts that no longer deserve that level of anxiety. Many people get stuck after their assets grow because old scarcity habits still control them. Relax everyday spending tolerance and save your energy for bigger decisions.',
                'For your current asset base, this spending habit may be too inflated. Tighten it slightly and avoid using a higher-tier standard to justify current expenses.',
                'You have a precise feel for what counts as a big expense and what does not, which supports rational spending without unnecessary anxiety.'
              )}
            />

            <FeedbackCard
              title="Income and time comparison"
              {...computeFeedback(
                q1,
                answers.q5 ?? 0,
                textQ5,
                'The value of your time has already risen, but you may still be trading cheap hours for too little return. Old methods will not carry you into a new tier. Reject low-efficiency income and look for leverage.',
                'You may be aiming too high too soon. At your current asset stage, smaller opportunities can still make a meaningful contribution to your capital base, so do not dismiss them prematurely.',
                'You understand your opportunity cost well. You do not overwork for small money, but you also do not miss income that is still worth capturing.'
              )}
            />

            <div className="result-item" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <div className="result-item-title" style={{ border: 'none', marginBottom: '5px' }}>
                Overall fulfillment and wealth assessment
              </div>
              <div style={{ fontSize: '14.5px', color: '#444', lineHeight: '1.8' }}>
                {avgH < 3 ? (
                  <>
                    <span className="status-lag">🚨 Lower fulfillment score (total {totalHappiness}/25)</span>
                    <br />
                    Your health, relationships, or time freedom may be in a depleted state. If life already feels empty or isolated, more money will only magnify the problem. Strongly consider slowing down and stop sacrificing health or relationships for income.
                  </>
                ) : avgH < 4.2 ? (
                  <>
                    <span className="status-lead">⚖️ Mid-range fulfillment score (total {totalHappiness}/25)</span>
                    <br />
                    Your life is in dynamic balance, but one or two invisible dimensions may still be undernourished. Review whether any single area scored below 3. Improving that area may create more happiness than increasing the number on paper.
                  </>
                ) : (
                  <>
                    <span className="status-match">🌟 Excellent fulfillment score (total {totalHappiness}/25)</span>
                    <br />
                    Congratulations. You are not just accumulating numbers on paper. You are also protecting the social, psychological, physical, and time wealth that makes life genuinely rich.
                  </>
                )}
              </div>
            </div>

            <br />
            <SocialShare title={siteTitle} text={shareText} description={shareModuleDescription} />
          </div>
        )}
      </div>
    </>
  );
}
