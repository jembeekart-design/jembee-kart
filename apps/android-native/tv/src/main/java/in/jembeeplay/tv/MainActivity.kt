package `in`.jembeeplay.tv

import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*

private val TvAccent = Color(0xFF43C7F5)
private data class TvShelf(val title: String, val titles: List<String>)

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
    LaunchedEffect(Unit) { RemoteConfigClient.fetch(context) { remoteConfig = it } }
    var selected by remember { mutableStateOf("Home") }
    val shelves = listOf(
        TvShelf("Continue watching", listOf("Resume video", "Your next episode", "Recently watched")),
        TvShelf("Popular on JEMBEE", listOf("Trending today", "New creators", "Most watched")),
        TvShelf("Learning by class", listOf("Class 6", "Class 7", "Class 8", "Class 9", "Class 10")),
        TvShelf("Explore Shorts", listOf("Quick facts", "Science bites", "Creator moments", "Daily learning"))
    )
    MaterialTheme(colorScheme = darkColorScheme(primary = TvAccent, background = Color(0xFF080B12), surface = Color(0xFF151B27))) {
        Surface(Modifier.fillMaxSize(), color = Color(0xFF080B12)) {
            when (selected) {
                "Shorts" -> TvShortsScreen(onBack = { selected = "Home" })
                "Watch" -> TvWatchScreen(onBack = { selected = "Home" })
                else -> TvHomeScreen(selected, { selected = it }, shelves, remoteConfig.maintenanceEnabled, remoteConfig.maintenanceMessage)
            }
        }
    }
}

@Composable
private fun TvHomeScreen(selected: String, onSelect: (String) -> Unit, shelves: List<TvShelf>, maintenance: Boolean, message: String) {
    Column(Modifier.fillMaxSize().background(Color(0xFF080B12)).padding(horizontal = 48.dp, vertical = 30.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text("JEMBEE PLAY", color = Color.White, fontSize = 32.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                Text("WATCH  •  LEARN  •  DISCOVER", color = Color(0xFF9AA8BC), fontSize = 11.sp, letterSpacing = 2.sp)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                listOf("Home", "Shorts", "Learning", "My List", "Settings").forEach { item ->
                    Surface(onClick = { onSelect(if (item == "Shorts") "Shorts" else if (item == "Home") "Home" else item) }, shape = ClickableSurfaceDefaults.shape(), colors = ClickableSurfaceDefaults.colors(containerColor = if (selected == item) Color(0xFF17445B) else Color(0xFF151B27), focusedContainerColor = TvAccent)) {
                        Text(item, Modifier.padding(horizontal = 19.dp, vertical = 13.dp), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }
        }
        if (maintenance) Text(message.ifBlank { "JEMBEE PLAY is temporarily under maintenance." }, Modifier.padding(top = 12.dp), color = Color(0xFFFF8A80))
        Spacer(Modifier.height(26.dp))
        Surface(onClick = { onSelect("Watch") }, modifier = Modifier.fillMaxWidth().height(220.dp), shape = ClickableSurfaceDefaults.shape(), colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF132F49), focusedContainerColor = Color(0xFF1C5270))) {
            Box(Modifier.fillMaxSize().background(Brush.horizontalGradient(listOf(Color(0xFF133E5A), Color(0xFF28234C), Color(0xFF111827)))).padding(28.dp)) {
                Column(Modifier.align(Alignment.CenterStart)) {
                    Text("JEMBEE PLAY ORIGINALS", color = TvAccent, fontSize = 11.sp, letterSpacing = 2.sp, fontWeight = FontWeight.Bold)
                    Text("Entertainment meets learning", color = Color.White, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
                    Text("Discover videos made for the big screen", color = Color.White.copy(alpha = .75f), fontSize = 16.sp)
                }
                Text("▶", Modifier.align(Alignment.CenterEnd).padding(end = 44.dp), color = Color.White, fontSize = 48.sp)
            }
        }
        shelves.forEach { shelf ->
            Row(Modifier.fillMaxWidth().padding(top = 22.dp, bottom = 10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                Text(shelf.title, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("Browse  →", color = TvAccent, fontSize = 12.sp)
            }
            LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                items(shelf.titles) { title ->
                    Surface(onClick = { onSelect(if (shelf.title == "Explore Shorts") "Shorts" else "Watch") }, modifier = Modifier.width(205.dp).height(105.dp), shape = ClickableSurfaceDefaults.shape(), colors = ClickableSurfaceDefaults.colors(containerColor = Color(0xFF182234), focusedContainerColor = Color(0xFF17506A))) {
                        Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF1B4961), Color(0xFF252344)))).padding(16.dp), contentAlignment = Alignment.BottomStart) {
                            Text(title, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Text("Remote navigation enabled in this UI shell · Live catalogue and playback integration pending", color = Color(0xFF8392A7), fontSize = 11.sp)
    }
}

@Composable
private fun TvShortsScreen(onBack: () -> Unit) {
    var index by remember { mutableIntStateOf(1) }
    Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF163B58), Color(0xFF30234D), Color(0xFF080B12))))) {
        Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("▶", color = Color.White, fontSize = 58.sp)
            Text("JEMBEE SHORTS", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Black)
            Text("Swipe-style feed • use remote left/right or up/down", color = Color.White.copy(alpha = .75f), fontSize = 14.sp)
            Text("Short ${index}", color = TvAccent, fontSize = 18.sp, modifier = Modifier.padding(top = 16.dp))
        }
        Row(Modifier.align(Alignment.BottomCenter).padding(bottom = 35.dp), horizontalArrangement = Arrangement.spacedBy(20.dp)) {
            Button(onClick = { index = (index - 1).coerceAtLeast(1) }) { Text("‹ Previous") }
            Button(onClick = { index++ }) { Text("Next ›") }
            Button(onClick = onBack) { Text("Home") }
        }
    }
}

@Composable
private fun TvWatchScreen(onBack: () -> Unit) {
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
            Text("▶", color = Color.White, fontSize = 62.sp)
            Text("Long-video player", color = Color.White, fontSize = 28.sp, fontWeight = FontWeight.Bold)
            Text("Website player and streaming API integration pending", color = Color(0xFF9AA8BC), fontSize = 13.sp)
        }
        Button(onClick = onBack, modifier = Modifier.align(Alignment.TopStart).padding(28.dp)) { Text("‹ Home") }
    }
}
