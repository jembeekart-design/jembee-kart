package `in`.jembeeplay.tv

import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private const val TV_LEARNING_ORIGIN = "https://jembeeplay.in"
private data class TvLearningNode(val id: String, val name: String, val type: String, val parentId: String?)
private data class TvLearningAnswer(val id: String, val title: String, val creator: String, val access: String)

private object TvLearningClient {
    private val main = Handler(Looper.getMainLooper())
    fun catalog(callback: (Result<List<TvLearningNode>>) -> Unit) {
        Thread {
            val result = runCatching {
                val connection = URL("$TV_LEARNING_ORIGIN/api/content-categories").openConnection() as HttpURLConnection
                connection.connectTimeout = 7000; connection.readTimeout = 10000
                try {
                    require(connection.responseCode in 200..299) { "Learning catalog unavailable" }
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 1024 * 1024)
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false))
                    val array = root.optJSONArray("schoolNodes") ?: org.json.JSONArray()
                    (0 until array.length()).mapNotNull { index ->
                        val item = array.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(64)
                        val type = item.optString("type").take(20)
                        if (id.isBlank() || item.optString("status") != "published" ||
                            type !in setOf("book", "chapter", "question")) return@mapNotNull null
                        TvLearningNode(id, item.optString("name").take(120).ifBlank { "Untitled" }, type,
                            item.optString("parentId").takeIf { it.isNotBlank() && it != "null" })
                    }
                } finally { connection.disconnect() }
            }
            main.post { callback(result) }
        }.start()
    }
    fun answers(questionId: String, callback: (Result<List<TvLearningAnswer>>) -> Unit) {
        Thread {
            val result = runCatching {
                require(questionId.matches(Regex("^[a-z0-9][a-z0-9_-]{1,63}$")))
                val connection = URL("$TV_LEARNING_ORIGIN/api/learning/school-video-answers?questionId=$questionId").openConnection() as HttpURLConnection
                connection.connectTimeout = 7000; connection.readTimeout = 10000
                try {
                    require(connection.responseCode in 200..299) { "Question answers unavailable" }
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 512 * 1024)
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false))
                    val array = root.optJSONArray("videos") ?: org.json.JSONArray()
                    (0 until array.length()).mapNotNull { index ->
                        val item = array.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(160)
                        if (id.isBlank()) return@mapNotNull null
                        TvLearningAnswer(id, item.optString("caption").take(200).ifBlank { "Video answer" },
                            item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" },
                            item.optString("videoAccess").take(10))
                    }
                } finally { connection.disconnect() }
            }
            main.post { callback(result) }
        }.start()
    }
}

@Composable
fun TvLearningLibraryScreen() {
    val context = LocalContext.current
    var nodes by remember { mutableStateOf<List<TvLearningNode>>(emptyList()) }
    var book by remember { mutableStateOf<TvLearningNode?>(null) }
    var chapter by remember { mutableStateOf<TvLearningNode?>(null) }
    var question by remember { mutableStateOf<TvLearningNode?>(null) }
    var answers by remember { mutableStateOf<List<TvLearningAnswer>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var answerLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    fun refresh() {
        loading = true; error = ""
        TvLearningClient.catalog { result ->
            result.onSuccess { nodes = it }.onFailure { error = it.message ?: "Learning catalog unavailable" }
            loading = false
        }
    }
    LaunchedEffect(Unit) { refresh() }
    val stage = when { question != null -> 3; chapter != null -> 2; book != null -> 1; else -> 0 }
    val entries = when (stage) {
        0 -> nodes.filter { it.type == "book" }
        1 -> nodes.filter { it.type == "chapter" && it.parentId == book?.id }
        2 -> nodes.filter { it.type == "question" && it.parentId == chapter?.id }
        else -> emptyList()
    }.sortedBy { it.name.lowercase() }
    val muted = Color(0xFFABB7C8)
    Column(Modifier.fillMaxSize().background(Color(0xFF05060B)).padding(horizontal = 30.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text("Learning Library", fontSize = 29.sp, fontWeight = FontWeight.ExtraBold)
                Text("Books  ·  Chapters  ·  Questions", fontSize = 14.sp, color = muted)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (book != null) Button(onClick = { book = null; chapter = null; question = null; answers = emptyList() }) { Text("Books") }
                if (chapter != null) Button(onClick = { chapter = null; question = null; answers = emptyList() }) { Text("Chapters") }
                Button(onClick = { refresh() }, enabled = !loading) { Text("Refresh") }
            }
        }
        if (book != null) Text(listOfNotNull(book?.name, chapter?.name, question?.name).joinToString("  ›  "),
            color = muted, fontSize = 13.sp)
        if (error.isNotBlank()) {
            Text(error, color = Color(0xFFFFA0A0), fontSize = 15.sp)
            Button(onClick = { refresh() }) { Text("Try again") }
        } else if (loading) {
            Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) { Text("Loading learning catalog…", color = muted, fontSize = 17.sp) }
        } else if (stage < 3) {
            if (entries.isEmpty()) {
                Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                    Text(listOf("No published books yet", "No chapters in this book yet", "No questions in this chapter yet")[stage],
                        color = muted, fontSize = 18.sp)
                }
            } else {
                LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(entries, key = { it.id }) { item ->
                        Surface(onClick = {
                            when (stage) {
                                0 -> { book = item; chapter = null; question = null }
                                1 -> { chapter = item; question = null }
                                2 -> {
                                    question = item; answerLoading = true; answers = emptyList()
                                    TvLearningClient.answers(item.id) { result ->
                                        result.onSuccess { answers = it }.onFailure { error = it.message ?: "Answers unavailable" }
                                        answerLoading = false
                                    }
                                }
                            }
                        }, shape = ClickableSurfaceDefaults.shape(shape = RoundedCornerShape(18.dp)),
                            colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF15131E),
                                focusedContainerColor = Color(0xFF3B174A), focusedContentColor = Color.White),
                            modifier = Modifier.fillMaxWidth().height(76.dp)) {
                            Row(Modifier.fillMaxSize().padding(horizontal = 22.dp), verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                                Text(when (stage) { 0 -> "▤"; 1 -> "▥"; else -> "#" }, color = Color(0xFFFF1978), fontSize = 28.sp)
                                Column(Modifier.weight(1f)) {
                                    Text(item.name, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                                    Text(when (stage) { 0 -> "Published book"; 1 -> "Chapter"; else -> "Question" }, color = muted, fontSize = 12.sp)
                                }
                                Text("›", fontSize = 26.sp, color = muted)
                            }
                        }
                    }
                }
            }
        } else {
            Text(question?.name ?: "Question", fontSize = 23.sp, fontWeight = FontWeight.Bold)
            Text("Approved video answers", color = muted, fontSize = 14.sp)
            when {
                answerLoading -> Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) { Text("Loading video answers…", color = muted, fontSize = 17.sp) }
                answers.isEmpty() -> Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                    Text("No approved video answers for this question yet.", color = muted, fontSize = 16.sp)
                }
                else -> LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(answers, key = { it.id }) { answer ->
                        Surface(onClick = {
                            val url = TV_LEARNING_ORIGIN + "/videos/original/" + Uri.encode(answer.id)
                            context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        }, shape = ClickableSurfaceDefaults.shape(shape = RoundedCornerShape(16.dp)),
                            colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF15131E),
                                focusedContainerColor = Color(0xFF3B174A), focusedContentColor = Color.White),
                            modifier = Modifier.fillMaxWidth().height(78.dp)) {
                            Row(Modifier.fillMaxSize().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text(answer.title, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                                    Text(answer.creator, fontSize = 12.sp, color = muted)
                                }
                                Text(if (answer.access == "paid") "Paid access  ›" else "Watch  ›",
                                    color = Color(0xFFFF8AB8), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
