package `in`.jembeeplay.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
    var dark by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf("Home") }
    val scheme = if (dark) darkColorScheme(
        primary = Color(0xFF79BFFF), background = Color(0xFF0D1119),
        surface = Color(0xFF171E2A), onSurface = Color(0xFFF2F5FA)
    ) else lightColorScheme(
        primary = JembeeBlue, background = JembeeCanvas, surface = Color.White,
        onSurface = JembeeInk
    )

    MaterialTheme(colorScheme = scheme) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            bottomBar = {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 8.dp
                ) {
                    listOf("Home", "Shorts", "Learn", "Library", "You").forEach { item ->
                        NavigationBarItem(
                            selected = selected == item,
                            onClick = { selected = item },
                            icon = {
                                Text(
                                    when (item) { "Home" -> "⌂"; "Shorts" -> "▶"; "Learn" -> "▤"; "Library" -> "▣"; else -> "●" },
                                    fontSize = 20.sp, fontWeight = FontWeight.Bold
                                )
                            },
                            label = { Text(item, fontSize = 11.sp) },
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
                        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                            Text("JEMBEE PLAY", fontSize = 21.sp, fontWeight = FontWeight.Black, letterSpacing = 0.6.sp)
                            Text("WATCH  ·  LEARN  ·  CREATE", fontSize = 9.sp, letterSpacing = 1.5.sp, color = JembeeMuted)
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            TextButton(onClick = { dark = !dark }) { Text(if (dark) "Light" else "Dark") }
                            Surface(shape = RoundedCornerShape(50), color = MaterialTheme.colorScheme.surfaceVariant) {
                                Text("J", Modifier.padding(horizontal = 13.dp, vertical = 8.dp), color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Black)
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
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 22.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        Column(Modifier.padding(horizontal = 18.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Text("Your next favourite starts here.", fontSize = 25.sp, lineHeight = 31.sp, fontWeight = FontWeight.ExtraBold)
            Text("A calmer place to watch, discover and learn.", fontSize = 13.sp, color = JembeeMuted)
        }
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            PremiumActionCard("Explore learning", "Books, chapters and answers", "▤", Modifier.weight(1f), onLearn)
            PremiumActionCard("Watch Shorts", "Quick ideas, one swipe away", "▶", Modifier.weight(1f), onShorts)
        }
        NativeCatalogSection()
        Column(Modifier.padding(horizontal = 18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("Made for your big screen moments", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text("Pick a video, settle in and enjoy. Your watch history and personal recommendations will appear here after account sync is connected.", fontSize = 13.sp, color = JembeeMuted, lineHeight = 19.sp)
        }
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
    var search by remember { mutableStateOf("") }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp)) {
        Text("Learn at your pace", fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
        Text("Find the exact book, chapter or question.", Modifier.padding(top = 5.dp, bottom = 18.dp), color = JembeeMuted, fontSize = 13.sp)
        OutlinedTextField(
            value = search, onValueChange = { search = it },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            label = { Text("Search learning library") },
            placeholder = { Text("Book name, chapter or question no.") },
            singleLine = true
        )
        Surface(
            shape = RoundedCornerShape(20.dp), color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth().padding(top = 18.dp)
        ) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Your Learning Library", fontWeight = FontWeight.Bold, fontSize = 17.sp)
                Text("Books, chapter images and question-wise answers will be shown here when the Learning Library API is connected.", color = JembeeMuted, fontSize = 13.sp, lineHeight = 19.sp)
            }
        }
    }
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
