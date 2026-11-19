package `in`.jembeeplay.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import coil.compose.AsyncImage
import androidx.compose.ui.layout.ContentScale

private val JembeeBlue = Color(0xFF1677D2)
private val JembeeInk = Color(0xFF111827)
private val JembeeMuted = Color(0xFF778196)
private val JembeeCanvas = Color(0xFFF5F7FB)

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
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            bottomBar = {
                if (selected != "Shorts") NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 8.dp
                ) {
                    listOf("Home", "Shorts", "Learn", "You", "Library").forEach { item ->
                        NavigationBarItem(
                            selected = selected == item,
                            onClick = { selected = item },
                            icon = {
                                Text(
                                    when (item) { "Home" -> "⌂"; "Shorts" -> "▶"; "Learn" -> "▤"; "Library" -> "▣"; else -> "●" },
                                    fontSize = 20.sp, fontWeight = FontWeight.Bold
                                )
                            },
                            label = { Text(when (item) { "Learn" -> "Learning"; "You" -> "Earn"; else -> item }, fontSize = 11.sp) },
                            alwaysShowLabel = true
                        )
                    }
                }
            }
        ) { padding ->
            Column(Modifier.fillMaxSize().padding(padding)) {
                if (selected != "Shorts") {
                    Row(
                        Modifier.fillMaxWidth().padding(start = 20.dp, end = 16.dp, top = 16.dp, bottom = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                            Box(
                                Modifier.size(34.dp).background(
                                    Brush.linearGradient(listOf(Color(0xFFFF1978), Color(0xFF8B2BDA))),
                                    RoundedCornerShape(10.dp)
                                ),
                                contentAlignment = Alignment.Center
                            ) { Text("▶", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Black) }
                            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                Text("JEMBEE PLAY", fontSize = 19.sp, fontWeight = FontWeight.Black, letterSpacing = 0.2.sp)
                                Text("WATCH  ·  LEARN  ·  CREATE", fontSize = 8.sp, letterSpacing = 1.1.sp, color = JembeeMuted)
                            }
                        }
                        Surface(
                            onClick = { selected = "You" },
                            shape = RoundedCornerShape(50),
                            color = MaterialTheme.colorScheme.surfaceVariant
                        ) {
                            Text("J", Modifier.padding(horizontal = 13.dp, vertical = 8.dp), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Black)
                        }
                    }
                }
                if (remoteConfig.maintenanceEnabled) {
                    Surface(color = MaterialTheme.colorScheme.errorContainer, modifier = Modifier.fillMaxWidth()) {
                        Text(
                            remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." },
                            Modifier.padding(horizontal = 18.dp, vertical = 10.dp),
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            fontSize = 13.sp
                        )
                    }
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
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 22.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        LazyRow(
            contentPadding = PaddingValues(horizontal = 18.dp),
            horizontalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            items(listOf("All", "Learning", "Shorts", "Education", "Craft")) { category ->
                val active = category == "All"
                Surface(
                    shape = RoundedCornerShape(22.dp),
                    color = if (active) Color(0xFFFF1978) else MaterialTheme.colorScheme.surface,
                    tonalElevation = if (active) 0.dp else 1.dp
                ) {
                    Text(category, Modifier.padding(horizontal = 17.dp, vertical = 9.dp), color = Color.White, fontSize = 12.sp, fontWeight = if (active) FontWeight.Bold else FontWeight.Medium)
                }
            }
        }
        PremiumHeroBanner(onWatch = onShorts)
        ReferenceQuickActions(onLearn = onLearn, onShorts = onShorts)
        Column(Modifier.fillMaxWidth().padding(horizontal = 18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Continue Learning", fontSize = 19.sp, fontWeight = FontWeight.Bold)
                Text("See All  ›", color = MaterialTheme.colorScheme.primary, fontSize = 12.sp)
            }
            Surface(shape = RoundedCornerShape(17.dp), color = MaterialTheme.colorScheme.surface, modifier = Modifier.fillMaxWidth()) {
                Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    Box(Modifier.size(76.dp, 66.dp).background(Color(0xFF183C27), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) {
                        Text("▤", color = Color(0xFF8BE28B), fontSize = 30.sp)
                    }
                    Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Your learning progress", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text("Sign in to sync completed chapters and continue where you left off.", fontSize = 11.sp, color = JembeeMuted, lineHeight = 15.sp)
                    }
                }
            }
        }
        NativeCatalogSection(sectionTitle = "Trending Videos 🔥", sectionSubtitle = "Recently approved videos from JEMBEE PLAY")
        Surface(
            onClick = onLearn,
            shape = RoundedCornerShape(22.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
        ) {
            Row(Modifier.padding(18.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Box(
                    Modifier.size(48.dp).background(
                        Brush.linearGradient(listOf(Color(0xFF1B83DB), Color(0xFF73B8F2))),
                        RoundedCornerShape(16.dp)
                    ),
                    contentAlignment = Alignment.Center
                ) { Text("✦", color = Color.White, fontSize = 24.sp) }
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                    Text("Learning Library", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("Find a book, chapter or question", fontSize = 12.sp, color = JembeeMuted)
                }
                Text("→", color = MaterialTheme.colorScheme.primary, fontSize = 23.sp)
            }
        }
    }
}

@Composable
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
            }
        }
    }
}

@Composable
private fun ShortsScreen() {
    NativeShortsFeed()
}

@Composable
private fun LearnScreen() {
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
    var heroThumbnail by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        VideoCatalogClient.fetch { result ->
            result.onSuccess { page -> heroThumbnail = page.videos.firstOrNull()?.thumbnailUrl }
        }
    }
    Box(
        Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(178.dp)
            .background(
                Brush.horizontalGradient(
                    listOf(Color(0xFF17072F), Color(0xFF35106B), Color(0xFF16112D))
                ),
                RoundedCornerShape(20.dp)
            )
    ) {
        if (heroThumbnail != null) {
            AsyncImage(
                model = heroThumbnail,
                contentDescription = "Featured approved JEMBEE PLAY video",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
        }
        Box(
            Modifier.fillMaxSize().background(
                Brush.horizontalGradient(
                    listOf(Color(0xEE17072F), Color(0xCC35106B), Color(0x4416112D))
                ),
                RoundedCornerShape(20.dp)
            )
        )
        Column(
            Modifier.align(Alignment.CenterStart).padding(horizontal = 20.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text("JEMBEE PLAY  ▶", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
            Text("Watch  ·  Learn  ·  Create  ·  Share  ·  Earn", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold, maxLines = 2)
            Text("Discover videos from the JEMBEE PLAY community", color = Color(0xFFE5DDF5), fontSize = 11.sp)
            Button(
                onClick = onWatch,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF1978)),
                contentPadding = PaddingValues(horizontal = 18.dp, vertical = 4.dp)
            ) {
                Text("▶  Watch Now", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun ReferenceQuickActions(onLearn: () -> Unit, onShorts: () -> Unit) {
    val actions = listOf(
        Triple("Learning Library", "▤", onLearn),
        Triple("Shorts", "▶", onShorts),
        Triple("Live", "◉", null),
        Triple("Create Upload", "☁", null),
        Triple("Earn & Rewards", "▥", null)
    )
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(actions) { (label, symbol, action) ->
            Surface(
                onClick = { action?.invoke() },
                enabled = action != null,
                shape = RoundedCornerShape(17.dp),
                color = MaterialTheme.colorScheme.surface,
                modifier = Modifier.width(78.dp).height(96.dp)
            ) {
                Column(
                    Modifier.fillMaxSize().padding(8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(symbol, color = MaterialTheme.colorScheme.primary, fontSize = 25.sp, fontWeight = FontWeight.Bold)
                    Spacer(Modifier.height(6.dp))
                    Text(label, color = MaterialTheme.colorScheme.onSurface, fontSize = 10.sp, lineHeight = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
