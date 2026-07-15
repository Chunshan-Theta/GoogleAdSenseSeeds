import { useState, useMemo } from 'react';
import Head from 'next/head';

interface Job { name: string; salary: number; }
interface HousingTier { rent: number; buy: number; desc: string; }
interface CostTier { cost: number; desc: string; }
interface Tier3<T> { low: T; mid: T; high: T; }
interface RegionData {
  region: string;
  housing: Tier3<HousingTier>;
  food: Tier3<CostTier>;
  trans: Tier3<CostTier>;
  life: Tier3<CostTier>;
}

const jobs: Job[] = [
  { name: '勞工 - 外送/便利店', salary: 480000 },
  { name: '吸引力 - 展場/主持', salary: 800000 },
  { name: '時間 - 遠洋/24h看護', salary: 1200000 },
  { name: '專業 - 軟硬體工程/管理職', salary: 1500000 },
  { name: '高階 - 醫師/自營商', salary: 3000000 },
];

const matrixDB: RegionData[] = [
  {
    region: '國內 - 蛋黃區',
    housing: { low: { rent: 15000, buy: 12000000, desc: '分租套房 / 40年老公寓' }, mid: { rent: 25000, buy: 25000000, desc: '市區小電梯大樓' }, high: { rent: 50000, buy: 45000000, desc: '精華區高級景觀宅' } },
    food: { low: { cost: 10000, desc: '自煮為主/平價便當' }, mid: { cost: 20000, desc: '日常外食/週末中階餐廳' }, high: { cost: 40000, desc: '無預算限制/精緻餐飲' } },
    trans: { low: { cost: 2000, desc: '大眾運輸月票' }, mid: { cost: 6000, desc: '機車/偶爾計程車' }, high: { cost: 20000, desc: '計程車自由/自駕進口車' } },
    life: { low: { cost: 5000, desc: '免費公共資源/健保' }, mid: { cost: 12000, desc: '健身房/定期國內旅遊' }, high: { cost: 30000, desc: '高階俱樂部/頻繁出國' } },
  },
  {
    region: '國內 - 蛋白蛋殼區',
    housing: { low: { rent: 8000, buy: 6000000, desc: '偏遠套房/老舊透天' }, mid: { rent: 18000, buy: 15000000, desc: '市郊新大樓/寬敞公寓' }, high: { rent: 35000, buy: 28000000, desc: '透天別墅/重劃區豪宅' } },
    food: { low: { cost: 8000, desc: '自煮/在地小吃' }, mid: { cost: 15000, desc: '外食無虞/連鎖餐廳' }, high: { cost: 25000, desc: '頻繁高階聚餐' } },
    trans: { low: { cost: 2000, desc: '機車代步' }, mid: { cost: 8000, desc: '國產代步汽車' }, high: { cost: 15000, desc: '進口車/高鐵商務艙' } },
    life: { low: { cost: 4000, desc: '社區活動/輕旅' }, mid: { cost: 8000, desc: '訂閱制/年度出國' }, high: { cost: 20000, desc: '私人教練/高端醫療' } },
  },
  {
    region: '國內 - 鄉鎮區域',
    housing: { low: { rent: 4000, buy: 3000000, desc: '老舊雅房/三合院' }, mid: { rent: 10000, buy: 8000000, desc: '翻新透天/公寓' }, high: { rent: 20000, buy: 18000000, desc: '豪華農舍/新別墅' } },
    food: { low: { cost: 5000, desc: '自種/傳統市場自煮' }, mid: { cost: 10000, desc: '鎮上小吃/外食' }, high: { cost: 18000, desc: '無預算限制/進口食材' } },
    trans: { low: { cost: 1000, desc: '老舊機車/腳踏車' }, mid: { cost: 5000, desc: '二手國產車' }, high: { cost: 10000, desc: '進口代步車' } },
    life: { low: { cost: 2000, desc: '廟口/社區活動' }, mid: { cost: 5000, desc: '國內輕旅/串流' }, high: { cost: 10000, desc: '頻繁出國/高級休閒' } },
  },
  {
    region: '國外 - 高發展 (美日德)',
    housing: { low: { rent: 25000, buy: 15000000, desc: '郊區合租/微型公寓' }, mid: { rent: 50000, buy: 30000000, desc: '都會區標準公寓' }, high: { rent: 100000, buy: 80000000, desc: '市中心獨棟/高級公寓' } },
    food: { low: { cost: 15000, desc: '超市自煮為主' }, mid: { cost: 30000, desc: '偶爾餐廳/外賣' }, high: { cost: 60000, desc: '米其林/高消費外食' } },
    trans: { low: { cost: 5000, desc: '地鐵/公車' }, mid: { cost: 15000, desc: '二手車/完善軌道' }, high: { cost: 40000, desc: '專車/頭等艙' } },
    life: { low: { cost: 8000, desc: '基本保險/公園' }, mid: { cost: 25000, desc: '國際藝文/標準醫療' }, high: { cost: 60000, desc: '高階私保/環球旅行' } },
  },
  {
    region: '國外 - 發展中 (東南亞)',
    housing: { low: { rent: 6000, buy: 3000000, desc: '當地人舊公寓' }, mid: { rent: 15000, buy: 8000000, desc: '外派標準服務公寓' }, high: { rent: 35000, buy: 20000000, desc: '帶泳池頂級全包公寓' } },
    food: { low: { cost: 5000, desc: '路邊攤/傳統市場' }, mid: { cost: 12000, desc: '商場餐廳/豐富道地' }, high: { cost: 25000, desc: '五星飯店餐飲' } },
    trans: { low: { cost: 1000, desc: '租機車/雙條車' }, mid: { cost: 4000, desc: '網約車自由' }, high: { cost: 12000, desc: '包車帶司機' } },
    life: { low: { cost: 3000, desc: '當地基本醫療' }, mid: { cost: 10000, desc: '國際醫院/平價按摩' }, high: { cost: 25000, desc: '高爾夫球證/頂級私醫' } },
  },
  {
    region: '國外 - 低發展 (非/南美)',
    housing: { low: { rent: 3000, buy: 1500000, desc: '當地貧民區/鐵皮' }, mid: { rent: 8000, buy: 5000000, desc: '一般住宅區安全公寓' }, high: { rent: 20000, buy: 12000000, desc: '富人區武裝保全別墅' } },
    food: { low: { cost: 3000, desc: '當地市場原形食物' }, mid: { cost: 8000, desc: '中階餐館/外國超市' }, high: { cost: 15000, desc: '高級飯店西餐' } },
    trans: { low: { cost: 500, desc: '擁擠小巴/徒步' }, mid: { cost: 2000, desc: '當地計程車/自駕' }, high: { cost: 8000, desc: '防彈專車/專職司機' } },
    life: { low: { cost: 1000, desc: '極簡生活/無保險' }, mid: { cost: 5000, desc: '基礎私立醫療/酒吧' }, high: { cost: 15000, desc: '跨國醫療/富豪俱樂部' } },
  },
];

const TARGETS = [1000000, 3000000, 5000000, 8000000, 10000000, 15000000, 20000000, 30000000, 50000000, 100000000];

type LevelClass = 'level-high' | 'level-mid' | 'level-low' | 'level-none';
interface LevelInfo { cls: LevelClass; label: string; desc: string; cost: number; }

function getLevelInfo(budget: number, thresholds: Tier3<HousingTier> | Tier3<CostTier>, isHousingBuy: boolean): LevelInfo {
  const isHousing = (t: Tier3<HousingTier> | Tier3<CostTier>): t is Tier3<HousingTier> =>
    'rent' in t.low;
  let tLow: number, tMid: number, tHigh: number;
  let dLow: string, dMid: string, dHigh: string;
  if (isHousing(thresholds)) {
    tLow = isHousingBuy ? thresholds.low.buy : thresholds.low.rent;
    tMid = isHousingBuy ? thresholds.mid.buy : thresholds.mid.rent;
    tHigh = isHousingBuy ? thresholds.high.buy : thresholds.high.rent;
    dLow = thresholds.low.desc; dMid = thresholds.mid.desc; dHigh = thresholds.high.desc;
  } else {
    tLow = (thresholds as Tier3<CostTier>).low.cost;
    tMid = (thresholds as Tier3<CostTier>).mid.cost;
    tHigh = (thresholds as Tier3<CostTier>).high.cost;
    dLow = (thresholds as Tier3<CostTier>).low.desc;
    dMid = (thresholds as Tier3<CostTier>).mid.desc;
    dHigh = (thresholds as Tier3<CostTier>).high.desc;
  }
  if (budget >= tHigh) return { cls: 'level-high', label: '舒適型', desc: dHigh, cost: tHigh };
  if (budget >= tMid) return { cls: 'level-mid', label: '標準型', desc: dMid, cost: tMid };
  if (budget >= tLow) return { cls: 'level-low', label: '妥協型', desc: dLow, cost: tLow };
  return { cls: 'level-none', label: '無法負擔', desc: '預算低於此區最低門檻', cost: tLow };
}

function BudgetCell({ title, budget, info }: { title: string; budget: number; info: LevelInfo }) {
  const surplus = budget - info.cost;
  return (
    <>
      <span className="budget-display">{title}: ${Math.round(budget).toLocaleString()}</span>
      <span className={`level-tag ${info.cls}`}>{info.label} (花費: ${info.cost.toLocaleString()})</span><br />
      {surplus >= 0
        ? <span className="surplus-pos">盈餘: +${Math.round(surplus).toLocaleString()}</span>
        : <span className="surplus-neg">缺口: -${Math.round(Math.abs(surplus)).toLocaleString()}</span>}
      <br />
      <span className="detail-text">{info.desc}</span>
    </>
  );
}

export default function FireCalculator() {
  const [RETIREMENT_AGE, setRETIREMENT_AGE] = useState(60);
  const [SAFE_WITHDRAWAL_RATE, setSAFE_WITHDRAWAL_RATE] = useState(0.04);
  const [finalAge, setFinalAge] = useState(80); // 20-year mortgage (20 × 12)
  const [currentAge, setCurrentAge] = useState(25);
  const [savingRate, setSavingRate] = useState(50);
  const [ror, setRor] = useState(5);
  const [annualSalary, setAnnualSalary] = useState(1500000);
  const [ratioHousing, setRatioHousing] = useState(40);
  const [ratioFood, setRatioFood] = useState(30);
  const [ratioTrans, setRatioTrans] = useState(10);
  const [ratioLife, setRatioLife] = useState(20);
  const [housingMode, setHousingMode] = useState<'rent' | 'buy'>('rent');
  const [targetSelect, setTargetSelect] = useState(5000000);

  const MORTGAGE_MONTHS = (finalAge-RETIREMENT_AGE) * 12;
  const annualSaving = annualSalary * (savingRate / 100);
  const ROR = ror / 100;
  const ratioSum = ratioHousing + ratioFood + ratioTrans + ratioLife;

  // Section 2: target accumulation results
  const calcResults = useMemo(() => {
    if (annualSaving <= 0) return [];
    return TARGETS.map(target => {
      const yearsToTarget = ROR === 0
        ? target / annualSaving
        : Math.log((target * ROR) / annualSaving + 1) / Math.log(1 + ROR);
      const targetAge = currentAge + yearsToTarget;
      if (targetAge > RETIREMENT_AGE) return { target, yearsToTarget, targetAge, fv: 0, monthlyBudget: 0, reachable: false };
      const fv = ROR === 0 ? target : target * Math.pow(1 + ROR, RETIREMENT_AGE - targetAge);
      const monthlyBudget = (fv * SAFE_WITHDRAWAL_RATE) / 12;
      return { target, yearsToTarget, targetAge, fv, monthlyBudget, reachable: true };
    });
  }, [currentAge, annualSaving, ROR]);

  // Current budgets map (target -> monthlyBudget)
  const currentBudgets = useMemo(() => {
    const map: Record<string, number> = {};
    calcResults.forEach(r => { map[r.target.toString()] = r.reachable ? r.monthlyBudget : 0; });
    return map;
  }, [calcResults]);

  // Section 3: matrix
  const totalBudget = currentBudgets[targetSelect.toString()] || 0;
  const bHousing = totalBudget * (ratioHousing / 100);
  const bHousingEffective = housingMode === 'buy' ? bHousing * MORTGAGE_MONTHS : bHousing;
  const bFood = totalBudget * (ratioFood / 100);
  const bTrans = totalBudget * (ratioTrans / 100);
  const bLife = totalBudget * (ratioLife / 100);

  // Section 4: coast FIRE
  const coastFireRows = useMemo(() => {
    const totalYears = RETIREMENT_AGE - currentAge;
    if (annualSaving <= 0 || currentAge >= RETIREMENT_AGE || ROR <= 0) return null;
    return matrixDB.map(row => {
      const tiers = ['low', 'mid', 'high'] as const;
      return {
        region: row.region,
        tiers: tiers.map(tier => {
          const housingCostMonthly = housingMode === 'buy'
            ? row.housing[tier].buy / MORTGAGE_MONTHS
            : row.housing[tier].rent;
          const monthlyNeeded = housingCostMonthly + row.food[tier].cost + row.trans[tier].cost + row.life[tier].cost;
          const fvNeeded = (monthlyNeeded * 12) / SAFE_WITHDRAWAL_RATE;
          const K = (fvNeeded * ROR) / (annualSaving * Math.pow(1 + ROR, totalYears));
          if (K >= 1) return { type: 'impossible' as const };
          const N = -Math.log(1 - K) / Math.log(1 + ROR);
          if (N > totalYears) return { type: 'impossible' as const };
          if (N <= 0) return { type: 'already' as const };
          const stopAge = currentAge + N;
          const principalAtStop = annualSaving * (Math.pow(1 + ROR, N) - 1) / ROR;
          return { type: 'stop' as const, stopAge, principalAtStop, fvNeeded };
        }),
      };
    });
  }, [currentAge, annualSaving, ROR, housingMode]);

  return (
    <>
      <Head>
        <title>你需要存錢嗎？ - 破除焦慮的 FIRE 試算系統</title>
        <style>{`
          :root { --primary: #0f172a; --bg: #f8fafc; --card: #ffffff; --text: #1e293b; --border: #e2e8f0; }
          body { font-family: system-ui, -apple-system, sans-serif !important; background-color: var(--bg) !important; color: var(--text); line-height: 1.5; margin: 0; padding: 20px !important; }
          .fire-container { max-width: 1200px; margin: 0 auto; display: grid; gap: 20px; }
          .header-title { text-align: center; font-size: 2rem; color: var(--primary); margin: 10px 0 10px; letter-spacing: 2px; }
          .intro-text { text-align: center; font-size: 0.95rem; color: #475569; max-width: 800px; margin: 0 auto 20px; line-height: 1.6; padding: 15px; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .card { background: var(--card); padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid var(--border); overflow-x: auto; }
          .card h2 { margin-top: 0; font-size: 1.25rem; border-bottom: 2px solid var(--primary); padding-bottom: 8px; display: inline-block; }
          .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
          .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
          .form-group { display: flex; flex-direction: column; gap: 5px; margin-bottom: 15px; }
          .form-group label { font-weight: 600; font-size: 0.9rem; }
          .form-group input, .form-group select { padding: 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 1rem; }
          .fire-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem; table-layout: fixed; min-width: 900px; }
          .fire-table th, .fire-table td { padding: 10px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: top; }
          .highlight { color: #16a34a; font-weight: bold; }
          .warning { color: #dc2626; font-weight: bold; }
          .surplus-pos { color: #16a34a; font-weight: 700; font-size: 0.85rem; }
          .surplus-neg { color: #dc2626; font-weight: 700; font-size: 0.85rem; }
          .level-tag { display: inline-block; padding: 3px 6px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-bottom: 4px; }
          .level-high { background: #dcfce7; color: #166534; }
          .level-mid { background: #fef08a; color: #854d0e; }
          .level-low { background: #e2e8f0; color: #475569; }
          .level-none { background: #fee2e2; color: #991b1b; }
          .detail-text { font-size: 0.8rem; color: #64748b; margin-top: 4px; display: block; }
          .budget-display { font-size: 0.85rem; font-weight: 700; color: var(--primary); margin-bottom: 6px; display: block; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
          .age-stop { font-size: 1.15rem; color: #0284c7; font-weight: 800; }
          .coast-data { font-size: 0.85rem; color: #475569; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1; display: block; }
          .ratio-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; }
          .ratio-grid > div { display: flex; flex-direction: column; gap: 4px; font-size: 0.9rem; font-weight: 600; }
          .ratio-grid input { padding: 8px; border: 1px solid var(--border); border-radius: 4px; font-size: 1rem; }
        `}</style>
      </Head>

      <div className="fire-container">
        <h1 className="header-title">你需要存錢嗎？</h1>
        <div className="intro-text">
          當代人常深陷財務焦慮，感覺被資本主義剝削，這往往是「焦慮販售」文化所致。<br />
          本工具旨在破除迷思，透過精算具體的「FIRE 階段目標」與「Coast FIRE 停止儲蓄點」，將抽象的數字映射至真實的生活品質。這是一套幫助你平定內心、重新掌握人生主導權的客觀方針。
        </div>

        {/* Section 1: Basic Parameters */}
        <div className="card">
          <h2>1. 基礎參數與職業設定</h2>
          <div className="grid-2">
            <div className="form-group">
              <label>當前年齡</label>
              <input type="number" value={currentAge} min={18} onChange={e => setCurrentAge(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>儲蓄率 (%)</label>
              <input type="number" value={savingRate} min={1} max={100} onChange={e => setSavingRate(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>預期年化報酬率 (%)</label>
              <input type="number" value={ror} min={0} max={20} step={0.5} onChange={e => setRor(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label>選擇職業 (帶入公版年薪)</label>
              <select onChange={e => setAnnualSalary(Number(e.target.value))} value={annualSalary}>
                {jobs.map(j => (
                  <option key={j.name} value={j.salary}>{j.name} (約 {j.salary / 10000} 萬)</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>實際年薪 (可手動修改)</label>
              <input type="number" value={annualSalary} step={10000} onChange={e => setAnnualSalary(Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Section 2: Target Accumulation */}
        <div className="card">
          <h2>2. 累積資產與 60 歲複利推算</h2>
          <table className="fire-table">
            <thead>
              <tr>
                <th>目標資產</th>
                <th>達成所需年月</th>
                <th>達成時年齡</th>
                <th>至60歲複利年數</th>
                <th>60 歲總資產 (FV)</th>
                <th>FIRE 月預算 (4%法則)</th>
              </tr>
            </thead>
            <tbody>
              {calcResults.map(r => (
                <tr key={r.target}>
                  <td>{r.target / 10000} 萬</td>
                  {r.reachable ? (
                    <>
                      <td>{Math.floor(r.yearsToTarget)}年{Math.ceil((r.yearsToTarget % 1) * 12)}月</td>
                      <td>{r.targetAge.toFixed(1)} 歲</td>
                      <td>{(60 - r.targetAge).toFixed(1)} 年</td>
                      <td>${Math.round(r.fv).toLocaleString()}</td>
                      <td className="highlight">${Math.round(r.monthlyBudget).toLocaleString()}</td>
                    </>
                  ) : (
                    <td colSpan={5} className="warning">無法在 60 歲前達成</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: Budget Matrix */}
        <div className="card">
          <h2>3. 預算分配與生活品質對應矩陣</h2>
          <div className="form-group">
            <label>
              生活預算佔比分配 (總和須為 100%)&nbsp;
              {ratioSum !== 100 && <span className="warning">總和不等於 100%！</span>}
            </label>
            <div className="ratio-grid">
              <div>住 (%) <input type="number" value={ratioHousing} onChange={e => setRatioHousing(Number(e.target.value))} /></div>
              <div>食衣 (%) <input type="number" value={ratioFood} onChange={e => setRatioFood(Number(e.target.value))} /></div>
              <div>行 (%) <input type="number" value={ratioTrans} onChange={e => setRatioTrans(Number(e.target.value))} /></div>
              <div>育樂 (%) <input type="number" value={ratioLife} onChange={e => setRatioLife(Number(e.target.value))} /></div>
            </div>
            <label>
              預期有效存活年齡
            </label>
            <div className="ratio-grid">
              <div>歲數<input type="number" value={finalAge} onChange={e => setFinalAge(Number(e.target.value))} /></div>
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 15 }}>
            <div className="form-group">
              <label>模擬目標資產</label>
              <select value={targetSelect} onChange={e => setTargetSelect(Number(e.target.value))}>
                {TARGETS.map(t => <option key={t} value={t}>{t / 10000} 萬 目標</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>居住模式 (買斷將比較總價，租屋比較月租金)</label>
              <select value={housingMode} onChange={e => setHousingMode(e.target.value as 'rent' | 'buy')}>
                <option value="rent">長期租屋</option>
                <option value="buy">購置房產</option>
              </select>
            </div>
          </div>
          <table className="fire-table">
            <thead>
              <tr>
                <th style={{ width: '15%' }}>區域</th>
                <th style={{ width: '21%' }}>住 (居住)</th>
                <th style={{ width: '21%' }}>食衣 (飲食/日常)</th>
                <th style={{ width: '21%' }}>行 (交通)</th>
                <th style={{ width: '21%' }}>育樂 (醫療/休閒)</th>
              </tr>
            </thead>
            <tbody>
              {totalBudget === 0 ? (
                <tr>
                  <td colSpan={5} className="warning" style={{ textAlign: 'center' }}>
                    此資產目標在 60 歲前無法達成，無預算可供分配
                  </td>
                </tr>
              ) : matrixDB.map(row => {
                const hInfo = getLevelInfo(bHousingEffective, row.housing, housingMode === 'buy');
                const fInfo = getLevelInfo(bFood, row.food, false);
                const tInfo = getLevelInfo(bTrans, row.trans, false);
                const lInfo = getLevelInfo(bLife, row.life, false);
                return (
                  <tr key={row.region}>
                    <td style={{ fontWeight: 'bold' }}>{row.region}</td>
                    <td><BudgetCell title="分配預算" budget={bHousingEffective} info={hInfo} /></td>
                    <td><BudgetCell title="分配預算" budget={bFood} info={fInfo} /></td>
                    <td><BudgetCell title="分配預算" budget={bTrans} info={tInfo} /></td>
                    <td><BudgetCell title="分配預算" budget={bLife} info={lInfo} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 4: Coast FIRE */}
        <div className="card">
          <h2>4. 你需要存錢到幾歲？ (停止儲蓄年齡精算)</h2>
          <table className="fire-table">
            <thead>
              <tr>
                <th style={{ width: '16%' }}>區域</th>
                <th style={{ width: '28%' }}>妥協型 (低) 生活水準</th>
                <th style={{ width: '28%' }}>標準型 (中) 生活水準</th>
                <th style={{ width: '28%' }}>舒適型 (高) 生活水準</th>
              </tr>
            </thead>
            <tbody>
              {coastFireRows === null ? (
                <tr>
                  <td colSpan={4} className="warning" style={{ textAlign: 'center' }}>
                    參數不足以精算 (未儲蓄、已達60歲，或報酬率為0)
                  </td>
                </tr>
              ) : coastFireRows.map(row => (
                <tr key={row.region}>
                  <td style={{ fontWeight: 'bold' }}>{row.region}</td>
                  {row.tiers.map((tier, i) => (
                    <td key={i}>
                      {tier.type === 'impossible' && (
                        <span className="warning">❌ 放棄吧<br /><span className="detail-text">存到 60 歲也無法達成</span></span>
                      )}
                      {tier.type === 'already' && (
                        <span className="highlight">🎉 恭喜！<br /><span className="detail-text">你現在就可以停止存錢了</span><br /><span className="coast-data">當前本金與未來複利已達標</span></span>
                      )}
                      {tier.type === 'stop' && (
                        <>
                          <span className="age-stop">{tier.stopAge.toFixed(1)} 歲</span>
                          <span className="coast-data">
                            停止時本金: {Math.round(tier.principalAtStop / 10000).toLocaleString()} 萬<br />
                            60歲時複利: {Math.round(tier.fvNeeded / 10000).toLocaleString()} 萬
                          </span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
