import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { TimeUnit, ShelfLifeResult } from "../types";

const IMPORTED_THRESHOLD = 50;
const DOMESTIC_THRESHOLD = 70;

const pad2 = (value: number) => String(value).padStart(2, "0");

const toDateStr = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

const parseDateStr = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  return parsed;
};

const formatDisplayDate = (date: Date) =>
  `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;

const MONTH_LABELS = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

const MIN_WHEEL_YEAR = 1950;
const MAX_WHEEL_YEAR = 2050;
const WHEEL_ITEM_HEIGHT = 44;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

function WheelColumn({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const index = Math.max(0, items.indexOf(value));
    container.scrollTo({ top: index * WHEEL_ITEM_HEIGHT, behavior: "auto" });
  }, [items, value]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const rawIndex = Math.round(container.scrollTop / WHEEL_ITEM_HEIGHT);
    const index = clamp(rawIndex, 0, items.length - 1);
    const nextValue = items[index];

    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  return (
    <div className="min-w-0">
      <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-neutral-400">
        {label}
      </p>
        <div className="relative">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-56 overflow-y-auto wheel-scrollbar-hide rounded-2xl border border-neutral-200 bg-neutral-50 py-[88px] shadow-inner-sm"
          >
          {items.map((item) => {
            const active = item === value;

            return (
              <button
                key={item}
                type="button"
                onClick={() => onChange(item)}
                className={`flex h-11 w-full items-center justify-center text-sm font-semibold transition-colors ${
                  active
                    ? "text-blue-700"
                    : "text-neutral-700 hover:bg-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="pointer-events-none absolute left-2 right-2 top-1/2 h-11 -translate-y-1/2 rounded-xl border-y border-blue-200/80 bg-blue-50/40" />
      </div>
    </div>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectedDate = parseDateStr(value);

  const initialWheelDate = selectedDate ?? new Date();
  const [wheelDay, setWheelDay] = useState(pad2(initialWheelDate.getDate()));
  const [wheelMonth, setWheelMonth] = useState(pad2(initialWheelDate.getMonth() + 1));
  const [wheelYear, setWheelYear] = useState(String(initialWheelDate.getFullYear()));
  const wheelYearItems = Array.from(
    { length: MAX_WHEEL_YEAR - MIN_WHEEL_YEAR + 1 },
    (_, index) => String(MIN_WHEEL_YEAR + index),
  );
  const wheelMonthNumber = Number(wheelMonth);
  const wheelYearNumber = Number(wheelYear);
  const wheelDaysInMonth = new Date(wheelYearNumber, wheelMonthNumber, 0).getDate();

  useEffect(() => {
    const nextDate = parseDateStr(value) ?? new Date();
    setWheelDay(pad2(nextDate.getDate()));
    setWheelMonth(pad2(nextDate.getMonth() + 1));
    setWheelYear(String(nextDate.getFullYear()));
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-full items-center justify-between gap-3 rounded-lg border border-neutral-300 bg-white px-4 text-left text-neutral-800 shadow-inner-sm transition-all hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
      >
        <div className="min-w-0 flex items-center gap-3">
          <Calendar className="h-4 w-4 flex-shrink-0 text-blue-500" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {label}
            </p>
            <p
              className={`truncate font-mono text-sm ${
                selectedDate ? "text-neutral-800" : "text-neutral-400"
              }`}
            >
              {selectedDate ? formatDisplayDate(selectedDate) : "Chọn ngày"}
            </p>
          </div>
        </div>
        <span className="text-neutral-400">▾</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-3 sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">
                  {label}
                </p>
                <h3 className="mt-1 text-lg font-bold text-neutral-900">
                  Chọn ngày
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            <div className="px-4 pb-4 pt-3">
              <div className="grid grid-cols-3 gap-2">
                <WheelColumn
                  label="Ngày"
                  items={Array.from({ length: wheelDaysInMonth }, (_, index) =>
                    pad2(index + 1),
                  )}
                  value={wheelDay}
                  onChange={(nextDay) => {
                    const nextDayNumber = Number(nextDay);
                    const safeDay = clamp(nextDayNumber, 1, wheelDaysInMonth);
                    const nextValue = toDateStr(
                      new Date(wheelYearNumber, wheelMonthNumber - 1, safeDay),
                    );

                    setWheelDay(pad2(safeDay));
                    onChange(nextValue);
                  }}
                />

                <WheelColumn
                  label="Tháng"
                  items={MONTH_LABELS}
                  value={wheelMonth}
                  onChange={(nextMonth) => {
                    const nextMonthNumber = Number(nextMonth);
                    const maxDay = new Date(wheelYearNumber, nextMonthNumber, 0).getDate();
                    const safeDay = clamp(Number(wheelDay), 1, maxDay);
                    const nextValue = toDateStr(
                      new Date(wheelYearNumber, nextMonthNumber - 1, safeDay),
                    );

                    setWheelMonth(nextMonth);
                    setWheelDay(pad2(safeDay));
                    onChange(nextValue);
                  }}
                />

                <WheelColumn
                  label="Năm"
                  items={wheelYearItems}
                  value={wheelYear}
                  onChange={(nextYear) => {
                    const nextYearNumber = Number(nextYear);
                    const maxDay = new Date(nextYearNumber, wheelMonthNumber, 0).getDate();
                    const safeDay = clamp(Number(wheelDay), 1, maxDay);
                    const nextValue = toDateStr(
                      new Date(nextYearNumber, wheelMonthNumber - 1, safeDay),
                    );

                    setWheelYear(nextYear);
                    setWheelDay(pad2(safeDay));
                    onChange(nextValue);
                  }}
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const todayValue = toDateStr(today);
                    setWheelDay(pad2(today.getDate()));
                    setWheelMonth(pad2(today.getMonth() + 1));
                    setWheelYear(String(today.getFullYear()));
                    onChange(todayValue);
                  }}
                  className="flex-1 rounded-full bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Xong
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ShelfLifeCalcProps {
  currentDateStr: string;
}

export default function ShelfLifeCalc({
  currentDateStr,
}: ShelfLifeCalcProps) {
  // NSX State
  const [nsxMode, setNsxMode] = useState<"specific" | "relative">("specific");
  const [nsxSpecific, setNsxSpecific] = useState<string>("2026-01-01");
  const [nsxRelativeVal, setNsxRelativeVal] = useState<number>(2);
  const [nsxRelativeUnit, setNsxRelativeUnit] = useState<TimeUnit>("months");

  // HSD State
  const [hsdMode, setHsdMode] = useState<"specific" | "relative">("specific");
  const [hsdSpecific, setHsdSpecific] = useState<string>("2026-12-31");
  const [hsdRelativeVal, setHsdRelativeVal] = useState<number>(12);
  const [hsdRelativeUnit, setHsdRelativeUnit] = useState<TimeUnit>("months");

  // Interactive state
  const [result, setResult] = useState<ShelfLifeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Formatted date string for system date display
  const formatVietnameseDateStr = (dateStr: string) => {
    const date = parseDateStr(dateStr);
    if (!date) return dateStr;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day} Tháng ${month}, ${year}`;
  };

  const addTime = (date: Date, value: number, unit: TimeUnit): Date => {
    const result = new Date(date);
    if (unit === "days") {
      result.setDate(result.getDate() + value);
    } else if (unit === "months") {
      result.setMonth(result.getMonth() + value);
    } else if (unit === "years") {
      result.setFullYear(result.getFullYear() + value);
    }
    return result;
  };

  const subtractTime = (date: Date, value: number, unit: TimeUnit): Date => {
    const result = new Date(date);
    if (unit === "days") {
      result.setDate(result.getDate() - value);
    } else if (unit === "months") {
      result.setMonth(result.getMonth() - value);
    } else if (unit === "years") {
      result.setFullYear(result.getFullYear() - value);
    }
    return result;
  };

  const getDaysDiff = (d1: Date, d2: Date): number => {
    // Reset hours to avoid daylight saving or partial day issues
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    const diffTime = date1.getTime() - date2.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculate = () => {
    try {
      setErrorMessage("");
      const currentDate = parseDateStr(currentDateStr);
      if (!currentDate) {
        setErrorMessage("Ngày hiện tại hệ thống không hợp lệ.");
        return;
      }

      let nsxDate = currentDate;
      let hsdDate = currentDate;

      if (nsxMode === "specific" && hsdMode === "specific") {
        const parsedNsx = parseDateStr(nsxSpecific);
        const parsedHsd = parseDateStr(hsdSpecific);
        if (!parsedNsx || !parsedHsd) {
          setErrorMessage(
            "Vui lòng kiểm tra lại tính chính xác của các ngày nhập liệu.",
          );
          return;
        }
        nsxDate = parsedNsx;
        hsdDate = parsedHsd;
      } else if (nsxMode === "specific" && hsdMode === "relative") {
        const parsedNsx = parseDateStr(nsxSpecific);
        if (!parsedNsx) {
          setErrorMessage(
            "Vui lòng kiểm tra lại tính chính xác của các ngày nhập liệu.",
          );
          return;
        }
        nsxDate = parsedNsx;
        hsdDate = addTime(nsxDate, hsdRelativeVal, hsdRelativeUnit);
      } else if (nsxMode === "relative" && hsdMode === "specific") {
        const parsedHsd = parseDateStr(hsdSpecific);
        if (!parsedHsd) {
          setErrorMessage(
            "Vui lòng kiểm tra lại tính chính xác của các ngày nhập liệu.",
          );
          return;
        }
        hsdDate = parsedHsd;
        nsxDate = subtractTime(hsdDate, nsxRelativeVal, nsxRelativeUnit);
      } else {
        // Both relative: resolve NSX relative to Today, then HSD from NSX
        nsxDate = subtractTime(currentDate, nsxRelativeVal, nsxRelativeUnit);
        hsdDate = addTime(nsxDate, hsdRelativeVal, hsdRelativeUnit);
      }

      const totalDays = getDaysDiff(hsdDate, nsxDate);
      if (totalDays <= 0) {
        setErrorMessage(
          "Ngày sản xuất phải ở trước Hạn sử dụng. Vui lòng điều chỉnh lại.",
        );
        return;
      }

      const elapsedDays = getDaysDiff(currentDate, nsxDate);
      const remainingDays = getDaysDiff(hsdDate, currentDate);

      let elapsedPercentage = 0;
      let remainingPercentage = 0;

      if (elapsedDays <= 0) {
        elapsedPercentage = 0;
        remainingPercentage = 100;
      } else if (remainingDays <= 0) {
        elapsedPercentage = 100;
        remainingPercentage = 0;
      } else {
        elapsedPercentage = Math.round((elapsedDays / totalDays) * 100);
        remainingPercentage = 100 - elapsedPercentage;
      }

      setResult({
        totalDays,
        elapsedDays: Math.max(0, elapsedDays),
        remainingDays: Math.max(0, remainingDays),
        elapsedPercentage,
        remainingPercentage,
        nsxDate,
        hsdDate,
        currentDate,
      });
    } catch (e) {
      setErrorMessage("Đã xảy ra lỗi trong quá trình tính toán.");
    }
  };

  // Run automatically when dependencies change or on load
  useEffect(() => {
    calculate();
  }, [
    currentDateStr,
    nsxMode,
    nsxSpecific,
    nsxRelativeVal,
    nsxRelativeUnit,
    hsdMode,
    hsdSpecific,
    hsdRelativeVal,
    hsdRelativeUnit,
  ]);

  const getShelfLifeStatus = (remainingPercentage: number) => {
    if (remainingPercentage <= 0) {
      return {
        title: "Đã hết hạn",
        tone: "text-red-700 bg-red-100",
      };
    }

    if (remainingPercentage >= IMPORTED_THRESHOLD) {
      return {
        title: "Đạt chuẩn hàng nhập khẩu",
        tone:
          "text-blue-700 bg-blue-100",
      };
    }

    if (remainingPercentage > DOMESTIC_THRESHOLD) {
      return {
        title: "Đạt chuẩn hàng nội địa",
        tone:
          "text-blue-700 bg-blue-100",
      };
    }

    return {
      title: "Chưa đạt chuẩn nhập kho",
      tone:
        "text-amber-700 bg-amber-100",
    };
  };

  return (
    <div id="shelf-life-calc" className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        {/* Left Form: Inputs - 7 columns on desktops */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-white p-4 sm:p-6 md:p-8 rounded-xl border border-neutral-200 shadow-sm relative overflow-hidden">
            {/* Form Title & Adjust System Date inline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-neutral-100 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-start gap-2 sm:items-center sm:gap-3 min-w-0">
                <div className="shrink-0 p-2 sm:p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
                    Máy tính Hạn sử dụng
                  </h2>
                  <p className="text-[11px] sm:text-xs text-neutral-500">
                    Nhập NSX & HSD để tính toán tỷ lệ vòng đời sản phẩm
                  </p>
                </div>
              </div>

              {/* System Date Widget */}
              <div className="w-full sm:w-auto sm:min-w-[200px] bg-neutral-50 p-3 rounded-xl border border-neutral-200/60 text-right">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" />
                  Ngày hiện tại (tự động)
                </p>
                <span className="block text-sm sm:text-base font-bold text-blue-600">
                    {formatVietnameseDateStr(currentDateStr)}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* NSX Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="min-w-0 text-xs sm:text-sm font-semibold text-neutral-700">
                    Ngày Sản Xuất (NSX)
                  </label>
                  <div className="inline-flex shrink-0 bg-neutral-100 rounded-lg p-1 text-[11px] sm:text-xs">
                    <button
                      type="button"
                      className={`px-2.5 py-1.5 sm:px-3 rounded-md font-medium transition-all cursor-pointer ${
                        nsxMode === "specific"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                      onClick={() => setNsxMode("specific")}
                    >
                      Ngày cụ thể
                    </button>
                    <button
                      type="button"
                      className={`px-2.5 py-1.5 sm:px-3 rounded-md font-medium transition-all cursor-pointer ${
                        nsxMode === "relative"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                      onClick={() => setNsxMode("relative")}
                    >
                      Tương đối
                    </button>
                  </div>
                </div>

                {nsxMode === "specific" ? (
                  <DatePickerField
                    label="Ngày sản xuất"
                    value={nsxSpecific}
                    onChange={setNsxSpecific}
                  />
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <input
                          type="number"
                          min="1"
                          placeholder="Nhập số..."
                          value={nsxRelativeVal || ""}
                          onChange={(e) =>
                            setNsxRelativeVal(parseInt(e.target.value) || 0)
                          }
                            className="w-full h-12 px-4 rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-neutral-800 bg-white text-sm"
                        />
                      </div>
                      <select
                        value={nsxRelativeUnit}
                        onChange={(e) =>
                          setNsxRelativeUnit(e.target.value as TimeUnit)
                        }
                        className="w-[120px] h-12 px-4 rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-neutral-800 bg-neutral-50 font-medium text-sm cursor-pointer"
                      >
                        <option value="days">Ngày</option>
                        <option value="months">Tháng</option>
                        <option value="years">Năm</option>
                      </select>
                    </div>
                    <p className="mt-1.5 text-neutral-500 text-xs text-right font-medium">
                      trước Hạn Sử Dụng (HSD)
                    </p>
                  </div>
                )}
              </div>

              {/* HSD Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="min-w-0 text-xs sm:text-sm font-semibold text-neutral-700">
                    Hạn Sử Dụng (HSD)
                  </label>
                  <div className="inline-flex shrink-0 bg-neutral-100 rounded-lg p-1 text-[11px] sm:text-xs">
                    <button
                      type="button"
                      className={`px-2.5 py-1.5 sm:px-3 rounded-md font-medium transition-all cursor-pointer ${
                        hsdMode === "specific"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                      onClick={() => setHsdMode("specific")}
                    >
                      Ngày cụ thể
                    </button>
                    <button
                      type="button"
                      className={`px-2.5 py-1.5 sm:px-3 rounded-md font-medium transition-all cursor-pointer ${
                        hsdMode === "relative"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-neutral-600 hover:text-neutral-900"
                      }`}
                      onClick={() => setHsdMode("relative")}
                    >
                      Tương đối
                    </button>
                  </div>
                </div>

                {hsdMode === "specific" ? (
                  <DatePickerField
                    label="Hạn sử dụng"
                    value={hsdSpecific}
                    onChange={setHsdSpecific}
                  />
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <input
                          type="number"
                          placeholder="Nhập số..."
                          min="1"
                          value={hsdRelativeVal || ""}
                          onChange={(e) =>
                            setHsdRelativeVal(parseInt(e.target.value) || 0)
                          }
                            className="w-full h-12 px-4 rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-neutral-800 bg-white text-sm"
                        />
                      </div>
                      <select
                        value={hsdRelativeUnit}
                        onChange={(e) =>
                          setHsdRelativeUnit(e.target.value as TimeUnit)
                        }
                        className="w-[120px] h-12 px-4 rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-neutral-800 bg-neutral-50 font-medium text-sm cursor-pointer"
                      >
                        <option value="days">Ngày</option>
                        <option value="months">Tháng</option>
                        <option value="years">Năm</option>
                      </select>
                    </div>
                    <p className="mt-1.5 text-neutral-500 text-xs text-right font-medium">
                      tính từ Ngày Sản Xuất (NSX)
                    </p>
                  </div>
                )}
              </div>

            </div>
          </section>
        </div>

        {/* Right Output: Detailed Visualizations - 5 columns */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {result ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Main Result Badge & Circular Gauge */}
              <section className="bg-white rounded-xl border border-neutral-200 shadow-sm relative flex items-center gap-4 p-3 sm:p-6 sm:flex-col sm:text-center">
                {/* Visual Circle Gauge (matching design specifications) */}
                <div className="relative w-28 h-28 sm:w-48 sm:h-48 flex-shrink-0 flex items-center justify-center">
                  {/* Inside Text Details */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">
                      Hạn dùng còn lại
                    </span>
                     <span className="text-2xl sm:text-4xl font-extrabold text-neutral-900 font-sans leading-none">
                      {result.remainingPercentage}%
                    </span>
                     <span className="text-[9px] sm:text-[11px] font-medium text-neutral-500 mt-1">
                      {result.remainingDays} ngày nữa
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1 sm:hidden">
                  <div className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest">
                    <span
                      className={`rounded-full px-2 py-1 ${getShelfLifeStatus(result.remainingPercentage).tone}`}
                    >
                      {getShelfLifeStatus(result.remainingPercentage).title}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-[11px]">
                     <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                       <span className="text-neutral-500">
                        Hàng nhập khẩu
                      </span>
                      <span
                        className={`font-semibold ${
                          result.remainingPercentage >= IMPORTED_THRESHOLD
                           ? "text-emerald-600"
                            : "text-amber-700"
                        }`}
                      >
                        {result.remainingPercentage >= IMPORTED_THRESHOLD
                          ? "Đạt chuẩn"
                          : `Tối thiểu ${IMPORTED_THRESHOLD}%`}
                      </span>
                    </div>
                     <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                       <span className="text-neutral-500">
                        Hàng nội địa
                      </span>
                      <span
                        className={`font-semibold ${
                          result.remainingPercentage > DOMESTIC_THRESHOLD
                           ? "text-emerald-600"
                            : "text-amber-700"
                        }`}
                      >
                        {result.remainingPercentage > DOMESTIC_THRESHOLD
                          ? "Đạt chuẩn"
                          : `Tối thiểu ${DOMESTIC_THRESHOLD}%`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block w-full mt-4">
                  <div className="grid grid-cols-1 gap-2 text-left">
                    <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
                      <span className="text-neutral-500">
                        Hàng nhập khẩu
                      </span>
                      <span
                        className={`font-semibold ${
                          result.remainingPercentage >= IMPORTED_THRESHOLD
                            ? "text-emerald-600"
                            : "text-amber-700"
                        }`}
                      >
                        {result.remainingPercentage >= IMPORTED_THRESHOLD
                          ? `Đạt chuẩn`
                          : `Tối thiểu ${IMPORTED_THRESHOLD}%`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-4 py-3">
                      <span className="text-neutral-500">
                        Hàng nội địa
                      </span>
                      <span
                        className={`font-semibold ${
                          result.remainingPercentage > DOMESTIC_THRESHOLD
                            ? "text-emerald-600"
                            : "text-amber-700"
                        }`}
                      >
                        {result.remainingPercentage > DOMESTIC_THRESHOLD
                          ? `Đạt chuẩn`
                          : `Tối thiểu ${DOMESTIC_THRESHOLD}%`}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 p-6 sm:p-12 text-center rounded-xl">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-neutral-500">
                Vui lòng nhập ngày hợp lệ để bắt đầu tính toán.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
