export const theme = {
  colors: {
    // メインカラー
    primary: '#3b82f6', // ブルー
    primaryHover: '#2563eb',
    secondary: '#6366f1', // インディゴ
    secondaryHover: '#4f46e5',
    
    // 背景色
    background: {
      primary: '#0f172a',   // ダークブルー
      secondary: '#1e293b', // やや明るいダークブルー
      tertiary: '#334155',  // アクセントの背景
    },
    
    // テキスト
    text: {
      primary: '#f8fafc',   // ほぼ白
      secondary: '#cbd5e1', // やや暗い白
      tertiary: '#94a3b8',  // さらに暗い白
    },
    
    // ボーダー
    border: {
      primary: '#334155',   // 暗めのボーダー
      secondary: '#475569', // やや明るいボーダー
    },
    
    // アクセント
    accent: {
      blue: '#38bdf8',    // 明るいブルー
      purple: '#a855f7',  // パープル
      green: '#22c55e',   // グリーン
      red: '#ef4444',     // レッド
    },
    
    // ハイライト
    highlight: {
      primary: 'rgba(56, 189, 248, 0.3)',    // 青のハイライト
      secondary: 'rgba(168, 85, 247, 0.3)',   // 紫のハイライト
      glow: 'rgba(56, 189, 248, 0.1)',       // 発光エフェクト
      hover: 'rgba(250, 204, 21, 0.4)',      // ホバー時の黄色のハイライト
      hoverGlow: 'rgba(250, 204, 21, 0.2)',  // ホバー時の発光エフェクト
    },
    
    // 選択
    selection: {
      active: '#1e40af',      // アクティブな選択
      hover: '#1e3a8a',       // ホバー時の選択
    },
    
    // ユーティリティ
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // 共通のスタイル
  common: {
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },
    shadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.3)',
    },
  },
  
  // コンポーネント固有のスタイル
  components: {
    sidebar: {
      width: '360px',
      background: '#1e293b',
      padding: '20px',
    },
    header: {
      height: '60px',
      background: '#1e293b',
    },
    button: {
      padding: '10px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
      transition: 'all 0.2s ease',
    },
    nodeCard: {
      background: '#334155',
      borderRadius: '12px',
      padding: '16px',
      margin: '8px 0',
      selectedBackground: '#1e40af',
      hoverBackground: '#1e3a8a',
    },
  },
}; 