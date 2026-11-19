package `in`.jembeeplay.tv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*

private val TvBlue = Color(0xFF1687E8)

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
    BackHandler(enabled = selected != "Home") { selected = "Home" }
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
                when (selected) {
                    "Home" -> {
                        Card(onClick = { selected = "Shorts" }, modifier = Modifier.fillMaxWidth().height(190.dp)) {
                            Column(Modifier.fillMaxSize().padding(28.dp), verticalArrangement = Arrangement.Center) {
                                Text("JEMBEE PLAY", color = TvBlue, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Text("A bigger screen for bigger ideas", fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
                                Text("Discover approved videos with your TV remote", Modifier.padding(top = 10.dp), fontSize = 17.sp)
                            }
                        }
                        Spacer(Modifier.height(28.dp))
                        TvLiveVideoShelf()
                    }
                    "Shorts" -> TvDestinationState("Shorts", "The full-screen Shorts player is being connected to the approved video feed.")
                    "Learning" -> TvDestinationState("Learning Library", "Book, chapter and question-based learning will appear here after the native catalog API is connected.")
                    "My List" -> TvDestinationState("My List", "Sign in and saved-video sync are not connected in this preview.")
                    else -> Column {
                        Text("Settings", fontSize = 26.sp, fontWeight = FontWeight.Bold)
                        Spacer(Modifier.height(16.dp))
                        Button(onClick = { dark = !dark }) { Text(if (dark) "Switch to light theme" else "Switch to dark theme") }
                        Text("Theme preference is local to this preview.", Modifier.padding(top = 10.dp), color = colors.onSurfaceVariant, fontSize = 13.sp)
                    }
                }
                Spacer(Modifier.height(18.dp))
                Text("Live approved video catalog · Other native services remain under integration", fontSize = 12.sp, color = colors.onSurfaceVariant)
            }
        }
    }
}


@Composable
private fun TvDestinationState(title: String, message: String) {
    Column(
        Modifier.fillMaxWidth().padding(vertical = 72.dp),
        horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally
    ) {
        Text(title, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
        Text(message, Modifier.padding(top = 14.dp), fontSize = 17.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text("Press Back to return to Home", Modifier.padding(top = 24.dp), fontSize = 14.sp, color = TvBlue)
    }
}
