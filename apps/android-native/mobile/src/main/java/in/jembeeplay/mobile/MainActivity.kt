package `in`.jembeeplay.mobile

import android.os.Bundle
import android.view.ViewGroup
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import coil.compose.AsyncImage
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val JembeeBlue = Color(0xFF0878D1)
private val Ink = Color(0xFF171923)
private val Muted = Color(0xFF777B86)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { JembeeMobileApp() }
    }
}

@Composable
private fun JembeeMobileApp() {
    val context = LocalContext.current
    var remoteConfig by remember { mutableStateOf(JembeeRemoteConfig()) }
    LaunchedEffect(Unit) { RemoteConfigClient.fetch(context) { remoteConfig = it } }
    var dark by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf("Home") }
    val scheme = if (dark) darkColorScheme(primary = Color(0xFF69C5FF), background = Color(0xFF101116), surface = Color(0xFF1B1D25)) else lightColorScheme(primary = JembeeBlue, background = Color(0xFFF8F8FA), surface = Color.White)

    MaterialTheme(colorScheme = scheme) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            bottomBar = {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                    listOf("Home", "Shorts", "Learn", "Library", "You").forEach { item ->
                        NavigationBarItem(
                            selected = selected == item,
                            onClick = { selected = item },
                            icon = { Text(when (item) { "Home" -> "⌂"; "Shorts" -> "▶"; "Learn" -> "▤"; "Library" -> "▣"; else -> "●" }, fontSize = 19.sp, fontWeight = FontWeight.Bold) },
                            label = { Text(item) }
                        )
                    }
                }
            }
        ) { padding ->
            Column(Modifier.fillMaxSize().padding(padding)) {
                if (selected != "Shorts") {
                    Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("JEMBEE PLAY", fontSize = 22.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.onBackground)
                            Text("WATCH · LEARN · CREATE · SHARE", fontSize = 10.sp, letterSpacing = 1.sp, color = Muted)
                        }
                        TextButton(onClick = { dark = !dark }) { Text(if (dark) "Light" else "Dark") }
                    }
                }
                if (remoteConfig.maintenanceEnabled) {
                    Text(remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." }, Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 8.dp), color = MaterialTheme.colorScheme.error)
                }
                when (selected) {
                    "Home" -> HomeScreen(onLearn = { selected = "Learn" }, onShorts = { selected = "Shorts" })
                    "Shorts" -> ShortsScreen()
                    "Learn" -> LearnScreen()
                    "Library" -> LibraryScreen()
                    else -> YouScreen(onTheme = { dark = !dark }, dark = dark)
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(onLearn: () -> Unit, onShorts: () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 18.dp)) {
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("For you", "Learning", "Trending", "Music", "Technology", "News").forEachIndexed { index, label ->
                FilterChip(selected = index == 0, onClick = { if (label == "Learning") onLearn() }, label = { Text(label) })
            }
        }
        NativeCatalogSection()
        Text("Featured for you", Modifier.padding(start = 18.dp, top = 14.dp, bottom = 10.dp), fontSize = 19.sp, fontWeight = FontWeight.Bold)
        Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp)) {
            ThumbnailCard("Learn something new every day", "JEMBEE PLAY • FEATURED", Modifier.fillMaxWidth().height(214.dp))
        }
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 12.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Continue watching", fontSize = 19.sp, fontWeight = FontWeight.Bold)
            TextButton(onClick = onLearn) { Text("See all") }
        }
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            MiniVideo("Your next lesson", "Continue learning", Color(0xFF5D6BCB))
            MiniVideo("Science explained", "Education • 12 min", Color(0xFF168B87))
            MiniVideo("Maths revision", "Class 7 • 8 min", Color(0xFFB66C36))
        }
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Learning by class", fontSize = 19.sp, fontWeight = FontWeight.Bold)
            TextButton(onClick = onLearn) { Text("Explore") }
        }
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf("Class 6", "Class 7", "Class 8", "Class 9", "Class 10").forEachIndexed { i, name ->
                Surface(onClick = onLearn, shape = RoundedCornerShape(16.dp), color = MaterialTheme.colorScheme.surface, modifier = Modifier.width(118.dp).height(76.dp)) {
                    Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.SpaceBetween) {
                        Text("JEMBEE LEARN", fontSize = 9.sp, color = JembeeBlue, fontWeight = FontWeight.Bold)
                        Text(name, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }
        }
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Shorts for you", fontSize = 19.sp, fontWeight = FontWeight.Bold)
            TextButton(onClick = onShorts) { Text("View Shorts") }
        }
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            listOf("Quick science facts", "One-minute maths", "Daily knowledge").forEachIndexed { i, title ->
                Box(Modifier.width(132.dp).height(190.dp)) { ThumbnailCard(title, "SHORTS • PREVIEW", Modifier.fillMaxSize(), listOf(Color(0xFF713F9E), Color(0xFF187F9A), Color(0xFFB45B55))[i]) }
            }
        }
        Text("Discover creators", Modifier.padding(start = 18.dp, top = 20.dp, bottom = 10.dp), fontSize = 19.sp, fontWeight = FontWeight.Bold)
        Text("Find teachers and creators to follow.", Modifier.padding(horizontal = 18.dp), color = Muted)
        Text("Preview content only · Live video services are not connected yet", Modifier.padding(18.dp), fontSize = 11.sp, color = Muted)
    }
}

@Composable
private fun ThumbnailCard(title: String, eyebrow: String, modifier: Modifier, accent: Color = Color(0xFF394B78)) {
    Box(modifier.background(Brush.linearGradient(listOf(accent, accent.copy(alpha = 0.72f), Color(0xFF171923))), RoundedCornerShape(18.dp))) {
        Column(Modifier.align(Alignment.BottomStart).padding(16.dp)) {
            Text(eyebrow, color = Color.White.copy(alpha = 0.8f), fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
            Text(title, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.ExtraBold)
        }
        Text("▶", Modifier.align(Alignment.Center), color = Color.White, fontSize = 34.sp)
    }
}

@Composable
private fun MiniVideo(title: String, subtitle: String, accent: Color) {
    Column(Modifier.width(218.dp)) {
        ThumbnailCard(title, "JEMBEE PLAY", Modifier.fillMaxWidth().height(122.dp), accent)
        Text(title, Modifier.padding(top = 8.dp), fontWeight = FontWeight.Bold, fontSize = 14.sp)
        Text(subtitle, color = Muted, fontSize = 12.sp)
    }
}

@Composable
private fun ShortsScreen() {
    var videos by remember { mutableStateOf<List<MobileCatalogVideo>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var failed by remember { mutableStateOf(false) }
    var selected by remember { mutableIntStateOf(0) }
    var playing by remember { mutableStateOf<MobileCatalogVideo?>(null) }

    fun refresh() {
        loading = true
        MobileVideoCatalogClient.fetch { result ->
            result.onSuccess { videos = it; selected = 0; failed = false }
                .onFailure { failed = true }
            loading = false
        }
    }
    LaunchedEffect(Unit) { refresh() }

    Column(Modifier.fillMaxSize().padding(horizontal = 14.dp, vertical = 8.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("JEMBEE SHORTS", fontSize = 20.sp, fontWeight = FontWeight.Black)
            Text("For you · Approved videos", color = Muted, fontSize = 11.sp)
        }
        Spacer(Modifier.height(10.dp))
        when {
            videos.isNotEmpty() -> {
                val video = videos[selected.coerceIn(videos.indices)]
                Box(Modifier.weight(1f).fillMaxWidth().background(Color.Black, RoundedCornerShape(20.dp))) {
                    AsyncImage(model = video.thumbnailUrl, contentDescription = video.caption, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                    Column(Modifier.align(Alignment.BottomStart).fillMaxWidth().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xDD000000)))).padding(16.dp)) {
                        Text(video.creator, color = Color.White, fontWeight = FontWeight.Bold)
                        Text(video.caption, color = Color.White, maxLines = 3)
                        Text("${video.views} views", color = Color.White.copy(alpha = 0.8f), fontSize = 11.sp)
                    }
                    Column(Modifier.align(Alignment.CenterEnd).padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("♡", color = Color.White, fontSize = 28.sp)
                        Text(video.likes.toString(), color = Color.White, fontSize = 11.sp)
                        Spacer(Modifier.height(18.dp))
                        Text("▢", color = Color.White, fontSize = 26.sp)
                        Text(video.comments.toString(), color = Color.White, fontSize = 11.sp)
                    }
                    Text("▶  Play video", Modifier.align(Alignment.Center).background(Color(0x99000000), RoundedCornerShape(30.dp)).clickable { playing = video }.padding(horizontal = 18.dp, vertical = 10.dp), color = Color.White)
                    TextButton(onClick = { selected = (selected - 1).coerceAtLeast(0) }, modifier = Modifier.align(Alignment.CenterStart)) { Text("‹", color = Color.White, fontSize = 28.sp) }
                    TextButton(onClick = { selected = (selected + 1).coerceAtMost(videos.lastIndex) }, modifier = Modifier.align(Alignment.CenterEnd).padding(end = 46.dp)) { Text("›", color = Color.White, fontSize = 28.sp) }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("Video ${selected + 1} of ${videos.size}", color = Muted, fontSize = 11.sp)
                    TextButton(onClick = { selected = (selected + 1) % videos.size }) { Text("Next video") }
                }
                playing?.let { activeVideo -> MobileVideoPlayer(video = activeVideo, onClose = { playing = null }) }
            }
            loading -> Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            failed -> Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Approved videos could not be loaded.", color = Muted)
                    TextButton(onClick = { refresh() }) { Text("Retry") }
                }
            }
            else -> Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                Text("No approved free videos are available yet.", color = Muted)
            }
        }
    }
}

@Composable
private fun MobileVideoPlayer(video: MobileCatalogVideo, onClose: () -> Unit) {
    val context = LocalContext.current
    {
        val player = remember(video.id) {
            ExoPlayer.Builder(context).build().apply {
                setMediaItem(MediaItem.fromUri(video.playbackUrl))
                prepare()
                playWhenReady = true
            }
        }
        DisposableEffect(player) { onDispose { player.release() } }
        Dialog(onDismissRequest = onClose) {
            Column(Modifier.fillMaxWidth().background(Color.Black, RoundedCornerShape(16.dp)).padding(12.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(video.caption, color = Color.White, modifier = Modifier.weight(1f), maxLines = 2)
                    TextButton(onClick = onClose) { Text("Close") }
                }
                AndroidView(factory = { ctx -> PlayerView(ctx).apply {
                    this.player = player
                    useController = true
                    layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
                } }, modifier = Modifier.fillMaxWidth().height(260.dp))
            }
        }
    }
}

@Composable
private fun LearnScreen() {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp)) {
        Text("Learn with JEMBEE", fontSize = 24.sp, fontWeight = FontWeight.Black)
        Text("Choose your curriculum and continue learning.", color = Muted, modifier = Modifier.padding(top = 4.dp, bottom = 18.dp))
        OutlinedTextField(value = "", onValueChange = {}, readOnly = true, modifier = Modifier.fillMaxWidth(), label = { Text("Search classes, subjects or chapters") }, placeholder = { Text("Search learning library") })
        listOf("CBSE", "ICSE", "JAC", "Other boards").forEach { board ->
            Text(board, Modifier.padding(top = 18.dp, bottom = 8.dp), fontWeight = FontWeight.Bold, fontSize = 18.sp)
            listOf("Class 6", "Class 7", "Class 8", "Class 9", "Class 10").forEach { grade ->
                Surface(shape = RoundedCornerShape(14.dp), color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Row(Modifier.padding(16.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(grade, fontWeight = FontWeight.SemiBold)
                        Text("Subjects  →", color = JembeeBlue)
                    }
                }
            }
        }
        Text("Catalog preview · Board and lesson data integration pending", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 12.dp))
    }
}

@Composable
private fun LibraryScreen() {
    Column(Modifier.fillMaxSize().padding(22.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text("▣", fontSize = 48.sp, color = JembeeBlue)
        Text("Your Library", fontSize = 24.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 12.dp))
        Text("Saved videos, history and downloads will live here.", color = Muted, modifier = Modifier.padding(top = 8.dp))
        Text("Sign in and video services are not connected in this preview.", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 14.dp))
    }
}

@Composable
private fun YouScreen(onTheme: () -> Unit, dark: Boolean) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        Text("You", fontSize = 28.sp, fontWeight = FontWeight.Black)
        Surface(shape = RoundedCornerShape(18.dp), color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxWidth().padding(top = 18.dp)) {
            Column(Modifier.padding(18.dp)) {
                Text("J", color = JembeeBlue, fontSize = 30.sp, fontWeight = FontWeight.Black)
                Text("Your JEMBEE PLAY profile", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text("Sign in to manage your account and creator profile.", color = Muted, fontSize = 12.sp)
            }
        }
        listOf("Your channel", "Watch history", "Downloads", "Settings", "Help & feedback").forEach { label ->
            Text(label, Modifier.fillMaxWidth().padding(vertical = 16.dp), fontWeight = FontWeight.SemiBold)
            HorizontalDivider()
        }
        TextButton(onClick = onTheme) { Text(if (dark) "Switch to light theme" else "Switch to dark theme") }
        Text("Account integration pending", color = Muted, fontSize = 11.sp)
    }
}
