package `in`.jembeeplay.mobile

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.ima.ImaAdsLoader
import androidx.media3.exoplayer.source.DefaultMediaSourceFactory
import androidx.media3.ui.PlayerView
import androidx.media3.ui.AspectRatioFrameLayout

@OptIn(UnstableApi::class)
@Composable
fun RealVideoPlayer(
    videoUrl: String,
    modifier: Modifier = Modifier,
    autoplay: Boolean = true,
    adTagUrl: String? = null,
    isMuted: Boolean = false,
    showController: Boolean = true,
    fillVideo: Boolean = false
) {
    val context = LocalContext.current
    val playerView = remember(context) {
        PlayerView(context).apply { useController = showController; resizeMode = if (fillVideo) AspectRatioFrameLayout.RESIZE_MODE_ZOOM else AspectRatioFrameLayout.RESIZE_MODE_FIT }
    }
    val imaAdsLoader = remember(context, adTagUrl) {
        if (adTagUrl.isNullOrBlank()) null else ImaAdsLoader.Builder(context)
            .setVastLoadTimeoutMs(5_000)
            .setAdPreloadTimeoutMs(7_000)
            .build()
    }
    val player = remember(videoUrl, adTagUrl, playerView) {
        val mediaSourceFactory = DefaultMediaSourceFactory(context)
        if (imaAdsLoader != null) {
            mediaSourceFactory.setLocalAdInsertionComponents(
                { _ -> imaAdsLoader },
                playerView
            )
        }
        ExoPlayer.Builder(context)
            .setMediaSourceFactory(mediaSourceFactory)
            .build()
            .apply {
                val itemBuilder = MediaItem.Builder().setUri(videoUrl)
                if (!adTagUrl.isNullOrBlank()) {
                    itemBuilder.setAdsConfiguration(
                        MediaItem.AdsConfiguration.Builder(Uri.parse(adTagUrl)).build()
                    )
                }
                setMediaItem(itemBuilder.build())
                playWhenReady = autoplay
                prepare()
                imaAdsLoader?.setPlayer(this)
            }
    }
    DisposableEffect(player, imaAdsLoader) {
        onDispose {
            imaAdsLoader?.setPlayer(null)
            player.release()
            imaAdsLoader?.release()
        }
    }
    AndroidView(
        modifier = modifier,
        factory = { playerView.apply { this.player = player } },
        update = {
            it.useController = showController
            it.resizeMode = if (fillVideo) AspectRatioFrameLayout.RESIZE_MODE_ZOOM else AspectRatioFrameLayout.RESIZE_MODE_FIT
            it.player = player
            player.playWhenReady = autoplay
            player.volume = if (isMuted) 0f else 1f
        }
    )
}
