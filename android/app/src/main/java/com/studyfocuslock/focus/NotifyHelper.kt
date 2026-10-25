package com.studyfocuslock.focus

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.os.Build

object NotifyHelper {
    private const val CH = "focus_alerts"

    fun show(c: Context, id: Int, title: String, text: String) {
        val nm = c.getSystemService(NotificationManager::class.java)
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null)
            nm.createNotificationChannel(NotificationChannel(CH, "Study alerts", NotificationManager.IMPORTANCE_HIGH))
        val launch = c.packageManager.getLaunchIntentForPackage(c.packageName)
        val pi = if (launch != null)
            PendingIntent.getActivity(c, 0, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT) else null
        val b = if (Build.VERSION.SDK_INT >= 26) Notification.Builder(c, CH) else Notification.Builder(c)
        b.setContentTitle(title).setContentText(text)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setAutoCancel(true)
        if (pi != null) b.setContentIntent(pi)
        nm.notify(id, b.build())
    }
}
