import { useState, useEffect, useCallback, useRef } from 'react';
import Head from 'next/head';

interface Quest {
  id: string;
  title: string;
  desc: string;
  exp: number;
  penalty: string;
}

type QuestStatus = 'DONE' | 'PENALTY';

interface AppState {
  exp: number;
  level: number;
  activeQuests: Quest[];
  completedQuests: Record<string, QuestStatus>;
  dailyStatus: Record<string, boolean>;
  logs: string[];
}

const questDatabase: Quest[] = [
  { id: 'q1', title: '斷聯實驗', desc: '連續 4 小時不碰任何螢幕，去戶外發呆或走路。', exp: 40, penalty: '在社群公開發道歉文：「因意志力薄弱沉迷螢幕，特此致歉。」' },
  { id: 'q2', title: '未知探索', desc: '走一條從未走過的回家路線，或去陌生街區亂逛。', exp: 35, penalty: '傳訊給通訊錄隨機朋友：「我迷路了，請鼓勵我。」且不解釋。' },
  { id: 'q3', title: '社交破冰', desc: '與陌生人（如店員）進行目標外的親切對話。', exp: 30, penalty: '傳訊給最親近的家人朋友說明你今天搞砸了。' },
  { id: 'q4', title: '微小冒險', desc: '嘗試一件一直想做但怕尷尬遲未做的現實小事。', exp: 50, penalty: '向親近的人坦白一件今天搞砸的糗事並接受嘲笑。' },
  { id: 'q5', title: '冷水刺激', desc: '洗澡時，最後 30 秒強制切換為全冷水。', exp: 25, penalty: '明日禁止飲用任何含有糖分或咖啡因的飲料。' },
  { id: 'q6', title: '飢餓控制', desc: '略過一餐，感受並忍受純粹的飢餓感 4 小時以上。', exp: 40, penalty: '本週禁止食用最喜歡的一項食物。' },
  { id: 'q7', title: '深度靜心', desc: '閉眼靜坐 15 分鐘，不聽音樂，不滑手機，專注呼吸。', exp: 30, penalty: '做 50 個波比跳 (Burpees)。' },
  { id: 'q8', title: '拒絕討好', desc: '今天對別人提出的一個不合理或不想做的要求，明確說「不」。', exp: 50, penalty: '將手機桌布換成「我是個不敢拒絕的懦夫」維持 24 小時。' },
  { id: 'q9', title: '直面恐懼', desc: '主動聯絡一個你一直在逃避、不想面對的人或工作項目。', exp: 60, penalty: '寫 500 字懺悔書並記錄在最顯眼的地方。' },
  { id: 'q10', title: '實體觸地', desc: '去公園脫下鞋襪，雙腳直接踩在泥土或草地上 10 分鐘。', exp: 25, penalty: '捐款 500 元給動物或環境團體。' },
];

const STORAGE_KEY = 'solo_leveling_v5_state';
const DAILY_IDS = ['d1', 'd2', 'd3'];

function drawRandomQuests(count: number): Quest[] {
  return [...questDatabase].sort(() => 0.5 - Math.random()).slice(0, count);
}

function getTitle(lvl: number): string {
  if (lvl >= 10) return '影之君王';
  if (lvl >= 5) return '野外核心獵人';
  if (lvl >= 3) return '覺醒者';
  if (lvl <= 0) return '💀 底層廢物';
  return '掙脫籠子的實驗鼠';
}

const defaultState: AppState = {
  exp: 0,
  level: 1,
  activeQuests: [],
  completedQuests: {},
  dailyStatus: {},
  logs: [],
};

function addLogEntry(logs: string[], message: string): string[] {
  const time = new Date().toLocaleTimeString();
  const updated = [`[${time}] ${message}`, ...logs];
  return updated.slice(0, 50);
}

function applyLevelUp(exp: number, level: number, logs: string[]): { exp: number; level: number; logs: string[] } {
  let e = exp;
  let l = level;
  let ls = logs;
  while (e >= l * 100) {
    e -= l * 100;
    l += 1;
    ls = addLogEntry(ls, `🎉 【系統公告】超越極限！升級至 LV. ${l}！`);
  }
  return { exp: e, level: l, logs: ls };
}

export default function SoloLeveling() {
  const [state, setState] = useState<AppState>(defaultState);
  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [activePenaltyTarget, setActivePenaltyTarget] = useState<Quest | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        if (!parsed.activeQuests || parsed.activeQuests.length === 0) {
          parsed.activeQuests = drawRandomQuests(4);
        }
        setState(parsed);
      } catch {
        const initial: AppState = { ...defaultState, activeQuests: drawRandomQuests(4), logs: addLogEntry([], '【系統啟動】環境初始化完成，已抽取全新任務。') };
        setState(initial);
      }
    } else {
      const initial: AppState = { ...defaultState, activeQuests: drawRandomQuests(4), logs: addLogEntry([], '【系統啟動】環境初始化完成，已抽取全新任務。') };
      setState(initial);
    }
  }, []);

  const saveState = useCallback((newState: AppState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const handleDailyCheck = useCallback((id: string, checked: boolean) => {
    setState(prev => {
      let { exp, level, logs, dailyStatus, ...rest } = prev;
      const newDailyStatus = { ...dailyStatus };
      if (checked) {
        newDailyStatus[id] = true;
        exp += 15;
        logs = addLogEntry(logs, '🏃‍♂️ [每日] 完成基礎鍛鍊，獲得 15 EXP。');
        const result = applyLevelUp(exp, level, logs);
        exp = result.exp; level = result.level; logs = result.logs;
      } else {
        delete newDailyStatus[id];
        exp = Math.max(0, exp - 15);
      }
      const next = { ...rest, exp, level, logs, dailyStatus: newDailyStatus };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const settleDay = useCallback(() => {
    setState(prev => {
      let { exp, level, logs, dailyStatus } = prev;
      const doneCount = Object.keys(dailyStatus).length;
      if (doneCount < 3) {
        exp = Math.max(0, exp - 50);
        logs = addLogEntry(logs, '🚨 [結算懲罰] 未完成所有每日基礎鍛鍊，強制扣除 50 EXP。');
      } else {
        exp += 30;
        logs = addLogEntry(logs, '✨ [結算獎勵] 完美完成每日鍛鍊，額外獲得 30 EXP。');
      }
      const newQuests = drawRandomQuests(4);
      logs = addLogEntry(logs, '🔄 [系統] 本日進度已結算。已為您隨機抽取全新任務。');
      const result = applyLevelUp(exp, level, logs);
      const next: AppState = {
        ...prev,
        exp: result.exp,
        level: result.level,
        logs: result.logs,
        dailyStatus: {},
        completedQuests: {},
        activeQuests: newQuests,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleQuestAction = useCallback((id: string, action: 'DONE' | 'FAIL') => {
    if (action === 'FAIL') {
      const quest = state.activeQuests.find(q => q.id === id) ?? null;
      setActivePenaltyTarget(quest);
      setPenaltyModalOpen(true);
      return;
    }
    setState(prev => {
      const quest = prev.activeQuests.find(q => q.id === id);
      if (!quest) return prev;
      let { exp, level, logs, completedQuests } = prev;
      const newCompleted = { ...completedQuests };
      if (newCompleted[id] === 'DONE') {
        delete newCompleted[id];
        exp = Math.max(0, exp - quest.exp);
        logs = addLogEntry(logs, `[撤銷] 取消任務「${quest.title}」`);
      } else {
        newCompleted[id] = 'DONE';
        exp += quest.exp;
        logs = addLogEntry(logs, `⚔️ [進化] 完成「${quest.title}」，獲得 ${quest.exp} EXP。`);
        const result = applyLevelUp(exp, level, logs);
        exp = result.exp; level = result.level; logs = result.logs;
      }
      const next = { ...prev, exp, level, logs, completedQuests: newCompleted };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [state.activeQuests]);

  const acceptPenalty = useCallback(() => {
    if (!activePenaltyTarget) return;
    const target = activePenaltyTarget;
    setState(prev => {
      const logs = addLogEntry(prev.logs, `🚨 [懲罰認證] 玩家選擇面對現實！已認證執行「${target.title}」的懲罰項目。`);
      const next = { ...prev, logs, completedQuests: { ...prev.completedQuests, [target.id]: 'PENALTY' as QuestStatus } };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setPenaltyModalOpen(false);
    setActivePenaltyTarget(null);
  }, [activePenaltyTarget]);

  const acceptShame = useCallback(() => {
    if (!activePenaltyTarget) return;
    if (!window.confirm('【系統警告】\n由於你拒絕任務亦拒絕懲罰，系統將對你實施意志降級！')) return;
    setState(prev => {
      const newLevel = Math.max(0, prev.level - 1);
      const logs = addLogEntry(prev.logs, `💀 【降級公告】玩家承認自己是廢物。等級強行下降！目前 LV. ${newLevel}。`);
      const next = { ...prev, level: newLevel, exp: 0, logs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setPenaltyModalOpen(false);
    setActivePenaltyTarget(null);
  }, [activePenaltyTarget]);

  const hardReset = useCallback(() => {
    if (!window.confirm('確定要徹底重置系統並清除紀錄嗎？')) return;
    localStorage.removeItem(STORAGE_KEY);
    const initial: AppState = { ...defaultState, activeQuests: drawRandomQuests(4), logs: addLogEntry([], '【系統啟動】環境初始化完成，已抽取全新任務。') };
    setState(initial);
  }, []);

  const expNeeded = state.level * 100;
  const expPercent = Math.max(0, (state.exp / expNeeded) * 100);
  const dailiesDoneCount = Object.keys(state.dailyStatus).length;

  return (
    <>
      <Head>
        <title>【系統】現實野化與強者覺醒計畫</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Noto+Sans+TC:wght@400;700&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Noto Sans TC', 'Orbitron', sans-serif !important; background-color: #0b0f19 !important; padding: 0 !important; }
          .system-border { border: 1px solid #00ffcc; box-shadow: 0 0 15px rgba(0,255,204,0.2); }
          .penalty-border { border: 1px solid #ff4444; box-shadow: 0 0 15px rgba(255,68,68,0.2); }
          .theory-border { border: 1px solid #a855f7; box-shadow: 0 0 15px rgba(168,85,247,0.1); }
          .glow-text { text-shadow: 0 0 10px rgba(0,255,204,0.6); }
          .glow-text-red { text-shadow: 0 0 10px rgba(255,68,68,0.6); }
        `}</style>
      </Head>

      <div className="text-gray-200 min-h-screen p-4 md:p-8" style={{ backgroundColor: '#0b0f19' }}>
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <header className="text-center mb-8 border-b border-gray-800 pb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-teal-400 glow-text tracking-wider mb-2">【 系統：強者準備計畫】</h1>
            <p className="text-gray-400 text-sm">【系統】自己選的路，要堅持走完</p>
          </header>

          {/* Theory Section */}
          <section className="bg-gray-900/80 p-6 rounded-lg theory-border mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              <span>🔮</span> 系統核心世界觀：為什麼你需要這場覺醒？
            </h2>
            <div className="space-y-4 text-sm md:text-base text-gray-300 leading-relaxed">
              <p>
                <strong className="text-white">【現代社會的「籠子效應」】</strong><br />
                當代社會為了絕對的安全與效率，幫人類打造了一個高度受限、規則明確的舒適圈。但神經科學研究指出：<span className="text-amber-400 font-bold">過度的安全，正是慢性焦慮的溫床</span>。當我們被關在規則的框架裡太久，太少主動出去面對未知的風險，我們大腦的「風險警報器」就會退化。最後，連生活中小小的變動或位置，都會像高空獨木橋一樣讓我們感到無比害怕。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2 pt-2 border-t border-b border-gray-800/60 pb-4">
                <div>
                  <span className="text-purple-300 font-bold">🔬 康乃爾大學「野化老鼠」實驗：</span><br />
                  實驗室裡患有嚴重焦慮、打死不敢走上高架獨木橋的老鼠，在被「野放」到大自然自由探索一個星期後，牠們的<span className="text-teal-400 font-bold">恐懼反應竟然完全被重置了</span>。因為見過真正的風雨與大世面，重新面對原本害怕的玩具獨木橋時，大腦學會了重新校準風險，變得大膽且自信。
                </div>
                <div>
                  <span className="text-teal-300 font-bold">⚔️ 《我獨自升級》的成長邏輯：</span><br />
                  主角成振宇在規則注定的殘酷世界裡，曾是最弱小的存在。直到「遊戲化系統」強迫他進行每日鍛鍊與生死肉搏，將他強行野放。當他戰勝過無數惡魔與君王後，回頭看人類社會的財閥與權勢威脅，就不再感到絲毫恐懼。
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                💡 <strong className="text-purple-400">系統使用指南：</strong>
                本系統旨在扮演那雙「強迫野放你」的幕後黑手。這裡的每一項任務都是為了打破社會框架、重建大腦對風險的耐受度。點擊下方按鈕結算任務；若選擇逃避，你必須執行現實代價或承認自己是廢物。請誠實回報，開始你的進化。
              </p>
            </div>
          </section>

          {/* Status + Daily */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Status */}
            <div className="bg-gray-900 p-5 rounded-lg system-border flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-teal-400 mb-4 border-b border-gray-800 pb-2">玩家狀態 (Status)</h2>
                <div className="space-y-3">
                  <p className="flex justify-between"><span className="text-gray-400">等級:</span> <span className="font-bold text-xl text-white">LV. {state.level}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">稱號:</span> <span className="text-amber-400">{getTitle(state.level)}</span></p>
                  <div className="w-full bg-gray-800 rounded-full h-2.5 mt-2">
                    <div className="bg-teal-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${expPercent}%` }} />
                  </div>
                  <p className="text-right text-xs text-gray-500">EXP: {state.exp} / {expNeeded}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-red-400">
                ⚠️ 每日結算時，若未完成基礎任務將強制扣除 50 EXP。
              </div>
            </div>

            {/* Daily Quests */}
            <div className="bg-gray-900 p-5 rounded-lg border border-gray-800 md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
                  <h2 className="text-xl font-bold text-white">每日基礎任務 (Daily Quest)</h2>
                  {dailiesDoneCount < 3 && (
                    <span className="text-xs bg-red-950 text-red-400 border border-red-800 px-2 py-1 rounded animate-pulse">⚠️ 尚未全部完成</span>
                  )}
                </div>
                <div className="space-y-3">
                  {[
                    { id: 'd1', label: '伏地挺身 100 下 (或個人極限)' },
                    { id: 'd2', label: '仰臥起坐 100 下 (或個人極限)' },
                    { id: 'd3', label: '長跑 5 公里 (或戶外徒步 30 分鐘)' },
                  ].map(({ id, label }) => (
                    <label key={id} className="flex items-center space-x-3 bg-gray-800/50 p-3 rounded cursor-pointer hover:bg-gray-800 transition">
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-teal-500 rounded"
                        checked={!!state.dailyStatus[id]}
                        onChange={e => handleDailyCheck(id, e.target.checked)}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={settleDay}
                className="mt-4 w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded shadow-lg shadow-amber-900/50 transition"
              >
                ⚡ 結算本日任務並隨機抽取新任務 ⚡
              </button>
            </div>
          </div>

          {/* Rewilding Quests */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-8">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">主動野化突破任務 (Rewilding Quests)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.activeQuests.map(q => {
                const currentStatus = state.completedQuests[q.id];
                const isDone = currentStatus === 'DONE';
                const isPenalty = currentStatus === 'PENALTY';
                const isNormal = !currentStatus;
                let borderClass = 'border-gray-700';
                if (isDone) borderClass = 'border-teal-500/50 bg-teal-950/10';
                if (isPenalty) borderClass = 'border-red-500/50 bg-red-950/10';
                return (
                  <div key={q.id} className={`bg-gray-800/40 p-4 rounded-lg border ${borderClass} flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-bold ${isDone ? 'text-teal-400 line-through' : ''} ${isPenalty ? 'text-red-400' : 'text-white'}`}>{q.title}</h3>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-700 text-teal-300">+{q.exp} EXP</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{q.desc}</p>
                      <div className="text-xs text-red-400/70 mb-4 bg-red-950/20 p-2 rounded border border-red-900/30">
                        <strong>⚠️ 懲罰代價：</strong>{q.penalty}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!isPenalty && (
                        <button
                          onClick={() => handleQuestAction(q.id, 'DONE')}
                          className={`flex-1 py-2 text-xs font-bold rounded ${isDone ? 'bg-gray-700 text-gray-400' : 'bg-teal-600 hover:bg-teal-500 text-white'}`}
                        >
                          {isDone ? '撤銷' : '回報完成'}
                        </button>
                      )}
                      {isNormal && (
                        <button
                          onClick={() => handleQuestAction(q.id, 'FAIL')}
                          className="py-2 px-3 text-xs font-bold rounded bg-red-950 text-red-400 border border-red-900 hover:bg-red-900/50"
                        >
                          放棄
                        </button>
                      )}
                      {isPenalty && (
                        <button disabled className="w-full py-2 text-xs font-bold rounded bg-red-900 text-red-200 opacity-50 cursor-not-allowed">
                          已執行懲罰
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Log */}
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">日誌紀錄 (System Log)</h2>
              <button onClick={hardReset} className="text-xs text-red-400 hover:underline">重設系統資料</button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto text-sm text-gray-400 font-mono">
              {state.logs.map((log, i) => <div key={i}>{log}</div>)}
            </div>
          </div>

        </div>
      </div>

      {/* Penalty Modal */}
      {penaltyModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full penalty-border">
            <h3 className="text-red-500 font-bold text-xl mb-2 glow-text-red">🚨 系統制約：觸發懲罰機制</h3>
            <p className="text-sm text-gray-400 mb-4">選擇放棄此任務，系統將啟動代價。請選擇面對方式：</p>
            <div className="bg-gray-900 border border-red-900 p-3 rounded mb-4 text-sm text-red-300 font-mono">
              <span className="text-gray-500">【當前懲罰項目】</span><br />
              {activePenaltyTarget?.penalty}
            </div>
            <div className="space-y-3">
              <button onClick={acceptPenalty} className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm transition">
                我願意執行此懲罰，並回報完成
              </button>
              <button onClick={acceptShame} className="w-full bg-transparent border border-gray-700 hover:border-red-500 text-gray-500 hover:text-red-400 font-bold py-2 px-4 rounded text-xs transition">
                承認我是廢物，直接降級
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
