package `in`.jembeeplay.mobile

import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val JembeeAccent = Color(0xFF39C6F4)
private val JembeeBackground = Color(0xFF080B12)
private val JembeeSurface = Color(0xFF151B27)
private val JembeeMuted = Color(0xFF9AA8BC)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setContent { JembeeMobileApp() }
    }
}

@Composable
private fun JembeeMobileApp() {
    val context = LocalContext.current
    var remoteConfig by remember { mutableStateOf(JembeeRemoteConfig()) }
    LaunchedEffect(Unit) { RemoteConfigClient.fetch(context) { remoteConfig = it } }
    var selected by remember { mutableStateOf("Home") }
    var watchReturn by remember { mutableStateOf("Home") }
    var activeVideo by remember { mutableStateOf<JembeeVideo?>(null) }
    BackHandler(enabled = selected != "Home") {
        selected = when (selected) {
            "Watch" -> watchReturn
            else -> "Home"
        }
    }
    var dark by remember { mutableStateOf(true) }
    val colors = darkColorScheme(primary = JembeeAccent, background = JembeeBackground, surface = JembeeSurface)
    MaterialTheme(colorScheme = colors) {
        Scaffold(
            containerColor = colors.background,
            bottomBar = {
                if (selected != "Shorts" && selected != "Watch") {
                    NavigationBar(containerColor = Color(0xFF101621), contentColor = Color.White) {
                        listOf("Home", "Shorts", "Learn", "Library", "You").forEach { item ->
                            NavigationBarItem(
                                selected = selected == item,
                                onClick = { selected = item },
                                icon = { Text(when (item) { "Home" -> "⌂"; "Shorts" -> "▶"; "Learn" -> "▤"; "Library" -> "▣"; else -> "●" }, fontSize = 19.sp, fontWeight = FontWeight.Bold) },
                                label = { Text(item, fontSize = 10.sp) },
                                colors = NavigationBarItemDefaults.colors(selectedIconColor = JembeeAccent, selectedTextColor = JembeeAccent, indicatorColor = Color(0xFF18384A), unselectedIconColor = JembeeMuted, unselectedTextColor = JembeeMuted)
                            )
                        }
                    }
                }
            }
        ) { padding ->
            Column(Modifier.fillMaxSize().then(if (selected == "Shorts" || selected == "Watch") Modifier else Modifier.padding(padding))) {
                if (selected != "Shorts" && selected != "Watch") {
                    Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("JEMBEE PLAY", color = Color.White, fontSize = 21.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                            Text("WATCH  •  LEARN  •  CREATE", color = JembeeMuted, fontSize = 9.sp, letterSpacing = 1.5.sp)
                        }
                        TextButton(onClick = { dark = !dark }) { Text(if (dark) "☼" else "☾", fontSize = 20.sp) }
                    }
                }
                if (remoteConfig.maintenanceEnabled) {
                    Text(remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." }, Modifier.fillMaxWidth().padding(12.dp), color = colors.error)
                }
                when (selected) {
                    "Home" -> HomeScreen(onOpenShorts = { selected = "Shorts" }, onOpenWatch = { video -> activeVideo = video; watchReturn = "Home"; selected = "Watch" }, onLearn = { selected = "Learn" })
                    "Shorts" -> ShortsScreen(onBack = { selected = "Home" }, onOpenWatch = { video -> activeVideo = video; watchReturn = "Shorts"; selected = "Watch" })
                    "Watch" -> WatchScreen(video = activeVideo, onBack = { selected = watchReturn })
                    "Learn" -> LearnScreen()
                    "Library" -> SimpleScreen("Your Library", "Saved videos, watch history and downloads")
                    else -> SimpleScreen("Your profile", "Sign in to manage your JEMBEE PLAY account")
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(onOpenShorts: () -> Unit, onOpenWatch: (JembeeVideo) -> Unit, onLearn: () -> Unit) {
    var videos by remember { mutableStateOf<List<JembeeVideo>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        VideoCatalogClient.fetch("long") { items, message -> videos = items; error = message; loading = false }
    }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 20.dp)) {
        SectionHeader("Shorts for you", "Real approved videos", onOpenShorts)
        Button(onClick = onOpenShorts, modifier = Modifier.padding(horizontal = 18.dp)) { Text("Open Shorts feed  ▶") }
        SectionHeader("Long videos", "From JEMBEE PLAY catalogue", onClick = {})
        when {
            loading -> CircularProgressIndicator(Modifier.padding(20.dp), color = JembeeAccent)
            videos.isEmpty() -> Text(error ?: "Abhi koi approved free long video available nahi hai.", Modifier.padding(18.dp), color = JembeeMuted)
            else -> videos.forEach { video ->
                Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp).background(JembeeSurface, RoundedCornerShape(14.dp)).clickable { onOpenWatch(video) }.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(video.caption.ifBlank { "JEMBEE PLAY video" }, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(video.creatorName, color = JembeeMuted, fontSize = 11.sp)
                        Text("${video.views} views  •  ${video.likes} likes", color = JembeeMuted, fontSize = 10.sp)
                    }
                    Text("▶ Play", color = JembeeAccent, fontWeight = FontWeight.Bold)
                }
            }
        }
        SectionHeader("Learn by class", "Browse published boards, books and questions", onLearn)
        Button(onClick = onLearn, modifier = Modifier.padding(horizontal = 18.dp)) { Text("Explore Learning Catalogue  →") }
    }
}

@Composable
private fun SectionHeader(title: String, subtitle: String, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Column {
            Text(title, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text(subtitle, color = JembeeMuted, fontSize = 10.sp)
        }
        TextButton(onClick = onClick) { Text("See all  →", color = JembeeAccent, fontSize = 11.sp) }
    }
}

@Composable
private fun ShortsScreen(onBack: () -> Unit, onOpenWatch: (JembeeVideo) -> Unit) {
    var videos by remember { mutableStateOf<List<JembeeVideo>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    LaunchedEffect(Unit) { VideoCatalogClient.fetch("short") { items, message -> videos = items; error = message; loading = false } }
    val pagerState = rememberPagerState(pageCount = { videos.size })
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        when {
            loading -> CircularProgressIndicator(Modifier.align(Alignment.Center), color = JembeeAccent)
            videos.isEmpty() -> Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Real Shorts abhi available nahi hain", color = Color.White, fontWeight = FontWeight.Bold)
                Text(error ?: "Admin se approved, active, safe free Shorts publish karayein.", color = JembeeMuted, modifier = Modifier.padding(12.dp))
                TextButton(onClick = onBack) { Text("Back") }
            }
            else -> VerticalPager(state = pagerState, modifier = Modifier.fillMaxSize(), beyondViewportPageCount = 1) { page ->
                val video = videos[page]
                Box(Modifier.fillMaxSize().background(Color.Black)) {
                    RealVideoPlayer(video.streamUrl, Modifier.fillMaxSize(), autoplay = pagerState.currentPage == page)
                    Column(Modifier.align(Alignment.BottomStart).padding(start = 18.dp, end = 82.dp, bottom = 32.dp)) {
                        Text(video.creatorName, color = Color.White, fontWeight = FontWeight.Bold)
                        Text(video.caption, color = Color.White, fontSize = 15.sp)
                        Text("${video.views} views", color = Color.White.copy(alpha = .75f), fontSize = 11.sp)
                    }
                    TextButton(onClick = onBack, modifier = Modifier.align(Alignment.TopStart).padding(10.dp)) { Text("‹ Back", color = Color.White) }
                    Text("SHORTS  •  ${page + 1}/${videos.size}", Modifier.align(Alignment.TopCenter).padding(top = 22.dp), color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    TextButton(onClick = { onOpenWatch(video) }, modifier = Modifier.align(Alignment.BottomEnd).padding(12.dp)) { Text("Open details", color = Color.White) }
                }
            }
        }
    }
}

@Composable
private fun WatchScreen(video: JembeeVideo?, onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(JembeeBackground)) {
        if (video == null) {
            Text("Home se koi video select karein.", color = Color.White, modifier = Modifier.padding(24.dp))
        } else {
            RealVideoPlayer(video.streamUrl, Modifier.fillMaxWidth().aspectRatio(16f / 9f))
            Column(Modifier.padding(18.dp)) {
                Text(video.caption.ifBlank { "JEMBEE PLAY video" }, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("${video.creatorName}  •  ${video.views} views", color = JembeeMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 6.dp))
                Text("${video.likes} likes", color = JembeeMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 8.dp))
            }
        }
        TextButton(onClick = onBack) { Text("‹ Back", color = JembeeAccent) }
    }
}

@Composable
private fun LearnScreen() {
    var nodes by remember { mutableStateOf<List<SchoolLearningNode>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var stage by remember { mutableIntStateOf(0) }
    var selected by remember { mutableStateOf<List<SchoolLearningNode>>(emptyList()) }
    var answers by remember { mutableStateOf<List<SchoolAnswerVideo>>(emptyList()) }
    var answersLoading by remember { mutableStateOf(false) }
    var activeAnswer by remember { mutableStateOf<SchoolAnswerVideo?>(null) }
    LaunchedEffect(Unit) { SchoolCatalogClient.fetch { items, message -> nodes = items; error = message; loading = false } }
    val types = listOf("board", "school", "class", "subject", "chapter", "question")
    val titles = listOf("Choose Board", "Choose School", "Choose Class", "Choose Subject", "Choose Chapter", "Choose Question", "Video Answers")
    val parent = selected.lastOrNull()?.id
    val currentType = types.getOrNull(stage)
    val entries = remember(nodes, stage, parent) {
        if (currentType == null) emptyList()
        else nodes.filter { node -> node.type == currentType && node.parentId == if (stage == 0) null else parent }.sortedBy { it.name.lowercase() }
    }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp)) {
        Text("Learn with JEMBEE", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
        Text("Board  •  School  •  Class  •  Subject  •  Chapter  •  Question", color = JembeeMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 5.dp, bottom = 14.dp))
        if (activeAnswer != null) {
            TextButton(onClick = { activeAnswer = null }) { Text("‹ Back to answers", color = JembeeAccent) }
            RealVideoPlayer(activeAnswer!!.streamUrl, Modifier.fillMaxWidth().aspectRatio(16f / 9f))
            Text(activeAnswer!!.caption.ifBlank { "Video answer" }, color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 12.dp))
            Text(activeAnswer!!.creator, color = JembeeMuted, fontSize = 11.sp)
        } else {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                if (stage > 0) TextButton(onClick = { stage--; selected = selected.dropLast(1); answers = emptyList(); activeAnswer = null; error = null }) { Text("‹ Back", color = JembeeAccent) }
                Text(titles[stage], color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Spacer(Modifier.weight(1f))
                if (stage > 0) TextButton(onClick = { stage = 0; selected = emptyList(); answers = emptyList() }) { Text("Reset", color = JembeeMuted) }
            }
            selected.forEach { node -> Text("${node.type.uppercase()}: ${node.name}", color = JembeeMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp)) }
            when {
                loading -> CircularProgressIndicator(Modifier.padding(20.dp), color = JembeeAccent)
                error != null && nodes.isEmpty() -> Text(error ?: "Learning catalogue unavailable", color = JembeeMuted, modifier = Modifier.padding(vertical = 16.dp))
                stage < 6 && entries.isEmpty() -> Text(if (stage == 0) "Abhi koi published Board available nahi hai." else "Is level ke liye abhi published entry nahi hai.", color = JembeeMuted, modifier = Modifier.padding(vertical = 18.dp))
                stage < 6 -> entries.forEach { node ->
                    Row(
                        Modifier.fillMaxWidth().padding(vertical = 5.dp).background(JembeeSurface, RoundedCornerShape(12.dp))
                            .clickable {
                                selected = selected.take(stage) + node
                                stage++
                                error = null
                                if (stage == 6) {
                                    answersLoading = true
                                    SchoolAnswerClient.fetch(node.id) { found, message -> answers = found; error = message; answersLoading = false }
                                }
                            }.padding(15.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(node.name, color = Color.White, fontWeight = FontWeight.Bold)
                            Text(node.type.replaceFirstChar { it.uppercase() }, color = JembeeMuted, fontSize = 10.sp)
                        }
                        Text("›", color = JembeeAccent, fontSize = 22.sp)
                    }
                }
                answersLoading -> CircularProgressIndicator(Modifier.padding(20.dp), color = JembeeAccent)
                answers.isNotEmpty() -> answers.forEach { video ->
                    Row(Modifier.fillMaxWidth().padding(vertical = 5.dp).background(JembeeSurface, RoundedCornerShape(12.dp)).clickable { activeAnswer = video }.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(video.caption.ifBlank { "Video answer" }, color = Color.White, fontWeight = FontWeight.Bold)
                            Text(video.creator, color = JembeeMuted, fontSize = 10.sp)
                        }
                        Text("▶ Play", color = JembeeAccent, fontWeight = FontWeight.Bold)
                    }
                }
                else -> Text(error ?: "Is question ke liye abhi koi approved free video answer nahi hai.", color = JembeeMuted, modifier = Modifier.padding(vertical = 18.dp))
            }
        }
    }
}

@Composable
private fun SimpleScreen(title: String, subtitle: String) {
    Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text(title, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text(subtitle, color = JembeeMuted, fontSize = 12.sp, modifier = Modifier.padding(12.dp))
    }
}
