package `in`.jembeeplay.mobile

import android.os.Bundle
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.ComponentActivity
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
                    "Home" -> HomeScreen(onOpenShorts = { selected = "Shorts" }, onOpenWatch = { selected = "Watch" }, onLearn = { selected = "Learn" })
                    "Shorts" -> ShortsScreen(onBack = { selected = "Home" })
                    "Watch" -> WatchScreen(onBack = { selected = "Home" })
                    "Learn" -> LearnScreen()
                    "Library" -> SimpleScreen("Your Library", "Saved videos, watch history and downloads")
                    else -> SimpleScreen("Your profile", "Sign in to manage your JEMBEE PLAY account")
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(onOpenShorts: () -> Unit, onOpenWatch: () -> Unit, onLearn: () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(bottom = 20.dp)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            listOf("For you", "Trending", "Education", "Music").forEachIndexed { i, label ->
                Surface(shape = CircleShape, color = if (i == 0) JembeeAccent else JembeeSurface, modifier = Modifier.clickable { if (label == "Education") onLearn() }) {
                    Text(label, Modifier.padding(horizontal = 15.dp, vertical = 9.dp), color = if (i == 0) Color.Black else Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        }
        Spacer(Modifier.height(18.dp))
        Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(205.dp).background(Brush.linearGradient(listOf(Color(0xFF123C5B), Color(0xFF24234C), Color(0xFF101522))), RoundedCornerShape(24.dp)).clickable { onOpenWatch() }) {
            Column(Modifier.align(Alignment.BottomStart).padding(20.dp)) {
                Text("YOUR NEXT FAVOURITE VIDEO", color = JembeeAccent, fontSize = 9.sp, letterSpacing = 1.4.sp, fontWeight = FontWeight.Bold)
                Text("Watch. Learn. Discover.", color = Color.White, fontSize = 25.sp, fontWeight = FontWeight.ExtraBold)
                Text("Explore the world of JEMBEE PLAY", color = Color.White.copy(alpha = .75f), fontSize = 12.sp)
            }
            Surface(Modifier.align(Alignment.CenterEnd).padding(end = 22.dp), shape = CircleShape, color = Color.White.copy(alpha = .15f)) {
                Text("▶", Modifier.padding(18.dp), color = Color.White, fontSize = 25.sp)
            }
        }
        SectionHeader("Shorts for you", "Swipe up to watch", onOpenShorts)
        Row(Modifier.fillMaxWidth().height(190.dp).padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(11.dp)) {
            listOf("Quick facts", "One-minute learning", "Creator moments").forEachIndexed { i, title ->
                Box(Modifier.weight(1f).fillMaxHeight().background(Brush.linearGradient(listOf(listOf(Color(0xFF673E89), Color(0xFF1A526E), Color(0xFF8B4A42))[i], Color(0xFF111827))), RoundedCornerShape(16.dp)).clickable { onOpenShorts() }) {
                    Column(Modifier.align(Alignment.BottomStart).padding(10.dp)) {
                        Text("▶", color = Color.White, fontSize = 20.sp)
                        Text(title, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        SectionHeader("Long videos", "Continue watching", onOpenWatch)
        Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            listOf("Explore something new", "Stories that inspire").forEachIndexed { i, title ->
                Row(Modifier.fillMaxWidth().background(JembeeSurface, RoundedCornerShape(16.dp)).clickable { onOpenWatch() }.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.width(132.dp).height(78.dp).background(Brush.linearGradient(listOf(if (i == 0) Color(0xFF17647C) else Color(0xFF63406E), Color(0xFF141B2A))), RoundedCornerShape(10.dp)), contentAlignment = Alignment.Center) { Text("▶", color = Color.White, fontSize = 25.sp) }
                    Column(Modifier.padding(start = 12.dp).weight(1f)) {
                        Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text("JEMBEE PLAY • Video", color = JembeeMuted, fontSize = 11.sp)
                        Text("Open video  →", color = JembeeAccent, fontSize = 11.sp)
                    }
                }
            }
        }
        SectionHeader("Learn by class", "Browse subjects", onLearn)
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf("6", "7", "8", "9", "10").forEach { grade ->
                Surface(Modifier.weight(1f).height(66.dp).clickable { onLearn() }, shape = RoundedCornerShape(13.dp), color = JembeeSurface) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                        Text("CLASS", color = JembeeMuted, fontSize = 8.sp)
                        Text(grade, color = Color.White, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
        Text("Video and account services connect in the next integration stage.", Modifier.padding(18.dp), color = JembeeMuted, fontSize = 10.sp)
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
private fun ShortsScreen(onBack: () -> Unit) {
    val pagerState = rememberPagerState(pageCount = { 8 })
    val labels = listOf("Discover something new", "A quick learning moment", "Creator spotlight", "Science in a minute", "Daily inspiration", "Explore more", "Learn every day", "JEMBEE SHORTS")
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        VerticalPager(state = pagerState, modifier = Modifier.fillMaxSize(), beyondViewportPageCount = 1) { page ->
            Box(Modifier.fillMaxSize().background(Brush.linearGradient(listOf(Color(0xFF152E4A), Color(0xFF30234D), Color(0xFF080B12))))) {
                Column(Modifier.align(Alignment.Center), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("▶", color = Color.White, fontSize = 48.sp)
                    Text("Shorts player", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Text("Real video playback will connect to the website feed", color = Color.White.copy(alpha = .7f), fontSize = 10.sp)
                }
                Column(Modifier.align(Alignment.BottomStart).padding(start = 18.dp, end = 82.dp, bottom = 32.dp)) {
                    Text("@jembeeplay", color = Color.White, fontWeight = FontWeight.Bold)
                    Text(labels[page], color = Color.White, fontSize = 15.sp)
                    Text("Swipe up for next video", color = Color.White.copy(alpha = .7f), fontSize = 11.sp)
                }
                Column(Modifier.align(Alignment.CenterEnd).padding(end = 14.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(22.dp)) {
                    listOf("♡" to "Like", "▢" to "Comment", "↗" to "Share", "⋯" to "More").forEach { (symbol, label) ->
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(symbol, color = Color.White, fontSize = 29.sp, fontWeight = FontWeight.Bold)
                            Text(label, color = Color.White, fontSize = 9.sp)
                        }
                    }
                }
                TextButton(onClick = onBack, modifier = Modifier.align(Alignment.TopStart).padding(10.dp)) { Text("‹  Back", color = Color.White) }
                Text("SHORTS  •  ${pagerState.currentPage + 1}/${pagerState.pageCount}", Modifier.align(Alignment.TopCenter).padding(top = 22.dp), color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun WatchScreen(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().background(JembeeBackground).verticalScroll(rememberScrollState())) {
        Box(Modifier.fillMaxWidth().aspectRatio(16f / 9f).background(Color.Black), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("▶", color = Color.White, fontSize = 48.sp)
                Text("Long-video player", color = Color.White, fontWeight = FontWeight.Bold)
                Text("Website streaming player integration pending", color = JembeeMuted, fontSize = 10.sp)
            }
            TextButton(onClick = onBack, modifier = Modifier.align(Alignment.TopStart)) { Text("‹ Back", color = Color.White) }
        }
        Column(Modifier.padding(18.dp)) {
            Text("Video title will appear here", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text("Creator name  •  Views  •  Published date", color = JembeeMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 6.dp))
            Row(Modifier.fillMaxWidth().padding(vertical = 18.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                listOf("♡ Like", "↗ Share", "▢ Comment", "＋ Save").forEach { Text(it, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.SemiBold) }
            }
            HorizontalDivider(color = JembeeSurface)
            Text("Comments", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 18.dp))
            Text("Comments load with the connected video service.", color = JembeeMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
            Text("Recommended videos", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 22.dp))
        }
    }
}

@Composable
private fun LearnScreen() {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp)) {
        Text("Learn with JEMBEE", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
        Text("Choose a class to explore subjects and chapters.", color = JembeeMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 5.dp, bottom = 18.dp))
        listOf("CBSE", "ICSE", "JAC", "Other boards").forEach { board ->
            Text(board, color = JembeeAccent, fontWeight = FontWeight.Bold, modifier = Modifier.padding(vertical = 9.dp))
            (6..10).forEach { grade ->
                Text("Class $grade     •     Browse subjects  →", Modifier.fillMaxWidth().padding(vertical = 8.dp).background(JembeeSurface, RoundedCornerShape(12.dp)).padding(16.dp), color = Color.White)
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
