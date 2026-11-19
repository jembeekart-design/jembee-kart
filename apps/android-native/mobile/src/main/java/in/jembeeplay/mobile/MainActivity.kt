package `in`.jembeeplay.mobile

import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
<<<<<<< HEAD
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
=======
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
>>>>>>> origin/pr-87
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.VideoLibrary
import androidx.compose.material.icons.filled.Cast
import androidx.compose.material.icons.filled.NotificationsNone
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Person
import androidx.compose.ui.draw.clip
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale

<<<<<<< HEAD
private val JembeeBlue = Color(0xFF1677D2)
private val JembeeInk = Color(0xFF111827)
private val JembeeMuted = Color(0xFF778196)
private val JembeeCanvas = Color(0xFFF5F7FB)
=======
private val JembeeAccent = Color(0xFF39C6F4)
private val JembeeBackground = Color(0xFF080B12)
private val JembeeSurface = Color(0xFF151B27)
private val JembeeMuted = Color(0xFF9AA8BC)
>>>>>>> origin/pr-87

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
<<<<<<< HEAD
    var dark by remember { mutableStateOf(true) }
    var selected by remember { mutableStateOf("Home") }
    val scheme = if (dark) darkColorScheme(
        primary = Color(0xFFFF1978), background = Color(0xFF080A12),
        surface = Color(0xFF15131E), onSurface = Color(0xFFF7F4F8)
    ) else lightColorScheme(
        primary = JembeeBlue, background = JembeeCanvas, surface = Color.White,
        onSurface = JembeeInk
    )

    MaterialTheme(colorScheme = scheme) {
=======
    var selected by remember { mutableStateOf("Home") }
    var watchReturn by remember { mutableStateOf("Home") }
    var activeVideo by remember { mutableStateOf<JembeeVideo?>(null) }
    BackHandler(enabled = selected != "Home") {
        selected = when (selected) {
            "Watch" -> watchReturn
            else -> "Home"
        }
    }
    val colors = darkColorScheme(primary = JembeeAccent, background = JembeeBackground, surface = JembeeSurface)
    MaterialTheme(colorScheme = colors) {
>>>>>>> origin/pr-87
        Scaffold(
            containerColor = colors.background,
            bottomBar = {
<<<<<<< HEAD
                if (selected != "Shorts") NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 8.dp
                ) {
                    listOf("Home", "Shorts", "Learn", "You", "Library").forEach { item ->
                        NavigationBarItem(
                            selected = selected == item,
                            onClick = { selected = item },
                            icon = {
                                Icon(when (item) {
                                    "Home" -> Icons.Filled.Home
                                    "Shorts" -> Icons.Filled.PlayArrow
                                    "Learn" -> Icons.Filled.MenuBook
                                    "Library" -> Icons.Filled.VideoLibrary
                                    else -> Icons.Filled.AccountBalanceWallet
                                }, contentDescription = item)
                            },
                            label = { Text(when (item) { "Learn" -> "Learning"; "You" -> "Earn"; else -> item }, fontSize = 11.sp) },
                            alwaysShowLabel = true
                        )
=======
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
>>>>>>> origin/pr-87
                    }
                }
            }
        ) { padding ->
<<<<<<< HEAD
            Column(Modifier.fillMaxSize().padding(padding)) {
                if (selected != "Shorts") {
                    Row(
                        Modifier.fillMaxWidth().padding(start = 18.dp, end = 16.dp, top = 12.dp, bottom = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                            Box(Modifier.size(35.dp).background(
                                Brush.linearGradient(listOf(Color(0xFFFF1978), Color(0xFF8B2BDA))),
                                RoundedCornerShape(10.dp)
                            ), contentAlignment = Alignment.Center) {
                                Icon(Icons.Filled.PlayArrow, contentDescription = "JEMBEE PLAY", tint = Color.White, modifier = Modifier.size(25.dp))
                            }
                            Text("JEMBEE PLAY", fontSize = 19.sp, fontWeight = FontWeight.Black, letterSpacing = 0.2.sp)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            IconButton(onClick = { selected = "Shorts" }) { Icon(Icons.Filled.Cast, contentDescription = "Cast", tint = Color.White) }
                            IconButton(onClick = { selected = "You" }) { Icon(Icons.Filled.NotificationsNone, contentDescription = "Notifications", tint = Color.White) }
                            IconButton(onClick = { selected = "Library" }) { Icon(Icons.Filled.Search, contentDescription = "Search", tint = Color.White) }
                            Surface(onClick = { selected = "You" }, shape = RoundedCornerShape(50), color = Color(0xFF252332)) {
                                Box(Modifier.size(34.dp), contentAlignment = Alignment.Center) {
                                    Icon(Icons.Filled.Person, contentDescription = "Profile", tint = Color.White)
                                }
                            }
=======
            Column(Modifier.fillMaxSize().then(if (selected == "Shorts" || selected == "Watch") Modifier else Modifier.padding(padding))) {
                if (selected != "Shorts" && selected != "Watch") {
                    Row(Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("JEMBEE PLAY", color = Color.White, fontSize = 21.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                            Text("WATCH  •  LEARN  •  CREATE", color = JembeeMuted, fontSize = 9.sp, letterSpacing = 1.5.sp)
>>>>>>> origin/pr-87
                        }
                    }
                }
                if (remoteConfig.maintenanceEnabled) {
<<<<<<< HEAD
                    Surface(color = MaterialTheme.colorScheme.errorContainer, modifier = Modifier.fillMaxWidth()) {
                        Text(
                            remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." },
                            Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            fontSize = 13.sp
                        )
                    }
=======
                    Text(remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." }, Modifier.fillMaxWidth().padding(12.dp), color = colors.error)
>>>>>>> origin/pr-87
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
<<<<<<< HEAD
private fun HomeScreen(onLearn: () -> Unit, onShorts: () -> Unit) {
    var activeCategory by remember { mutableStateOf("All") }
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 20.dp),
        verticalArrangement = Arrangement.spacedBy(15.dp)
    ) {
        LazyRow(contentPadding = PaddingValues(horizontal = 18.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            items(listOf("All", "Learning", "Shorts", "Education", "Craft")) { category ->
                val active = activeCategory == category
                Surface(onClick = { activeCategory = category; if (category == "Learning") onLearn(); if (category == "Shorts") onShorts() },
                    shape = RoundedCornerShape(22.dp), color = if (active) Color(0xFFFF1978) else Color(0xFF171521)) {
                    Text(category, Modifier.padding(horizontal = 17.dp, vertical = 9.dp), color = Color.White,
                        fontSize = 12.sp, fontWeight = if (active) FontWeight.Bold else FontWeight.Medium)
                }
            }
        }
        PremiumHeroBanner(onWatch = onShorts)
        ReferenceQuickActions(onLearn = onLearn, onShorts = onShorts)
        Column(Modifier.fillMaxWidth().padding(horizontal = 18.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Continue Learning", fontSize = 19.sp, fontWeight = FontWeight.Bold)
                TextButton(onClick = onLearn, contentPadding = PaddingValues(0.dp)) { Text("See All  ›", color = Color.White, fontSize = 12.sp) }
            }
            Surface(onClick = onLearn, shape = RoundedCornerShape(17.dp), color = Color(0xFF15131E), modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(Modifier.size(110.dp, 92.dp).clip(RoundedCornerShape(12.dp))
                        .background(Brush.linearGradient(listOf(Color(0xFF103D20), Color(0xFF267A37)))),
                        contentAlignment = Alignment.Center) {
                        Text("🌿", fontSize = 43.sp)
                    }
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                        Text("Explore your Learning Library", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Books  ·  Chapters  ·  Questions", fontSize = 11.sp, color = JembeeMuted)
=======
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
        SectionHeader("Long videos", "From JEMBEE PLAY catalogue")
        when {
            loading -> CircularProgressIndicator(Modifier.padding(20.dp), color = JembeeAccent)
            videos.isEmpty() -> Text(error ?: "Abhi koi approved free long video available nahi hai.", Modifier.padding(18.dp), color = JembeeMuted)
            else -> videos.forEach { video ->
                Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp).background(JembeeSurface, RoundedCornerShape(14.dp)).clickable { onOpenWatch(video) }.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(video.caption.ifBlank { "JEMBEE PLAY video" }, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(video.creatorName, color = JembeeMuted, fontSize = 11.sp)
                        Text("${video.views} views  •  ${video.likes} likes", color = JembeeMuted, fontSize = 10.sp)
>>>>>>> origin/pr-87
                    }
                    Text("▶ Play", color = JembeeAccent, fontWeight = FontWeight.Bold)
                }
            }
        }
<<<<<<< HEAD
        NativeCatalogSection(sectionTitle = "Trending Videos 🔥", sectionSubtitle = "Popular approved videos from JEMBEE PLAY")
=======
        SectionHeader("Learn by class", "Browse published boards, books and questions", onLearn)
        Button(onClick = onLearn, modifier = Modifier.padding(horizontal = 18.dp)) { Text("Explore Learning Catalogue  →") }
>>>>>>> origin/pr-87
    }
}

@Composable
<<<<<<< HEAD
private fun PremiumActionCard(title: String, subtitle: String, symbol: String, modifier: Modifier, onClick: () -> Unit) {
    Surface(
        onClick = onClick, modifier = modifier.height(132.dp),
        shape = RoundedCornerShape(20.dp), color = MaterialTheme.colorScheme.surface,
        tonalElevation = 1.dp
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.SpaceBetween) {
            Text(symbol, color = MaterialTheme.colorScheme.primary, fontSize = 23.sp, fontWeight = FontWeight.Bold)
            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text(subtitle, fontSize = 10.sp, color = JembeeMuted, lineHeight = 14.sp)
=======
private fun SectionHeader(title: String, subtitle: String, onClick: (() -> Unit)? = null) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Column {
            Text(title, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text(subtitle, color = JembeeMuted, fontSize = 10.sp)
        }
        if (onClick != null) {
            TextButton(onClick = onClick) { Text("See all  →", color = JembeeAccent, fontSize = 11.sp) }
        }
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
>>>>>>> origin/pr-87
            }
        }
    }
}

@Composable
<<<<<<< HEAD
private fun ShortsScreen() {
    NativeShortsFeed()
=======
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
>>>>>>> origin/pr-87
}

@Composable
private fun LearnScreen() {
<<<<<<< HEAD
    NativeLearningLibraryScreen()
}

@Composable
private fun LibraryScreen() {
    Column(Modifier.fillMaxSize().padding(26.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text("▣", fontSize = 46.sp, color = MaterialTheme.colorScheme.primary)
        Text("Your Library", fontSize = 24.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 14.dp))
        Text("Saved videos, watch history and downloads will be gathered in one quiet, easy-to-find place.", color = JembeeMuted, fontSize = 13.sp, lineHeight = 19.sp, modifier = Modifier.padding(top = 8.dp))
    }
}

@Composable
private fun YouScreen(onTheme: () -> Unit, dark: Boolean) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        Text("Your space", fontSize = 26.sp, fontWeight = FontWeight.ExtraBold)
        Surface(shape = RoundedCornerShape(22.dp), color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxWidth().padding(top = 18.dp)) {
            Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Surface(shape = RoundedCornerShape(18.dp), color = MaterialTheme.colorScheme.primaryContainer) {
                    Text("J", Modifier.padding(horizontal = 18.dp, vertical = 13.dp), color = MaterialTheme.colorScheme.primary, fontSize = 24.sp, fontWeight = FontWeight.Black)
                }
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("Your JEMBEE PLAY account", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("Sign in and profile sync are being connected.", color = JembeeMuted, fontSize = 12.sp)
                }
            }
        }
        listOf("Your channel", "Watch history", "Downloads", "Help & feedback").forEach { label ->
            Text(label, Modifier.fillMaxWidth().padding(vertical = 17.dp), fontWeight = FontWeight.SemiBold)
            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)
        }
        TextButton(onClick = onTheme) { Text(if (dark) "Switch to light theme" else "Switch to dark theme") }
    }
}


@Composable
private fun PremiumHeroBanner(onWatch: () -> Unit) {
    Box(
        Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(190.dp)
            .background(
                Brush.horizontalGradient(
                    listOf(Color(0xFF17072F), Color(0xFF35106B), Color(0xFF16112D))
                ),
                RoundedCornerShape(20.dp)
            )
    ) {
        AsyncImage(
            model = R.drawable.reference_hero_students,
            contentDescription = "Students featured in the JEMBEE PLAY learning banner",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxHeight().fillMaxWidth(0.53f).align(Alignment.CenterEnd)
        )
        Box(
            Modifier.fillMaxSize().background(
                Brush.horizontalGradient(
                    listOf(Color(0xFF17072F), Color(0xEE35106B), Color(0x2235116B))
                ),
                RoundedCornerShape(20.dp)
            )
        )
        Column(
            Modifier.align(Alignment.CenterStart).fillMaxWidth(0.61f).padding(start = 18.dp, end = 4.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text("JEMBEE PLAY  ▶", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Black, letterSpacing = 0.6.sp)
            Text("Watch  ·  Learn  ·  Create  ·  Share & Earn", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, maxLines = 3, lineHeight = 17.sp)
            Button(
                onClick = onWatch,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF1978)),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 3.dp)
            ) {
                Text("▶  Watch Now", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun ReferenceQuickActions(onLearn: () -> Unit, onShorts: () -> Unit) {
    val actions = listOf(
        Triple("Learning\nLibrary", "▤", Color(0xFF29114E)) to onLearn,
        Triple("Shorts", "▶", Color(0xFF4A102B)) to onShorts,
        Triple("Live", "◉", Color(0xFF103B43)) to null,
        Triple("Create\nUpload", "☁", Color(0xFF103F45)) to null,
        Triple("Earn\n& Rewards", "▥", Color(0xFF443516)) to null
    )
    LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
        items(actions) { (entry, action) ->
            val (label, symbol, tileColor) = entry
            Surface(onClick = { action?.invoke() }, enabled = action != null,
                shape = RoundedCornerShape(17.dp), color = tileColor,
                modifier = Modifier.width(76.dp).height(102.dp)) {
                Column(Modifier.fillMaxSize().padding(7.dp), horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center) {
                    Text(symbol, color = when(label) {
                        "Learning\nLibrary" -> Color(0xFFD9A4FF)
                        "Shorts" -> Color(0xFFFF1978)
                        "Live" -> Color(0xFF45DCE7)
                        "Create\nUpload" -> Color(0xFF57E5E8)
                        else -> Color(0xFFFFC53D)
                    }, fontSize = 29.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(6.dp))
                    Text(label, color = Color.White, fontSize = 10.sp, lineHeight = 12.sp, fontWeight = FontWeight.SemiBold,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                }
            }
        }
=======
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
>>>>>>> origin/pr-87
    }
}
