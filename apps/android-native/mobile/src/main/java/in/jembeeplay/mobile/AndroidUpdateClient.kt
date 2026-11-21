package `in`.jembeeplay.mobile

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.Settings
import android.widget.Toast
import java.net.URL

object AndroidUpdateClient {
    fun isNewerVersion(remote: String, local: String): Boolean {
        val remoteParts = remote.split(".").map { it.toIntOrNull() ?: 0 }
        val localParts = local.split(".").map { it.toIntOrNull() ?: 0 }
        for (index in 0 until maxOf(remoteParts.size, localParts.size)) {
            val comparison = (remoteParts.getOrElse(index) { 0 }).compareTo(localParts.getOrElse(index) { 0 })
            if (comparison != 0) return comparison > 0
        }
        return false
    }

    fun downloadAndInstall(context: Context, apkUrl: String) {
        val uri = runCatching { Uri.parse(apkUrl) }.getOrNull()
        if (uri == null || uri.scheme != "https" || uri.host.isNullOrBlank()) {
            Toast.makeText(context, "Update link valid nahi hai.", Toast.LENGTH_LONG).show()
            return
        }

        if (android.os.Build.VERSION.SDK_INT >= 26 && !context.packageManager.canRequestPackageInstalls()) {
            val settings = Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:${context.packageName}")
            ).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            runCatching { context.startActivity(settings) }
                .onFailure { Toast.makeText(context, "Install permission settings open nahi hui.", Toast.LENGTH_LONG).show() }
            Toast.makeText(context, "JEMBEE PLAY ke liye Allow from this source enable karein, phir app kholkar Update dabayein.", Toast.LENGTH_LONG).show()
            return
        }

        val manager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
        val request = DownloadManager.Request(uri)
            .setTitle("JEMBEE PLAY update")
            .setDescription("Latest version download ho raha hai")
            .setMimeType("application/vnd.android.package-archive")
            .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
            .setAllowedOverMetered(true)
            .setAllowedOverRoaming(false)
            .setDestinationInExternalFilesDir(context, Environment.DIRECTORY_DOWNLOADS, "jembee-play-update.apk")
        val downloadId = runCatching { manager.enqueue(request) }.getOrElse {
            Toast.makeText(context, "Update download start nahi hua.", Toast.LENGTH_LONG).show()
            return
        }

        Thread {
            val deadline = System.currentTimeMillis() + 10 * 60 * 1000
            var finished = false
            while (System.currentTimeMillis() < deadline && !finished) {
                val query = DownloadManager.Query().setFilterById(downloadId)
                manager.query(query).use { cursor ->
                    if (cursor != null && cursor.moveToFirst()) {
                        when (cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))) {
                            DownloadManager.STATUS_SUCCESSFUL -> {
                                val apkUri = manager.getUriForDownloadedFile(downloadId)
                                if (apkUri != null) {
                                    val install = Intent(Intent.ACTION_VIEW).apply {
                                        setDataAndType(apkUri, "application/vnd.android.package-archive")
                                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION)
                                    }
                                    runCatching { context.startActivity(install) }
                                        .onFailure { Toast.makeText(context, "APK installer open nahi hua.", Toast.LENGTH_LONG).show() }
                                } else {
                                    Toast.makeText(context, "Downloaded APK nahi mila.", Toast.LENGTH_LONG).show()
                                }
                                finished = true
                            }
                            DownloadManager.STATUS_FAILED -> {
                                val reason = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_REASON))
                                Toast.makeText(context, "Update download fail hua (code $reason).", Toast.LENGTH_LONG).show()
                                finished = true
                            }
                        }
                    } else {
                        finished = true
                    }
                }
                if (!finished) Thread.sleep(1000)
            }
            if (!finished) {
                manager.remove(downloadId)
                Toast.makeText(context, "Update download timeout ho gaya. Dobara try karein.", Toast.LENGTH_LONG).show()
            }
        }.start()
        Toast.makeText(context, "Update download shuru ho gaya.", Toast.LENGTH_SHORT).show()
    }
}
