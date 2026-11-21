package `in`.jembeeplay.mobile

import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class MonetagAdSlot(
    val name: String,
    val title: String,
    val description: String,
    val ctaLabel: String,
    val advertiserName: String,
    val creativeImageUrl: String?,
    val logoImageUrl: String?,
    val url: String
)

object MonetagAdsClient {
    private const val BASE = "https://jembeeplay.in"
    private const val ENDPOINT = "$BASE/api/ads/placements"
    private val mainHandler = Handler(Looper.getMainLooper())
    private val allowedPlacements = setOf(
        "home-after-learning-banner",
        "home-after-shorts",
        "home-after-video-grid",
        "explore-bottom",
        "videos-after-feed",
        "learning-bottom"
    )

    fun fetch(placement: String, onResult: (Result<MonetagAdSlot?>) -> Unit) {
        if (placement !in allowedPlacements) {
            onResult(Result.failure(IllegalArgumentException("Unknown ad placement")))
            return
        }
        Thread {
            val result = runCatching {
                val connection = (URL("$ENDPOINT?placement=$placement").openConnection() as HttpURLConnection).apply {
                    requestMethod = "GET"
                    connectTimeout = 7000
                    readTimeout = 9000
                    setRequestProperty("Accept", "application/json")
                    setRequestProperty("Cache-Control", "no-cache")
                }
                try {
                    require(connection.url.protocol == "https")
                    val status = connection.responseCode
                    require(status in 200..299) { "Ad placement unavailable ($status)" }
                    val raw = connection.inputStream.bufferedReader().use { it.readText() }
                    require(raw.length <= 128 * 1024) { "Ad response too large" }
                    val root = JSONObject(raw)
                    require(root.optBoolean("success", false)) { "Ad placement disabled or unavailable" }
                    val item = root.optJSONObject("slot") ?: return@runCatching null
                    val target = item.optString("url")
                    if (!target.startsWith("https://")) return@runCatching null
                    val creative = item.optString("creativeImageUrl").takeIf { it.startsWith("https://") }
                    val logo = item.optString("logoImageUrl").takeIf { it.startsWith("https://") }
                    MonetagAdSlot(
                        name = item.optString("name").take(80),
                        title = item.optString("title", "Sponsored offer").take(120),
                        description = item.optString("description").take(240),
                        ctaLabel = item.optString("ctaLabel", "View offer").take(32),
                        advertiserName = item.optString("advertiserName").take(80),
                        creativeImageUrl = creative,
                        logoImageUrl = logo,
                        url = target
                    )
                } finally {
                    connection.disconnect()
                }
            }
            mainHandler.post { onResult(result) }
        }.start()
    }
}
