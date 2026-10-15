package com.studyfocuslock.focus

import android.app.*
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.content.ContextCompat

class EnforcementService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private val tick = object : Runnable {
        override fun run() {
            val st = BlockPolicy.state(this@EnforcementService)
            if (st.active && !st.onBreak) FocusStore.addSeconds(this@EnforcementService, 30)
            getSystemService(NotificationManager::class.java).notify(ID, build(st))
            handler.postDelayed(this, 30_000)
        }
    }

    override fun onCreate() {
        super.onCreate()
        val nm = getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= 26)
            nm.createNotificationChannel(NotificationChannel(CH, "Focus status", NotificationManager.IMPORTANCE_LOW))
        val n = build(BlockPolicy.state(this))
        if (Build.VERSION.SDK_INT >= 34) startForeground(ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        else startForeground(ID, n)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        handler.removeCallbacks(tick)
        handler.postDelayed(tick, 30_000)
        return START_STICKY
    }

    private fun build(st: FocusState): Notification {
        val text = when {
            !st.active -> "Watching your study schedule"
            st.onBreak -> "On break - apps unlocked"
            else -> "Focus session: ${st.remainingMin} min left"
        }
        val b = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(this, CH) else Notification.Builder(this)
        return b.setContentTitle("Study Focus Lock").setContentText(text)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock).setOngoing(true).build()
    }

    override fun onDestroy() { handler.removeCallbacks(tick); super.onDestroy() }
    override fun onBind(i: Intent?): IBinder? = null

    companion object {
        private const val ID = 1001
        private const val CH = "focus_status"
        fun start(c: Context) = ContextCompat.startForegroundService(c, Intent(c, EnforcementService::class.java))
    }
}
