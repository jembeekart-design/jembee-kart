package `in`.jembeeplay.tv

import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*

private val TvAccent = Color(0xFF43C7F5)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setContent { JembeeTvApp() }
    }
}

@Composable
private fun JembeeTvApp() {
    val context = androidx.compose.ui.platform.LocalContext.current
    var remoteConfig by remember { mutableStateOf(JembeeRemoteConfig()) }
    var shorts by remember { mutableStateOf<List<JembeeVideo>>(emptyList()) }
    var longVideos by remember { mutableStateOf<List<JembeeVideo>>(emptyList()) }
    var shortError by remember { mutableStateOf<String?>(null) }
    var longError by remember { mutableStateOf<String?>(null) }
    var selected by remember { mutableStateOf("Home") }
    var activeVideo by remember { mutableStateOf<JembeeVideo?>(null) }

    LaunchedEffect(Unit) {
        RemoteConfigClient.fetch(context) { remoteConfig = it }
        VideoCatalogClient.fetch("short") { items, error -> shorts = items; shortError = error }
        VideoCatalogClient.fetch("long") { items, error -> longVideos = items; longError = error }
    }

    MaterialTheme(colorScheme = darkColorScheme(primary = TvAccent, background = Color(0xFF080B12), surface = Color(0xFF151B27))) {
        Box(Modifier.fillMaxSize().background(Color(0xFF080B12))) {
            when (selected) {
                "Shorts" -> TvShortsScreen(videos = shorts, error = shortError, onBack = { selected = "Home" }, onWatch = { activeVideo = it; selected = "Watch" })
                "Watch" -> TvWatchScreen(video = activeVideo, onBack = { selected = "Home" })
                "Learning" -> TvLearningScreen(onBack = { selected = "Home" })
                else -> TvHomeScreen(
                    longVideos = longVideos,
                    error = longError,
                    maintenance = remoteConfig.maintenanceEnabled,
                    message = remoteConfig.maintenanceMessage,
                    onSelect = { selected = it },
                    onWatch = { activeVideo = it; selected = "Watch" }
                )
            }
        }
    }
}

@Composable
private fun TvHomeScreen(
    longVideos: List<JembeeVideo>,
    error: String?,
    maintenance: Boolean,
    message: String,
    onSelect: (String) -> Unit,
    onWatch: (JembeeVideo) -> Unit
) {
    Column(Modifier.fillMaxSize().background(Color(0xFF080B12)).padding(horizontal = 48.dp, vertical = 30.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text("JEMBEE PLAY", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                Text("WATCH  •  LEARN  •  DISCOVER", color = Color(0xFF9AA8BC), fontSize = 11.sp, letterSpacing = 2.sp)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                listOf("Home", "Shorts", "Learning").forEach { item ->
                    Surface(onClick = { onSelect(if (item == "Shorts") "Shorts" else if (item == "Learning") "Learning" else "Home") }, shape = ClickableSurfaceDefaults.shape(), colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF151B27), focusedContainerColor = TvAccent)) {
                        Text(item, Modifier.padding(horizontal = 22.dp, vertical = 14.dp), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    }
                }
            }
        }
        if (maintenance) Text(message.ifBlank { "JEMBEE PLAY is temporarily under maintenance." }, Modifier.padding(top = 12.dp), color = Color(0xFFFF8A80))
        Spacer(Modifier.height(24.dp))
        Surface(onClick = { onSelect("Shorts") }, modifier = Modifier.fillMaxWidth().height(150.dp), shape = ClickableSurfaceDefaults.shape(), colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF123C5B), focusedContainerColor = Color(0xFF1C5270))) {
            Box(Modifier.fillMaxSize().padding(28.dp), contentAlignment = Alignment.CenterStart) {
                Column {
                    Text("JEMBEE SHORTS", color = TvAccent, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text("Open real Shorts feed  ▶", color = Color.White, fontSize = 27.sp, fontWeight = FontWeight.ExtraBold)
                }
            }
        }
        Text("REAL VIDEOS • APPROVED CATALOGUE", Modifier.padding(top = 24.dp, bottom = 12.dp), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 19.sp)
        if (longVideos.isEmpty()) {
            Text(error ?: "No approved free long videos are available yet.", color = Color(0xFF9AA8BC), fontSize = 14.sp)
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(longVideos, key = { it.id }) { video ->
                    Surface(onClick = { onWatch(video) }, modifier = Modifier.fillMaxWidth().height(88.dp), shape = ClickableSurfaceDefaults.shape(), colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF151B27), focusedContainerColor = Color(0xFF17445B))) {
                        Row(Modifier.fillMaxSize().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text("▶", color = TvAccent, fontSize = 28.sp, modifier = Modifier.padding(end = 18.dp))
                            Column(Modifier.weight(1f)) {
                                Text(video.caption.ifBlank { "JEMBEE PLAY video" }, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp, maxLines = 1)
                                Text("${video.creatorName}  •  ${video.views} views", color = Color(0xFF9AA8BC), fontSize = 12.sp)
                            }
                            Text("PLAY", color = TvAccent, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
        Text("Only approved, active, safe and free videos are listed.", Modifier.padding(top = 10.dp), color = Color(0xFF8392A7), fontSize = 11.sp)
    }
}


@Composable
private fun TvLearningScreen(onBack: () -> Unit) {
    var nodes by remember { mutableStateOf<List<SchoolLearningNode>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var stage by remember { mutableIntStateOf(0) }
    var selected by remember { mutableStateOf<List<SchoolLearningNode>>(emptyList()) }
    var answerVideos by remember { mutableStateOf<List<SchoolAnswerVideo>>(emptyList()) }
    var answerLoading by remember { mutableStateOf(false) }
    var answerError by remember { mutableStateOf<String?>(null) }
    var activeAnswer by remember { mutableStateOf<SchoolAnswerVideo?>(null) }
    LaunchedEffect(Unit) { SchoolCatalogClient.fetch { items, message -> nodes = items; error = message; loading = false } }
    LaunchedEffect(stage, selected) {
        if (stage == 6) {
            val questionId = selected.lastOrNull()?.id ?: return@LaunchedEffect
            answerLoading = true
            SchoolAnswerClient.fetch(questionId) { items, message -> answerVideos = items; answerError = message; answerLoading = false }
        } else {
            activeAnswer = null
        }
    }
    val types = listOf("board", "school", "class", "subject", "chapter", "question")
    val titles = listOf("Choose Board", "Choose School", "Choose Class", "Choose Subject", "Choose Chapter", "Choose Question")
    val parent = selected.lastOrNull()?.id
    val type = types.getOrNull(stage)
    val entries = remember(nodes, stage, parent) {
        if (type == null) emptyList() else nodes.filter { it.type == type && it.parentId == if (stage == 0) null else parent }.sortedBy { it.name.lowercase() }
    }
    Column(Modifier.fillMaxSize().background(Color(0xFF080B12)).padding(horizontal = 48.dp, vertical = 28.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("JEMBEE LEARNING", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
            Button(onClick = onBack) { Text("Home") }
        }
        Text(if (stage < 6) titles[stage] else "Selected Question", color = TvAccent, fontSize = 20.sp, modifier = Modifier.padding(vertical = 12.dp))
        if (selected.isNotEmpty()) Text(selected.joinToString("  ›  ") { it.name }, color = Color(0xFF9AA8BC), fontSize = 13.sp)
        if (loading) {
            Text("Loading published learning catalogue…", color = Color.White, modifier = Modifier.padding(24.dp))
        } else if (nodes.isEmpty()) {
            Text(error ?: "Abhi koi published learning entry available nahi hai.", color = Color(0xFF9AA8BC), modifier = Modifier.padding(24.dp))
        } else if (stage < 6) {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                items(entries, key = { it.id }) { node ->
                    Surface(onClick = { selected = selected.take(stage) + node; stage++ }, modifier = Modifier.fillMaxWidth().height(70.dp), shape = ClickableSurfaceDefaults.shape(), colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF151B27), focusedContainerColor = Color(0xFF17445B))) {
                        Row(Modifier.fillMaxSize().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(node.name, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.weight(1f))
                            Text("SELECT  ›", color = TvAccent, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
            if (entries.isEmpty()) Text("Is level ke liye koi published entry nahi hai.", color = Color(0xFF9AA8BC), modifier = Modifier.padding(20.dp))
        } else {
            Text(selected.lastOrNull()?.name ?: "Question selected", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            when {
                activeAnswer != null -> {
                    RealVideoPlayer(activeAnswer!!.streamUrl, Modifier.fillMaxWidth().weight(1f))
                    Text(activeAnswer!!.caption.ifBlank { "Learning answer" }, color = Color.White, modifier = Modifier.padding(12.dp))
                    Button(onClick = { activeAnswer = null }) { Text("‹ Answers") }
                }
                answerLoading -> Text("Loading approved video answers…", color = Color(0xFF9AA8BC), modifier = Modifier.padding(20.dp))
                answerVideos.isEmpty() -> Text(answerError ?: "Is question ke liye abhi approved free video answer nahi hai.", color = Color(0xFF9AA8BC), modifier = Modifier.padding(20.dp))
                else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(answerVideos, key = { it.id }) { answer ->
                        Surface(onClick = { activeAnswer = answer }, modifier = Modifier.fillMaxWidth().height(72.dp), shape = ClickableSurfaceDefaults.shape(), colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF151B27), focusedContainerColor = Color(0xFF17445B))) {
                            Row(Modifier.fillMaxSize().padding(horizontal = 20.dp), verticalAlignment = Alignment.CenterVertically) {
                                Text("▶", color = TvAccent, fontSize = 24.sp, modifier = Modifier.padding(end = 16.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(answer.caption.ifBlank { "Video answer" }, color = Color.White, fontWeight = FontWeight.Bold)
                                    Text(answer.creator, color = Color(0xFF9AA8BC), fontSize = 12.sp)
                                }
                                Text("PLAY", color = TvAccent, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.padding(top = 14.dp)) {
            if (stage > 0) Button(onClick = { stage--; selected = selected.dropLast(1); answerVideos = emptyList(); answerError = null; activeAnswer = null }) { Text("‹ Back") }
            Button(onClick = { stage = 0; selected = emptyList() }) { Text("Reset") }
        }
    }
}


@Composable
private fun TvShortsScreen(videos: List<JembeeVideo>, error: String?, onBack: () -> Unit, onWatch: (JembeeVideo) -> Unit) {
    var index by remember(videos) { mutableIntStateOf(0) }
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        if (videos.isEmpty()) {
            Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("No approved Shorts available", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text(error ?: "Admin se approved, active, safe free Shorts publish karayein.", color = Color(0xFF9AA8BC), modifier = Modifier.padding(12.dp))
            }
        } else {
            val video = videos[index.coerceIn(0, videos.lastIndex)]
            RealVideoPlayer(video.streamUrl, Modifier.fillMaxSize())
            Column(Modifier.align(Alignment.BottomStart).padding(36.dp)) {
                Text(video.creatorName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text(video.caption, color = Color.White, fontSize = 16.sp)
                Text("${index + 1} / ${videos.size}", color = TvAccent, fontSize = 12.sp)
            }
            Row(Modifier.align(Alignment.BottomEnd).padding(30.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Button(onClick = { index = (index - 1).coerceAtLeast(0) }, enabled = index > 0) { Text("‹ Previous") }
                Button(onClick = { index = (index + 1).coerceAtMost(videos.lastIndex) }, enabled = index < videos.lastIndex) { Text("Next ›") }
                Button(onClick = { onWatch(video) }) { Text("Details") }
            }
        }
        Button(onClick = onBack, modifier = Modifier.align(Alignment.TopStart).padding(24.dp)) { Text("‹ Home") }
    }
}

@Composable
private fun TvWatchScreen(video: JembeeVideo?, onBack: () -> Unit) {
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        if (video != null) {
            Column(Modifier.fillMaxSize()) {
                RealVideoPlayer(video.streamUrl, Modifier.fillMaxWidth().weight(1f))
                Column(Modifier.fillMaxWidth().background(Color(0xFF101621)).padding(horizontal = 34.dp, vertical = 18.dp)) {
                    Text(video.caption.ifBlank { "JEMBEE PLAY video" }, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    Text("${video.creatorName}  •  ${video.views} views  •  ${video.likes} likes", color = Color(0xFF9AA8BC), fontSize = 14.sp)
                }
            }
        } else {
            Text("Select a video from Home.", color = Color.White, modifier = Modifier.align(Alignment.Center))
        }
        Button(onClick = onBack, modifier = Modifier.align(Alignment.TopStart).padding(24.dp)) { Text("‹ Home") }
    }
}
