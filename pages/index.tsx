import Head from 'next/head';
import Link from 'next/link';

const tools = [
  {
    href: '/csv',
    title: 'CSV 比對工具',
    desc: '上傳兩份 CSV，依主鍵比對差異，支援欄位忽略與分頁統計。',
  },
  {
    href: '/solo-leveling',
    title: 'Solo Leveling 自我訓練',
    desc: '仿遊戲任務系統，每日抽取挑戰任務，累積經驗值提升等級。',
  },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Tools Hub</title>
        <meta name="description" content="A collection of useful tools." />
      </Head>
      <main style={{ maxWidth: 640, margin: '60px auto', padding: '0 24px', fontFamily: 'sans-serif' }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Tools Hub</h1>
        <p style={{ color: '#666', marginBottom: 40 }}>選擇工具開始使用</p>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {tools.map((t) => (
            <li key={t.href}>
              <Link href={t.href} style={{ display: 'block', padding: '20px 24px', border: '1px solid #e2e8f0', borderRadius: 8, textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 6 }}>{t.title}</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>{t.desc}</div>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
