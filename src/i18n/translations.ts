export type Language = 'en' | 'th';

export const translations = {
  en: {
    // Header & Brand
    appTitle: 'POKER CHIP HUB',
    appSubtitle: 'Real-time Peer-to-Peer Chip Counter & Side-Pot Calculator for live home games. No accounts required.',
    potMath: 'Pot Math',
    leaveTable: 'Leave Table',
    copyRoomId: 'Copy Room ID',
    roomCode: 'Room Code',
    playersCount: 'Players',

    // Lobby / Landing
    playerNickname: 'Player Nickname',
    nicknamePlaceholder: 'e.g. Maverick',
    hostNewTable: 'Host New Table',
    dealerTable: 'Dealer Table',
    buyInChips: 'Buy-In Chips',
    maxPlayers: 'Max Players (Seats)',
    seatsCount: '{count} Seats',
    roomCodeOptional: 'Room Code (optional)',
    roomCodePlaceholder: 'e.g. poker-night',
    createTableBtn: 'Create {count}-Player Table & Share Code',
    creatingRoom: 'Creating Room...',
    joinExistingTable: 'Join Existing Table',
    enterRoomCodePlaceholder: 'Enter Host Room Code...',
    joinBtn: 'Join',
    practiceModeTitle: 'Practice Table (Single Device)',
    practicePlayers: 'Players:',
    startPracticeBtn: 'Start Practice Hand ({count} Players)',
    connectionError: 'Error:',

    // Table View
    roundStage: 'Round Stage',
    handNumber: 'Hand #{number}',
    totalPot: 'Total Pot',
    sidePots: 'Side Pots:',
    mainPot: 'Main',
    sidePotN: 'Side {index}',
    emptySeat: 'Seat {number}',
    clickToSit: 'Click to Sit',
    seatNumber: 'Seat {number}',
    youBadge: '(You)',
    winnerBadge: 'WINNER (+{amount})',
    foldedBadge: 'Folded',
    allInBadge: 'ALL-IN',
    actingBadge: 'Acting...',
    checkedBadge: 'Checked',
    calledBadge: 'Called',
    raisedBadge: 'Raised',
    inHandBadge: 'In Hand',
    stackLabel: 'Stack',
    betLabel: 'Bet',
    spectatingNotice: 'You are spectating. Click an empty seat to sit.',

    // Streets
    streetReady: 'Ready',
    streetPreflop: 'Preflop',
    streetFlop: 'Flop',
    streetTurn: 'Turn',
    streetRiver: 'River',
    streetShowdown: 'Showdown',

    // Action Controls
    yourTurn: '★ YOUR TURN TO ACT ★',
    toCall: 'To Call:',
    waitingForTurn: 'Waiting for other players to act...',
    foldedMessage: 'You have folded for this hand. Waiting for the next round...',
    zeroChipsMessage: 'You have 0 chips left. Ask the Host to add chips / rebuy to participate.',
    allInCommitted: 'You are ALL-IN with {chips} chips committed!',
    zeroChipsRebuy: 'You have 0 CHIPS remaining. Rebuy to play.',
    actionFold: 'FOLD',
    actionSurrender: 'Surrender',
    actionCheck: 'CHECK',
    actionCheckSub: 'Free / Pass',
    actionCall: 'CALL',
    actionRaise: 'RAISE',
    actionAllInBtn: 'ALL-IN 🔥',
    halfPot: '½ Pot',
    threeQuarterPot: '¾ Pot',
    fullPot: 'Pot',

    // Host Panel
    dealerHostTitle: 'DEALER / HOST',
    chipsBtn: 'Chips',
    blindsBtn: 'Blinds',
    dealNewHand: 'DEAL NEW HAND ({sb}/{bb})',
    nextStreet: 'Next Street',
    awardPotBtn: 'Award Pot ({amount})',
    peerConnected: 'Peer Connected',
    hostManaging: 'Host is managing dealer operations.',

    // Award Pot Modal
    awardModalTitle: 'Select Winner(s) & Award Pot',
    awardModalDesc: 'Distribute the pot of {amount} chips among the hand winner(s).',
    selectedWinner: '✓ Selected',
    clickToPickWinner: 'Click to Pick',
    cancel: 'Cancel',
    confirmPayout: 'Confirm Payout',
    foldedTag: '(Folded)',

    // Rebuy Modal
    rebuyModalTitle: 'Add Chips (Rebuy / Top-Up)',
    targetPlayer: 'Target Player',
    selectPlayerPlaceholder: 'Select player to top-up',
    amountToAdd: 'Amount to Add',
    applyRebuy: 'Apply Rebuy',

    // Blinds & Settings Modal
    tableSettingsTitle: 'Table Blinds & Stakes',
    maxPlayersSetting: 'Max Players (Seats: 2 - 10)',
    maxPlayersOption: '{count} Seats ({count} Max Players)',
    smallBlindLabel: 'Small Blind',
    bigBlindLabel: 'Big Blind',
    anteLabel: 'Ante (per player)',
    saveSettings: 'Save Settings',

    // Pot Calculator Modal
    calculatorTitle: 'Live Pot & Side-Pot Calculations',
    calculatorSubtitle: 'Accurate side-pot splits for all-in scenarios',
    currentBetLabel: 'Current Bet',
    potBreakdown: 'Pot Breakdown',
    potsCount: '({count} Pot)',
    potsCountPlural: '({count} Pots)',
    noChipsInPot: 'No chips in the pot yet.',
    mainPotTitle: '🏆 Main Pot',
    sidePotTitle: '🎯 Side Pot #{index}',
    chipsUnit: 'chips',
    eligibleLabel: 'Eligible:',
    noneAllFolded: 'None (all folded)',
    playerContributions: 'Player Contributions',
    closeCalculator: 'Close Calculator',

    // Winner Celebration
    handWinnerTitle: 'Hand #{number} Winner',
    awardedLabel: 'Awarded',
    dismiss: 'Dismiss',

    // Game Log
    handHistoryTitle: 'Hand History & Activity',
    eventsCount: '{count} events',
    noActivityRecorded: 'No action recorded yet.',

    // Language Toggle
    switchLanguage: 'Language',
  },
  th: {
    // Header & Brand
    appTitle: 'POKER CHIP HUB',
    appSubtitle: 'ระบบนับชิปและคำนวณกองกลางแยก (Side-Pot) แบบ Peer-to-Peer เรียลไทม์ สำหรับวงโป๊กเกอร์สด ไม่ต้องสมัครสมาชิก',
    potMath: 'คำนวณกองกลาง',
    leaveTable: 'ออกจากโต๊ะ',
    copyRoomId: 'คัดลอกรหัสห้อง',
    roomCode: 'รหัสห้อง',
    playersCount: 'ผู้เล่น',

    // Lobby / Landing
    playerNickname: 'ชื่อผู้เล่น / ฉายา',
    nicknamePlaceholder: 'เช่น Maverick, บลัฟคิง',
    hostNewTable: 'สร้างโต๊ะใหม่ (Host)',
    dealerTable: 'โต๊ะคนแจกไพ่',
    buyInChips: 'ชิปเริ่มต้น (Buy-In)',
    maxPlayers: 'จำนวนที่นั่งสูงสุด',
    seatsCount: '{count} ที่นั่ง',
    roomCodeOptional: 'รหัสห้อง (ระบุเองได้)',
    roomCodePlaceholder: 'เช่น poker-night-1',
    createTableBtn: 'สร้างโต๊ะ {count} ที่นั่งและแชร์รหัส',
    creatingRoom: 'กำลังสร้างห้อง...',
    joinExistingTable: 'เข้าร่วมโต๊ะที่มีอยู่',
    enterRoomCodePlaceholder: 'กรอกรหัสห้องของโฮสต์...',
    joinBtn: 'เข้าร่วม',
    practiceModeTitle: 'โต๊ะฝึกซ้อม (เล่นบนเครื่องเดียว)',
    practicePlayers: 'จำนวนผู้เล่น:',
    startPracticeBtn: 'เริ่มเล่นโต๊ะฝึกซ้อม ({count} ผู้เล่น)',
    connectionError: 'เกิดข้อผิดพลาด:',

    // Table View
    roundStage: 'รอบการเล่น',
    handNumber: 'ตาที่ #{number}',
    totalPot: 'กองกลางรวม',
    sidePots: 'กองกลางแยก:',
    mainPot: 'กองหลัก',
    sidePotN: 'กองแยก {index}',
    emptySeat: 'ที่นั่ง {number}',
    clickToSit: 'คลิกเพื่อนั่ง',
    seatNumber: 'ที่นั่ง {number}',
    youBadge: '(คุณ)',
    winnerBadge: 'ผู้ชนะ (+{amount})',
    foldedBadge: 'หมอบแล้ว',
    allInBadge: 'เทหมดหน้าตัก',
    actingBadge: 'กำลังเล่น...',
    checkedBadge: 'ผ่าน (Check)',
    calledBadge: 'ตาม (Call)',
    raisedBadge: 'เก/เพิ่ม (Raise)',
    inHandBadge: 'อยู่ในเกม',
    stackLabel: 'ชิปคงเหลือ',
    betLabel: 'เดิมพัน',
    spectatingNotice: 'คุณกำลังรับชม คลิกที่นั่งว่างเพื่อเข้าร่วมเล่น',

    // Streets
    streetReady: 'พร้อมเริ่ม',
    streetPreflop: 'พรีฟล็อป (Preflop)',
    streetFlop: 'ฟล็อป (Flop)',
    streetTurn: 'เทิร์น (Turn)',
    streetRiver: 'ริเวอร์ (River)',
    streetShowdown: 'เปิดไพ่ (Showdown)',

    // Action Controls
    yourTurn: '★ ถึงตาคุณเล่นแล้ว ★',
    toCall: 'จำนวนที่ต้องตาม:',
    waitingForTurn: 'กำลังรอผู้เล่นคนอื่นดำเนินการ...',
    foldedMessage: 'คุณหมอบไปแล้วในตานี้ กำลังรอเริ่มตาถัดไป...',
    zeroChipsMessage: 'ชิปของคุณหมดแล้ว แจ้งโฮสต์เพื่อขอเติมชิป (Rebuy)',
    allInCommitted: 'คุณเทหมดหน้าตัก (ALL-IN) แล้ว ด้วยชิป {chips}!',
    zeroChipsRebuy: 'คุณมี 0 ชิป ขอเติมชิปเพื่อเล่นต่อ',
    actionFold: 'หมอบ (FOLD)',
    actionSurrender: 'ยอมแพ้ตานี้',
    actionCheck: 'ผ่าน (CHECK)',
    actionCheckSub: 'ผ่านฟรี',
    actionCall: 'ตาม (CALL)',
    actionRaise: 'เก/เพิ่ม (RAISE)',
    actionAllInBtn: 'เทหมดหน้าตัก 🔥',
    halfPot: '½ กอง',
    threeQuarterPot: '¾ กอง',
    fullPot: 'เต็มกอง',

    // Host Panel
    dealerHostTitle: 'คนแจก / โฮสต์',
    chipsBtn: 'เติมชิป',
    blindsBtn: 'บลายด์',
    dealNewHand: 'แจกไพ่รอบใหม่ ({sb}/{bb})',
    nextStreet: 'เปิดรอบถัดไป',
    awardPotBtn: 'มอบกองกลาง ({amount})',
    peerConnected: 'เชื่อมต่อกับห้องแล้ว',
    hostManaging: 'โฮสต์กำลังจัดการรอบการแจกไพ่',

    // Award Pot Modal
    awardModalTitle: 'เลือกผู้ชนะและมอบชิปกองกลาง',
    awardModalDesc: 'แจกจ่ายชิปกองกลาง {amount} ให้กับผู้ชนะในตานี้',
    selectedWinner: '✓ เลือกแล้ว',
    clickToPickWinner: 'คลิกเพื่อเลือก',
    cancel: 'ยกเลิก',
    confirmPayout: 'ยืนยันการจ่ายชิป',
    foldedTag: '(หมอบแล้ว)',

    // Rebuy Modal
    rebuyModalTitle: 'เติมชิป (Rebuy / Top-Up)',
    targetPlayer: 'เลือกผู้เล่น',
    selectPlayerPlaceholder: 'เลือกผู้เล่นที่ต้องการเติมชิป',
    amountToAdd: 'จำนวนชิปที่ต้องการเพิ่ม',
    applyRebuy: 'ยืนยันเติมชิป',

    // Blinds & Settings Modal
    tableSettingsTitle: 'ตั้งค่าบลายด์และขนาดโต๊ะ',
    maxPlayersSetting: 'จำนวนที่นั่งสูงสุด (2 - 10 ที่นั่ง)',
    maxPlayersOption: '{count} ที่นั่ง (สูงสุด {count} ผู้เล่น)',
    smallBlindLabel: 'สมอลบลายด์ (Small Blind)',
    bigBlindLabel: 'บิ๊กบลายด์ (Big Blind)',
    anteLabel: 'อันเต้ / ค่าต๋ง (Ante ต่อคน)',
    saveSettings: 'บันทึกการตั้งค่า',

    // Pot Calculator Modal
    calculatorTitle: 'คำนวณกองกลางและ Side-Pot สด',
    calculatorSubtitle: 'คำนวณการแบ่งกองกลางแยกอย่างแม่นยำกรณีมีผู้เล่น All-in',
    currentBetLabel: 'ยอดเดิมพันสูงสุด',
    potBreakdown: 'รายละเอียดกองกลาง',
    potsCount: '({count} กอง)',
    potsCountPlural: '({count} กอง)',
    noChipsInPot: 'ยังไม่มีชิปในกองกลาง',
    mainPotTitle: '🏆 กองกลางหลัก (Main Pot)',
    sidePotTitle: '🎯 กองกลางแยก #{index} (Side Pot)',
    chipsUnit: 'ชิป',
    eligibleLabel: 'ผู้มีสิทธิ์ลุ้น:',
    noneAllFolded: 'ไม่มี (หมอบทุกคน)',
    playerContributions: 'ชิปที่ผู้เล่นลงในตานี้',
    closeCalculator: 'ปิดหน้าต่าง',

    // Winner Celebration
    handWinnerTitle: 'ผู้ชนะตาที่ #{number}',
    awardedLabel: 'ได้รับชิป',
    dismiss: 'ปิด',

    // Game Log
    handHistoryTitle: 'ประวัติและบันทึกการเล่น',
    eventsCount: '{count} รายการ',
    noActivityRecorded: 'ยังไม่มีบันทึกการเล่น',

    // Language Toggle
    switchLanguage: 'เปลี่ยนภาษา',
  },
};

export type TranslationKey = keyof typeof translations.en;
