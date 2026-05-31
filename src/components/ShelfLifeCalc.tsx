import React, { useState, useEffect } from "react";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import { TimeUnit, ShelfLifeResult } from "../types";

const IMPORTED_THRESHOLD = 70;
const DOMESTIC_THRESHOLD = 50;

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
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
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
      const currentDate = new Date(currentDateStr);
      if (isNaN(currentDate.getTime())) {
        setErrorMessage("Ngày hiện tại hệ thống không hợp lệ.");
        return;
      }

      let nsxDate = new Date();
      let hsdDate = new Date();

      if (nsxMode === "specific" && hsdMode === "specific") {
        nsxDate = new Date(nsxSpecific);
        hsdDate = new Date(hsdSpecific);
      } else if (nsxMode === "specific" && hsdMode === "relative") {
        nsxDate = new Date(nsxSpecific);
        hsdDate = addTime(nsxDate, hsdRelativeVal, hsdRelativeUnit);
      } else if (nsxMode === "relative" && hsdMode === "specific") {
        hsdDate = new Date(hsdSpecific);
        nsxDate = subtractTime(hsdDate, nsxRelativeVal, nsxRelativeUnit);
      } else {
        // Both relative: resolve NSX relative to Today, then HSD from NSX
        nsxDate = subtractTime(currentDate, nsxRelativeVal, nsxRelativeUnit);
        hsdDate = addTime(nsxDate, hsdRelativeVal, hsdRelativeUnit);
      }

      if (isNaN(nsxDate.getTime()) || isNaN(hsdDate.getTime())) {
        setErrorMessage(
          "Vui lòng kiểm tra lại tính chính xác của các ngày nhập liệu.",
        );
        return;
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
                  <div className="relative">
                    <input
                      type="date"
                      value={nsxSpecific}
                      onChange={(e) => setNsxSpecific(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-neutral-800 bg-white font-mono shadow-inner-sm text-sm"
                    />
                  </div>
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
                  <div className="relative">
                    <input
                      type="date"
                      value={hsdSpecific}
                      onChange={(e) => setHsdSpecific(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-neutral-800 bg-white font-mono shadow-inner-sm text-sm"
                    />
                  </div>
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
