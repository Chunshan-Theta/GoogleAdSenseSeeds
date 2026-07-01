import { ChangeEvent, useMemo, useRef, useState } from 'react';
import Head from 'next/head';
import Papa from 'papaparse';

type CellStatus = 'identical' | 'empty' | 'added' | 'removed' | 'changed';

interface ComparisonCell {
  colIndex: number;
  status: CellStatus;
  val1: string;
  val2: string;
}

interface ComparisonRow {
  rowIndex: number;
  cells: ComparisonCell[];
}

const ROWS_PER_PAGE = 250;
const PAGE_WINDOW_SIZE = 5;

export default function Home() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [headers1, setHeaders1] = useState<string[]>([]);
  const [headers2, setHeaders2] = useState<string[]>([]);
  const [globalHeaders, setGlobalHeaders] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonRow[]>([]);
  const [ignoredCols, setIgnoredCols] = useState<Set<number>>(new Set());
  const [ignoredRows, setIgnoredRows] = useState<Set<number>>(new Set());
  const [ignoredCells, setIgnoredCells] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [isProcessed, setIsProcessed] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || 'CSV 比對工具 (分頁與統計版)';
  const siteDesc =
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    '本地安全執行、標題智慧對應、可忽視欄列單格、支援大資料量分頁比對。';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const traditionalChineseUrl = process.env.NEXT_PUBLIC_SITE_ZH_TW_URL;

  const onFileUpload = (
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setter(String(e.target?.result || ''));
    reader.readAsText(file);
  };

  const processComparison = () => {
    const trimmed1 = text1.trim();
    const trimmed2 = text2.trim();

    if (!trimmed1 && !trimmed2) {
      alert('請上傳或貼上 CSV 資料！');
      return;
    }

    const config = { header: true, skipEmptyLines: true };
    const parsed1 = Papa.parse<Record<string, string>>(trimmed1, config);
    const parsed2 = Papa.parse<Record<string, string>>(trimmed2, config);

    const fields1 = parsed1.meta.fields || [];
    const fields2 = parsed2.meta.fields || [];
    const mergedHeaders = Array.from(new Set([...fields1, ...fields2]));

    if (mergedHeaders.length === 0) {
      alert('無法解析標題，請確認 CSV 格式。');
      return;
    }

    const data1 = parsed1.data;
    const data2 = parsed2.data;
    const maxRows = Math.max(data1.length, data2.length);

    const nextComparisonData: ComparisonRow[] = [];

    for (let i = 0; i < maxRows; i += 1) {
      const row1 = data1[i] || {};
      const row2 = data2[i] || {};

      const cells = mergedHeaders.map((header, colIndex) => {
        const raw1 = row1[header];
        const raw2 = row2[header];
        const val1 = typeof raw1 === 'string' ? raw1.trim() : '';
        const val2 = typeof raw2 === 'string' ? raw2.trim() : '';

        let status: CellStatus;
        if (val1 === val2 && val1 !== '') {
          status = 'identical';
        } else if (val1 === val2 && val1 === '') {
          status = 'empty';
        } else if (val1 === '') {
          status = 'added';
        } else if (val2 === '') {
          status = 'removed';
        } else {
          status = 'changed';
        }

        return { colIndex, status, val1, val2 };
      });

      nextComparisonData.push({ rowIndex: i, cells });
    }

    setHeaders1(fields1);
    setHeaders2(fields2);
    setGlobalHeaders(mergedHeaders);
    setComparisonData(nextComparisonData);
    setIgnoredCols(new Set());
    setIgnoredRows(new Set());
    setIgnoredCells(new Set());
    setCurrentPage(1);
    setIsProcessed(true);
  };

  const totalRows = comparisonData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE));

  const pageData = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = Math.min(start + ROWS_PER_PAGE, totalRows);
    return comparisonData.slice(start, end);
  }, [comparisonData, currentPage, totalRows]);

  const stats = useMemo(() => {
    let total = 0;
    let identical = 0;
    let changed = 0;
    let added = 0;
    let removed = 0;

    comparisonData.forEach((row) => {
      if (ignoredRows.has(row.rowIndex)) {
        return;
      }

      row.cells.forEach((cell) => {
        if (ignoredCols.has(cell.colIndex)) {
          return;
        }

        const cellId = `${row.rowIndex}-${cell.colIndex}`;
        if (ignoredCells.has(cellId)) {
          return;
        }

        total += 1;
        if (cell.status === 'identical' || cell.status === 'empty') {
          identical += 1;
        } else if (cell.status === 'changed') {
          changed += 1;
        } else if (cell.status === 'added') {
          added += 1;
        } else if (cell.status === 'removed') {
          removed += 1;
        }
      });
    });

    return { total, identical, changed, added, removed };
  }, [comparisonData, ignoredCells, ignoredCols, ignoredRows]);

  const pct = (value: number) => {
    if (stats.total === 0) {
      return '0%';
    }
    return `${((value / stats.total) * 100).toFixed(1)}%`;
  };

  const toggleColumn = (colIndex: number) => {
    setIgnoredCols((prev) => {
      const next = new Set(prev);
      if (next.has(colIndex)) {
        next.delete(colIndex);
      } else {
        next.add(colIndex);
      }
      return next;
    });
  };

  const toggleRow = (rowIndex: number) => {
    setIgnoredRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowIndex)) {
        next.delete(rowIndex);
      } else {
        next.add(rowIndex);
      }
      return next;
    });
  };

  const toggleCell = (rowIndex: number, colIndex: number) => {
    const cellId = `${rowIndex}-${colIndex}`;
    setIgnoredCells((prev) => {
      const next = new Set(prev);
      if (next.has(cellId)) {
        next.delete(cellId);
      } else {
        next.add(cellId);
      }
      return next;
    });
  };

  const scrollToStats = () => {
    statsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(totalPages, Math.max(1, page));
    setCurrentPage(nextPage);
    setTimeout(scrollToStats, 0);
  };

  const changePage = (delta: number) => {
    goToPage(currentPage + delta);
  };

  const pageNumbers = useMemo(() => {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + (PAGE_WINDOW_SIZE - 1));

    if (endPage - startPage < PAGE_WINDOW_SIZE - 1) {
      startPage = Math.max(1, endPage - (PAGE_WINDOW_SIZE - 1));
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }, [currentPage, totalPages]);

  const headerSet1 = useMemo(() => new Set(headers1), [headers1]);
  const headerSet2 = useMemo(() => new Set(headers2), [headers2]);

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDesc} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="zh_TW" />
        {siteUrl && <link rel="canonical" href={siteUrl} />}
        {siteUrl && <link rel="alternate" hrefLang="en" href={siteUrl} />}
        {traditionalChineseUrl && (
          <link rel="alternate" hrefLang="zh-TW" href={traditionalChineseUrl} />
        )}
        {siteUrl && <link rel="alternate" hrefLang="x-default" href={siteUrl} />}
      </Head>

      <div className="container csv-container">
        <div className="instructions">
          <h3>📖 工具功能說明</h3>
          <ul>
            <li>
              <strong>本地安全執行：</strong>所有資料都在您的瀏覽器內處理，不上傳任何伺服器，確保機密資料不外洩。
            </li>
            <li>
              <strong>標題智慧對應：</strong>系統會自動讀取第一行的標題名稱進行比對。即使兩份檔案的欄位順序被打亂，也能精準找出差異。
            </li>
            <li>
              <strong>點擊忽視（不列入計算）：</strong>可點擊表頭、行號、資料格忽視差異，統計面板會即時扣除。
            </li>
            <li>
              <strong>效能優化與分頁控制：</strong>預設每頁 250 筆，可切換上一頁、下一頁或直接跳頁。
            </li>
          </ul>
        </div>

        <h1>CSV 比對工具 (分頁與統計版)</h1>

        <div className="compare-inputs">
          <div className="box">
            <h3>📂 原始資料</h3>
            <input type="file" accept=".csv" onChange={(e) => onFileUpload(e, setText1)} />
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              placeholder="或直接貼上含標題的 CSV..."
            />
          </div>
          <div className="box">
            <h3>📂 修改後資料</h3>
            <input type="file" accept=".csv" onChange={(e) => onFileUpload(e, setText2)} />
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              placeholder="或直接貼上含標題的 CSV..."
            />
          </div>
        </div>

        <button type="button" className="btn-compare" onClick={processComparison}>
          執行比較
        </button>

        {isProcessed && (
          <div id="result-section">
            <div className="stats-panel" ref={statsRef}>
              <div className="stat-item stat-total">
                總計處理格數
                <div className="stat-value">{stats.total}</div>
              </div>
              <div className="stat-item stat-identical">
                ✅ 內容相同
                <div className="stat-value">
                  {stats.identical} ({pct(stats.identical)})
                </div>
              </div>
              <div className="stat-item stat-changed">
                ⚠️ 內容修改
                <div className="stat-value">
                  {stats.changed} ({pct(stats.changed)})
                </div>
              </div>
              <div className="stat-item stat-added">
                ➕ 新增資料
                <div className="stat-value">
                  {stats.added} ({pct(stats.added)})
                </div>
              </div>
              <div className="stat-item stat-removed">
                ➖ 刪除資料
                <div className="stat-value">
                  {stats.removed} ({pct(stats.removed)})
                </div>
              </div>
            </div>

            <div className="pagination-container">
              <button
                type="button"
                className="btn-page"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                |◀
              </button>
              <button
                type="button"
                className="btn-page"
                onClick={() => changePage(-1)}
                disabled={currentPage === 1}
              >
                ◀ 上一頁
              </button>
              {pageNumbers.map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`btn-page ${page === currentPage ? 'active-page' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="btn-page"
                onClick={() => changePage(1)}
                disabled={currentPage === totalPages}
              >
                下一頁 ▶
              </button>
              <button
                type="button"
                className="btn-page"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                ▶|
              </button>
              <span className="page-info">
                第 {currentPage} / {totalPages} 頁 (每頁 {ROWS_PER_PAGE} 筆 / 共 {totalRows} 筆)
              </span>
            </div>

            <div className="result-container">
              <table>
                <thead>
                  <tr>
                    <th className="index-head">#</th>
                    {globalHeaders.map((header, colIndex) => {
                      const structuralClass = !headerSet1.has(header)
                        ? 'diff-added'
                        : !headerSet2.has(header)
                          ? 'diff-removed'
                          : '';
                      const ignoredClass = ignoredCols.has(colIndex) ? 'ignored-col' : '';
                      return (
                        <th
                          key={`${header}-${colIndex}`}
                          data-col={colIndex}
                          className={`${structuralClass} ${ignoredClass}`.trim()}
                          title="點擊忽略此欄"
                          onClick={() => toggleColumn(colIndex)}
                        >
                          {header}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((row) => {
                    const rowIgnored = ignoredRows.has(row.rowIndex);
                    return (
                      <tr
                        key={row.rowIndex}
                        className={rowIgnored ? 'ignored-row' : ''}
                        data-row={row.rowIndex}
                      >
                        <th
                          className="row-index"
                          title="點擊忽略此列"
                          onClick={() => toggleRow(row.rowIndex)}
                        >
                          {row.rowIndex + 1}
                        </th>
                        {row.cells.map((cell) => {
                          const cellId = `${row.rowIndex}-${cell.colIndex}`;
                          const ignoredCellClass = ignoredCells.has(cellId) ? 'ignored-cell' : '';
                          const ignoredColClass = ignoredCols.has(cell.colIndex) ? 'ignored-col' : '';

                          const statusClass =
                            cell.status === 'added'
                              ? 'diff-added'
                              : cell.status === 'removed'
                                ? 'diff-removed'
                                : cell.status === 'changed'
                                  ? 'diff-changed'
                                  : '';

                          return (
                            <td
                              key={cellId}
                              data-row={row.rowIndex}
                              data-col={cell.colIndex}
                              className={`${statusClass} ${ignoredCellClass} ${ignoredColClass}`.trim()}
                              onClick={() => toggleCell(row.rowIndex, cell.colIndex)}
                            >
                              {cell.status === 'changed' ? (
                                <>
                                  <span className="text-removed">{cell.val1}</span>
                                  <br />
                                  <span className="text-added">{cell.val2}</span>
                                </>
                              ) : (
                                cell.val2 || cell.val1
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination-container">
              <button
                type="button"
                className="btn-page"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
              >
                |◀
              </button>
              <button
                type="button"
                className="btn-page"
                onClick={() => changePage(-1)}
                disabled={currentPage === 1}
              >
                ◀ 上一頁
              </button>
              {pageNumbers.map((page) => (
                <button
                  type="button"
                  key={`bottom-${page}`}
                  className={`btn-page ${page === currentPage ? 'active-page' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="btn-page"
                onClick={() => changePage(1)}
                disabled={currentPage === totalPages}
              >
                下一頁 ▶
              </button>
              <button
                type="button"
                className="btn-page"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                ▶|
              </button>
              <span className="page-info">
                第 {currentPage} / {totalPages} 頁 (每頁 {ROWS_PER_PAGE} 筆 / 共 {totalRows} 筆)
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
