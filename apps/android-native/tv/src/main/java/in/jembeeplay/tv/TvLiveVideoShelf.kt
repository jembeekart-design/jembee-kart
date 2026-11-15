package `in`.jembeeplay.tv

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.tv.material3.*

@Composable
fun TvLiveVideoShelf() {
    var videos by remember { mutableStateOf<List<TvCatalogVideo>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var failed by remember { mutableStateOf(false) }

    fun refresh() {
        loading = true
        TvVideoCatalogClient.fetch { result ->
            result.onSuccess { videos = it; failed = false }
                .onFailure { failed = true }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    Column(Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text("Watch on JEMBEE PLAY", fontSize = 21.sp, fontWeight = FontWeight.Bold)
                Text("Live approved video catalog", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (loading) CircularProgressIndicator()
        }
        when {
            videos.isNotEmpty() -> LazyRow(horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                items(videos, key = { it.id }) { video ->
                    Surface(
                        onClick = { },
                        modifier = Modifier.width(250.dp).height(148.dp),
                        shape = ClickableSurfaceDefaults.shape(),
                        colors = ClickableSurfaceDefaults.colors(focusedContainerColor = androidx.compose.ui.graphics.Color(0xFF0878D1))
                    ) {
                        Column(Modifier.fillMaxSize().padding(18.dp), verticalArrangement = Arrangement.Bottom) {
                            Text("▶", fontSize = 28.sp)
                            Text(video.title, fontSize = 16.sp, fontWeight = FontWeight.Bold, maxLines = 2)
                            Text("${video.creator} · ${video.views} views", fontSize = 11.sp)
                        }
                    }
                }
            }
            loading -> Text("Loading approved videos…")
            failed -> Button(onClick = { refresh() }) { Text("Retry loading videos") }
            else -> Text("No approved videos are available yet.")
        }
    }
}
