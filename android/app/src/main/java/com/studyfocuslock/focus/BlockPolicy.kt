package com.studyfocuslock.focus

import android.content.Context
import java.util.Calendar

data class FocusState(val active: Boolean, val onBreak: Boolean, val remainingMin: Int, val source: String)

object BlockPolicy {
    private val IDLE = FocusState(false, false, 0, "none")

    // Screens that let someone undo the lock. Blocked only when strictMode is on and a session is active.
    private val STRICT_PKGS = setOf(
        "com.android.settings",
        "com.google.android.packageinstaller",
        "com.android.packageinstaller",
        "com.samsung.android.packageinstaller",
        "com.miui.packageinstaller"
    )

    fun state(c: Context, now: Calendar = Calendar.getInstance()): FocusState {
        val nowMs = now.timeInMillis
        val manualEnd = FocusStore.manualEnd(c)
        if (manualEnd > nowMs) {
            return FocusState(true, false, ((manualEnd - nowMs + 59_999) / 60_000).toInt(), "manual")
        }
        try {
            val schedules = FocusStore.loadPlan(c).optJSONArray("schedules") ?: return IDLE
            val dow = now.get(Calendar.DAY_OF_WEEK) - 1 // 0 = Sunday
            val minute = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
            for (i in 0 until schedules.length()) {
                val s = schedules.getJSONObject(i)
                if (!s.optBoolean("enabled", true)) continue
                val days = s.getJSONArray("days")
                var dayOk = false
                for (d in 0 until days.length()) if (days.getInt(d) == dow) dayOk = true
                if (!dayOk) continue
                val start = s.getInt("startMinute")
                val end = s.getInt("endMinute")
                if (minute < start || minute >= end) continue
                val off = minute - start
                var onBreak = false
                val br = s.optJSONArray("breaks")
                if (br != null) for (b in 0 until br.length()) {
                    val o = br.getJSONObject(b)
                    val bs = o.getInt("startOffsetMin")
                    if (off >= bs && off < bs + o.getInt("durationMin")) onBreak = true
                }
                return FocusState(true, onBreak, end - minute, "schedule")
            }
        } catch (e: Exception) { /* bad plan JSON -> no blocking */ }
        return IDLE
    }

    fun shouldBlock(c: Context, pkg: String): Boolean {
        if (pkg == c.packageName) return false
        val st = state(c)
        if (!st.active || st.onBreak) return false
        val plan = FocusStore.loadPlan(c)
        val blocked = plan.optJSONArray("blockedPackages")
        if (blocked != null) for (i in 0 until blocked.length()) if (blocked.optString(i) == pkg) return true
        return plan.optBoolean("strictMode", true) && pkg in STRICT_PKGS
    }
}
