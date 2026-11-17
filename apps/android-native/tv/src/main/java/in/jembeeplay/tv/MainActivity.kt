package `in`.jembeeplay.tv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
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
    val colors = if (dark) darkColorScheme() else lightColorScheme()

    MaterialTheme(colorScheme = colors) {
        Surface(Modifier.fillMaxSize()) {
            Column(Modifier.fillMaxSize().background(colors.background).padding(horizontal = 42.dp, vertical = 28.dp)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("JEMBEE PLAY", fontSize = 30.sp, fontWeight = FontWeight.Black)
                        Text("WATCH  •  LEARN  •  CREATE  •  SHARE", fontSize = 12.sp, color = colors.onSurfaceVariant)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                        listOf("Home", "Long videos", "Shorts", "Learning", "Settings").forEach { item ->
                            Surface(
                                onClick = { selected = item },
                                shape = ClickableSurfaceDefaults.shape(),
                                colors = ClickableSurfaceDefaults.colors(
                                    containerColor = if (selected == item) TvBlue else colors.surfaceVariant,
                                    focusedContainerColor = TvBlue
                                )
                            ) {
                                Text(item, Modifier.padding(horizontal = 15.dp, vertical = 12.dp), fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }
                    }
                }
                if (remoteConfig.maintenanceEnabled) {
                    Text(
                        remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." },
                        Modifier.padding(top = 14.dp),
                        color = colors.error
                    )
                }
                Spacer(Modifier.height(30.dp))
                when (selected) {
                    "Home" -> TvLiveVideoShelf("all")
                    "Long videos" -> TvLiveVideoShelf("long")
                    "Shorts" -> TvLiveVideoShelf("short")
                    "Learning" -> TvLearningScreen()
                    "Settings" -> Column(Modifier.fillMaxWidth().padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        Text("Display settings", fontSize = 26.sp, fontWeight = FontWeight.Bold)
                        Text("Choose the appearance for your TV.", color = colors.onSurfaceVariant)
                        Button(onClick = { dark = !dark }) { Text(if (dark) "Switch to light theme" else "Switch to dark theme") }
                        Text("JEMBEE PLAY TV is designed for remote navigation.", color = colors.onSurfaceVariant)
                    }
                }
            }
        }
    }
}
