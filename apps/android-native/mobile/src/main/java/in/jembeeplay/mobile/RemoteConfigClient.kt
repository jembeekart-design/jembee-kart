package in.jembeeplay.mobile

import android.content.Context
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class JembeeRemoteConfig(
    val configVersion: Int = 1,
    val maintenanceEnabled: Boolean = false,
    val maintenanceMessage: String = "",
    val shortsEnabled: Boolean = true,
    val learningEnabled: Boolean = true,
    val uploadsEnabled: Boolean = false,
    val paidVideoEnabled: Boolean = false,
    val adsEnabled: Boolean = false,
    val notificationsEnabled: Boolean = false
)

object RemoteConfigClient {
    private const val ENDPOINT = "https://jembeeplay.in/api/app/remote-config"
    private const val PREFS = "jembee_remote_config"
    private const val CACHE_KEY = "last_known_good_v1"

    fun fetch(context: Context, onResult: (JembeeRemoteConfig) -> Unit) {
        Thread {
            val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val cached = runCatching { prefs.getString(CACHE_KEY, null)?.let(::parse) }.getOrNull()
            val fresh = runCatching {
                val connection = (URL(ENDPOINT).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 5000
                    readTimeout = 5000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.url.protocol == "https")
                    require(connection.responseCode in 200..299)
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 64 * 1024)
                    val parsed = parse(body)
                    prefs.edit().putString(CACHE_KEY, body).apply()
                    parsed
                } finally {
                    connection.disconnect()
                }
            }.getOrNull()
            val selected = fresh ?: cached ?: JembeeRemoteConfig()
            android.os.Handler(context.mainLooper).post { onResult(selected) }
        }.start()
    }

    private fun parse(raw: String): JembeeRemoteConfig {
        val root = JSONObject(raw)
        require(root.optBoolean("success", false))
        val config = root.getJSONObject("config")
        require(config.optInt("schemaVersion", -1) == 1)
        val maintenance = config.optJSONObject("maintenance") ?: JSONObject()
        val features = config.optJSONObject("features") ?: JSONObject()
        val message = maintenance.optString("message", "").take(240)
        return JembeeRemoteConfig(
            configVersion = config.optInt("configVersion", 1).coerceAtLeast(1),
            maintenanceEnabled = maintenance.optBoolean("enabled", false),
            maintenanceMessage = message,
            shortsEnabled = features.optBoolean("shorts", true),
            learningEnabled = features.optBoolean("schoolLearning", true),
            uploadsEnabled = features.optBoolean("creatorUploads", false),
            paidVideoEnabled = features.optBoolean("paidVideo", false),
            adsEnabled = features.optBoolean("videoAds", false),
            notificationsEnabled = features.optBoolean("notifications", false)
        )
    }
}
