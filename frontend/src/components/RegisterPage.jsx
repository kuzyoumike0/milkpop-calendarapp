// RegisterPage.jsx 抜粋
const [selectionMode, setSelectionMode] = useState("range"); // range or multiple
const [rangeStart, setRangeStart] = useState(null); // 範囲選択の開始日
const [selectedDates, setSelectedDates] = useState([]);

// 日付クリック処理
const handleDateClick = (date) => {
  if (selectionMode === "range") {
    if (!rangeStart) {
      // 開始日をクリックしたら保存＆強調
      setRangeStart(date);
      setSelectedDates([date]); // 一旦開始日のみ選択状態に
    } else {
      // 2回目クリックで範囲確定
      const start = rangeStart < date ? rangeStart : date;
      const end = rangeStart < date ? date : rangeStart;

      const days = [];
      let d = new Date(start);
      while (d <= end) {
        days.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }

      setSelectedDates(days);
      setRangeStart(null); // 範囲選択終了
    }
  } else if (selectionMode === "multiple") {
    // 複数選択は toggle
    const exists = selectedDates.some(d => d.toDateString() === date.toDateString());
    if (exists) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  }
};

// 日付セルのクラス付与
const getDateClass = (date) => {
  const isSelected = selectedDates.some(d => d.toDateString() === date.toDateString());
  const isStart = rangeStart && date.toDateString() === rangeStart.toDateString();

  if (isStart) return "selected-day range-start";
  if (isSelected) return "selected-day";
  return "";
};
