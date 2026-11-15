package `in`.jembeeplay.tv

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class TvCatalogVideo(val id: String, val title: String, val creator: String, val views: Int, val thumbnailUrl: String, val playbackUrl: String)

object TvVideoCatalogClient {
    private const val ENDPOINT = "https://jembeeplay.in/api/app/video-catalog?limit=20"
    private const val ORIGIN = "https://jembeeplay.in"
    private const val THUMBNAIL_PREFIX = "/api/shorts/video-thumbnail/"
    private const val PLAYBACK_PREFIX = "/api/shorts/video-stream/"

    private fun trustedMediaUrl(path: String, expectedPrefix: String): String? {
        if (!path.startsWith(expectedPrefix) || path.length <= expectedPrefix.length) return null
        if (path.startsWith("//") || path.contains('\\') || path.contains('?') || path.contains('#')) return null
        if (path.any { it.isWhitespace() || it.code < 0x20 }) return null
        return ORIGIN + path
    }

    fun fetch(onResult: (Result<List<TvCatalogVideo>>) -> Unit) {
        Thread {
            val result = runCatching {
                val connection = (URL(ENDPOINT).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"; connectTimeout = 7000; readTimeout = 10000
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
                        val thumbnailUrl = trustedMediaUrl(item.optString("thumbnailUrl"), THUMBNAIL_PREFIX) ?: return@mapNotNull null
                        val playbackUrl = trustedMediaUrl(item.optString("playbackUrl"), PLAYBACK_PREFIX) ?: return@mapNotNull null
                        if (id.isBlank()) return@mapNotNull null
                        TvCatalogVideo(
                            id, item.optString("caption", "Untitled video").take(500).ifBlank { "Untitled video" },
                            item.optString("displayName").take(120).ifBlank { item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" } },
                            item.optInt("views", 0).coerceAtLeast(0), thumbnailUrl, playbackUrl
                        )
                    }
                } finally { connection.disconnect() }
            }
            onResult(result)
        }.start()
    }
}
