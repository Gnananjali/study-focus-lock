package com.studyfocuslock.focus

import android.content.Context
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

object FocusStore {
    private fun prefs(c: Context) = c.getSharedPreferences("focus", Context.MODE_PRIVATE)

    fun savePlan(c: Context, json: String) = prefs(c).edit().putString("plan", json).apply()
    fun planString(c: Context): String = prefs(c).getString("plan", null) ?: "{}"
    fun loadPlan(c: Context): JSONObject = try { JSONObject(planString(c)) } catch (e: Exception) { JSONObject() }

    fun setManualEnd(c: Context, endMs: Long) = prefs(c).edit().putLong("manualEnd", endMs).apply()
    fun manualEnd(c: Context): Long = prefs(c).getLong("manualEnd", 0L)

    private fun dayKey(cal: Calendar = Calendar.getInstance()): String =
        SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.time)

    fun addSeconds(c: Context, sec: Long) {
        val k = "stat_" + dayKey()
        prefs(c).edit().putLong(k, prefs(c).getLong(k, 0L) + sec).apply()
    }

    fun statsJson(c: Context): String {
        val o = JSONObject()
        val cal = Calendar.getInstance()
        for (i in 0 until 7) {
            val k = dayKey(cal)
            o.put(k, prefs(c).getLong("stat_$k", 0L))
            cal.add(Calendar.DAY_OF_YEAR, -1)
        }
        return o.toString()
    }

    fun kvGet(c: Context, k: String): String? = prefs(c).getString("kv_$k", null)
    fun kvSet(c: Context, k: String, v: String) = prefs(c).edit().putString("kv_$k", v).apply()
    fun lastNotifiedEnd(c: Context): Long = prefs(c).getLong("lastEnd", 0L)
    fun setLastNotifiedEnd(c: Context, v: Long) = prefs(c).edit().putLong("lastEnd", v).apply()
}
