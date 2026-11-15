package `in`.jembeeplay.mobile

import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.platform.LocalContext
import coil.compose.AsyncImage
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
fun NativeCatalogSection() {
    var videos by remember { mutableStateOf<List<CatalogVideo>>(emptyList()) }
    var cursor by remember { mutableStateOf<String?>(null) }
    var hasMore by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf<CatalogVideo?>(null) }

    fun loadMore() {
        if (loading) return
        loading = true
        VideoCatalogClient.fetch(cursor) { result ->
            result.onSuccess { page ->
                videos = videos + page.videos
                cursor = page.nextCursor
                hasMore = page.hasMore
                error = false
            }.onFailure { error = true }
            loading = false
        }
    }

    LaunchedEffect(Unit) {
        VideoCatalogClient.fetch { result ->
            result.onSuccess { page ->
                videos = page.videos
                cursor = page.nextCursor
                hasMore = page.hasMore
                error = false
            }.onFailure { error = true }
            loading = false
        }
    }

    Column(Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 12.dp)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text("Watch on JEMBEE PLAY", fontSize = 19.sp, fontWeight = FontWeight.Bold)
                Text("Approved videos · Live catalog", fontSize = 11.sp, color = Color.Gray)
            }
            if (loading) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
        }
        when {
            videos.isNotEmpty() -> {
                LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(videos, key = { it.id }) { video ->
                        Column(Modifier.width(230.dp)) {
                            Box(Modifier.fillMaxWidth().height(130.dp).clip(RoundedCornerShape(16.dp)).background(Color(0xFF172033)).clickable { selected = video }) {
                                AsyncImage(model = video.thumbnailUrl, contentDescription = video.title, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                                Surface(Modifier.align(androidx.compose.ui.Alignment.Center), color = Color.Black.copy(alpha = .72f), shape = RoundedCornerShape(50)) {
                                    Text("▶", Modifier.padding(horizontal = 14.dp, vertical = 8.dp), color = Color.White, fontSize = 20.sp)
                                }
                                Text(if (video.durationSeconds != null) "${video.durationSeconds / 60} min" else "JEMBEE PLAY", Modifier.align(androidx.compose.ui.Alignment.BottomEnd).padding(8.dp).background(Color.Black.copy(alpha = .8f), RoundedCornerShape(5.dp)).padding(horizontal = 6.dp, vertical = 3.dp), color = Color.White, fontSize = 10.sp)
                            }
                            Text(video.title, Modifier.padding(top = 8.dp), maxLines = 2, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(video.creator + " · " + video.views.toString() + " views", color = Color.Gray, fontSize = 11.sp)
                        }
                    }
                }
                if (hasMore) TextButton(onClick = { loadMore() }, enabled = !loading, modifier = Modifier.padding(start = 12.dp)) { Text(if (loading) "Loading…" else "Load more videos") }
            }
            loading -> Text("Loading approved videos…", Modifier.padding(18.dp), color = Color.Gray)
            error -> Row(Modifier.padding(horizontal = 18.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Videos couldn't load. Check your connection.", color = Color.Gray, fontSize = 12.sp)
                TextButton(onClick = {
                    loading = true
                    error = false
                    VideoCatalogClient.fetch { result ->
                        result.onSuccess { page -> videos = page.videos; cursor = page.nextCursor; hasMore = page.hasMore }.onFailure { error = true }
                        loading = false
                    }
                }) { Text("Retry") }
            }
            else -> Text("No approved videos are available yet.", Modifier.padding(18.dp), color = Color.Gray, fontSize = 12.sp)
        }
    }

    selected?.let { video ->
        NativeVideoPlayer(video = video, onClose = { selected = null })
    }
}

@Composable
private fun NativeVideoPlayer(video: CatalogVideo, onClose: () -> Unit) {
    val context = LocalContext.current
    val player = remember(video.id) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(video.playbackUrl))
            prepare()
            playWhenReady = true
        }
    }
    DisposableEffect(player) { onDispose { player.release() } }
    androidx.compose.ui.window.Dialog(onDismissRequest = onClose) {
        Column(Modifier.fillMaxWidth().background(Color(0xFF0B1020), RoundedCornerShape(18.dp)).padding(12.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(video.title, Modifier.weight(1f), color = Color.White, fontWeight = FontWeight.Bold, maxLines = 2)
                TextButton(onClick = onClose) { Text("Close") }
            }
            AndroidView(
                factory = { ctx -> PlayerView(ctx).apply { this.player = player; layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT); useController = true } },
                modifier = Modifier.fillMaxWidth().height(220.dp)
            )
            Text(video.creator, Modifier.padding(top = 8.dp), color = Color.LightGray, fontSize = 12.sp)
        }
    }
}


@Composable
fun NativeShortsScreen() {
    var videos by remember { mutableStateOf<List<CatalogVideo>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var failed by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf<CatalogVideo?>(null) }

    fun refresh() {
        loading = true
        failed = false
        VideoCatalogClient.fetch { result ->
            result.onSuccess { page ->
                videos = page.videos.filter { it.format == "short" }
                failed = false
            }.onFailure { failed = true }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    Column(Modifier.fillMaxSize().padding(horizontal = 16.dp, vertical = 8.dp)) {
        Text("JEMBEE SHORTS", fontSize = 22.sp, fontWeight = FontWeight.Black)
        Text("Short videos from approved creators", color = Color.Gray, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp, bottom = 12.dp))
        when {
            loading -> Box(Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                CircularProgressIndicator()
            }
            failed -> Column(Modifier.fillMaxWidth().padding(24.dp), horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                Text("Shorts couldn't load right now.", color = Color.Gray)
                TextButton(onClick = { refresh() }) { Text("Try again") }
            }
            videos.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) {
                Text("No approved Shorts are available yet.", color = Color.Gray)
            }
            else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(14.dp), contentPadding = PaddingValues(bottom = 18.dp)) {
                items(videos, key = { it.id }) { video ->
                    Column(Modifier.fillMaxWidth()) {
                        Box(
                            Modifier.fillMaxWidth().height(390.dp).clip(RoundedCornerShape(22.dp))
                                .background(Color(0xFF111629)).clickable { selected = video }
                        ) {
                            AsyncImage(
                                model = video.thumbnailUrl,
                                contentDescription = video.title,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                            Surface(
                                Modifier.align(androidx.compose.ui.Alignment.Center),
                                color = Color.Black.copy(alpha = .68f),
                                shape = RoundedCornerShape(50)
                            ) {
                                Text("▶", Modifier.padding(horizontal = 18.dp, vertical = 12.dp), color = Color.White, fontSize = 28.sp)
                            }
                            Text(
                                "JEMBEE SHORTS",
                                Modifier.align(androidx.compose.ui.Alignment.BottomStart).padding(14.dp)
                                    .background(Color.Black.copy(alpha = .62f), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 9.dp, vertical = 5.dp),
                                color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold
                            )
                        }
                        Text(video.title, Modifier.padding(top = 8.dp), fontSize = 16.sp, fontWeight = FontWeight.Bold, maxLines = 2)
                        Text(video.creator + " · " + video.views + " views", color = Color.Gray, fontSize = 12.sp)
                    }
                }
            }
        }
    }
    selected?.let { video -> NativeVideoPlayer(video = video, onClose = { selected = null }) }
}


private data class LearningNode(val id: String, val name: String, val type: String, val parentId: String?)

private fun readLearningNodes(): List<LearningNode> {
    val connection = (java.net.URL("https://jembeeplay.in/api/content-categories").openConnection() as java.net.HttpURLConnection).apply {
        connectTimeout = 7000
        readTimeout = 10000
        setRequestProperty("Accept", "application/json")
    }
    try {
        require(connection.responseCode in 200..299) { "Learning catalog unavailable" }
        val body = connection.inputStream.bufferedReader().use { it.readText() }
        require(body.length <= 1024 * 1024) { "Learning catalog response too large" }
        val root = org.json.JSONObject(body)
        require(root.optBoolean("success", false))
        val array = root.optJSONArray("schoolNodes") ?: org.json.JSONArray()
        return (0 until array.length()).mapNotNull { index ->
            val item = array.optJSONObject(index) ?: return@mapNotNull null
            val id = item.optString("id")
            val name = item.optString("name")
            val type = item.optString("type")
            if (id.isBlank() || name.isBlank() || type !in setOf("board", "school", "class", "subject", "book", "chapter", "question")) null
            else LearningNode(id.take(64), name.take(120), type, item.optString("parentId").takeIf { it.isNotBlank() && it != "null" })
        }
    } finally {
        connection.disconnect()
    }
}

private fun readQuestionAnswers(questionId: String): List<String> {
    val encodedId = java.net.URLEncoder.encode(questionId, "UTF-8")
    val url = "https://jembeeplay.in/api/learning/school-video-answers?questionId=$encodedId"
    val connection = (java.net.URL(url).openConnection() as java.net.HttpURLConnection).apply {
        connectTimeout = 7000
        readTimeout = 10000
        setRequestProperty("Accept", "application/json")
    }
    try {
        require(connection.responseCode in 200..299) { "Question answers unavailable" }
        val body = connection.inputStream.bufferedReader().use { it.readText() }
        require(body.length <= 512 * 1024) { "Question answers response too large" }
        val root = org.json.JSONObject(body)
        val array = root.optJSONArray("videos") ?: org.json.JSONArray()
        return (0 until array.length()).mapNotNull { index ->
            val video = array.optJSONObject(index) ?: return@mapNotNull null
            val caption = video.optString("caption").take(180)
            val creator = video.optString("username").take(80)
            val access = video.optString("videoAccess").take(16)
            if (caption.isBlank() && creator.isBlank()) null else "$caption  •  $creator  •  $access"
        }
    } finally {
        connection.disconnect()
    }
}

@Composable
fun NativeLearningScreen() {
    var nodes by remember { mutableStateOf<List<LearningNode>>(emptyList()) }
    var stage by remember { mutableIntStateOf(0) }
    var selected by remember { mutableStateOf<List<LearningNode>>(emptyList()) }
    var query by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var failed by remember { mutableStateOf(false) }
    var reloadKey by remember { mutableIntStateOf(0) }
    var answers by remember { mutableStateOf<List<String>>(emptyList()) }
    var answersLoading by remember { mutableStateOf(false) }
    var answersFailed by remember { mutableStateOf(false) }
    var selectedQuestion by remember { mutableStateOf<LearningNode?>(null) }

    LaunchedEffect(reloadKey) {
        loading = true
        failed = false
        val result = runCatching { withContext(Dispatchers.IO) { readLearningNodes() } }
        result.onSuccess { nodes = it }.onFailure { failed = true }
        loading = false
    }

    val labels = listOf("Choose Board", "Choose School", "Choose Class", "Choose Subject / Book", "Choose Chapter", "Choose Question")
    val parent = selected.lastOrNull()?.id
    val acceptedTypes = when (stage) {
        0 -> setOf("board")
        1 -> setOf("school")
        2 -> setOf("class")
        3 -> setOf("subject", "book")
        4 -> setOf("chapter")
        5 -> setOf("question")
        else -> emptySet()
    }
    val visible = nodes.filter { node ->
        node.type in acceptedTypes && (stage == 0 || node.parentId == parent) &&
            node.name.contains(query, ignoreCase = true)
    }

    Column(Modifier.fillMaxSize().padding(18.dp)) {
        Text("JEMBEE LEARN", fontSize = 23.sp, fontWeight = FontWeight.Black)
        Text("Explore your school curriculum", color = Color.Gray, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp, bottom = 12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            if (stage > 0) TextButton(onClick = {
                stage--
                selected = selected.take(stage)
                selectedQuestion = null
                answers = emptyList()
                query = ""
            }) { Text("← Back") }
            Text(if (stage < 6) labels[stage] else "Video Answers", fontWeight = FontWeight.Bold)
            Spacer(Modifier.weight(1f))
            TextButton(onClick = {
                stage = 0
                selected = emptyList()
                selectedQuestion = null
                answers = emptyList()
                query = ""
            }) { Text("Reset") }
        }
        selected.forEach { Text(it.name, color = Color(0xFF1684C7), fontSize = 11.sp) }
        if (stage < 6) {
            OutlinedTextField(value = query, onValueChange = { query = it }, modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp), label = { Text("Search") }, singleLine = true)
            when {
                loading -> Box(Modifier.fillMaxSize(), contentAlignment = androidx.compose.ui.Alignment.Center) { CircularProgressIndicator() }
                failed -> Column(Modifier.fillMaxWidth().padding(20.dp), horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                    Text("Learning catalog couldn't load.", color = Color.Gray)
                    TextButton(onClick = { reloadKey++ }) { Text("Try again") }
                }
                visible.isEmpty() -> Box(Modifier.fillMaxWidth().padding(24.dp), contentAlignment = androidx.compose.ui.Alignment.Center) {
                    Text(if (nodes.isEmpty()) "No published learning entries yet." else "No matching entries found.", color = Color.Gray)
                }
                else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(visible, key = { it.id }) { node ->
                        Surface(
                            onClick = {
                                selected = selected + node
                                if (stage == 5) {
                                    selectedQuestion = node
                                    answersLoading = true
                                    answersFailed = false
                                    stage = 6
                                } else {
                                    stage++
                                }
                                query = ""
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                            color = MaterialTheme.colorScheme.surface
                        ) {
                            Row(Modifier.padding(16.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                                Text(node.name, Modifier.weight(1f), fontWeight = FontWeight.SemiBold)
                                Text("›", color = Color(0xFF1684C7), fontSize = 24.sp)
                            }
                        }
                    }
                }
            }
        } else {
            LaunchedEffect(selectedQuestion?.id) {
                val questionId = selectedQuestion?.id ?: return@LaunchedEffect
                answersLoading = true
                answersFailed = false
                val result = runCatching { withContext(Dispatchers.IO) { readQuestionAnswers(questionId) } }
                result.onSuccess { answers = it }.onFailure { answersFailed = true }
                answersLoading = false
            }
            Text(selectedQuestion?.name ?: "Video answers", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            when {
                answersLoading -> CircularProgressIndicator(Modifier.padding(top = 16.dp))
                answersFailed -> TextButton(onClick = { selectedQuestion = selectedQuestion?.copy() }) { Text("Couldn't load answers. Try again") }
                answers.isEmpty() -> Text("No approved video answers are available for this question yet.", color = Color.Gray, modifier = Modifier.padding(top = 12.dp))
                else -> answers.forEach { answer ->
                    Text(answer, Modifier.fillMaxWidth().padding(vertical = 10.dp), color = MaterialTheme.colorScheme.onSurface)
                    HorizontalDivider()
                }
            }
            Text("Video metadata only. Verified answer-video playback integration is still pending.", color = Color.Gray, fontSize = 11.sp, modifier = Modifier.padding(top = 14.dp))
        }
    }
}
