import {
  BadgeInfo,
  MessageSquareText,
  PhoneCall,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const APP_NAME = "I.C.A.T - Inventory Counting Assistance Tool";
const SUPPORT_ZALO = "033.887.8397";

const features = [
  "Tính hạn sử dụng tự động theo ngày hiện tại của máy.",
  "Máy tính cơ bản cho các phép tính số học nhanh.",
];

export default function Support() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
        <div className="relative p-5 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5 items-end">
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-900">
                {APP_NAME}
              </h1>
              <p className="max-w-3xl text-sm sm:text-base leading-7 text-neutral-600">
                Ứng dụng giúp tính hạn sử dụng và phép tính nhanh.
              </p>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/85 p-4 sm:p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BadgeInfo className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                    Trạng thái
                  </p>
                  <p className="text-sm font-semibold text-neutral-900">
                    Đang phát triển
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                sẽ cập nhật thêm tính năng mới sau
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900">Tính năng hiện có</h2>
              <p className="text-sm text-neutral-500">
                Các chức năng chính đang dùng trong ứng dụng.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {features.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
              >
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                  <p className="text-sm leading-6 text-neutral-700">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-neutral-900">Liên hệ hỗ trợ</h2>
              <p className="text-sm text-neutral-500">
                Dùng khi cần hỗ trợ hoặc báo lỗi.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
              <PhoneCall className="h-4 w-4 flex-shrink-0" />
              Zalo: {SUPPORT_ZALO}
            </div>
            <p className="mt-2 text-sm leading-6 text-blue-900/80">
              Gửi ảnh chụp màn hình hoặc mô tả ngắn để được hỗ trợ nhanh hơn.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
