"use client";

import React from "react";
import { Users, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { ReferredFriend } from "@/interfaces/referral.interface";
import { formatCurrency } from "@/utils/formatCurrency";

interface ReferralHistoryTableProps {
  friends: ReferredFriend[];
  currency?: string;
}

export const ReferralHistoryTable: React.FC<ReferralHistoryTableProps> = ({
  friends,
  currency = "LKR",
}) => {
  if (!friends || friends.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto font-bold">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-extrabold text-slate-900">
          No Friends Invited Yet
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Share your referral code or invite link above. When your friends register and complete their purchases, their activity and your commission will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-[#D81B60] flex items-center justify-center font-bold">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Referred Friends & Activity
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Real-time progress and earnings from your referrals
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              <th className="p-3.5 pl-4">Friend</th>
              <th className="p-3.5">Contact</th>
              <th className="p-3.5">Joined Date</th>
              <th className="p-3.5">Orders</th>
              <th className="p-3.5 pr-4 text-right">Commission Earned</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            {friends.map((friend, index) => {
              const displayName =
                friend.fullName ||
                friend.name ||
                (friend.friendUserId
                  ? `Friend (#${friend.friendUserId.substring(0, 6)})`
                  : `Friend #${index + 1}`);

              const contact = friend.phone || "—";
              const rawDate = friend.joinedAt || friend.createdAt;
              const formattedDate = rawDate
                ? new Date(rawDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—";

              const orderCount = friend.totalOrders ?? friend.orderCount ?? "—";
              const earnedAmount =
                friend.commissionEarned ?? friend.commission ?? friend.amount ?? 0;

              return (
                <tr key={friend.friendUserId || friend.userId || friend.id || index} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 pl-4 font-bold text-slate-900">
                    {displayName}
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono">
                    {contact}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {formattedDate}
                  </td>
                  <td className="p-3.5 text-slate-700">
                    {orderCount}
                  </td>
                  <td className="p-3.5 pr-4 text-right font-extrabold text-slate-900">
                    {earnedAmount > 0 ? (
                      <span className="text-emerald-600">
                        +{formatCurrency(earnedAmount, currency)}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        {formatCurrency(0, currency)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
