package `in`.jembeeplay.tv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*

private val TvBlue = Color(0xFFFF1978)
private val TvMuted = Color(0xFFABB7C8)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { JembeeTvApp() }
    }
}

@Composable
private fun JembeeTvApp() {
    val context = LocalContext.current
    var remoteConfig by remember { mutableStateOf(JembeeRemoteConfig()) }
    LaunchedEffect(Unit) { RemoteConfigClient.fetch(context) { remoteConfig = it } }
    var selected by remember { mutableStateOf("Home") }
    var heroThumbnail by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) { TvVideoCatalogClient.fetch { result -> result.onSuccess { heroThumbnail = it.firstOrNull()?.thumbnailUrl } } }
    val colors = darkColorScheme(
        primary = TvBlue,
        background = Color(0xFF05060B),
        surface = Color(0xFF101019),
        surfaceVariant = Color(0xFF1B1B27),
        onSurface = Color(0xFFF4F7FC),
        onSurfaceVariant = TvMuted
    )
    MaterialTheme(colorScheme = colors) {
        Surface(Modifier.fillMaxSize(), colors = SurfaceDefaults.colors(containerColor = colors.background)) {
            Column(
                Modifier.fillMaxSize().padding(horizontal = 54.dp, vertical = 34.dp),
                verticalArrangement = Arrangement.spacedBy(25.dp)
            ) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text("▶  JEMBEE PLAY", fontSize = 31.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                        Text("WATCH  ·  LEARN  ·  CREATE  ·  SHARE", fontSize = 11.sp, color = TvMuted, letterSpacing = 1.8.sp)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        listOf("Home", "Shorts", "Learning", "Library", "Live").forEach { item ->
                            Surface(
                                onClick = { selected = item },
                                modifier = Modifier.height(46.dp),
                                shape = ClickableSurfaceDefaults.shape(shape = RoundedCornerShape(30.dp)),
                                colors = ClickableSurfaceDefaults.colors(
                                    containerColor = Color.Transparent,
                                    focusedContainerColor = TvBlue,
                                    focusedContentColor = Color.White
                                )
                            ) {
                                Box(Modifier.padding(horizontal = 20.dp), contentAlignment = Alignment.Center) {
                                    Text(item, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                }
                            }
                        }
                    }
                }

                if (remoteConfig.maintenanceEnabled) {
                    Surface(colors = SurfaceDefaults.colors(containerColor = colors.errorContainer), shape = RoundedCornerShape(12.dp)) {
                        Text(
                            remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." },
                            Modifier.fillMaxWidth().padding(14.dp), color = colors.onErrorContainer
                        )
                    }
                }

                if (selected == "Home" || selected == "Shorts") {
                    Surface(
                        shape = RoundedCornerShape(24.dp),
                        colors = SurfaceDefaults.colors(containerColor = colors.surface),
                        modifier = Modifier.fillMaxWidth().height(220.dp)
                    ) {
                        Box(Modifier.fillMaxSize().background(
                            Brush.horizontalGradient(listOf(Color(0xFF17072F), Color(0xFF35106B), Color(0xFF170B35)))
                        )) {
                            if (heroThumbnail != null) {
                                AsyncImage(model = heroThumbnail, contentDescription = "Featured approved JEMBEE PLAY video",
                                    contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                                Box(Modifier.fillMaxSize().background(Brush.horizontalGradient(
                                    listOf(Color(0xEE17072F), Color(0xCC35106B), Color(0x44170B35)))))
                            }
                            Column(
                                Modifier.align(Alignment.CenterStart).padding(horizontal = 34.dp),
                                verticalArrangement = Arrangement.spacedBy(9.dp)
                            ) {
                                Text(if (selected == "Shorts") "Ideas that move you" else "Learn", fontSize = 17.sp, color = Color(0xFFFF8AB8), fontWeight = FontWeight.Bold)
                                Text(if (selected == "Shorts") "Shorts on the big screen" else "Anytime Anywhere", fontSize = 34.sp, fontWeight = FontWeight.ExtraBold)
                                Text(
                                    if (selected == "Shorts") "Discover short videos from JEMBEE PLAY creators" else "Videos  ·  Chapters  ·  Questions  ·  Answers",
                                    fontSize = 15.sp, color = TvMuted
                                )
                                Button(
                                    onClick = { selected = if (selected == "Shorts") "Home" else "Learning" },
                                    colors = ButtonDefaults.colors(containerColor = Color(0xFFFF1978)),
                                    contentPadding = PaddingValues(horizontal = 22.dp, vertical = 7.dp)
                                ) { Text("▶  Watch Now", color = Color.White, fontWeight = FontWeight.Bold) }
                            }
                            Box(
                                Modifier.align(Alignment.CenterEnd).padding(end = 38.dp)
                                    .size(190.dp, 160.dp)
                                    .background(
                                        Brush.radialGradient(listOf(Color(0x887E42D8), Color.Transparent)),
                                        RoundedCornerShape(36.dp)
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("▶", fontSize = 94.sp, fontWeight = FontWeight.Black, color = Color.White.copy(alpha = .18f))
                            }
                        }
                    }
                    TvLiveVideoShelf()
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                        TvFeatureCard("Learning Library", "Books  ·  Chapters  ·  Questions", "▤", Modifier.weight(1f)) { selected = "Learning" }
                        TvFeatureCard("Your Library", "Saved videos and watch history", "▣", Modifier.weight(1f)) { selected = "My List" }
                    }
                } else if (selected == "Learning") {
                    TvLearningLibraryScreen()
                } else {
                    Column(
                        Modifier.fillMaxWidth().weight(1f),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Your Library", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
                        Text(
                            "Saved videos and watch history will appear here after account sync.",
                            Modifier.padding(top = 10.dp), fontSize = 16.sp, color = TvMuted
                        )
                    }
                }
                Spacer(Modifier.weight(1f, fill = false))
                Text("Designed for comfortable viewing · Use your remote to explore", fontSize = 12.sp, color = TvMuted)
            }
        }
    }
}

@Composable
private fun TvFeatureCard(title: String, subtitle: String, symbol: String, modifier: Modifier, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        modifier = modifier.height(112.dp),
        shape = ClickableSurfaceDefaults.shape(shape = RoundedCornerShape(20.dp)),
        colors = ClickableSurfaceDefaults.colors(
            containerColor = Color(0xFF121019),
            focusedContainerColor = Color(0xFF351047),
            focusedContentColor = Color.White
        )
    ) {
        Row(Modifier.fillMaxSize().padding(horizontal = 22.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(18.dp)) {
            Text(symbol, fontSize = 30.sp, color = TvBlue, fontWeight = FontWeight.Bold)
            Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                Text(subtitle, fontSize = 12.sp, color = TvMuted)
            }
        }
    }
}
