package in.jembeeplay.tv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
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
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text("JEMBEE PLAY", fontSize = 30.sp, fontWeight = FontWeight.Black)
                        Text("WATCH · LEARN · CREATE · SHARE", fontSize = 12.sp, color = colors.onSurfaceVariant)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
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
