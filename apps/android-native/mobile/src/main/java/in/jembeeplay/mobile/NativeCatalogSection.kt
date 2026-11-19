package `in`.jembeeplay.mobile

import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.platform.LocalContext
import coil.compose.AsyncImage
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

@Composable
fun NativeCatalogSection(sectionTitle: String = "Watch on JEMBEE PLAY", sectionSubtitle: String = "Approved videos · Live catalog") {
    var videos by remember { mutableStateOf<List<CatalogVideo>>(emptyList()) }
    var cursor by remember { mutableStateOf<String?>(null) }
    var hasMore by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf<CatalogVideo?>(null) }

    fun loadMore() {
        if (loading) return
        loading = true
        VideoCatalogClient.fetch(cursor) { result ->
            result.onSuccess { page ->
                videos = videos + page.videos
                cursor = page.nextCursor
                hasMore = page.hasMore
                error = false
            }.onFailure { error = true }
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
                Text(sectionTitle, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                Text(sectionSubtitle, fontSize = 11.sp, color = Color.Gray)
            }
            if (loading) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
        }
        when {
            videos.isNotEmpty() -> {
                LazyRow(contentPadding = PaddingValues(horizontal = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    items(videos, key = { it.id }) { video ->
                        Column(Modifier.width(230.dp)) {
                            Box(Modifier.fillMaxWidth().height(130.dp).clip(RoundedCornerShape(16.dp)).background(Color(0xFF172033)).clickable { selected = video }) {
                                AsyncImage(model = video.thumbnailUrl, contentDescription = video.title, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                                Surface(Modifier.align(androidx.compose.ui.Alignment.Center), color = Color.Black.copy(alpha = .72f), shape = RoundedCornerShape(50)) {
                                    Text("▶", Modifier.padding(horizontal = 14.dp, vertical = 8.dp), color = Color.White, fontSize = 20.sp)
                                }
                                Text(if (video.durationSeconds != null) "${video.durationSeconds / 60} min" else "JEMBEE PLAY", Modifier.align(androidx.compose.ui.Alignment.BottomEnd).padding(8.dp).background(Color.Black.copy(alpha = .8f), RoundedCornerShape(5.dp)).padding(horizontal = 6.dp, vertical = 3.dp), color = Color.White, fontSize = 10.sp)
                            }
                            Text(video.title, Modifier.padding(top = 8.dp), maxLines = 2, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text(video.creator + " · " + video.views.toString() + " views", color = Color.Gray, fontSize = 11.sp)
                        }
                    }
                }
                if (hasMore) TextButton(onClick = { loadMore() }, enabled = !loading, modifier = Modifier.padding(start = 12.dp)) { Text(if (loading) "Loading…" else "Load more videos") }
            }
            loading -> Text("Loading approved videos…", Modifier.padding(18.dp), color = Color.Gray)
            error -> Row(Modifier.padding(horizontal = 18.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Videos couldn't load. Check your connection.", color = Color.Gray, fontSize = 12.sp)
                TextButton(onClick = {
                    loading = true
                    error = false
                    VideoCatalogClient.fetch { result ->
                        result.onSuccess { page -> videos = page.videos; cursor = page.nextCursor; hasMore = page.hasMore }.onFailure { error = true }
                        loading = false
                    }
                }) { Text("Retry") }
            }
            else -> Text("No approved videos are available yet.", Modifier.padding(18.dp), color = Color.Gray, fontSize = 12.sp)
        }
    }

    selected?.let { video ->
        NativeVideoPlayer(video = video, onClose = { selected = null })
    }
}

@Composable
private fun NativeVideoPlayer(video: CatalogVideo, onClose: () -> Unit) {
    val context = LocalContext.current
    val player = remember(video.id) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(video.playbackUrl))
            prepare()
            playWhenReady = true
        }
    }
    DisposableEffect(player) { onDispose { player.release() } }
    androidx.compose.ui.window.Dialog(onDismissRequest = onClose) {
        Column(Modifier.fillMaxWidth().background(Color(0xFF0B1020), RoundedCornerShape(18.dp)).padding(12.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(video.title, Modifier.weight(1f), color = Color.White, fontWeight = FontWeight.Bold, maxLines = 2)
                TextButton(onClick = onClose) { Text("Close") }
            }
            AndroidView(
                factory = { ctx -> PlayerView(ctx).apply { this.player = player; layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT); useController = true } },
                modifier = Modifier.fillMaxWidth().height(220.dp)
            )
            Text(video.creator, Modifier.padding(top = 8.dp), color = Color.LightGray, fontSize = 12.sp)
        }
    }
}
