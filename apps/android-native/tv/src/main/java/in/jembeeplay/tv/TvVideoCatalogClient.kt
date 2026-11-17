package `in`.jembeeplay.tv

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class TvCatalogVideo(val id: String, val title: String, val creator: String, val views: Int, val thumbnailUrl: String, val playbackUrl: String)

object TvVideoCatalogClient {
    private const val ENDPOINT = "https://jembeeplay.in/api/app/video-catalog?limit=20"

    fun fetch(onResult: (Result<List<TvCatalogVideo>>) -> Unit) {
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
                    require(connection.responseCode in 200..299) { "Catalog unavailable" }
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 512 * 1024)
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false))
                    val items = root.optJSONArray("videos") ?: org.json.JSONArray()
                    (0 until items.length()).mapNotNull { index ->
                        val item = items.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(160)
                        val playbackPath = item.optString("playbackUrl")
                        if (id.isBlank() || !playbackPath.startsWith("/api/shorts/video-stream/")) return@mapNotNull null
                        TvCatalogVideo(
                            id = id,
                            title = item.optString("caption", "Untitled video").take(500).ifBlank { "Untitled video" },
                            creator = item.optString("displayName").take(120).ifBlank { item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" } },
                            views = item.optInt("views", 0).coerceAtLeast(0),
                            thumbnailUrl = "https://jembeeplay.in" + item.optString("thumbnailUrl").take(2048),
                            playbackUrl = "https://jembeeplay.in" + item.optString("playbackUrl").take(2048)
                        )
                    }
                } finally {
                    connection.disconnect()
                }
            }
            onResult(result)
        }.start()
    }
}
