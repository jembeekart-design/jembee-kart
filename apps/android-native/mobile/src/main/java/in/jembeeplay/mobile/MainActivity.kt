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
                    }
                }
            }
        ) { padding ->
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
                    }
                }
            }
        }
        NativeCatalogSection(sectionTitle = "Trending Videos 🔥", sectionSubtitle = "Popular approved videos from JEMBEE PLAY")
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
    }
}
