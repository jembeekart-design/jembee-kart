package `in`.jembeeplay.mobile

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class SchoolAnswerVideo(val id: String, val caption: String, val creator: String, val streamUrl: String)

object SchoolAnswerClient {
    private const val BASE = "https://jembeeplay.in"

    fun fetch(questionId: String, onResult: (List<SchoolAnswerVideo>, String?) -> Unit) {
        Thread {
            val result = runCatching {
                val safeId = java.net.URLEncoder.encode(questionId, Charsets.UTF_8.name())
                val connection = (URL("$BASE/api/learning/school-video-answers?questionId=$safeId").openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 10000
                    readTimeout = 15000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.responseCode in 200..299) { "Question videos HTTP ${connection.responseCode}" }
                    val root = JSONObject(connection.inputStream.bufferedReader().use { it.readText() })
                    require(root.optBoolean("success", false)) { root.optString("message", "Question videos unavailable") }
                    val items = root.optJSONArray("videos") ?: org.json.JSONArray()
                    buildList {
                        for (i in 0 until items.length()) {
                            val item = items.optJSONObject(i) ?: continue
                            val id = item.optString("id")
                            val stream = item.optString("streamUrl")
                            if (id.isNotBlank() && stream.startsWith("/api/shorts/video-stream/")) {
                                add(SchoolAnswerVideo(id, item.optString("caption"), item.optString("username"), "$BASE$stream"))
                            }
                        }
                    }
                } finally { connection.disconnect() }
            }
            android.os.Handler(android.os.Looper.getMainLooper()).post {
                onResult(result.getOrDefault(emptyList()), result.exceptionOrNull()?.message)
            }
        }.start()
    }
}
