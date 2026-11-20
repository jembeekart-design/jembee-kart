package `in`.jembeeplay.mobile

import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class NativeVideoAdConfig(
    val longVideoPreRollUrl: String? = null
)

object VideoAdsConfigClient {
    private const val ENDPOINT = "https://jembeeplay.in/api/videos/video-ads"
    private const val LONG_VIDEO_VAST = "https://s.magsrv.com/v1/vast.php?idzone=6090508"
    private val mainHandler = Handler(Looper.getMainLooper())

    fun fetch(onResult: (NativeVideoAdConfig) -> Unit) {
        Thread {
            val config = runCatching {
                val connection = (URL(ENDPOINT).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 5000
                    readTimeout = 7000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.responseCode in 200..299)
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 64 * 1024)
                    val root = JSONObject(body)
                    val longAds = root.optJSONObject("longVideoAds") ?: JSONObject()
                    val free = longAds.optJSONObject("free") ?: JSONObject()
                    val enabled = root.optBoolean("masterEnabled") &&
                        root.optBoolean("providerReady") &&
                        longAds.optBoolean("enabled") &&
                        free.optBoolean("enabled") &&
                        free.optBoolean("preRollEnabled")
                    NativeVideoAdConfig(if (enabled) LONG_VIDEO_VAST else null)
                } finally {
                    connection.disconnect()
                }
            }.getOrDefault(NativeVideoAdConfig())
            mainHandler.post { onResult(config) }
        }.start()
    }
}
