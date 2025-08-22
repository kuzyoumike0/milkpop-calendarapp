import Holidays from "date-holidays";

const hd = new Holidays("JP"); // 日本の祝日

// react-calendar の tileClassName 用
export const holidayTileClass = ({ date, view }) => {
  if (view === "month") {
    const holiday = hd.isHoliday(date);
    if (holiday) return "holiday";
    if (date.getDay() === 0) return "sunday";
    if (date.getDay() === 6) return "saturday";
  }
  return null;
};
