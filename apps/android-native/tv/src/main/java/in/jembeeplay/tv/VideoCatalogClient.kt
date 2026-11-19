package `in`.jembeeplay.tv

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class JembeeVideo(
    val id: String,
    val format: String,
    val caption: String,
    val creatorName: String,
    val username: String,
    val thumbnailUrl: String,
    val streamUrl: String,
    val likes: Int,
    val views: Int
)

/**
 * Uses the already-published production catalogue contract.
 * Do not switch this to /api/app/videos until that route is deployed to production.
 */
object VideoCatalogClient {
    private const val BASE = "https://jembeeplay.in"
    private const val ENDPOINT = "$BASE/api/app/video-catalog?limit=40"

    fun fetch(format: String, onResult: (List<JembeeVideo>, String?) -> Unit) {
        Thread {
            val result = runCatching {
                require(format == "short" || format == "long")
                val connection = (URL(ENDPOINT).openConnection() as HttpURLConnection).apply {
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
                                format = itemFormat,
                                caption = item.optString("caption"),
                                creatorName = item.optString("displayName").ifBlank { item.optString("username").ifBlank { "JEMBEE PLAY creator" } },
                                username = item.optString("username"),
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
            android.os.Handler(android.os.Looper.getMainLooper()).post {
                onResult(result.getOrDefault(emptyList()), result.exceptionOrNull()?.message)
            }
        }.start()
    }
}
