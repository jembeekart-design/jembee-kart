package in.jembeeplay.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

private val JembeeBlue = Color(0xFF0878D1)
private data class DemoShelf(val title: String, val items: List<String>)

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
    val shelves = listOf(
        DemoShelf("Continue watching", listOf("Your next lesson", "Science explained", "Maths revision")),
        DemoShelf("Learning by class", listOf("Class 6", "Class 7", "Class 8", "Class 9")),
        DemoShelf("Discover creators", listOf("Teachers", "New creators", "Popular lessons"))
    )
    val scheme = if (dark) darkColorScheme(primary = Color(0xFF69C5FF)) else lightColorScheme(primary = JembeeBlue)
    MaterialTheme(colorScheme = scheme) {
        Scaffold(
            bottomBar = {
                NavigationBar {
                    listOf("Home", "Shorts", "Learn", "Library", "You").forEach { item ->
                        NavigationBarItem(
                            selected = selected == item,
                            onClick = { selected = item },
                            icon = { Text(item.take(1), fontWeight = FontWeight.Bold) },
                            label = { Text(item) }
                        )
                    }
                }
            }
        ) { padding ->
            Column(
                Modifier.fillMaxSize().background(MaterialTheme.colorScheme.background)
                    .padding(padding).padding(horizontal = 18.dp)
            ) {
                Row(Modifier.fillMaxWidth().padding(top = 18.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text("JEMBEE PLAY", fontWeight = FontWeight.Black, fontSize = 21.sp)
                        Text("WATCH · LEARN · CREATE · SHARE", fontSize = 10.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    TextButton(onClick = { dark = !dark }) { Text(if (dark) "Dark" else "Light") }
                }
                if (remoteConfig.maintenanceEnabled) {
                    Text(remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." }, Modifier.fillMaxWidth().padding(top = 14.dp), color = MaterialTheme.colorScheme.error)
                }
                Spacer(Modifier.height(22.dp))
                Card(shape = RoundedCornerShape(24.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                    Column(Modifier.fillMaxWidth().padding(22.dp)) {
                        Text("A world of videos and learning", fontSize = 23.sp, fontWeight = FontWeight.ExtraBold)
                        Text("Your personalized JEMBEE PLAY experience", Modifier.padding(top = 8.dp))
                        Button(onClick = { selected = "Learn" }, Modifier.padding(top = 16.dp)) { Text("Explore learning") }
                    }
                }
                shelves.forEach { shelf ->
                    Text(shelf.title, Modifier.padding(top = 22.dp, bottom = 10.dp), fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        items(shelf.items) { item ->
                            Card(Modifier.width(156.dp).height(112.dp), shape = RoundedCornerShape(18.dp)) {
                                Column(Modifier.fillMaxSize().padding(14.dp), verticalArrangement = Arrangement.SpaceBetween) {
                                    Text("JEMBEE", color = MaterialTheme.colorScheme.primary, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                    Text(item, fontWeight = FontWeight.SemiBold)
                                }
                            }
                        }
                    }
                }
                Spacer(Modifier.height(18.dp))
                Text("Preview interface · Live account and video services are not connected yet", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
