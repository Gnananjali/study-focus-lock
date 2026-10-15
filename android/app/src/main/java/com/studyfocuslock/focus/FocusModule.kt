package com.studyfocuslock.focus

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.bridge.*

class FocusModule(private val rc: ReactApplicationContext) : ReactContextBaseJavaModule(rc) {
    override fun getName() = "FocusModule"

    private fun launch(i: Intent) { i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); rc.startActivity(i) }
    private fun locked() = BlockPolicy.state(rc).active

    @ReactMethod fun savePlan(json: String, p: Promise) {
        if (locked()) { p.reject("LOCKED", "Plan is locked while a focus session is running."); return }
        FocusStore.savePlan(rc, json); p.resolve(null)
    }

    @ReactMethod fun loadPlan(p: Promise) = p.resolve(FocusStore.planString(rc))

    @ReactMethod fun startManualSession(minutes: Int, p: Promise) {
        if (locked()) { p.reject("LOCKED", "A session is already running."); return }
        FocusStore.setManualEnd(rc, System.currentTimeMillis() + minutes * 60_000L)
        EnforcementService.start(rc)
        p.resolve(null)
    }

    @ReactMethod fun getStatus(p: Promise) {
        val s = BlockPolicy.state(rc)
        p.resolve(Arguments.createMap().apply {
            putBoolean("active", s.active); putBoolean("onBreak", s.onBreak)
            putInt("remainingMin", s.remainingMin); putString("source", s.source)
        })
    }

    @ReactMethod fun getInstalledApps(p: Promise) {
        Thread {
            try {
                val pm = rc.packageManager
                val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
                val list = pm.queryIntentActivities(intent, 0)
                    .map { it.activityInfo.packageName to it.loadLabel(pm).toString() }
                    .filter { it.first != rc.packageName }
                    .distinctBy { it.first }
                    .sortedBy { it.second.lowercase() }
                val arr = Arguments.createArray()
                list.forEach { arr.pushMap(Arguments.createMap().apply { putString("package", it.first); putString("label", it.second) }) }
                p.resolve(arr)
            } catch (e: Exception) { p.reject("ERR", e) }
        }.start()
    }

    @ReactMethod fun isAccessibilityEnabled(p: Promise) {
        val enabled = Settings.Secure.getString(rc.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
        p.resolve(enabled.contains("${rc.packageName}/${FocusAccessibilityService::class.java.name}"))
    }
    @ReactMethod fun openAccessibilitySettings() = launch(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))

    private fun admin() = ComponentName(rc, AdminReceiver::class.java)
    @ReactMethod fun isAdminActive(p: Promise) =
        p.resolve((rc.getSystemService(DevicePolicyManager::class.java)).isAdminActive(admin()))
    @ReactMethod fun requestAdmin() = launch(
        Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN)
            .putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, admin())
            .putExtra(DevicePolicyManager.EXTRA_ADD_EXPLANATION, "Prevents uninstalling Study Focus Lock during a session.")
    )

    @ReactMethod fun isBatteryExempt(p: Promise) =
        p.resolve(rc.getSystemService(PowerManager::class.java).isIgnoringBatteryOptimizations(rc.packageName))
    @ReactMethod fun requestBatteryExemption() = launch(
        Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:${rc.packageName}"))
    )

    @ReactMethod fun startService() = EnforcementService.start(rc)
    @ReactMethod fun getStats(p: Promise) = p.resolve(FocusStore.statsJson(rc))
}
