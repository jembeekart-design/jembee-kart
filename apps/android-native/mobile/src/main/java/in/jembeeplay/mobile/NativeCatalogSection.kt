package `in`.jembeeplay.mobile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun NativeCatalogSection() {
    var videos by remember { mutableStateOf<List<CatalogVideo>>(emptyList()) }
    var cursor by remember { mutableStateOf<String?>(null) }
    var hasMore by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf(false) }

    fun loadMore() {
        if (loading) return
        loading = true
        VideoCatalogClient.fetch(cursor) { result ->
            result.onSuccess { page ->
                videos = videos + page.videos
                cursor = page.nextCursor
                hasMore = page.hasMore
                error = false
            }.onFailure {
                error = true
            }
            loading = false
        }
    }

    LaunchedEffect(Unit) {
        VideoCatalogClient.fetch { result ->
            result.onSuccess { page ->
                videos = page.videos
                cursor = page.nextCursor
                hasMore = page.hasMore
                error = false
            }.onFailure { error = true }
            loading = false
        }
    }

    Column(Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 12.dp)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text("Real videos from JEMBEE PLAY", fontSize = 19.sp, fontWeight = FontWeight.Bold)
                Text("Approved videos · Live catalog", fontSize = 11.sp, color = Color.Gray)
            }
            if (loading) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
        }
        when {
            videos.isNotEmpty() -> {
                LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(videos, key = { it.id }) { video ->
                        Column(Modifier.width(230.dp)) {
                            Box(Modifier.fillMaxWidth().height(126.dp).background(Brush.linearGradient(listOf(Color(0xFF153B66), Color(0xFF172033))), RoundedCornerShape(16.dp)).padding(14.dp)) {
                                Text(if (video.format == "long") "VIDEO" else "SHORT", color = Color.White.copy(alpha = .75f), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                                Text("▶", Modifier.align(androidx.compose.ui.Alignment.Center), color = Color.White, fontSize = 28.sp)
                                Text(if (video.durationSeconds != null) "${video.durationSeconds / 60} min" else "JEMBEE PLAY", Modifier.align(androidx.compose.ui.Alignment.BottomEnd), color = Color.White, fontSize = 10.sp)
                            }
                            Text(video.title, Modifier.padding(top = 8.dp), maxLines = 2, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(video.creator + " · " + video.views.toString() + " views", color = Color.Gray, fontSize = 11.sp)
                        }
                    }
                }
                if (hasMore) {
                    TextButton(onClick = { loadMore() }, enabled = !loading, modifier = Modifier.padding(start = 12.dp)) { Text(if (loading) "Loading…" else "Load more videos") }
                }
            }
            loading -> Text("Loading approved videos…", Modifier.padding(18.dp), color = Color.Gray)
            error -> Row(Modifier.padding(horizontal = 18.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Videos couldn't load. Check your connection.", color = Color.Gray, fontSize = 12.sp)
                TextButton(onClick = {
                    loading = true
                    error = false
                    VideoCatalogClient.fetch { result ->
                        result.onSuccess { page -> videos = page.videos; cursor = page.nextCursor; hasMore = page.hasMore }
                            .onFailure { error = true }
                        loading = false
                    }
                }) { Text("Retry") }
            }
            else -> Text("No approved videos are available yet.", Modifier.padding(18.dp), color = Color.Gray, fontSize = 12.sp)
        }
    }
}
