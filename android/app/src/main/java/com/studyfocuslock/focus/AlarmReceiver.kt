package com.studyfocuslock.focus

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(c: Context, i: Intent) {
        when (i.action) {
            AlarmScheduler.ACTION_SESSION -> {
                val end = i.getLongExtra("endMs", 0L)
                if (end != FocusStore.lastNotifiedEnd(c)) {
                    FocusStore.setLastNotifiedEnd(c, end)
                    NotifyHelper.show(c, 2001, "Study session complete", "Great work! Your apps are unlocked.")
                }
                AlarmScheduler.scheduleSessionEnd(c)
            }
            AlarmScheduler.ACTION_TASK -> {
                val id = i.getStringExtra("id") ?: return
                if (!taskPending(c, id)) return
                val title = i.getStringExtra("title") ?: "Task"
                if (i.getStringExtra("kind") == "start")
                    NotifyHelper.show(c, 3000 + (id.hashCode() and 0xFFFF), "Time to start", title)
                else
                    NotifyHelper.show(c, 4000 + (id.hashCode() and 0xFFFF), "Task time is over", "$title - mark it done or reschedule it.")
            }
            AlarmScheduler.ACTION_JOURNAL -> {
                if (!journalWrittenToday(c))
                    NotifyHelper.show(c, 5001, "Journal time", "Write down what you did today.")
                AlarmScheduler.scheduleJournal(c)
            }
        }
    }

    private fun taskPending(c: Context, id: String): Boolean = try {
        val arr = JSONArray(FocusStore.kvGet(c, "tasks") ?: "[]")
        var pending = false
        for (n in 0 until arr.length()) {
            val t = arr.getJSONObject(n)
            if (t.optString("id") == id && !t.optBoolean("done")) pending = true
        }
        pending
    } catch (e: Exception) { false }

    private fun journalWrittenToday(c: Context): Boolean = try {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date())
        JSONObject(FocusStore.kvGet(c, "journal") ?: "{}").optJSONObject(today)?.optString("text", "")?.isNotBlank() == true
    } catch (e: Exception) { false }
}
