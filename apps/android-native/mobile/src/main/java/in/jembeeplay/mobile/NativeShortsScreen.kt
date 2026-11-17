package `in`.jembeeplay.mobile

import android.view.ViewGroup
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

@Composable
internal fun NativeShortsScreen() {
    var videos by remember { mutableStateOf<List<CatalogVideo>>(emptyList()) }
    var selected by remember { mutableIntStateOf(0) }
    var playingVideo by remember { mutableStateOf<CatalogVideo?>(null) }
    var loading by remember { mutableStateOf(true) }
    var failed by remember { mutableStateOf(false) }

    fun refresh() {
        loading = true
        failed = false
        VideoCatalogClient.fetch { result ->
            result.onSuccess { page ->
                videos = page.videos.filter { it.format.equals("short", ignoreCase = true) }
                selected = 0
                failed = false
            }.onFailure { failed = true }
            loading = false
        }
    }

    LaunchedEffect(Unit) { refresh() }

    Column(Modifier.fillMaxSize().padding(horizontal = 14.dp, vertical = 8.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Column {
                Text("JEMBEE SHORTS", fontSize = 21.sp, fontWeight = FontWeight.Black)
                Text("Approved short videos", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 11.sp)
            }
            TextButton(onClick = { refresh() }, enabled = !loading) { Text("Refresh") }
        }
        Spacer(Modifier.height(10.dp))
        when {
            loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            failed -> EmptyShortsState("Short videos could not load. Check your connection.", "Retry", ::refresh)
            videos.isEmpty() -> EmptyShortsState("No approved Shorts are available right now.", "Refresh", ::refresh)
            else -> {
                val video = videos[selected.coerceIn(videos.indices)]
                Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(Modifier.weight(1f).fillMaxWidth().background(Color(0xFF10131B), RoundedCornerShape(22.dp))) {
                        Column(Modifier.align(Alignment.Center).padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("▶", color = Color.White, fontSize = 42.sp)
                            Text("Tap to play this Short", color = Color.White, fontWeight = FontWeight.Bold)
                            Text(video.title, color = Color.White.copy(alpha = .8f), fontSize = 13.sp, maxLines = 2)
                            Button(onClick = { playingVideo = video }) { Text("Play Short") }
                        }
                        Column(Modifier.align(Alignment.BottomStart).padding(16.dp)) {
                            Text(video.creator, color = Color.White, fontWeight = FontWeight.Bold)
                            Text(video.title, color = Color.White, maxLines = 2)
                            Text("${video.views} views", color = Color.White.copy(alpha = .75f), fontSize = 11.sp)
                        }
                    }
                    Row(Modifier.fillMaxWidth().padding(vertical = 10.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        OutlinedButton(onClick = { selected = (selected - 1).coerceAtLeast(0) }, enabled = selected > 0) { Text("Previous") }
                        Text("${selected + 1} / ${videos.size}", fontWeight = FontWeight.SemiBold)
                        Button(onClick = { selected = (selected + 1).coerceAtMost(videos.lastIndex) }, enabled = selected < videos.lastIndex) { Text("Next") }
                    }
                }
            }
        }
    }

    playingVideo?.let { video -> NativeShortPlayer(video = video, onClose = { playingVideo = null }) }
}

@Composable
private fun EmptyShortsState(message: String, action: String, onAction: () -> Unit) {
    Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(message, color = MaterialTheme.colorScheme.onSurfaceVariant)
        TextButton(onClick = onAction) { Text(action) }
    }
}

@Composable
private fun NativeShortPlayer(video: CatalogVideo, onClose: () -> Unit) {
    val context = LocalContext.current
    val player = remember(video.id) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(video.playbackUrl))
            repeatMode = ExoPlayer.REPEAT_MODE_ONE
            prepare()
            playWhenReady = true
        }
    }
    DisposableEffect(player) { onDispose { player.release() } }
    Dialog(onDismissRequest = onClose) {
        Column(Modifier.fillMaxWidth().background(Color(0xFF10131B), RoundedCornerShape(18.dp)).padding(12.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text(video.title, Modifier.weight(1f), color = Color.White, maxLines = 2, fontWeight = FontWeight.Bold)
                TextButton(onClick = onClose) { Text("Close") }
            }
            AndroidView(
                factory = { ctx -> PlayerView(ctx).apply {
                    this.player = player
                    useController = true
                    layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
                } },
                modifier = Modifier.fillMaxWidth().heightIn(min = 360.dp, max = 620.dp)
            )
        }
    }
}
