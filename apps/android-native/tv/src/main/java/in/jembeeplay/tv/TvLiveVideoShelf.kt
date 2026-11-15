package `in`.jembeeplay.tv

import android.view.ViewGroup
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.background
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import coil.compose.AsyncImage
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.tv.material3.*
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

@Composable
fun TvLiveVideoShelf() {
    var videos by remember { mutableStateOf<List<TvCatalogVideo>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var failed by remember { mutableStateOf(false) }
    var selected by remember { mutableStateOf<TvCatalogVideo?>(null) }

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
            if (loading) Text("Loading…", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
        when {
            videos.isNotEmpty() -> LazyRow(horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                items(videos, key = { it.id }) { video ->
                    Surface(
                        onClick = { selected = video },
                        modifier = Modifier.width(250.dp).height(148.dp),
                        shape = ClickableSurfaceDefaults.shape(),
                        colors = ClickableSurfaceDefaults.colors(focusedContainerColor = androidx.compose.ui.graphics.Color(0xFF0878D1))
                    ) {
                        Box(Modifier.fillMaxSize()) {
                            AsyncImage(
                                model = video.thumbnailUrl,
                                contentDescription = video.title,
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xDD05070B)))))
                            Column(Modifier.align(androidx.compose.ui.Alignment.BottomStart).padding(16.dp), verticalArrangement = Arrangement.Bottom) {
                                Text("▶", fontSize = 25.sp)
                                Text(video.title, fontSize = 16.sp, fontWeight = FontWeight.Bold, maxLines = 2)
                                Text("${video.creator} · ${video.views} views", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
            loading -> Text("Loading approved videos…")
            failed -> Button(onClick = { refresh() }) { Text("Retry loading videos") }
            else -> Text("No approved videos are available yet.")
        }
    }

    selected?.let { video -> TvNativeVideoPlayer(video = video, onClose = { selected = null }) }
}

@Composable
private fun TvNativeVideoPlayer(video: TvCatalogVideo, onClose: () -> Unit) {
    val context = LocalContext.current
    val player = remember(video.id) {
        ExoPlayer.Builder(context).build().apply {
            setMediaItem(MediaItem.fromUri(video.playbackUrl))
            prepare()
            playWhenReady = true
        }
    }
    DisposableEffect(player) { onDispose { player.release() } }
    BackHandler(onBack = onClose)
    Dialog(onDismissRequest = onClose) {
        Column(Modifier.fillMaxWidth().padding(20.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(video.title, Modifier.weight(1f), fontSize = 22.sp, fontWeight = FontWeight.Bold, maxLines = 2)
                Button(onClick = onClose) { Text("Close") }
            }
            AndroidView(
                factory = { ctx -> PlayerView(ctx).apply {
                    this.player = player
                    useController = true
                    controllerShowTimeoutMs = 0
                    layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
                    isFocusable = true
                    requestFocus()
                } },
                modifier = Modifier.fillMaxWidth().height(420.dp)
            )
            Text(video.creator, Modifier.padding(top = 10.dp), fontSize = 15.sp)
        }
    }
}
