package `in`.jembeeplay.mobile

import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class LearningNode(val id: String, val name: String, val type: String, val coverImageUrl: String?)
data class LearningQuestion(val questionNumber: String, val videoCount: Int)
data class LearningAnswer(val id: String, val caption: String, val creator: String, val videoFormat: String)

object LearningLibraryClient {
    private const val BASE = "https://jembeeplay.in"
    private const val MAX_RESPONSE_CHARS = 512 * 1024
    private val main = Handler(Looper.getMainLooper())

    fun loadNodes(type: String, parentId: String? = null, onResult: (Result<List<LearningNode>>) -> Unit) {
        val path = "/api/content-categories?type=" + URLEncoder.encode(type, "UTF-8") + "&pageSize=50" +
            (parentId?.let { "&parentId=" + URLEncoder.encode(it, "UTF-8") } ?: "")
        request(path, onResult) { raw ->
            val root = JSONObject(raw)
            require(root.optBoolean("success", false)) { "Learning catalogue unavailable" }
            val rows = root.optJSONArray("learningNodes") ?: org.json.JSONArray()
            (0 until rows.length()).mapNotNull { index ->
                val item = rows.optJSONObject(index) ?: return@mapNotNull null
                val id = item.optString("id").take(64)
                val name = item.optString("name").take(3000)
                if (id.isBlank() || name.isBlank()) null else LearningNode(
                    id, name, item.optString("type", type),
                    item.optString("coverImageUrl").takeIf { it.startsWith("https://") || it.startsWith("/learning-covers/") }
                )
            }
        }
    }

    fun loadQuestions(chapterId: String, onResult: (Result<List<LearningQuestion>>) -> Unit) {
        val path = "/api/learning/school-video-answers?chapterId=" + URLEncoder.encode(chapterId, "UTF-8")
        request(path, onResult) { raw ->
            val root = JSONObject(raw)
            require(root.optBoolean("success", false)) { "Question numbers unavailable" }
            val rows = root.optJSONArray("questions") ?: org.json.JSONArray()
            (0 until rows.length()).mapNotNull { index ->
                val item = rows.optJSONObject(index) ?: return@mapNotNull null
                val number = item.optString("questionNumber").take(40)
                if (number.isBlank()) null else LearningQuestion(number, item.optInt("videoCount", 0).coerceAtLeast(0))
            }
        }
    }

    fun loadAnswers(chapterId: String, questionNumber: String, onResult: (Result<List<LearningAnswer>>) -> Unit) {
        val path = "/api/learning/school-video-answers?chapterId=" + URLEncoder.encode(chapterId, "UTF-8") +
            "&questionNumber=" + URLEncoder.encode(questionNumber, "UTF-8")
        request(path, onResult) { raw ->
            val root = JSONObject(raw)
            require(root.optBoolean("success", false)) { "Video answers unavailable" }
            val rows = root.optJSONArray("videos") ?: org.json.JSONArray()
            (0 until rows.length()).mapNotNull { index ->
                val item = rows.optJSONObject(index) ?: return@mapNotNull null
                val id = item.optString("id").take(160)
                if (id.isBlank() || item.optString("videoAccess") != "free") null else LearningAnswer(
                    id, item.optString("caption", "Video answer").take(500),
                    item.optString("username", "JEMBEE PLAY Creator").take(80),
                    item.optString("videoFormat", "short")
                )
            }
        }
    }

    private fun <T> request(path: String, onResult: (Result<T>) -> Unit, parse: (String) -> T) {
        Thread {
            val result = runCatching {
                val connection = (URL(BASE + path).openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 7000
                    readTimeout = 10000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.url.protocol == "https")
                    val status = connection.responseCode
                    require(status in 200..299) { "Learning request failed ($status)" }
                    val body = connection.inputStream.bufferedReader().use { reader ->
                        val output = StringBuilder()
                        val buffer = CharArray(8192)
                        while (true) {
                            val count = reader.read(buffer)
                            if (count < 0) break
                            require(output.length + count <= MAX_RESPONSE_CHARS) { "Learning response too large" }
                            output.append(buffer, 0, count)
                        }
                        output.toString()
                    }
                    parse(body)
                } finally { connection.disconnect() }
            }
            main.post { onResult(result) }
        }.start()
    }
}