package `in`.jembeeplay.mobile

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

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
    private const val BASE_URL = "https://jembeeplay.in/api/app/video-catalog"

    fun fetch(cursor: String? = null, onResult: (Result<CatalogPage>) -> Unit) {
        Thread {
            val result = runCatching {
                val query = if (cursor.isNullOrBlank()) "?limit=20" else "?limit=20&cursor=" + java.net.URLEncoder.encode(cursor, "UTF-8")
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
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 512 * 1024) { "Catalog response too large" }
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false))
                    val items = root.optJSONArray("videos") ?: org.json.JSONArray()
                    val videos = (0 until items.length()).mapNotNull { index ->
                        val item = items.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(160)
                        if (id.isBlank()) return@mapNotNull null
                        CatalogVideo(
                            id = id,
                            title = item.optString("caption", "Untitled video").take(500).ifBlank { "Untitled video" },
                            creator = item.optString("displayName").take(120).ifBlank { item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" } },
                            thumbnailUrl = "https://jembeeplay.in" + item.optString("thumbnailUrl"),
                            playbackUrl = "https://jembeeplay.in" + item.optString("playbackUrl"),
                            views = item.optInt("views", 0).coerceAtLeast(0),
                            durationSeconds = item.optInt("durationSeconds", 0).takeIf { it > 0 },
                            format = item.optString("videoFormat", "short")
                        )
                    }
                    val page = root.optJSONObject("page") ?: JSONObject()
                    CatalogPage(videos, page.optString("nextCursor").takeIf { it.isNotBlank() && it != "null" }, page.optBoolean("hasMore", false))
                } finally {
                    connection.disconnect()
                }
            }
            onResult(result)
        }.start()
    }
}
