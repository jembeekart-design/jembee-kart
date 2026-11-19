package `in`.jembeeplay.tv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*

private val TvBlue = Color(0xFF278BE6)
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
    val colors = darkColorScheme(
        primary = TvBlue,
        background = Color(0xFF080D16),
        surface = Color(0xFF121B29),
        surfaceVariant = Color(0xFF1A2636),
        onSurface = Color(0xFFF4F7FC),
        onSurfaceVariant = TvMuted
    )
    MaterialTheme(colorScheme = colors) {
        Surface(Modifier.fillMaxSize(), color = colors.background) {
            Column(
                Modifier.fillMaxSize().padding(horizontal = 54.dp, vertical = 34.dp),
                verticalArrangement = Arrangement.spacedBy(25.dp)
            ) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text("JEMBEE PLAY", fontSize = 31.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                        Text("WATCH  ·  LEARN  ·  CREATE  ·  SHARE", fontSize = 11.sp, color = TvMuted, letterSpacing = 1.8.sp)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        listOf("Home", "Shorts", "Learning", "My List").forEach { item ->
                            androidx.compose.material3.Surface(
                                modifier = Modifier.clickable { selected = item },
                                shape = RoundedCornerShape(30.dp),
                                color = if (selected == item) TvBlue.copy(alpha = .22f) else Color.Transparent
                            ) {
                                Text(item, Modifier.padding(horizontal = 20.dp, vertical = 12.dp), fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                            }
                        }
                    }
                }

                if (remoteConfig.maintenanceEnabled) {
                    Surface(color = colors.errorContainer, shape = RoundedCornerShape(12.dp)) {
                        Text(
                            remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." },
                            Modifier.fillMaxWidth().padding(14.dp), color = colors.onErrorContainer
                        )
                    }
                }

                if (selected == "Home" || selected == "Shorts") {
                    Surface(
                        shape = RoundedCornerShape(28.dp),
                        color = colors.surface,
                        modifier = Modifier.fillMaxWidth().height(174.dp)
                    ) {
                        Box(Modifier.fillMaxSize().background(
                            Brush.horizontalGradient(listOf(Color(0xFF142B48), Color(0xFF172237), Color(0xFF111A29)))
                        )) {
                            Column(
                                Modifier.align(Alignment.CenterStart).padding(horizontal = 30.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(if (selected == "Shorts") "Quick ideas. Big screen." else "Settle in. Find something good.", fontSize = 29.sp, fontWeight = FontWeight.ExtraBold)
                                Text(
                                    if (selected == "Shorts") "Short-form video experience" else "A more comfortable way to watch and learn",
                                    fontSize = 15.sp, color = TvMuted
                                )
                            }
                            Text("J", Modifier.align(Alignment.CenterEnd).padding(end = 48.dp), fontSize = 100.sp, fontWeight = FontWeight.Black, color = Color.White.copy(alpha = .08f))
                        }
                    }
                    TvLiveVideoShelf()
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                        TvFeatureCard("Learning Library", "Explore books and question-wise lessons", "▤", Modifier.weight(1f)) { selected = "Learning" }
                        TvFeatureCard("Your Library", "Return to saved videos and watch history", "▣", Modifier.weight(1f)) { selected = "My List" }
                    }
                } else {
                    Column(
                        Modifier.fillMaxWidth().weight(1f),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(if (selected == "Learning") "Learn on the big screen" else "Your Library", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
                        Text(
                            if (selected == "Learning") "Books, chapters and answers will appear here when Learning Library is connected." else "Saved videos and watch history will appear here after account sync.",
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
    androidx.compose.material3.Surface(
        modifier = modifier.height(112.dp).clickable(onClick = onClick),
        shape = RoundedCornerShape(20.dp),
        color = Color(0xFF121B29)
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
