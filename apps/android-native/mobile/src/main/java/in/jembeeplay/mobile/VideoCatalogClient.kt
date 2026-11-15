package `in`.jembeeplay.mobile

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class CatalogVideo(
    val id: String, val title: String, val creator: String, val thumbnailUrl: String,
    val playbackUrl: String, val views: Int, val durationSeconds: Int?, val format: String
)
data class CatalogPage(val videos: List<CatalogVideo>, val nextCursor: String?, val hasMore: Boolean)

object VideoCatalogClient {
    private const val BASE_URL = "https://jembeeplay.in/api/app/video-catalog"
    private const val ORIGIN = "https://jembeeplay.in"
    private const val THUMBNAIL_PREFIX = "/api/shorts/video-thumbnail/"
    private const val PLAYBACK_PREFIX = "/api/shorts/video-stream/"

    private fun trustedMediaUrl(path: String, expectedPrefix: String): String? {
        if (!path.startsWith(expectedPrefix) || path.length <= expectedPrefix.length) return null
        if (path.startsWith("//") || path.contains('\\') || path.contains('?') || path.contains('#')) return null
        if (path.any { it.isWhitespace() || it.code < 0x20 }) return null
        return ORIGIN + path
    }

    fun fetch(cursor: String? = null, onResult: (Result<CatalogPage>) -> Unit) {
        Thread {
            val result = runCatching {
                val query = if (cursor.isNullOrBlank()) "?limit=20" else "?limit=20&cursor=" + java.net.URLEncoder.encode(cursor, "UTF-8")
                val connection = (URL(BASE_URL + query).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"; connectTimeout = 7000; readTimeout = 10000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.url.protocol == "https")
                    val status = connection.responseCode
                    require(status in 200..299) { "Video catalog unavailable ($status)" }
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 512 * 1024) { "Catalog response too large" }
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false))
                    val items = root.optJSONArray("videos") ?: org.json.JSONArray()
                    val videos = (0 until items.length()).mapNotNull { index ->
                        val item = items.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(160)
                        val thumbnailUrl = trustedMediaUrl(item.optString("thumbnailUrl"), THUMBNAIL_PREFIX) ?: return@mapNotNull null
                        val playbackUrl = trustedMediaUrl(item.optString("playbackUrl"), PLAYBACK_PREFIX) ?: return@mapNotNull null
                        if (id.isBlank()) return@mapNotNull null
                        CatalogVideo(
                            id, item.optString("caption", "Untitled video").take(500).ifBlank { "Untitled video" },
                            item.optString("displayName").take(120).ifBlank { item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" } },
                            thumbnailUrl, playbackUrl, item.optInt("views", 0).coerceAtLeast(0),
                            item.optInt("durationSeconds", 0).takeIf { it > 0 }, item.optString("videoFormat", "short")
                        )
                    }
                    val page = root.optJSONObject("page") ?: JSONObject()
                    CatalogPage(videos, page.optString("nextCursor").takeIf { it.isNotBlank() && it != "null" }, page.optBoolean("hasMore", false))
                } finally { connection.disconnect() }
            }
            onResult(result)
        }.start()
    }
}
