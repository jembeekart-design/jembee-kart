package `in`.jembeeplay.mobile

import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class CatalogVideo(
    val id: String,
    val title: String,
    val creator: String,
    val thumbnailUrl: String,
    val playbackUrl: String,
    val views: Int,
    val durationSeconds: Int?,
    val format: String
)

data class CatalogPage(
    val videos: List<CatalogVideo>,
    val nextCursor: String?,
    val hasMore: Boolean
)

object VideoCatalogClient {
    private const val BASE = "https://jembeeplay.in"
    private const val BASE_URL = "$BASE/api/app/video-catalog"
    private const val MAX_RESPONSE_CHARS = 512 * 1024
    private val mainHandler = Handler(Looper.getMainLooper())

    fun fetch(cursor: String? = null, onResult: (Result<CatalogPage>) -> Unit) {
        Thread {
            val result = runCatching {
                val query = if (cursor.isNullOrBlank()) "?limit=20" else "?limit=20&cursor=" + URLEncoder.encode(cursor, "UTF-8")
                val connection = (URL(BASE_URL + query).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 7000
                    readTimeout = 10000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.url.protocol == "https")
                    val status = connection.responseCode
                    require(status in 200..299) { "Video catalog unavailable ($status)" }
                    val body = connection.inputStream.bufferedReader().use { reader ->
                        val output = StringBuilder()
                        val buffer = CharArray(8192)
                        while (true) {
                            val count = reader.read(buffer)
                            if (count < 0) break
                            require(output.length + count <= MAX_RESPONSE_CHARS) { "Catalog response too large" }
                            output.append(buffer, 0, count)
                        }
                        output.toString()
                    }
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false)) { "Catalog response invalid" }
                    val items = root.optJSONArray("videos") ?: org.json.JSONArray()
                    val videos = (0 until items.length()).mapNotNull { index ->
                        val item = items.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(160)
                        val thumbnailPath = item.optString("thumbnailUrl")
                        val playbackPath = item.optString("playbackUrl")
                        if (id.isBlank() ||
                            !thumbnailPath.startsWith("/api/shorts/video-thumbnail/") ||
                            !playbackPath.startsWith("/api/shorts/video-stream/") ||
                            thumbnailPath.contains("..") || playbackPath.contains("..")) return@mapNotNull null
                        CatalogVideo(
                            id = id,
                            title = item.optString("caption", "Untitled video").take(500).ifBlank { "Untitled video" },
                            creator = item.optString("displayName").take(120).ifBlank {
                                item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" }
                            },
                            thumbnailUrl = BASE + thumbnailPath.take(2048),
                            playbackUrl = BASE + playbackPath.take(2048),
                            views = item.optInt("views", 0).coerceAtLeast(0),
                            durationSeconds = item.optInt("durationSeconds", 0).takeIf { it > 0 },
                            format = item.optString("videoFormat", "short").take(40)
                        )
                    }
                    val page = root.optJSONObject("page") ?: JSONObject()
                    CatalogPage(videos, page.optString("nextCursor").takeIf { it.isNotBlank() && it != "null" }, page.optBoolean("hasMore", false))
                } finally {
                    connection.disconnect()
                }
            }
            mainHandler.post { onResult(result) }
        }.start()
    }
}
