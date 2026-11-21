package `in`.jembeeplay.mobile

import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class LiveStreamItem(
    val id: String,
    val title: String,
    val streamer: String,
    val playbackUrl: String,
    val startTime: String
)

object LiveStreamClient {
    private const val ENDPOINT = "https://jembeeplay.in/api/app/live-streams"
    private val mainHandler = Handler(Looper.getMainLooper())

    fun fetch(onResult: (Result<List<LiveStreamItem>>) -> Unit) {
        Thread {
            val result = runCatching {
                val connection = (URL(ENDPOINT).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 7000
                    readTimeout = 10000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.url.protocol == "https")
                    val status = connection.responseCode
                    require(status in 200..299) { "Live catalogue unavailable ($status)" }
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 128 * 1024) { "Live catalogue response too large" }
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false))
                    val items = root.optJSONArray("streams") ?: org.json.JSONArray()
                    (0 until items.length()).mapNotNull { index ->
                        val item = items.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(160)
                        val url = item.optString("playbackUrl")
                        val parsed = runCatching { URL(url) }.getOrNull()
                        if (id.isBlank() || parsed?.protocol != "https" ||
                            !parsed.path.endsWith(".m3u8", true) && !parsed.path.endsWith(".mpd", true)
                        ) return@mapNotNull null
                        LiveStreamItem(
                            id,
                            item.optString("title").take(120),
                            item.optString("streamer").take(100),
                            url,
                            item.optString("startTime").take(40)
                        )
                    }
                } finally {
                    connection.disconnect()
                }
            }
            mainHandler.post { onResult(result) }
        }.start()
    }
}
