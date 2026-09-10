import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  X,
  Trophy,
  Sparkles,
  Info,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
} from 'lucide-react';

interface CardDef {
  rank: string;
  suit: '♠' | '♥' | '♦' | '♣';
  isKey?: boolean;
}

interface HandRankingItem {
  rank: number;
  tier: 'high' | 'mid' | 'low';
  title: {
    en: string;
    th: string;
    ja: string;
  };
  altName?: {
    en?: string;
    th?: string;
    ja?: string;
  };
  description: {
    en: string;
    th: string;
    ja: string;
  };
  tieBreaker: {
    en: string;
    th: string;
    ja: string;
  };
  odds: string;
  cards: CardDef[];
}

const HAND_RANKINGS: HandRankingItem[] = [
  {
    rank: 1,
    tier: 'high',
    title: {
      en: 'Royal Flush',
      th: 'รอยัลฟลัช (Royal Flush)',
      ja: 'ロイヤルフラッシュ',
    },
    altName: {
      th: 'รอยัล สเตรท ฟลัช (ไพ่สูงสุด ไร้พ่าย)',
      ja: '最上位のストレートフラッシュ',
    },
    description: {
      en: 'Ace, King, Queen, Jack, and Ten of the exact same suit. Unbeatable hand.',
      th: 'ไพ่ 10, J, Q, K, A ดอกเดียวกัน เป็นชุดไพ่ที่ใหญ่ที่สุดในโป๊กเกอร์ ไม่มีไพ่ใดเอาชนะได้',
      ja: '同じ絵柄のA・K・Q・J・10の組み合わせ。ポーカーにおける絶対的最強役。',
    },
    tieBreaker: {
      en: 'Cannot be beaten. If shared on board, split pot.',
      th: 'ไม่มีใครใหญ่กว่า หากเกิดขึ้นบนกองกลางทุกคนแบ่งชิปเท่ากัน',
      ja: '負けることはありません。ボード共通で成立した場合はチョップ（引き分け）。',
    },
    odds: '0.00015% (1 in 649,740)',
    cards: [
      { rank: 'A', suit: '♠', isKey: true },
      { rank: 'K', suit: '♠', isKey: true },
      { rank: 'Q', suit: '♠', isKey: true },
      { rank: 'J', suit: '♠', isKey: true },
      { rank: '10', suit: '♠', isKey: true },
    ],
  },
  {
    rank: 2,
    tier: 'high',
    title: {
      en: 'Straight Flush',
      th: 'สเตรทฟลัช (Straight Flush)',
      ja: 'ストレートフラッシュ',
    },
    altName: {
      th: 'ไพ่เรียงดอกเดียวกัน',
      ja: '連続する同スートの5枚',
    },
    description: {
      en: 'Five cards of the same suit in sequential numerical order.',
      th: 'ไพ่ 5 ใบ เรียงลำดับแต้มต่อเนื่องกัน และเป็นดอกเดียวกันทั้งหมด',
      ja: '同一スートで数字が連続した5枚の組み合わせ。',
    },
    tieBreaker: {
      en: 'Highest top card wins (e.g. 9-8-7-6-5 beats 8-7-6-5-4).',
      th: 'วัดที่ไพ่ใบสูงสุดของชุดเรียง (เช่น 9♥-5♥ ชนะ 8♠-4♠)',
      ja: '最も高い数字を持つプレイヤーの勝利（例: 9ハイが8ハイに勝つ）。',
    },
    odds: '0.0014% (1 in 72,192)',
    cards: [
      { rank: '9', suit: '♥', isKey: true },
      { rank: '8', suit: '♥', isKey: true },
      { rank: '7', suit: '♥', isKey: true },
      { rank: '6', suit: '♥', isKey: true },
      { rank: '5', suit: '♥', isKey: true },
    ],
  },
  {
    rank: 3,
    tier: 'high',
    title: {
      en: 'Four of a Kind (Quads)',
      th: 'โฟร์การ์ด (Four of a Kind)',
      ja: 'フォー・オブ・ア・カインド',
    },
    altName: {
      th: 'โฟร์การ์ด / หอน / ไพ่แต้มเหมือนกัน 4 ใบ',
      ja: 'クワッズ / 4カード',
    },
    description: {
      en: 'Four cards of identical numerical rank, plus one kicker card.',
      th: 'ไพ่ที่มีแต้มเหมือนกัน 4 ใบ (เช่น K-K-K-K) พร้อมไพ่คิกเกอร์ 1 ใบ',
      ja: '同じ数字のカード4枚と、キッカー1枚の組み合わせ。',
    },
    tieBreaker: {
      en: 'Higher 4-card rank wins. If tied on board, highest 5th card (kicker) wins.',
      th: 'แต้มโฟร์การ์ดสูงกว่าชนะ หากโฟร์การ์ดอยู่บนบอร์ดวัดที่คิกเกอร์ใบที่ 5',
      ja: '4枚のランクが高い方が勝ち。共通の場合は5枚目（キッカー）の強さで判定。',
    },
    odds: '0.024% (1 in 4,165)',
    cards: [
      { rank: 'K', suit: '♠', isKey: true },
      { rank: 'K', suit: '♥', isKey: true },
      { rank: 'K', suit: '♦', isKey: true },
      { rank: 'K', suit: '♣', isKey: true },
      { rank: '9', suit: '♦', isKey: false },
    ],
  },
  {
    rank: 4,
    tier: 'high',
    title: {
      en: 'Full House',
      th: 'ฟูลเฮ้าส์ (Full House)',
      ja: 'フルハウス',
    },
    altName: {
      th: 'ฟูลเฮ้าส์ / เหย้า (ตอง + คู่)',
      ja: 'スリーカード ＋ ワンペア',
    },
    description: {
      en: 'Three cards of one rank combined with two cards of another rank.',
      th: 'ไพ่ตอง (3 ใบแต้มเหมือน) รวมกับไพ่คู่ (2 ใบแต้มเหมือน)',
      ja: '同じランク3枚（スリーカード）と同じランク2枚（ペア）の組み合わせ。',
    },
    tieBreaker: {
      en: 'Higher 3-of-a-kind wins. If trips are equal, higher pair wins.',
      th: 'วัดที่แต้มของตองก่อน หากตองเท่ากันให้วัดที่แต้มของคู่',
      ja: 'スリーカード部分の数字が高い方が勝ち。同じ場合はペア部分で判定。',
    },
    odds: '0.144% (1 in 694)',
    cards: [
      { rank: 'Q', suit: '♠', isKey: true },
      { rank: 'Q', suit: '♥', isKey: true },
      { rank: 'Q', suit: '♦', isKey: true },
      { rank: '10', suit: '♣', isKey: true },
      { rank: '10', suit: '♦', isKey: true },
    ],
  },
  {
    rank: 5,
    tier: 'mid',
    title: {
      en: 'Flush',
      th: 'ฟลัช (Flush)',
      ja: 'フラッシュ',
    },
    altName: {
      th: 'สี (ไพ่ดอกเดียวกัน 5 ใบ ไม่ต้องเรียง)',
      ja: '同スート5枚',
    },
    description: {
      en: 'Any five cards of the same suit, not in sequential order.',
      th: 'ไพ่ 5 ใบที่มีดอกเดียวกันทั้งหมด โดยไม่จำเป็นต้องเรียงแต้ม',
      ja: '同じ絵柄（スート）のカード5枚。数字は連続していなくてよい。',
    },
    tieBreaker: {
      en: 'Highest card in flush wins. If tied, compare 2nd, 3rd, 4th, 5th cards.',
      th: 'วัดที่ไพ่แต้มสูงสุด หากเท่ากันวัดใบถัดไปทีละใบจนครบ 5 ใบ (ดอกไม่มีผล)',
      ja: '最も高い数字を持つ方が勝ち。同ランクの場合は2番目、3番目と順に比較。',
    },
    odds: '0.197% (1 in 508)',
    cards: [
      { rank: 'A', suit: '♣', isKey: true },
      { rank: 'J', suit: '♣', isKey: true },
      { rank: '8', suit: '♣', isKey: true },
      { rank: '4', suit: '♣', isKey: true },
      { rank: '2', suit: '♣', isKey: true },
    ],
  },
  {
    rank: 6,
    tier: 'mid',
    title: {
      en: 'Straight',
      th: 'สเตรท (Straight)',
      ja: 'ストレート',
    },
    altName: {
      th: 'เรียง (ไพ่แต้มเรียงกัน 5 ใบ ต่างดอกได้)',
      ja: '数字が連続する5枚',
    },
    description: {
      en: 'Five cards in sequential order of any suits. Ace can be high (10-J-Q-K-A) or low (A-2-3-4-5).',
      th: 'ไพ่แต้มเรียงลำดับกัน 5 ใบ ต่างดอกกันได้ (A ใช้เป็นแต้มต่ำ A-2-3-4-5 หรือแต้มสูงสุด 10-J-Q-K-A ได้)',
      ja: '数字が5枚連続した組み合わせ（スート不問）。Aは最高（10-J-Q-K-A）または最安（A-2-3-4-5）として使用可能。',
    },
    tieBreaker: {
      en: 'Highest top card of the straight wins. Broadway (A-K-Q-J-10) is highest.',
      th: 'วัดที่ไพ่ใบสูงสุดของสเตรท (10-J-Q-K-A สูงสุด เรียกว่า Broadway)',
      ja: '最も高い数字のストレートが勝ち。A-K-Q-J-10（ブロードウェイ）が最強。',
    },
    odds: '0.392% (1 in 254)',
    cards: [
      { rank: '9', suit: '♠', isKey: true },
      { rank: '8', suit: '♥', isKey: true },
      { rank: '7', suit: '♦', isKey: true },
      { rank: '6', suit: '♣', isKey: true },
      { rank: '5', suit: '♠', isKey: true },
    ],
  },
  {
    rank: 7,
    tier: 'mid',
    title: {
      en: 'Three of a Kind (Trips/Set)',
      th: 'ตอง (Three of a Kind)',
      ja: 'スリー・オブ・ア・カインド',
    },
    altName: {
      th: 'ตอง / ทริปส์ (Trips) / เซ็ต (Set)',
      ja: 'スリーカード / セット',
    },
    description: {
      en: 'Three cards of the same numerical rank, plus two kicker cards.',
      th: 'ไพ่ที่มีแต้มเหมือนกัน 3 ใบ พร้อมไพ่คิกเกอร์อีก 2 ใบ',
      ja: '同じ数字のカード3枚と、キッカー2枚の組み合わせ。',
    },
    tieBreaker: {
      en: 'Higher 3-of-a-kind rank wins. If tied, highest kicker wins.',
      th: 'ตองแต้มสูงกว่าชนะ หากตองเท่ากันวัดที่คิกเกอร์ใบที่ 4 และ 5 ตามลำดับ',
      ja: 'スリーカードの数字が高い方が勝ち。同じ場合はキッカーの数字で判定。',
    },
    odds: '2.11% (1 in 47.3)',
    cards: [
      { rank: '8', suit: '♠', isKey: true },
      { rank: '8', suit: '♥', isKey: true },
      { rank: '8', suit: '♦', isKey: true },
      { rank: 'K', suit: '♣', isKey: false },
      { rank: '4', suit: '♦', isKey: false },
    ],
  },
  {
    rank: 8,
    tier: 'low',
    title: {
      en: 'Two Pair',
      th: 'สองคู่ (Two Pair)',
      ja: 'ツーペア',
    },
    altName: {
      th: 'ทูแพร์ / สองคู่',
      ja: '異なる2組のペア',
    },
    description: {
      en: 'Two different pairs of cards, plus one kicker card.',
      th: 'ไพ่คู่ 2 ชุดต่างแต้มกัน พร้อมไพ่คิกเกอร์ 1 ใบ',
      ja: '異なる数字のペア2組と、キッカー1枚の組み合わせ。',
    },
    tieBreaker: {
      en: 'Higher top pair wins. If tied, higher 2nd pair wins. If still tied, highest kicker wins.',
      th: 'คู่อันดับสูงสุดชนะ หากคู่บนเท่ากันวัดคู่รอง หากเท่ากันอีกวัดคิกเกอร์ใบที่ 5',
      ja: '上位ペアの数字が高い方が勝ち。同じ場合は下位ペア、さらに同じ場合はキッカーで判定。',
    },
    odds: '4.75% (1 in 21)',
    cards: [
      { rank: 'J', suit: '♠', isKey: true },
      { rank: 'J', suit: '♥', isKey: true },
      { rank: '6', suit: '♦', isKey: true },
      { rank: '6', suit: '♣', isKey: true },
      { rank: 'A', suit: '♦', isKey: false },
    ],
  },
  {
    rank: 9,
    tier: 'low',
    title: {
      en: 'One Pair',
      th: 'หนึ่งคู่ (One Pair)',
      ja: 'ワンペア',
    },
    altName: {
      th: 'วันแพร์ / คู่เดียว',
      ja: '1組のペア',
    },
    description: {
      en: 'Two cards of the same numerical rank, plus three kicker cards.',
      th: 'ไพ่ที่มีแต้มเหมือนกัน 2 ใบ พร้อมไพ่คิกเกอร์อีก 3 ใบ',
      ja: '同じ数字のカード2枚と、キッカー3枚の組み合わせ。',
    },
    tieBreaker: {
      en: 'Higher pair wins. If identical pair, highest kicker wins (in order 1st, 2nd, 3rd).',
      th: 'คู่แต้มสูงกว่าชนะ หากคู่แต้มเท่ากันวัดคิกเกอร์ 3 ใบที่เหลือจากสูงไปต่ำ',
      ja: 'ペアの数字が高い方が勝ち。同じ場合は残りのキッカー3枚を強い順に比較。',
    },
    odds: '42.3% (1 in 2.37)',
    cards: [
      { rank: '10', suit: '♠', isKey: true },
      { rank: '10', suit: '♥', isKey: true },
      { rank: 'A', suit: '♦', isKey: false },
      { rank: '8', suit: '♣', isKey: false },
      { rank: '3', suit: '♠', isKey: false },
    ],
  },
  {
    rank: 10,
    tier: 'low',
    title: {
      en: 'High Card',
      th: 'ไพ่สูง (High Card)',
      ja: 'ハイカード',
    },
    altName: {
      th: 'ไฮการ์ด / แต้มสูงสุด (ไม่มีคู่ ไม่เรียง ไม่ใช่สีเดียวกัน)',
      ja: 'ノーハンド / 役なし',
    },
    description: {
      en: 'No matching cards, straights, or flushes. Value determined solely by highest card.',
      th: 'ไม่มีไพ่เข้าคู่ ไม่เรียง และไม่เหมือนดอก วัดแต้มจากไพ่ใบสูงสุดในมือ (A สูงสุด)',
      ja: '役が何も成立していない状態。5枚の中で最も強い数字で競う。',
    },
    tieBreaker: {
      en: 'Highest card wins. If highest matches, compare 2nd, 3rd, 4th, 5th highest cards.',
      th: 'วัดที่ไพ่แต้มสูงสุด หากเท่ากันวัดใบที่ 2, 3, 4, 5 ตามลำดับ',
      ja: '最も高い数字を持つ方が勝ち。同じなら2番目、3番目と順に比較。',
    },
    odds: '50.1% (1 in 1.99)',
    cards: [
      { rank: 'A', suit: '♠', isKey: true },
      { rank: 'Q', suit: '♦', isKey: false },
      { rank: '9', suit: '♣', isKey: false },
      { rank: '6', suit: '♥', isKey: false },
      { rank: '3', suit: '♦', isKey: false },
    ],
  },
];

interface HandRankingsModalProps {
  onClose: () => void;
}

export const HandRankingsModal: React.FC<HandRankingsModalProps> = ({ onClose }) => {
  const { t, language } = useLanguage();
  const [selectedTier, setSelectedTier] = useState<'all' | 'high' | 'mid' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRulesBanner, setShowRulesBanner] = useState<boolean>(true);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const filteredRankings = useMemo(() => {
    return HAND_RANKINGS.filter((item) => {
      // Filter by tier
      if (selectedTier !== 'all' && item.tier !== selectedTier) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleEn = item.title.en.toLowerCase();
        const titleTh = item.title.th.toLowerCase();
        const titleJa = item.title.ja.toLowerCase();
        const altTh = item.altName?.th?.toLowerCase() || '';
        const altEn = item.altName?.en?.toLowerCase() || '';
        const descEn = item.description.en.toLowerCase();
        const descTh = item.description.th.toLowerCase();

        return (
          titleEn.includes(q) ||
          titleTh.includes(q) ||
          titleJa.includes(q) ||
          altTh.includes(q) ||
          altEn.includes(q) ||
          descEn.includes(q) ||
          descTh.includes(q) ||
          item.rank.toString() === q
        );
      }

      return true;
    });
  }, [selectedTier, searchQuery]);

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ring-1 ring-white/10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-2xl shadow-md border border-amber-300/60 text-slate-950">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-serif-poker text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                  {t('handRankingsTitle')}
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  10 Hands
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-tight mt-0.5">
                {t('handRankingsSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
            title={t('closeHandRankings')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchRankingsPlaceholder')}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tier Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedTier('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTier === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('filterAllHands')}
            </button>
            <button
              onClick={() => setSelectedTier('high')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                selectedTier === 'high'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              {t('filterHighHands')}
            </button>
            <button
              onClick={() => setSelectedTier('mid')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTier === 'mid'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('filterMidHands')}
            </button>
            <button
              onClick={() => setSelectedTier('low')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTier === 'low'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t('filterLowHands')}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3.5">
          {/* Rules & Essential Knowledge Collapsible Card */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 text-xs shadow-inner">
            <button
              onClick={() => setShowRulesBanner((prev) => !prev)}
              className="w-full flex items-center justify-between font-bold text-amber-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span>{t('ruleImportantNotes')}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>{showRulesBanner ? 'ซ่อน' : 'แสดง'}</span>
                {showRulesBanner ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {showRulesBanner && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-slate-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('ruleSuitsEqual')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('ruleBestFive')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('ruleSplitPot')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('ruleKicker')}</span>
                </div>
                <div className="mt-2.5 p-2 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-amber-200/90 text-center">
                  {t('ruleCardOrder')}
                </div>
              </div>
            )}
          </div>

          {/* Rankings List */}
          {filteredRankings.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              ไม่พบระดับไพ่ที่ตรงกับคำค้นหา
            </div>
          ) : (
            filteredRankings.map((item) => {
              const localizedTitle = item.title[language] || item.title.en;
              const localizedAlt = item.altName?.[language] || item.altName?.th;
              const localizedDesc = item.description[language] || item.description.en;
              const localizedTie = item.tieBreaker[language] || item.tieBreaker.en;

              const isTop = item.rank <= 2;
              const isQuadsOrFullHouse = item.rank === 3 || item.rank === 4;

              return (
                <div
                  key={item.rank}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isTop
                      ? 'bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-950 border-amber-400/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-400/20'
                      : isQuadsOrFullHouse
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-md'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top line: Rank badge, Title, and Probability */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black font-mono text-xs sm:text-sm shrink-0 shadow-sm ${
                          isTop
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 border border-amber-200'
                            : isQuadsOrFullHouse
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        #{item.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-sm sm:text-base text-slate-100">
                            {localizedTitle}
                          </h4>
                          {item.rank === 1 && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 fill-slate-950" />
                              {t('bestHandBadge')}
                            </span>
                          )}
                        </div>
                        {localizedAlt && (
                          <div className="text-[11px] text-amber-400/80 font-medium">
                            {localizedAlt}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block">
                        {t('oddsLabel')}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-amber-300">
                        {item.odds.split(' ')[0]}
                      </span>
                    </div>
                  </div>

                  {/* Visual 5 Playing Cards Representation */}
                  <div className="my-2.5 flex items-center gap-1.5 sm:gap-2">
                    {item.cards.map((card, idx) => {
                      const isRedSuit = card.suit === '♥' || card.suit === '♦';
                      return (
                        <div
                          key={idx}
                          className={`w-10 h-14 sm:w-12 sm:h-16 rounded-xl flex flex-col justify-between p-1 select-none font-bold transition-transform shadow-md ${
                            card.isKey
                              ? 'bg-gradient-to-b from-white to-slate-100 border-2 border-amber-400 ring-2 ring-amber-400/30'
                              : 'bg-slate-200/90 border border-slate-300 opacity-70'
                          }`}
                        >
                          <div
                            className={`text-[11px] sm:text-xs font-black leading-none flex items-center justify-between ${
                              isRedSuit ? 'text-rose-600' : 'text-slate-950'
                            }`}
                          >
                            <span>{card.rank}</span>
                            <span className="text-[10px] sm:text-[11px]">{card.suit}</span>
                          </div>
                          <div
                            className={`text-center text-sm sm:text-base font-black leading-none ${
                              isRedSuit ? 'text-rose-600' : 'text-slate-950'
                            }`}
                          >
                            {card.suit}
                          </div>
                          <div
                            className={`text-[10px] sm:text-[11px] font-black leading-none text-right rotate-180 ${
                              isRedSuit ? 'text-rose-600' : 'text-slate-950'
                            }`}
                          >
                            <span>{card.rank}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Descriptions and Tie Breakers */}
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-slate-300 leading-relaxed">{localizedDesc}</p>
                    <div className="p-2 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-1.5">
                      <strong className="text-amber-300 shrink-0">
                        {t('tieBreakerLabel')}:
                      </strong>
                      <span>{localizedTie}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs">
          <div className="text-[11px] text-slate-400">
            {t('appTitle')} • Texas Hold&apos;em Rules
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all cursor-pointer"
          >
            {t('closeHandRankings')}
          </button>
        </div>
      </div>
    </div>
  );
};
