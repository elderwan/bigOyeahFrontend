import { ArrowUpRight, CalendarCheck2, CircleDollarSign, Clock3, MapPin, MoreHorizontal, Star, UsersRound } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatCard } from "@/components/stat-card";
import { BookingStatusBadge } from "@/components/booking-status";
import { demoBookings, demoCoach, demoCourses, demoGyms } from "@/lib/mock-data";

const courseById = new Map(demoCourses.map((course) => [course.course_id, course]));
const gymById = new Map(demoGyms.map((gym) => [gym.gym_id, gym]));

export default function HomePage() {
  return (
    <DashboardShell>
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-moss">ภาพรวมระบบ</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink md:text-4xl">
              จัดการ FitBooking
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              ภาพรวมการจอง เทรนเนอร์ สมาชิก และการชำระเงินจากฐานข้อมูล FitBooking
            </p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-moss px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-moss/20 transition hover:bg-[#264b3e]">
            <CalendarCheck2 size={17} />
            สร้างการจองใหม่
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="การจองวันนี้" value="24" detail="+12% จากเมื่อวาน" icon={CalendarCheck2} accent="bg-[#e5f1e5] text-moss" />
          <StatCard label="สมาชิกที่ใช้งาน" value="1,284" detail="บัญชี ACTIVE" icon={UsersRound} accent="bg-[#fff3dc] text-[#b47a1f]" />
          <StatCard label="รายได้เดือนนี้" value="฿186.4K" detail="จาก orders ที่ชำระแล้ว" icon={ArrowUpRight} accent="bg-[#fce9e2] text-terracotta" />
          <StatCard label="คะแนนเฉลี่ย" value="4.8" detail="จาก review_coach" icon={Star} accent="bg-[#e8eafb] text-indigo-600" />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <section className="rounded-2xl border border-emerald-950/5 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">การจองล่าสุด</h2>
                <p className="mt-1 text-sm text-slate-500">ข้อมูลจากตาราง booking</p>
              </div>
              <button className="text-sm font-semibold text-moss hover:underline">ดูทั้งหมด</button>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-slate-100 text-xs text-slate-400">
                  <tr>
                    <th className="pb-3 font-medium">รหัส</th>
                    <th className="pb-3 font-medium">หลักสูตร</th>
                    <th className="pb-3 font-medium">วันและเวลา</th>
                    <th className="pb-3 font-medium">รูปแบบ</th>
                    <th className="pb-3 font-medium">สถานะ</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {demoBookings.map((booking) => {
                    const course = courseById.get(booking.course_id);
                    const gym = booking.gym_id ? gymById.get(booking.gym_id) : null;
                    return (
                      <tr key={booking.booking_id} className="group">
                        <td className="py-4 font-semibold text-moss">#{booking.booking_id}</td>
                        <td className="py-4">
                          <p className="font-semibold text-ink">{course?.course_name}</p>
                          <p className="mt-1 text-xs text-slate-400">Coach {demoCoach.coach_no}</p>
                        </td>
                        <td className="py-4">
                          <p className="font-medium text-slate-700">{booking.booking_date}</p>
                          <p className="mt-1 text-xs text-slate-400">{booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</p>
                        </td>
                        <td className="py-4 text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} />
                            {gym?.gym_name ?? booking.service_district}
                          </span>
                        </td>
                        <td className="py-4"><BookingStatusBadge status={booking.status} /></td>
                        <td className="py-4 text-right">
                          <button className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-slate-50 group-hover:opacity-100" aria-label="เพิ่มเติม">
                            <MoreHorizontal size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl bg-moss p-6 text-white shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-emerald-100/70">เทรนเนอร์เด่น</p>
                <h2 className="mt-2 text-xl font-bold">Kritsada S.</h2>
                <p className="mt-1 text-sm text-emerald-100/70">Coach No. {demoCoach.coach_no}</p>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {demoCoach.coach_level}
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs text-emerald-100/60">คะแนนเฉลี่ย</p>
                <p className="mt-2 text-2xl font-bold">4.9</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#f5d285]"><Star size={12} fill="currentColor" /> 128 รีวิว</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <p className="text-xs text-emerald-100/60">ชั่วโมงเดือนนี้</p>
                <p className="mt-2 text-2xl font-bold">76.5</p>
                <p className="mt-1 text-xs text-emerald-100/60">เป้าหมาย 80 ชั่วโมง</p>
              </div>
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-100/70">ความคืบหน้า KPI</span>
                <span className="font-semibold">95.6%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div className="h-2 w-[95%] rounded-full bg-[#e6b86a]" />
              </div>
            </div>
            <button className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-semibold hover:bg-white/15">
              ดูโปรไฟล์เทรนเนอร์
              <ArrowUpRight size={16} />
            </button>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-emerald-950/5 bg-white p-6 shadow-card lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">ตารางวันนี้</h2>
                <p className="mt-1 text-sm text-slate-500">ช่วงเวลาที่ถูกจองจาก dynamic schedule</p>
              </div>
              <button className="text-sm font-semibold text-moss hover:underline">เปิดปฏิทิน</button>
            </div>
            <div className="mt-5 space-y-3">
              {[
                ["09:00", "Strength Training", "Nimman Fitness Club", "ยืนยันแล้ว"],
                ["11:00", "Functional Movement", "บริการที่บ้าน · NIMMAN", "รอชำระเงิน"],
                ["14:30", "Strength Training", "Old City Training Lab", "ยืนยันแล้ว"]
              ].map(([time, course, place, status]) => (
                <div key={time} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="w-14 text-center">
                    <p className="font-bold text-moss">{time}</p>
                    <div className="mx-auto mt-2 h-1.5 w-1.5 rounded-full bg-gold" />
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{course}</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-400"><MapPin size={13} />{place}</p>
                  </div>
                  <BookingStatusBadge status={status === "ยืนยันแล้ว" ? "CONFIRMED" : "PENDING"} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-950/5 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">สรุปการเงิน</h2>
                <p className="mt-1 text-sm text-slate-500">ตาราง orders</p>
              </div>
              <CircleDollarSign className="text-gold" size={20} />
            </div>
            <div className="mt-6">
              <p className="text-sm text-slate-500">รายได้สุทธิเดือนนี้</p>
              <p className="mt-2 text-3xl font-bold text-ink">฿186,420</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                <ArrowUpRight size={14} />
                18.2% จากเดือนก่อน
              </div>
            </div>
            <div className="mt-7 space-y-4">
              {[
                ["ชำระแล้ว", "฿214,800", "bg-moss"],
                ["รอชำระเงิน", "฿18,200", "bg-gold"],
                ["คืนเงิน", "฿10,380", "bg-terracotta"]
              ].map(([label, amount, color]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-700">{amount}</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                    <div className={`h-1.5 rounded-full ${color}`} style={{ width: label === "ชำระแล้ว" ? "82%" : label === "รอชำระเงิน" ? "11%" : "7%" }} />
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-7 flex items-center gap-2 text-sm font-semibold text-moss hover:underline">
              <Clock3 size={16} />
              ดูรายการทั้งหมด
            </button>
          </section>
        </div>
      </section>
    </DashboardShell>
  );
}
