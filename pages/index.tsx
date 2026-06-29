import { useState, useRef } from 'react';
import Head from 'next/head';
import SocialShare from '../components/SocialShare';

// ─── Feedback text arrays (raw text, no A/B/C prefix) ────────────
const textQ2 = [
  '容錯率低，意外生病或請假可能導致收入中斷、影響生活。',
  '去超市不需對每一項斤斤計較，多買點日用品不會覺得有負擔。',
  '去餐廳點餐不會完全被價格綁架，不會每點一道菜就心痛。',
  '可自由花錢買體驗或旅行、住好飯店，不輕易被價格勸退。',
  '能輕鬆買到理想中的房子，住宅選擇不再是人生限制。',
  '金錢成為影響世界、改變產業或支持研究的工具。',
];

const textQ3 = [
  '提高收入、處理債務、建立能應付意外的基本緊急預備金。',
  '投資自己的技能，尋找專長與市場需求的交集，以提高主動收入。',
  '讓錢幫你賺錢，買進生財資產並持續投入，避免生活膨脹太快。',
  '尋找槓桿以突破單靠薪水與一般投資的瓶頸。',
  '保護現有財富，處理因財富變多產生的新問題。',
  '建立某種長期存在，甚至在離開之後都會持續運作的影響力事物。',
];

const textQ4 = [
  '100 元台幣以內',
  '300 元台幣以內',
  '3,000 元台幣以內',
  '30,000 元台幣以內',
  '300,000 元台幣以內',
  '日常花費數字對我已無實質意義，完全不會為了消費金額焦慮。',
];

const textQ5 = [
  '為了多賺 1,000 元，我願意投入半天以上的勞力或兼差。',
  '我願意花費時間接案或加班，以換取數千元的額外收入。',
  '若新收入無法帶來數萬元的進帳，我不會輕易出賣寶貴的時間。',
  '我只專注於能帶來數十萬以上回報的槓桿機會，拒絕零星低薪工作。',
  '我不再為微小比例的增長出賣時間，主要關注百萬級別以上的資產保護。',
  '我只將時間投入在能產生巨大社會影響力的決策上，不單純為賺錢工作。',
];

// ─── Question definitions ─────────────────────────────────────────
interface QuestionDef {
  name: string;
  title: string;
  options: { value: number; label: string }[];
}

const WEALTH_QUESTIONS: QuestionDef[] = [
  {
    name: 'q1',
    title: '1. 您的淨資產範圍大約落在以下哪個區間？',
    options: [
      { value: 1, label: 'A. 不到 30 萬台幣' },
      { value: 2, label: 'B. 台幣 30 萬到 300 萬' },
      { value: 3, label: 'C. 台幣 300 萬到 3 千萬' },
      { value: 4, label: 'D. 台幣 3 千萬到 3 億' },
      { value: 5, label: 'E. 台幣 3 億到 30 億' },
      { value: 6, label: 'F. 台幣 30 億以上' },
    ],
  },
  {
    name: 'q2',
    title: '2. 在日常消費與生活狀態中，您目前最符合哪一種自由程度？',
    options: [
      { value: 1, label: 'A. 容錯率低，意外生病或請假可能導致收入中斷、影響生活。' },
      { value: 2, label: 'B. 去超市不需對每一項斤斤計較，多買點日用品不會覺得有負擔。' },
      { value: 3, label: 'C. 去餐廳點餐不會完全被價格綁架，不會每點一道菜就心痛。' },
      { value: 4, label: 'D. 可自由花錢買體驗或旅行、住好飯店，不輕易被價格勸退。' },
      { value: 5, label: 'E. 能輕鬆買到理想中的房子，住宅選擇不再是人生限制。' },
      { value: 6, label: 'F. 金錢成為影響世界、改變產業或支持研究的工具。' },
    ],
  },
  {
    name: 'q3',
    title: '3. 您現階段最需要專注的主線任務是什麼？',
    options: [
      { value: 1, label: 'A. 提高收入、處理債務、建立能應付意外的基本緊急預備金。' },
      { value: 2, label: 'B. 投資自己的技能，尋找專長與市場需求的交集，以提高主動收入。' },
      { value: 3, label: 'C. 讓錢幫你賺錢，買進生財資產並持續投入，避免生活膨脹太快。' },
      { value: 4, label: 'D. 尋找槓桿以突破單靠薪水與一般投資的瓶頸。' },
      { value: 5, label: 'E. 保護現有財富，處理因財富變多產生的新問題。' },
      { value: 6, label: 'F. 建立某種長期存在，甚至在離開之後都會持續運作的影響力事物。' },
    ],
  },
  {
    name: 'q4',
    title:
      '4. 面對日常支出，當您花費一筆金錢時，以下哪個金額是您完全不需感到焦慮或罪惡的上限？',
    options: [
      { value: 1, label: 'A. 100 元台幣以內' },
      { value: 2, label: 'B. 300 元台幣以內' },
      { value: 3, label: 'C. 3,000 元台幣以內' },
      { value: 4, label: 'D. 30,000 元台幣以內' },
      { value: 5, label: 'E. 300,000 元台幣以內' },
      { value: 6, label: 'F. 日常花費數字對我已無實質意義，完全不會為了消費金額焦慮。' },
    ],
  },
  {
    name: 'q5',
    title:
      '5. 面對增加收入與時間分配的抉擇，當有新的賺錢機會出現時，您當前的決策直覺最符合哪一項？',
    options: [
      { value: 1, label: 'A. 為了多賺 1,000 元，我願意投入半天以上的勞力或兼差。' },
      { value: 2, label: 'B. 我願意花費時間接案或加班，以換取數千元的額外收入。' },
      { value: 3, label: 'C. 若新收入無法帶來數萬元的進帳，我不會輕易出賣寶貴的時間。' },
      { value: 4, label: 'D. 我只專注於能帶來數十萬以上回報的槓桿機會，拒絕零星低薪工作。' },
      {
        value: 5,
        label: 'E. 我不再為微小比例的增長出賣時間，主要關注百萬級別以上的資產保護。',
      },
      {
        value: 6,
        label: 'F. 我只將時間投入在能產生巨大社會影響力的決策上，不單純為賺錢工作。',
      },
    ],
  },
];

const HAPPINESS_QUESTIONS: QuestionDef[] = [
  {
    name: 'h1',
    title: '1. 您的生活緊繃程度與選擇權如何？',
    options: [
      { value: 1, label: '1分：充滿壓力，連最基本的生活選擇都被剝奪，每天為生存焦慮。' },
      { value: 2, label: '2分：勉強支撐，剛好能負擔生活，但遇到突發狀況就會陷入危機。' },
      { value: 3, label: '3分：趨於穩定，度過了壓力最大的時期，但生活重心依然是想辦法賺錢。' },
      { value: 4, label: '4分：餘裕調味，金錢像是調味料讓生活變得更好，擁有較多選擇權。' },
      { value: 5, label: '5分：豐盛無憂，完全不需為錢煩惱，金錢不再是限制人生的任何阻礙。' },
    ],
  },
  {
    name: 'h2',
    title: '2. 您的人際連結與親密關係健康嗎？',
    options: [
      { value: 1, label: '1分：孤立無援，0 個親密朋友，且與家人關係極差、充滿衝突。' },
      { value: 2, label: '2分：關係疏離，僅有 1 到 2 位點頭之交，難以對人敞開心房。' },
      { value: 3, label: '3分：基本社交，有 2 到 3 位可以偶爾談心的朋友，家庭關係普通。' },
      { value: 4, label: '4分：穩定支持，有 3 到 4 位知心好友，與家人或伴侶關係良好和睦。' },
      { value: 5, label: '5分：深度連結，擁有 5 位以上隨時能依靠的親密朋友，給予強大支持。' },
    ],
  },
  {
    name: 'h3',
    title: '3. 您的內在成就感與生活動機穩定嗎？',
    options: [
      { value: 1, label: '1分：嚴重空虛，完全不知道每天前進的動力是什麼，感到極度迷茫。' },
      { value: 2, label: '2分：仰賴外部，失去金錢壓力或外界推力後，就會喪失動機。' },
      { value: 3, label: '3分：偶爾迷惘，大方向清楚，但有時會懷疑自己現在做的事情是否有意義。' },
      { value: 4, label: '4分：目標明確，有穩定的成就感來源，知道自己現階段追求什麼。' },
      { value: 5, label: '5分：內在富足，擁有強大且清晰的人生使命，充滿內在驅動力。' },
    ],
  },
  {
    name: 'h4',
    title: '4. 在追求目標的過程中，您的健康狀況如何？',
    options: [
      {
        value: 1,
        label: '1分：嚴重透支，為賺錢犧牲健康，已造成不可逆的身體傷害或嚴重慢性病。',
      },
      { value: 2, label: '2分：亮起紅燈，經常熬夜、疲勞，有明顯的身體小毛病但無暇理會。' },
      { value: 3, label: '3分：狀態平平，無重大疾病，但缺乏運動，偶爾感到體力不濟。' },
      {
        value: 4,
        label: '4分：注重保養，有固定的運動習慣與良好睡眠，身體狀態能支撐想做的事。',
      },
      { value: 5, label: '5分：充滿活力，非常健康，妥善維護身心，擁有充沛的精力享受生活。' },
    ],
  },
  {
    name: 'h5',
    title: '5. 您能完全掌控自己的時間分配嗎？',
    options: [
      {
        value: 1,
        label: '1分：身不由己，時間完全被綁架，把最好的時間都賣掉了，毫無個人餘裕。',
      },
      { value: 2, label: '2分：勉強擠出，僅能在極短的下班或週末碎片時間做一點想做的事。' },
      { value: 3, label: '3分：勞逸平衡，擁有一定的自由時間，但主要精華時段仍需受制於人或工作。' },
      { value: 4, label: '4分：高度自主，能大幅度決定自己的行程，把大部分時間花在重視的事情上。' },
      { value: 5, label: '5分：時間自由，百分之百掌控自己的日曆，能任意將時間投入真正熱愛的事物。' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────
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
        <strong>合乎資產標準的結果應為：</strong>
        <br />
        {standardText}
      </div>
      <div className="advice-box">
        {status === 'match' ? (
          <span className="status-match">
            ✅ 您的選擇與資產階段完美吻合。
            <br />
            建議：{advice}
          </span>
        ) : (
          <span className={status === 'lag' ? 'status-lag' : 'status-lead'}>
            ⚠️ 您的選擇：{userText}
            <br />
            建議：{advice}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
type Answers = Record<string, number>;

const REQUIRED_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'h1', 'h2', 'h3', 'h4', 'h5'];

export default function Home() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || '現狀與幸福量表';
  const siteDesc = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || '全面檢視您的財務思維與人生平衡';
  const shareText =
    process.env.NEXT_PUBLIC_SHARE_TEXT ||
    '一起用這份量表檢視資產階段、幸福指數與目前最該調整的方向。';
  const shareModuleDescription =
    process.env.NEXT_PUBLIC_SHARE_MODULE_DESCRIPTION ||
    '把這份量表分享給朋友，也保留未來嵌入其他頁面的彈性。';

  const setAnswer = (name: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (REQUIRED_KEYS.some((k) => !answers[k])) {
      alert('請完成所有（共10題）選項後，再查看分析建議喔！');
      return;
    }
    setSubmitted(true);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const q1 = answers['q1'] ?? 0;
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
        <SocialShare title={siteTitle} text={shareText} description={shareModuleDescription} />

        <div className="notice">
          💡
          填寫提示：在第一部分的作答中，請仔細閱讀所有選項，並盡可能往下選擇您目前能達到的「最高」或「最寬裕」的狀態，這將幫助系統為您定位最真實的財富階段。
        </div>

        {/* Part 1 */}
        <div className="section-title">第一部分：檢測目前資產階段</div>
        {renderQuestions(WEALTH_QUESTIONS)}

        {/* Part 2 */}
        <div className="section-title">第二部分：檢測幸福指數</div>
        <p style={{ fontSize: '14.5px', color: 'var(--text-light)', marginBottom: '25px' }}>
          請根據具體指標，評估您在五大維度中的生活狀態：
        </p>
        {renderQuestions(HAPPINESS_QUESTIONS)}

        <button type="button" className="submit-btn" onClick={handleSubmit}>
          送出並查看全方位對比分析
        </button>

        {/* Results */}
        {submitted && (
          <div id="result-section" ref={resultRef}>
            <div className="result-title">您的專屬評量與對比建議</div>
            <p style={{ fontSize: '15px', marginBottom: '25px' }}>
              系統已將您的<strong>淨資產階層</strong>
              作為基準，為您逐一比對各項思維是否合乎當前資產狀態。
            </p>

            <FeedbackCard
              title="【日常自由度比對】"
              {...computeFeedback(
                q1,
                answers['q2'] ?? 0,
                textQ2,
                '您的生活品質或心態仍停留在過去的恐懼中。請適度放寬心，學習享受辛苦累積的財富，不用再對生活中的小麻煩過度焦慮。',
                '您的消費自由度超前了資產水準。請小心生活膨脹的速度是否超過了資產成長的速度，這會讓您的財務狀況變得脆弱。',
                '您對生活的掌控感與您的資產規模非常相符，請繼續保持健康的消費觀。'
              )}
            />

            <FeedbackCard
              title="【主線任務比對】"
              {...computeFeedback(
                q1,
                answers['q3'] ?? 0,
                textQ3,
                '您正花費心力在過往階段的任務上。這會導致您卡在此階層無法突破，請更新您的策略，專注於當前階段最該做的事。',
                '您似乎正在嘗試越級打怪。在沒有穩固基礎的情況下過早追求高槓桿或影響力，可能會因為地基不穩而承受過高風險。',
                '您非常清楚現階段最該做的事，這能確保您以最有效率的方式穩步前進。'
              )}
            />

            <FeedbackCard
              title="【支出思維比對】"
              {...computeFeedback(
                q1,
                answers['q4'] ?? 0,
                textQ4,
                '您仍在為不該焦慮的小錢感到罪惡。許多人在資產成長後卡住，就是被以前靠省錢度過低潮的舊思維綁住。請適度放寬日常消費的容忍度，把精力留給更重要的決策。',
                '對於您目前的資產水位來說，這樣的支出習慣可能過度膨脹。建議稍微收緊，別用更高階層的標準來合理化自己的開銷。',
                '您對於多少錢算大錢、多少錢算小錢的拿捏非常精準，能理性消費而不過度焦慮。'
              )}
            />

            <FeedbackCard
              title="【收入與時間思維比對】"
              {...computeFeedback(
                q1,
                answers['q5'] ?? 0,
                textQ5,
                '您的時間價值已經提升，但仍習慣出賣便宜的時間去換取微小的收入。舊的方法無法帶您跨入新階級，學會拒絕低效收入，尋找槓桿！',
                '您可能眼高手低了。在您目前的資產階段，那些看似微薄的收入其實對累積本金仍有實質幫助，切勿過早追求不切實際的巨大回報。',
                '您非常了解自己的機會成本，不會隨便為小錢賣命，也不會錯失該賺的錢。'
              )}
            />

            {/* Happiness summary */}
            <div className="result-item" style={{ borderLeft: '4px solid var(--accent-color)' }}>
              <div
                className="result-item-title"
                style={{ border: 'none', marginBottom: '5px' }}
              >
                【綜合幸福財富評估】
              </div>
              <div style={{ fontSize: '14.5px', color: '#444', lineHeight: '1.8' }}>
                {avgH < 3 ? (
                  <>
                    <span className="status-lag">
                      🚨 幸福指數偏低 (總分 {totalHappiness}/25)
                    </span>
                    <br />
                    您的健康、人際或時間財富處於匱乏狀態。如果本來就空虛孤立，錢只會把問題放大。強烈建議您暫停腳步，停止為了賺錢犧牲無法買回的健康與人際關係。
                  </>
                ) : avgH < 4.2 ? (
                  <>
                    <span className="status-lead">
                      ⚖️ 幸福指數中等 (總分 {totalHappiness}/25)
                    </span>
                    <br />
                    您的生活處於動態平衡，但可能在某些無形的維度上仍有欠缺。請檢視是否有單一項目低於
                    3 分，填補它會比帳面數字增加帶來更多的快樂。
                  </>
                ) : (
                  <>
                    <span className="status-match">
                      🌟 幸福指數極佳 (總分 {totalHappiness}/25)
                    </span>
                    <br />
                    恭喜您！您不僅在累積帳面的數字，更掌握了人生最重要的社會、心理、身體與時間財富，活出了真正的豐盛。
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
