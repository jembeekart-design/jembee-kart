package `in`.jembeeplay.mobile

import android.content.Intent
import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import coil.compose.AsyncImage

@Composable
fun NativeShortsFeed() {
    val context = LocalContext.current
    val listState = rememberLazyListState()
    var videos by remember { mutableStateOf<List<CatalogVideo>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var failed by remember { mutableStateOf(false) }
    val activeIndex by remember { derivedStateOf { listState.firstVisibleItemIndex } }
    val activeVideo = videos.getOrNull(activeIndex)

    fun refresh() {
        loading = true
        failed = false
        VideoCatalogClient.fetch { result ->
            result.onSuccess { page ->
                videos = page.videos.filter { it.format != "long" }
                failed = false
            }.onFailure { failed = true }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    val player = remember { ExoPlayer.Builder(context).build() }
    var preparedVideoId by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(activeVideo?.id) {
        val video = activeVideo
        if (video == null) {
            player.pause()
            preparedVideoId = null
        } else if (preparedVideoId != video.id) {
            player.stop()
            player.setMediaItem(MediaItem.fromUri(video.playbackUrl))
            player.prepare()
            player.playWhenReady = true
            preparedVideoId = video.id
        } else {
            player.playWhenReady = true
        }
    }
    DisposableEffect(player) { onDispose { player.release() } }

    BoxWithConstraints(Modifier.fillMaxSize().background(Color.Black)) {
        when {
            videos.isNotEmpty() -> LazyColumn(
                state = listState,
                modifier = Modifier.fillMaxSize()
            ) {
                itemsIndexed(videos, key = { _, video -> video.id }) { index, video ->
                    Box(Modifier.fillMaxWidth().height(maxHeight).background(Color.Black)) {
                        if (index == activeIndex) {
                            AndroidView(
                                factory = { ctx ->
                                    PlayerView(ctx).apply {
                                        this.player = player
                                        useController = true
                                        controllerShowTimeoutMs = 3000
                                        layoutParams = ViewGroup.LayoutParams(
                                            ViewGroup.LayoutParams.MATCH_PARENT,
                                            ViewGroup.LayoutParams.MATCH_PARENT
                                        )
                                    }
                                },
                                update = { it.player = player },
                                modifier = Modifier.fillMaxSize()
                            )
                        } else {
                            AsyncImage(
                                model = video.thumbnailUrl,
                                contentDescription = video.title,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                        }
                        Box(
                            Modifier.fillMaxWidth().height(210.dp).align(Alignment.BottomCenter)
                                .background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xE8000000))))
                        )
                        Column(
                            Modifier.align(Alignment.BottomStart).fillMaxWidth(0.82f)
                                .padding(start = 18.dp, end = 12.dp, bottom = 24.dp),
                            verticalArrangement = Arrangement.spacedBy(7.dp)
                        ) {
                            Surface(color = Color(0xCC111827), shape = RoundedCornerShape(20.dp)) {
                                Text(
                                    "▶  JEMBEE PLAY",
                                    Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                    color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold
                                )
                            }
                            Text(video.creator, color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text(video.title, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, maxLines = 3)
                            Text(
                                "${video.views} views",
                                color = Color.White.copy(alpha = .78f), fontSize = 11.sp
                            )
                        }
                        Text(
                            "${index + 1} / ${videos.size}",
                            Modifier.align(Alignment.TopEnd).padding(18.dp)
                                .background(Color(0x88000000), RoundedCornerShape(20.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            color = Color.White, fontSize = 11.sp
                        )
                        Column(
                            Modifier.align(Alignment.CenterEnd).padding(end = 12.dp, bottom = 92.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(18.dp)
                        ) {
                            ShortsAction("♡", "Like")
                            ShortsAction("▢", "Comment")
                            ShortsAction("↗", "Share") {
                                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/plain"
                                    putExtra(Intent.EXTRA_TEXT, "${video.title} · JEMBEE PLAY")
                                }
                                context.startActivity(Intent.createChooser(shareIntent, "Share video"))
                            }
                            ShortsAction("⋯", "More")
                        }
                    }
                }
            }
            loading -> CircularProgressIndicator(Modifier.align(Alignment.Center), color = Color(0xFFFF1978))
            failed -> Column(
                Modifier.align(Alignment.Center).padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text("Shorts couldn't load", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("Check your connection and try again.", color = Color.LightGray)
                Button(onClick = { refresh() }) { Text("Retry") }
            }
            else -> Column(
                Modifier.align(Alignment.Center).padding(28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("No approved Shorts yet", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("New approved short videos will appear here.", color = Color.LightGray)
                OutlinedButton(onClick = { refresh() }) { Text("Refresh", color = Color.White) }
            }
        }
    }
}


@Composable
private fun ShortsAction(symbol: String, label: String, onClick: (() -> Unit)? = null) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(3.dp)) {
        Surface(
            onClick = { onClick?.invoke() },
            enabled = onClick != null,
            shape = RoundedCornerShape(50),
            color = Color(0x66000000),
            modifier = Modifier.size(44.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text(symbol, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Medium)
            }
        }
        Text(label, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Medium)
    }
}
