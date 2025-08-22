{currentUser === voter ? (
  <select
    value={matrix.votes[schedule.id]?.[voter] || ""}
    onChange={e =>
      handleVoteChange(schedule.id, voter, e.target.value)
    }
  >
    <option value="">-</option>
    <option value="参加">〇 参加</option>
    <option value="不参加">✕ 不参加</option>
  </select>
) : (
  matrix.votes[schedule.id]?.[voter] === "参加"
    ? "〇"
    : matrix.votes[schedule.id]?.[voter] === "不参加"
    ? "✕"
    : "-"
)}
