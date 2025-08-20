<h2 className="text-2xl font-bold mb-4 text-[#FDB9C8]">共有ページ</h2>

<table className="w-full border-collapse">
  <thead className="table-header">
    <tr>
      <th className="p-2">ユーザー</th>
      {data.schedules.map((s) => (
        <th key={s.id} className="p-2">
          {s.date} <br /> {s.timeslot}
        </th>
      ))}
    </tr>
  </thead>
  <tbody>
    {users.map((u) => (
      <tr key={u} className="border-t">
        <td className="table-cell font-bold">{u}</td>
        {data.schedules.map((s) => (
          <td key={s.id} className="table-cell">
            {renderCell(
              responseMap[u] && responseMap[u][s.id]
                ? responseMap[u][s.id]
                : "-"
            )}
          </td>
        ))}
      </tr>
    ))}
    <tr className="bg-[#111] text-yellow-400 font-bold">
      <td className="p-2">出欠率 / 人数</td>
      {data.schedules.map((s) => {
        const stats = calcStats(s.id);
        return (
          <td key={s.id} className="p-2">
            {stats.rate} <br /> {stats.count}
          </td>
        );
      })}
    </tr>
  </tbody>
</table>

<button onClick={handleSave} className="mt-4 btn-accent">
  保存
</button>
