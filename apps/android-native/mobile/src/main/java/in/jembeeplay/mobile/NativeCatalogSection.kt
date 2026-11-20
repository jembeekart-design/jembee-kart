package `in`.jembeeplay.mobile

import android.content.Intent
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
fun NativeCatalogSection(sectionTitle: String = "Watch on JEMBEE PLAY", sectionSubtitle: String = "Approved videos · Live catalog", videoFormat: String? = null) {
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
                videos = videos + page.videos.filter { videoFormat == null || it.format == videoFormat }
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
                videos = page.videos.filter { videoFormat == null || it.format == videoFormat }
                cursor = page.nextCursor
                hasMore = page.hasMore
                error = false
            }.onFailure { error = true }
            loading = false
        }
    }

    val compactCards = sectionTitle.startsWith("Trending")
    Column(Modifier.fillMaxWidth().padding(top = 14.dp, bottom = 10.dp)) {
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
                        Column(Modifier.width(if (compactCards) 145.dp else 230.dp)) {
                            Box(Modifier.fillMaxWidth().height(if (compactCards) 118.dp else 130.dp).clip(RoundedCornerShape(16.dp)).background(Color(0xFF172033)).clickable { selected = video }) {
                                AsyncImage(model = video.thumbnailUrl, contentDescription = video.title, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                                Surface(Modifier.align(androidx.compose.ui.Alignment.Center), color = Color.Black.copy(alpha = .72f), shape = RoundedCornerShape(50)) {
                                    Text("▶", Modifier.padding(horizontal = 14.dp, vertical = 8.dp), color = Color.White, fontSize = 20.sp)
                                }
                                Text(if (video.durationSeconds != null) "${video.durationSeconds / 60} min" else "JEMBEE PLAY", Modifier.align(androidx.compose.ui.Alignment.BottomEnd).padding(8.dp).background(Color.Black.copy(alpha = .8f), RoundedCornerShape(5.dp)).padding(horizontal = 6.dp, vertical = 3.dp), color = Color.White, fontSize = 10.sp)
                            }
                            Text(video.title, Modifier.padding(top = 7.dp), maxLines = 2, fontWeight = FontWeight.Bold, fontSize = if (compactCards) 12.sp else 14.sp)
                            Text(video.creator + " · " + video.views.toString() + " views", color = Color.Gray, fontSize = 10.sp, maxLines = 1)
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
                        result.onSuccess { page -> videos = page.videos.filter { videoFormat == null || it.format == videoFormat }; cursor = page.nextCursor; hasMore = page.hasMore }.onFailure { error = true }
                        loading = false
                    }
                }) { Text("Retry") }
            }
            else -> Text("No approved videos are available yet.", Modifier.padding(18.dp), color = Color.Gray, fontSize = 12.sp)
        }
    }

    selected?.let { video ->
        NativeVideoPlayer(
            video = video,
            recommendations = videos.filterNot { it.id == video.id }.take(5),
            onSelect = { selected = it },
            onClose = { selected = null }
        )
    }
}

@Composable
private fun NativeVideoPlayer(
    video: CatalogVideo,
    recommendations: List<CatalogVideo>,
    onSelect: (CatalogVideo) -> Unit,
    onClose: () -> Unit
) {
    val context = LocalContext.current
    val player = remember(video.id) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(video.playbackUrl))
            prepare()
            playWhenReady = true
        }
    }
    DisposableEffect(player) { onDispose { player.release() } }
    androidx.compose.ui.window.Dialog(
        onDismissRequest = onClose,
        properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)
    ) {
        BoxWithConstraints(
            Modifier.fillMaxSize().background(Color(0xFF05060B)).padding(12.dp)
        ) {
            val wide = maxWidth > 600.dp
            if (wide) {
                Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column(Modifier.weight(2.5f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            Text(video.title, Modifier.weight(1f), color = Color.White, fontWeight = FontWeight.Bold, maxLines = 2)
                            TextButton(onClick = onClose) { Text("Close") }
                        }
                        AndroidView(
                            factory = { ctx -> PlayerView(ctx).apply {
                                this.player = player
                                useController = true
                                controllerShowTimeoutMs = 3500
                                layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
                            } },
                            modifier = Modifier.fillMaxWidth().weight(1f)
                        )
                        Text(video.title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 17.sp)
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                            Column {
                                Text(video.creator, color = Color.LightGray, fontSize = 13.sp)
                                Text("${video.views} views", color = Color.Gray, fontSize = 11.sp)
                            }
                            OutlinedButton(onClick = {
                                val share = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_TEXT, "${video.title} · JEMBEE PLAY")
                                }
                                context.startActivity(Intent.createChooser(share, "Share video"))
                            }) { Text("↗  Share") }
                        }
                    }
                    Column(Modifier.weight(1f).fillMaxHeight(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text("Up Next", color = Color.White, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                        if (recommendations.isEmpty()) {
                            Text("No more approved videos in this list.", color = Color.LightGray, fontSize = 12.sp)
                        } else {
                            recommendations.forEach { next ->
                                Surface(
                                    onClick = { onSelect(next) },
                                    color = Color(0xFF15131E),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Row(Modifier.fillMaxWidth().padding(7.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                                        AsyncImage(
                                            model = next.thumbnailUrl,
                                            contentDescription = next.title,
                                            contentScale = ContentScale.Crop,
                                            modifier = Modifier.size(100.dp, 62.dp).clip(RoundedCornerShape(8.dp))
                                        )
                                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
                                            Text(next.title, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 2)
                                            Text("${next.views} views", color = Color.LightGray, fontSize = 10.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Text(video.title, Modifier.weight(1f), color = Color.White, fontWeight = FontWeight.Bold, maxLines = 2)
                        TextButton(onClick = onClose) { Text("Close") }
                    }
                    AndroidView(
                        factory = { ctx -> PlayerView(ctx).apply {
                            this.player = player
                            useController = true
                            controllerShowTimeoutMs = 3500
                            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
                        } },
                        modifier = Modifier.fillMaxWidth().height(230.dp)
                    )
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Column {
                            Text(video.creator, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("${video.views} views", color = Color.LightGray, fontSize = 11.sp)
                        }
                        OutlinedButton(onClick = {
                            val share = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, "${video.title} · JEMBEE PLAY")
                            }
                            context.startActivity(Intent.createChooser(share, "Share video"))
                        }) { Text("↗  Share") }
                    }
                    Text("Up Next", color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                    androidx.compose.foundation.lazy.LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(recommendations, key = { it.id }) { next ->
                            Surface(onClick = { onSelect(next) }, color = Color(0xFF15131E), shape = RoundedCornerShape(12.dp)) {
                                Row(Modifier.fillMaxWidth().padding(7.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                                    AsyncImage(model = next.thumbnailUrl, contentDescription = next.title, contentScale = ContentScale.Crop, modifier = Modifier.size(112.dp, 66.dp).clip(RoundedCornerShape(8.dp)))
                                    Column(Modifier.weight(1f)) {
                                        Text(next.title, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 2)
                                        Text("${next.views} views", color = Color.LightGray, fontSize = 10.sp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
