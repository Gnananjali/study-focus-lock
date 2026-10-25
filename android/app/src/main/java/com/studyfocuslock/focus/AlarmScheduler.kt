package com.studyfocuslock.focus

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

object AlarmScheduler {
    const val ACTION_SESSION = "com.studyfocuslock.SESSION_END"
    const val ACTION_TASK = "com.studyfocuslock.TASK"
    const val ACTION_JOURNAL = "com.studyfocuslock.JOURNAL"
    private const val CODE_SESSION = 1
    private const val CODE_JOURNAL = 3

    private fun pi(c: Context, action: String, code: Int, extras: Bundle? = null): PendingIntent {
        val i = Intent(c, AlarmReceiver::class.java).setAction(action)
        if (extras != null) i.putExtras(extras)
        return PendingIntent.getBroadcast(c, code, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    private fun setAt(c: Context, at: Long, p: PendingIntent) {
        val am = c.getSystemService(AlarmManager::class.java)
        try {
            if (Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms())
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p)
            else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p)
        } catch (e: SecurityException) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p)
        }
    }

    private fun cancel(c: Context, action: String, code: Int) =
        c.getSystemService(AlarmManager::class.java).cancel(pi(c, action, code))

    fun scheduleAll(c: Context) {
        scheduleSessionEnd(c); scheduleTasks(c); scheduleJournal(c)
    }

    // ---- study session end ----
    private fun nextSessionEnd(c: Context, now: Long): Long? {
        var best: Long? = null
        val manual = FocusStore.manualEnd(c)
        if (manual > now + 2000) best = manual
        try {
            val sch = FocusStore.loadPlan(c).optJSONArray("schedules") ?: return best
            for (i in 0 until sch.length()) {
                val s = sch.getJSONObject(i)
                if (!s.optBoolean("enabled", true)) continue
                val days = s.getJSONArray("days")
                val end = s.getInt("endMinute")
                for (off in 0..7) {
                    val cal = Calendar.getInstance().apply {
                        timeInMillis = now
                        add(Calendar.DAY_OF_YEAR, off)
                        set(Calendar.HOUR_OF_DAY, end / 60); set(Calendar.MINUTE, end % 60)
                        set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
                    }
                    val dow = cal.get(Calendar.DAY_OF_WEEK) - 1
                    var ok = false
                    for (d in 0 until days.length()) if (days.getInt(d) == dow) ok = true
                    if (ok && cal.timeInMillis > now + 2000) {
                        if (best == null || cal.timeInMillis < best!!) best = cal.timeInMillis
                        break
                    }
                }
            }
        } catch (e: Exception) { }
        return best
    }

    fun scheduleSessionEnd(c: Context) {
        cancel(c, ACTION_SESSION, CODE_SESSION)
        val end = nextSessionEnd(c, System.currentTimeMillis()) ?: return
        val b = Bundle().apply { putLong("endMs", end) }
        setAt(c, end, pi(c, ACTION_SESSION, CODE_SESSION, b))
    }

    // ---- tasks ----
    private fun taskExtras(id: String, title: String, kind: String) = Bundle().apply {
        putString("id", id); putString("title", title); putString("kind", kind)
    }

    fun scheduleTasks(c: Context) {
        (FocusStore.kvGet(c, "task_alarm_ids") ?: "").split(",").filter { it.isNotEmpty() }.forEach { id ->
            cancel(c, ACTION_TASK, id.hashCode()); cancel(c, ACTION_TASK, id.hashCode() + 1)
        }
        val ids = mutableListOf<String>()
        val now = System.currentTimeMillis()
        try {
            val arr = JSONArray(FocusStore.kvGet(c, "tasks") ?: "[]")
            for (i in 0 until arr.length()) {
                val t = arr.getJSONObject(i)
                if (t.optBoolean("done")) continue
                val id = t.getString("id")
                val title = t.optString("title")
                val st = t.optLong("startAt", 0L)
                val en = t.optLong("endAt", 0L)
                if (st > now) setAt(c, st, pi(c, ACTION_TASK, id.hashCode(), taskExtras(id, title, "start")))
                if (en > now) setAt(c, en, pi(c, ACTION_TASK, id.hashCode() + 1, taskExtras(id, title, "end")))
                ids.add(id)
            }
        } catch (e: Exception) { }
        FocusStore.kvSet(c, "task_alarm_ids", ids.joinToString(","))
    }

    // ---- daily journal reminder ----
    fun journalSettings(c: Context): Pair<Boolean, Int> = try {
        val o = JSONObject(FocusStore.kvGet(c, "journal_reminder") ?: "{}")
        Pair(o.optBoolean("enabled", true), o.optInt("minute", 1260))
    } catch (e: Exception) { Pair(true, 1260) }

    fun scheduleJournal(c: Context) {
        cancel(c, ACTION_JOURNAL, CODE_JOURNAL)
        val (enabled, minute) = journalSettings(c)
        if (!enabled) return
        val now = System.currentTimeMillis()
        val cal = Calendar.getInstance().apply {
            timeInMillis = now
            set(Calendar.HOUR_OF_DAY, minute / 60); set(Calendar.MINUTE, minute % 60)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
        }
        if (cal.timeInMillis <= now + 2000) cal.add(Calendar.DAY_OF_YEAR, 1)
        setAt(c, cal.timeInMillis, pi(c, ACTION_JOURNAL, CODE_JOURNAL))
    }
}
