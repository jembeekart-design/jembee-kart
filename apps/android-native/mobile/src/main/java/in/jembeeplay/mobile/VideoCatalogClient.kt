package `in`.jembeeplay.mobile

import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class JembeeVideo(
    val id: String,
    val creatorId: String,
    val format: String,
    val caption: String,
    val creatorName: String,
    val username: String,
    val photoUrl: String,
    val thumbnailUrl: String,
    val streamUrl: String,
    val likes: Int,
    val views: Int
)

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

data class CatalogPage(val videos: List<CatalogVideo>, val nextCursor: String?, val hasMore: Boolean)

object VideoCatalogClient {
    private const val BASE = "https://jembeeplay.in"
    private const val ENDPOINT = "$BASE/api/app/video-catalog"
    private val mainHandler = Handler(Looper.getMainLooper())

    /** Paged API used by the native catalogue and Shorts feed components. */
    fun fetch(cursor: String? = null, onResult: (Result<CatalogPage>) -> Unit) {
        Thread {
            val result = runCatching {
                val query = if (cursor.isNullOrBlank()) "?limit=20" else "?limit=20&cursor=" + java.net.URLEncoder.encode(cursor, "UTF-8")
                val connection = (URL(ENDPOINT + query).openConnection() as HttpURLConnection).apply {
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
                        val thumbnail = item.optString("thumbnailUrl")
                        val playback = item.optString("playbackUrl")
                        if (id.isBlank() || !thumbnail.startsWith("/api/shorts/video-thumbnail/") ||
                            !playback.startsWith("/api/shorts/video-stream/")) return@mapNotNull null
                        CatalogVideo(
                            id = id,
                            title = item.optString("caption", "Untitled video").take(500).ifBlank { "Untitled video" },
                            creator = item.optString("displayName").take(120).ifBlank {
                                item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" }
                            },
                            thumbnailUrl = BASE + thumbnail,
                            playbackUrl = BASE + playback,
                            views = item.optInt("views", 0).coerceAtLeast(0),
                            durationSeconds = item.optInt("durationSeconds", 0).takeIf { it > 0 },
                            format = item.optString("videoFormat", "short").take(10)
                        )
                    }
                    val page = root.optJSONObject("page") ?: JSONObject()
                    CatalogPage(
                        videos,
                        page.optString("nextCursor").takeIf { it.isNotBlank() && it != "null" },
                        page.optBoolean("hasMore", false)
                    )
                } finally {
                    connection.disconnect()
                }
            }
            mainHandler.post { onResult(result) }
        }.start()
    }

    /** Format-filtered API used by the redesigned Mobile Home, Shorts and Watch screens. */
    fun fetch(format: String, onResult: (List<JembeeVideo>, String?) -> Unit) {
        Thread {
            val result = runCatching {
                require(format == "short" || format == "long")
                val connection = (URL("$ENDPOINT?limit=40").openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 10000
                    readTimeout = 15000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.responseCode in 200..299) { "Catalogue HTTP ${connection.responseCode}" }
                    val raw = connection.inputStream.bufferedReader().use { it.readText() }
                    require(raw.length <= 2 * 1024 * 1024) { "Catalogue response too large" }
                    val root = JSONObject(raw)
                    require(root.optBoolean("success", false)) { root.optString("error", "Catalogue unavailable") }
                    val items = root.optJSONArray("videos") ?: org.json.JSONArray()
                    buildList {
                        for (i in 0 until items.length()) {
                            val item = items.optJSONObject(i) ?: continue
                            val id = item.optString("id").takeIf { it.isNotBlank() } ?: continue
                            val itemFormat = item.optString("videoFormat", "short")
                            if (itemFormat != format) continue
                            val playback = item.optString("playbackUrl")
                            if (!playback.startsWith("/api/shorts/video-stream/")) continue
                            val thumbnail = item.optString("thumbnailUrl")
                            if (!thumbnail.startsWith("/api/shorts/video-thumbnail/")) continue
                            add(JembeeVideo(
                                id = id,
                                creatorId = item.optString("creatorId").ifBlank { item.optString("userId") },
                                format = itemFormat,
                                caption = item.optString("caption"),
                                creatorName = item.optString("displayName").ifBlank {
                                    item.optString("username").ifBlank { "JEMBEE PLAY creator" }
                                },
                                username = item.optString("username"),
                                photoUrl = item.optString("photoURL").ifBlank { item.optString("photoUrl") }.takeIf { it.startsWith("https://") }.orEmpty(),
                                thumbnailUrl = "$BASE$thumbnail",
                                streamUrl = "$BASE$playback",
                                likes = item.optInt("likes", 0).coerceAtLeast(0),
                                views = item.optInt("views", 0).coerceAtLeast(0)
                            ))
                        }
                    }
                } finally {
                    connection.disconnect()
                }
            }
            mainHandler.post { onResult(result.getOrDefault(emptyList()), result.exceptionOrNull()?.message) }
        }.start()
    }
}
