package `in`.jembeeplay.mobile

import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class MobileCatalogVideo(
    val id: String,
    val caption: String,
    val creator: String,
    val views: Int,
    val likes: Int,
    val comments: Int,
    val thumbnailUrl: String,
    val playbackUrl: String
)

object MobileVideoCatalogClient {
    private const val BASE = "https://jembeeplay.in"
    private const val ENDPOINT = "$BASE/api/app/video-catalog?limit=20"
    private const val MAX_RESPONSE_CHARS = 512 * 1024

    fun fetch(onResult: (Result<List<MobileCatalogVideo>>) -> Unit) {
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
                    require(connection.responseCode in 200..299) { "Video catalog unavailable" }
                    val body = connection.inputStream.bufferedReader().use { reader ->
                        val output = StringBuilder()
                        val buffer = CharArray(8192)
                        while (true) {
                            val count = reader.read(buffer)
                            if (count < 0) break
                            require(output.length + count <= MAX_RESPONSE_CHARS) { "Video catalog response too large" }
                            output.append(buffer, 0, count)
                        }
                        output.toString()
                    }
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false)) { "Video catalog response invalid" }
                    val items = root.optJSONArray("videos") ?: org.json.JSONArray()
                    (0 until items.length()).mapNotNull { index ->
                        val item = items.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(160)
                        val thumbnailPath = item.optString("thumbnailUrl")
                        val playbackPath = item.optString("playbackUrl")
                        if (id.isBlank() || item.optString("videoAccess") != "free" ||
                            !thumbnailPath.startsWith("/api/shorts/video-thumbnail/") ||
                            !playbackPath.startsWith("/api/shorts/video-stream/") ||
                            thumbnailPath.contains("..") || playbackPath.contains("..")) return@mapNotNull null
                        MobileCatalogVideo(
                            id = id,
                            caption = item.optString("caption", "Untitled video").take(500).ifBlank { "Untitled video" },
                            creator = item.optString("displayName").take(120).ifBlank {
                                item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" }
                            },
                            views = item.optInt("views", 0).coerceAtLeast(0),
                            likes = item.optInt("likes", 0).coerceAtLeast(0),
                            comments = item.optInt("comments", 0).coerceAtLeast(0),
                            thumbnailUrl = BASE + thumbnailPath.take(2048),
                            playbackUrl = BASE + playbackPath.take(2048)
                        )
                    }
                } finally {
                    connection.disconnect()
                }
            }
            Handler(Looper.getMainLooper()).post { onResult(result) }
        }.start()
    }
}
