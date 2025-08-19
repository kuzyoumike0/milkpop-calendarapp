<table>
  <thead>
    <tr>
      <th>日付</th>
      <th>時間帯</th>
      <th>あなたの可否</th>
    </tr>
  </thead>
  <tbody>
    {schedules.map((s, idx) => (
      <tr key={idx}>
        <td>{s.date}</td>
        <td>{s.timeslot}</td>
        <td>
          <select
            value={s.userChoice || ""}
            onChange={(e) => updateChoice(s.date, s.timeslot, e.target.value)}
          >
            <option value="">未選択</option>
            <option value="◯">◯</option>
            <option value="×">×</option>
          </select>
        </td>
      </tr>
    ))}
  </tbody>
</table>
