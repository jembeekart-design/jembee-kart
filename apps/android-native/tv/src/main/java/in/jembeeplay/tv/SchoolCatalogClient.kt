package `in`.jembeeplay.tv

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class SchoolLearningNode(val id: String, val name: String, val type: String, val parentId: String?)

object SchoolCatalogClient {
    private const val BASE = "https://jembeeplay.in"
    fun fetch(onResult: (List<SchoolLearningNode>, String?) -> Unit) {
        Thread {
            val result = runCatching {
                val connection = (URL("$BASE/api/content-categories").openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"; connectTimeout = 10000; readTimeout = 15000
                }
                try {
                    require(connection.responseCode in 200..299) { "Learning catalogue HTTP ${connection.responseCode}" }
                    val raw = connection.inputStream.bufferedReader().use { it.readText() }
                    require(raw.length <= 2 * 1024 * 1024) { "Learning catalogue response too large" }
                    val root = JSONObject(raw)
                    require(root.optBoolean("success", false)) { root.optString("message", "Learning catalogue unavailable") }
                    val items = root.optJSONArray("schoolNodes") ?: org.json.JSONArray()
                    buildList {
                        for (i in 0 until items.length()) {
                            val item = items.optJSONObject(i) ?: continue
                            val id = item.optString("id").trim(); val name = item.optString("name").trim(); val type = item.optString("type").trim()
                            if (id.isNotBlank() && name.isNotBlank() && type in setOf("board", "school", "class", "subject", "book", "chapter", "question")) {
                                add(SchoolLearningNode(id, name.take(120), type, item.optString("parentId").takeIf { it.isNotBlank() && it != "null" }))
                            }
                        }
                    }
                } finally { connection.disconnect() }
            }
            android.os.Handler(android.os.Looper.getMainLooper()).post { onResult(result.getOrDefault(emptyList()), result.exceptionOrNull()?.message) }
        }.start()
    }
}
