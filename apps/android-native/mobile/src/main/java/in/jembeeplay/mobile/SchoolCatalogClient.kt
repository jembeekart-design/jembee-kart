package `in`.jembeeplay.mobile

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object SchoolCatalogClient {
    private const val BASE = "https://jembeeplay.in"

    fun fetch(onResult: (List<Pair<String, String>>, String?) -> Unit) {
        Thread {
            val result = runCatching {
                val connection = (URL("$BASE/api/education/schools").openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 10000
                    readTimeout = 15000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.responseCode in 200..299) { "School catalogue HTTP ${connection.responseCode}" }
                    val raw = connection.inputStream.bufferedReader().use { it.readText() }
                    require(raw.length <= 1024 * 1024) { "School catalogue response too large" }
                    val root = JSONObject(raw)
                    require(root.optBoolean("success", false)) { root.optString("message", "School catalogue unavailable") }
                    val schools = root.optJSONArray("schools") ?: org.json.JSONArray()
                    buildList {
                        for (i in 0 until schools.length()) {
                            val item = schools.optJSONObject(i) ?: continue
                            val name = item.optString("name").trim()
                            if (name.isBlank()) continue
                            val board = item.optString("board").trim().ifBlank { "Board not specified" }
                            add(name.take(120) to board.take(32))
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
