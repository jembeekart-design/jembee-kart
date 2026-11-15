package `in`.jembeeplay.tv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Brush
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*

private val TvBlue = Color(0xFF1687E8)
private data class TvShelf(val title: String, val titles: List<String>)

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
    var dark by remember { mutableStateOf(true) }
    val shelves = listOf(
        TvShelf("Featured for you", listOf("Featured video", "Continue watching", "New this week")),
        TvShelf("Learning by class", listOf("Class 6", "Class 7", "Class 8", "Class 9", "Class 10")),
        TvShelf("Explore JEMBEE PLAY", listOf("Shorts", "Teachers", "Creators", "My List"))
    )
    val colors = if (dark) darkColorScheme() else lightColorScheme()
    MaterialTheme(colorScheme = colors) {
        Surface(Modifier.fillMaxSize()) {
            Column(Modifier.fillMaxSize().background(colors.background).padding(horizontal = 42.dp, vertical = 28.dp)) {
                Row(
                    Modifier.fillMaxWidth().background(
                        Brush.linearGradient(listOf(Color(0xFF10172D), Color(0xFF243B68), Color(0xFF111629))),
                        RoundedCornerShape(26.dp)
                    ).padding(horizontal = 24.dp, vertical = 20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                        Box(
                            Modifier.size(64.dp).background(Color(0xFFFFD782), RoundedCornerShape(18.dp)),
                            contentAlignment = androidx.compose.ui.Alignment.Center
                        ) {
                            Text("J", color = Color(0xFF17213B), fontSize = 42.sp, fontWeight = FontWeight.Black)
                        }
                        Column {
                            Text("JEMBEE", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.Black, letterSpacing = 1.5.sp)
                            Text("PLAY", color = Color(0xFFFFD782), fontSize = 19.sp, fontWeight = FontWeight.ExtraBold, letterSpacing = 7.sp)
                            Text("WATCH  •  LEARN  •  CREATE  •  SHARE", color = Color.White.copy(alpha = .86f), fontSize = 11.sp, letterSpacing = 1.5.sp)
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        listOf("Home", "Shorts", "Learning", "My List", "Settings").forEach { item ->
                            Surface(
                                onClick = { selected = item },
                                shape = ClickableSurfaceDefaults.shape(),
                                colors = ClickableSurfaceDefaults.colors(
                                    containerColor = if (selected == item) TvBlue else colors.surfaceVariant,
                                    focusedContainerColor = TvBlue
                                )
                            ) { Text(item, Modifier.padding(horizontal = 18.dp, vertical = 12.dp), fontWeight = FontWeight.Bold) }
                        }
                        Button(onClick = { dark = !dark }) { Text(if (dark) "Dark" else "Light") }
                    }
                }
                if (remoteConfig.maintenanceEnabled) {
                    Text(remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." }, Modifier.padding(top = 14.dp), color = colors.error)
                }
                Spacer(Modifier.height(34.dp))
                Card(onClick = { selected = "Featured" }, modifier = Modifier.fillMaxWidth().height(190.dp)) {
                    Column(Modifier.fillMaxSize().padding(28.dp), verticalArrangement = Arrangement.Center) {
                        Text("A bigger screen for bigger ideas", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
                        Text("Discover videos, teachers and learning paths", Modifier.padding(top = 10.dp), fontSize = 17.sp)
                    }
                }
                Spacer(Modifier.height(28.dp))
                TvLiveVideoShelf()
                shelves.forEach { shelf ->
                    Text(shelf.title, Modifier.padding(top = 26.dp, bottom = 12.dp), fontSize = 21.sp, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                        items(shelf.titles) { title ->
                            Surface(
                                onClick = { selected = title },
                                modifier = Modifier.width(205.dp).height(116.dp),
                                shape = ClickableSurfaceDefaults.shape(),
                                colors = ClickableSurfaceDefaults.colors(focusedContainerColor = TvBlue)
                            ) {
                                Box(Modifier.fillMaxSize().padding(18.dp), contentAlignment = androidx.compose.ui.Alignment.BottomStart) {
                                    Text(title, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
                Spacer(Modifier.height(18.dp))
                Text("TV interface foundation · Live video and account APIs are not connected yet", fontSize = 12.sp, color = colors.onSurfaceVariant)
            }
        }
    }
}
