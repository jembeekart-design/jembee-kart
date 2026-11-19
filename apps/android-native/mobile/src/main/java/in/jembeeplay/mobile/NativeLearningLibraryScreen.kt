package `in`.jembeeplay.mobile

import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

private const val LEARNING_ORIGIN = "https://jembeeplay.in"
private data class LearningNode(val id: String, val name: String, val type: String, val parentId: String?)
private data class LearningAnswer(val id: String, val title: String, val creator: String, val format: String, val access: String)

private object LearningLibraryClient {
    private val main = Handler(Looper.getMainLooper())
    fun loadCatalog(onResult: (Result<List<LearningNode>>) -> Unit) {
        Thread {
            val result = runCatching {
                val connection = (URL("$LEARNING_ORIGIN/api/content-categories").openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"; connectTimeout = 7000; readTimeout = 10000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.responseCode in 200..299) { "Learning catalog unavailable" }
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 1024 * 1024)
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false))
                    val nodes = root.optJSONArray("schoolNodes") ?: org.json.JSONArray()
                    (0 until nodes.length()).mapNotNull { index ->
                        val item = nodes.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(64)
                        val type = item.optString("type").take(20)
                        if (id.isBlank() || item.optString("status") != "published" ||
                            type !in setOf("board", "school", "class", "subject", "book", "chapter", "question")) return@mapNotNull null
                        LearningNode(id, item.optString("name").take(120).ifBlank { "Untitled" }, type,
                            item.optString("parentId").takeIf { it.isNotBlank() && it != "null" })
                    }
                } finally { connection.disconnect() }
            }
            main.post { onResult(result) }
        }.start()
    }

    fun loadAnswers(questionId: String, onResult: (Result<List<LearningAnswer>>) -> Unit) {
        Thread {
            val result = runCatching {
                require(questionId.matches(Regex("^[a-z0-9][a-z0-9_-]{1,63}$")))
                val connection = (URL("$LEARNING_ORIGIN/api/learning/school-video-answers?questionId=$questionId").openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"; connectTimeout = 7000; readTimeout = 10000
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    require(connection.responseCode in 200..299) { "Question answers unavailable" }
                    val body = connection.inputStream.bufferedReader().use { it.readText() }
                    require(body.length <= 512 * 1024)
                    val root = JSONObject(body)
                    require(root.optBoolean("success", false))
                    val videos = root.optJSONArray("videos") ?: org.json.JSONArray()
                    (0 until videos.length()).mapNotNull { index ->
                        val item = videos.optJSONObject(index) ?: return@mapNotNull null
                        val id = item.optString("id").take(160)
                        if (id.isBlank()) return@mapNotNull null
                        LearningAnswer(id, item.optString("caption").take(200).ifBlank { "Video answer" },
                            item.optString("username").take(80).ifBlank { "JEMBEE PLAY Creator" },
                            item.optString("videoFormat").take(10), item.optString("videoAccess").take(10))
                    }
                } finally { connection.disconnect() }
            }
            main.post { onResult(result) }
        }.start()
    }
}

@Composable
fun NativeLearningLibraryScreen() {
    val context = LocalContext.current
    var nodes by remember { mutableStateOf<List<LearningNode>>(emptyList()) }
    var book by remember { mutableStateOf<LearningNode?>(null) }
    var chapter by remember { mutableStateOf<LearningNode?>(null) }
    var question by remember { mutableStateOf<LearningNode?>(null) }
    var answers by remember { mutableStateOf<List<LearningAnswer>>(emptyList()) }
    var search by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var answerLoading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }

    fun refresh() {
        loading = true; error = ""
        LearningLibraryClient.loadCatalog { result ->
            result.onSuccess { nodes = it }.onFailure { error = it.message ?: "Learning Library could not be loaded." }
            loading = false
        }
    }
    LaunchedEffect(Unit) { refresh() }

    val stage = when { question != null -> 3; chapter != null -> 2; book != null -> 1; else -> 0 }
    val options = when (stage) {
        0 -> nodes.filter { it.type == "book" || it.type == "subject" }
        1 -> nodes.filter { it.type == "chapter" && it.parentId == book?.id }
        2 -> nodes.filter { it.type == "question" && it.parentId == chapter?.id }
        else -> emptyList()
    }.filter { it.name.contains(search, ignoreCase = true) }.sortedBy { it.name.lowercase() }

    Column(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background).padding(horizontal = 18.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Column(Modifier.weight(1f)) {
                Text("Learning Library", fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
                Text("Books  ·  Chapters  ·  Questions", color = Color(0xFF778196), fontSize = 12.sp)
            }
            TextButton(onClick = { refresh() }, enabled = !loading) { Text("Refresh") }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
            listOf("Books", "Chapters", "Questions").forEachIndexed { index, label ->
                val active = stage == index
                Surface(onClick = {
                    when (index) {
                        0 -> { book = null; chapter = null; question = null; answers = emptyList() }
                        1 -> if (book != null) { chapter = null; question = null; answers = emptyList() }
                        2 -> if (chapter != null) { question = null; answers = emptyList() }
                    }
                    search = ""
                }, enabled = index == 0 || (index == 1 && book != null) || (index == 2 && chapter != null),
                    shape = RoundedCornerShape(24.dp), color = if (active) Color(0xFFFF1978) else MaterialTheme.colorScheme.surface,
                    modifier = Modifier.weight(1f)) {
                    Box(Modifier.padding(vertical = 10.dp), contentAlignment = Alignment.Center) {
                        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold,
                            color = if (active) Color.White else MaterialTheme.colorScheme.onSurface)
                    }
                }
            }
        }
        if (book != null) Text(listOfNotNull(book?.name, chapter?.name, question?.name).joinToString("  ›  "),
            color = Color(0xFF778196), fontSize = 11.sp)
        if (stage < 3) {
            OutlinedTextField(value = search, onValueChange = { search = it }, modifier = Modifier.fillMaxWidth(),
                singleLine = true, shape = RoundedCornerShape(15.dp),
                label = { Text("Search " + listOf("books", "chapters", "questions")[stage]) },
                placeholder = { Text("Type a name or question number") })
        }
        if (error.isNotBlank()) {
            Text(error, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
            OutlinedButton(onClick = { refresh() }) { Text("Try again") }
        } else if (loading) {
            Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Color(0xFFFF1978))
            }
        } else if (stage < 3) {
            if (options.isEmpty()) {
                Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(listOf("No published books or subjects yet", "No chapters in this selection yet", "No questions in this chapter yet")[stage],
                            fontWeight = FontWeight.Bold)
                        Text("Only published catalog entries are shown here.", color = Color(0xFF778196), fontSize = 12.sp)
                    }
                }
            } else {
                LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(9.dp),
                    contentPadding = PaddingValues(bottom = 18.dp)) {
                    items(options, key = { it.id }) { item ->
                        Surface(onClick = {
                            search = ""
                            when (stage) {
                                0 -> { book = item; chapter = null; question = null }
                                1 -> { chapter = item; question = null }
                                2 -> {
                                    question = item; answerLoading = true; answers = emptyList()
                                    LearningLibraryClient.loadAnswers(item.id) { result ->
                                        result.onSuccess { answers = it; error = "" }
                                            .onFailure { error = it.message ?: "Answers could not be loaded." }
                                        answerLoading = false
                                    }
                                }
                            }
                        }, shape = RoundedCornerShape(17.dp), color = MaterialTheme.colorScheme.surface,
                            modifier = Modifier.fillMaxWidth()) {
                            Row(Modifier.fillMaxWidth().padding(15.dp), verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(13.dp)) {
                                Box(Modifier.size(48.dp).background(Color(0x1AFF1978), RoundedCornerShape(14.dp)),
                                    contentAlignment = Alignment.Center) {
                                    Text(when (stage) { 0 -> "▤"; 1 -> "▥"; else -> "#" },
                                        color = Color(0xFFFF1978), fontSize = 23.sp, fontWeight = FontWeight.Bold)
                                }
                                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                    Text(item.name, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                    Text(when (stage) { 0 -> "Published book"; 1 -> "Chapter"; else -> "Question number" },
                                        color = Color(0xFF778196), fontSize = 11.sp)
                                }
                                Text("›", fontSize = 24.sp, color = Color(0xFF778196))
                            }
                        }
                    }
                }
            }
        } else {
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(question?.name ?: "Question", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("Approved video answers", fontSize = 13.sp, color = Color(0xFF778196))
                when {
                    answerLoading -> Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Color(0xFFFF1978))
                    }
                    answers.isEmpty() -> Box(Modifier.fillMaxWidth().weight(1f), contentAlignment = Alignment.Center) {
                        Text("No approved video answers for this question yet.", color = Color(0xFF778196), fontSize = 13.sp)
                    }
                    else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                        items(answers, key = { it.id }) { answer ->
                            Surface(onClick = {
                                val url = LEARNING_ORIGIN + "/videos/original/" + Uri.encode(answer.id)
                                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                            }, color = MaterialTheme.colorScheme.surface, shape = RoundedCornerShape(15.dp)) {
                                Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                                    Text(answer.title, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                    Text(answer.creator, color = Color(0xFF778196), fontSize = 11.sp)
                                    Text((if (answer.format == "long") "Long video" else "Short video") +
                                        "  ·  " + (if (answer.access == "paid") "Paid access" else "Free") + "  ·  Open video",
                                        color = Color(0xFFFF1978), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
