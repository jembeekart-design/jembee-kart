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

object VideoCatalogClient {
    private const val BASE = "https://jembeeplay.in"

    fun fetch(format: String, onResult: (List<JembeeVideo>, String?) -> Unit) {
        Thread {
            val result = runCatching {
                require(format == "short" || format == "long")
                val connection = (URL("$BASE/api/app/videos?format=$format").openConnection() as HttpURLConnection).apply {
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
                            val stream = item.optString("streamUrl")
                            if (!stream.startsWith("$BASE/api/shorts/video-stream/")) continue
                            add(JembeeVideo(
                                id = id,
                                format = item.optString("format", format),
                                caption = item.optString("caption"),
                                creatorName = item.optString("displayName").ifBlank { item.optString("username").ifBlank { "JEMBEE PLAY creator" } },
                                username = item.optString("username"),
                                thumbnailUrl = "$BASE" + item.optString("thumbnailUrl"),
                                streamUrl = "$BASE$stream",
                                likes = item.optInt("likes", 0),
                                views = item.optInt("views", 0)
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
