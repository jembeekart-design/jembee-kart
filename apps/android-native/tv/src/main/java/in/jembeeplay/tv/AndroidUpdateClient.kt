package `in`.jembeeplay.tv

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast

object AndroidUpdateClient {
    fun isNewerVersion(remote: String, local: String): Boolean {
        val remoteParts = remote.split(".").map { it.toIntOrNull() ?: 0 }
        val localParts = local.split(".").map { it.toIntOrNull() ?: 0 }
        for (index in 0 until maxOf(remoteParts.size, localParts.size)) {
            val comparison = remoteParts.getOrElse(index) { 0 }.compareTo(localParts.getOrElse(index) { 0 })
            if (comparison != 0) return comparison > 0
        }
        return false
    }

    fun downloadAndInstall(context: Context, updateUrl: String) {
        val uri = runCatching { Uri.parse(updateUrl) }.getOrNull()
        if (uri == null || uri.scheme != "https" || uri.host.isNullOrBlank()) {
            Toast.makeText(context, "Update link valid nahi hai.", Toast.LENGTH_LONG).show()
            return
        }
        val intent = Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        runCatching { context.startActivity(intent) }
            .onFailure { Toast.makeText(context, "Update page open nahi hui.", Toast.LENGTH_LONG).show() }
    }
}
