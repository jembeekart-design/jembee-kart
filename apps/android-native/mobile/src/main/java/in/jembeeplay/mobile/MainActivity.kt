package `in`.jembeeplay.mobile

import android.os.Bundle
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import android.webkit.CookieManager
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import java.net.HttpURLConnection
import java.net.URL
import org.json.JSONObject
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Cast
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.VideoLibrary
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
import coil.compose.AsyncImage

private val JembeeAccent = Color(0xFF39C6F4)
private val JembeeBackground = Color(0xFF080B12)
private val JembeeSurface = Color(0xFF151B27)
private val JembeeMuted = Color(0xFF9AA8BC)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        setContent { JembeeMobileApp() }
    }
}

@Composable
private fun JembeeMobileApp() {
    val context = LocalContext.current
    var remoteConfig by remember { mutableStateOf(JembeeRemoteConfig()) }
    LaunchedEffect(Unit) { RemoteConfigClient.fetch(context) { remoteConfig = it } }
    var selected by remember { mutableStateOf("Home") }
    var webReturn by remember { mutableStateOf("Home") }
    var watchReturn by remember { mutableStateOf("Home") }
    var activeVideo by remember { mutableStateOf<JembeeVideo?>(null) }
    var activeWebPath by remember { mutableStateOf("/login") }
    var activeWebTitle by remember { mutableStateOf("JEMBEE PLAY") }
    BackHandler(enabled = selected != "Home") {
        selected = when (selected) {
            "Watch" -> watchReturn
            "Web" -> webReturn
            else -> "Home"
        }
    }
    val colors = darkColorScheme(primary = JembeeAccent, background = JembeeBackground, surface = JembeeSurface)
    MaterialTheme(colorScheme = colors) {
        Scaffold(
            containerColor = colors.background,
            bottomBar = {
                if (selected != "Shorts" && selected != "Watch") {
                    JembeeBottomBar(selected = selected, onSelect = { item ->
                        when (item) {
                            "Earn" -> { activeWebPath = "/login?redirect=%2Fvideos%2Freward-center"; activeWebTitle = "Earn & Rewards"; selected = "Web" }
                            "Library" -> { activeWebPath = "/videos/history"; activeWebTitle = "Your Library & Watch History"; webReturn = "Home"; selected = "Web" }
                            else -> selected = item
                        }
                    })
                }
            }
        ) { padding ->
            Column(Modifier.fillMaxSize().then(if (selected == "Shorts" || selected == "Watch") Modifier else Modifier.padding(padding))) {
                if (selected != "Shorts" && selected != "Watch") {
                    HomeTopBar(
                        onProfile = { activeWebPath = "/login"; activeWebTitle = "Profile & Login"; webReturn = "Home"; selected = "Web" },
                        onSearch = { activeWebPath = "/search"; activeWebTitle = "Search"; webReturn = "Home"; selected = "Web" },
                        onNotifications = { activeWebPath = "/videos/notifications"; activeWebTitle = "Notifications"; webReturn = "Home"; selected = "Web" },
                        onCast = {
                            val castIntent = Intent("android.settings.CAST_SETTINGS")
                            runCatching { context.startActivity(castIntent) }
                                .onFailure { Toast.makeText(context, "Cast settings are not available on this device.", Toast.LENGTH_SHORT).show() }
                        }
                    )
                }
                if (remoteConfig.maintenanceEnabled) {
                    Text(remoteConfig.maintenanceMessage.ifBlank { "JEMBEE PLAY is temporarily under maintenance." }, Modifier.fillMaxWidth().padding(12.dp), color = colors.error)
                }
                when (selected) {
                    "Home" -> HomeScreen(onOpenShorts = { selected = "Shorts" }, onOpenWatch = { video -> activeVideo = video; watchReturn = "Home"; selected = "Watch" }, onLearn = { selected = "Learn" }, onLive = { selected = "Live" }, onUpload = { activeWebPath = "/login?redirect=%2Fvideos%2Fupload"; activeWebTitle = "Create & Upload"; selected = "Web" }, onEarn = { activeWebPath = "/login?redirect=%2Fvideos%2Freward-center"; activeWebTitle = "Earn & Rewards"; selected = "Web" })
                    "Shorts" -> ShortsScreen(onBack = { selected = "Home" }, onOpenWatch = { video -> activeVideo = video; watchReturn = "Shorts"; selected = "Watch" }, onOpenWeb = { path, title -> webReturn = "Shorts"; activeWebPath = path; activeWebTitle = title; selected = "Web" })
                    "Live" -> LiveScreen(onBack = { selected = "Home" })
                    "Watch" -> WatchScreen(video = activeVideo, onBack = { selected = watchReturn })
                    "Web" -> JembeeWebScreen(path = activeWebPath, title = activeWebTitle, onClose = { selected = webReturn })
                    "Learn" -> NativeLearningLibraryScreen()
                    "Library" -> SimpleScreen("Your Library", "Saved videos, watch history and downloads")
                    else -> SimpleScreen("JEMBEE PLAY", "Choose a section to continue")
                }
            }
        }
    }
}

@Composable
private fun HomeScreen(onOpenShorts: () -> Unit, onOpenWatch: (JembeeVideo) -> Unit, onLearn: () -> Unit, onLive: () -> Unit, onUpload: () -> Unit, onEarn: () -> Unit) {
    var shorts by remember { mutableStateOf<List<JembeeVideo>>(emptyList()) }
    var longVideos by remember { mutableStateOf<List<JembeeVideo>>(emptyList()) }
    var shortsLoading by remember { mutableStateOf(true) }
    var longLoading by remember { mutableStateOf(true) }
    var shortsError by remember { mutableStateOf<String?>(null) }
    var longError by remember { mutableStateOf<String?>(null) }
    LaunchedEffect(Unit) {
        VideoCatalogClient.fetch("short") { items, message -> shorts = items; shortsError = message; shortsLoading = false }
        VideoCatalogClient.fetch("long") { items, message -> longVideos = items; longError = message; longLoading = false }
    }
    Column(Modifier.fillMaxSize().background(Color(0xFF07080D)).verticalScroll(rememberScrollState()).padding(bottom = 18.dp)) {
        PremiumHeroBanner(onWatch = onOpenShorts)
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            ActionTile("Learning\nLibrary", Color(0xFF29114E), Color(0xFFD9A4FF), Icons.Filled.MenuBook, onLearn)
            ActionTile("Shorts", Color(0xFF4A102B), Color(0xFFFF1978), Icons.Filled.PlayArrow, onOpenShorts)
            ActionTile("Live", Color(0xFF103B43), Color(0xFF45DCE7), Icons.Filled.Notifications, onLive)
            ActionTile("Create\nUpload", Color(0xFF103F45), Color(0xFF57E5E8), Icons.Filled.CloudUpload, onUpload)
            ActionTile("Earn\n& Rewards", Color(0xFF443516), Color(0xFFFFC53D), Icons.Filled.AccountBalanceWallet, onEarn)
        }
        SectionHeader("Continue Learning", "Books · Chapters · Questions", onLearn)
        Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 4.dp).background(Color(0xFF15131E), RoundedCornerShape(17.dp)).clickable(onClick = onLearn).padding(10.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Box(Modifier.size(110.dp, 92.dp).background(Brush.linearGradient(listOf(Color(0xFF103D20), Color(0xFF267A37))), RoundedCornerShape(12.dp)), contentAlignment = Alignment.Center) { Text("🌿", fontSize = 43.sp) }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
                Text("Explore your Learning Library", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Books  ·  Chapters  ·  Questions", color = JembeeMuted, fontSize = 11.sp)
            }
        }
        MonetagAdCard("home-after-learning-banner")
        VideoShelf("Trending Shorts 🔥", "Popular approved Shorts from JEMBEE PLAY", shorts, shortsLoading, shortsError ?: "No approved Shorts are available yet.", { onOpenShorts() }, onOpenShorts)
        MonetagAdCard("home-after-shorts")
        VideoShelf("Trending Long Videos", "Popular approved long videos from JEMBEE PLAY", longVideos, longLoading, longError ?: "No approved long videos are available yet.", onOpenWatch, { longVideos.firstOrNull()?.let(onOpenWatch) })
        MonetagAdCard("home-after-video-grid")
    }
}


@Composable
private fun MonetagAdCard(placement: String) {
    val context = LocalContext.current
    var slot by remember(placement) { mutableStateOf<MonetagAdSlot?>(null) }
    LaunchedEffect(placement) {
        MonetagAdsClient.fetch(placement) { result -> slot = result.getOrNull() }
    }
    val ad = slot ?: return
    Surface(
        onClick = {
            runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(ad.url))) }
        },
        color = Color(0xFFF7F8FC),
        shape = RoundedCornerShape(18.dp),
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp)
    ) {
        Column(Modifier.padding(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                if (!ad.logoImageUrl.isNullOrBlank()) {
                    AsyncImage(model = ad.logoImageUrl, contentDescription = null, modifier = Modifier.size(38.dp), contentScale = ContentScale.Fit)
                }
                Column(Modifier.weight(1f)) {
                    Text(ad.title, color = Color(0xFF111827), fontWeight = FontWeight.Bold, fontSize = 15.sp, maxLines = 2)
                    Text(ad.advertiserName.ifBlank { ad.name }, color = Color(0xFF64748B), fontSize = 11.sp, maxLines = 1)
                }
                Text("Sponsored", color = Color(0xFF475569), fontSize = 10.sp, fontWeight = FontWeight.Bold)
            }
            if (!ad.creativeImageUrl.isNullOrBlank()) {
                AsyncImage(model = ad.creativeImageUrl, contentDescription = null, modifier = Modifier.fillMaxWidth().padding(top = 10.dp).heightIn(max = 170.dp), contentScale = ContentScale.Crop)
            }
            if (ad.description.isNotBlank()) {
                Text(ad.description, color = Color(0xFF475569), fontSize = 12.sp, modifier = Modifier.padding(top = 9.dp), maxLines = 3)
            }
            Text(ad.ctaLabel, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp,
                modifier = Modifier.fillMaxWidth().padding(top = 11.dp).background(Color(0xFF101827), RoundedCornerShape(24.dp)).padding(vertical = 12.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        }
    }
}

@Composable
private fun PremiumHeroBanner(onWatch: () -> Unit) {
    Box(Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp).height(190.dp).background(Brush.horizontalGradient(listOf(Color(0xFF17072F), Color(0xFF35106B), Color(0xFF16112D))), RoundedCornerShape(20.dp))) {
        AsyncImage(model = R.drawable.reference_hero_students, contentDescription = "JEMBEE PLAY featured learning artwork", contentScale = ContentScale.Crop, modifier = Modifier.fillMaxHeight().fillMaxWidth(0.53f).align(Alignment.CenterEnd))
        Box(Modifier.fillMaxSize().background(Brush.horizontalGradient(listOf(Color(0xFF17072F), Color(0xEE35106B), Color(0x2235116B))), RoundedCornerShape(20.dp)))
        Column(Modifier.align(Alignment.CenterStart).fillMaxWidth(0.61f).padding(start = 18.dp, end = 4.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("JEMBEE PLAY  ▶", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Black, letterSpacing = 0.6.sp)
            Text("Watch  ·  Learn  ·  Create  ·  Share & Earn", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, maxLines = 3, lineHeight = 17.sp)
            Button(onClick = onWatch, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF1978)), contentPadding = PaddingValues(horizontal = 16.dp, vertical = 3.dp)) {
                Text("▶  Watch Now", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun HomeTopBar(onProfile: () -> Unit, onSearch: () -> Unit, onNotifications: () -> Unit, onCast: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().background(Color(0xFF07080D)).padding(horizontal = 18.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(
            Modifier.size(54.dp).background(
                Brush.linearGradient(listOf(Color(0xFFFF1680), Color(0xFF8B25D6))),
                RoundedCornerShape(15.dp)
            ),
            contentAlignment = Alignment.Center
        ) {
            Icon(Icons.Filled.PlayArrow, contentDescription = "JEMBEE PLAY", tint = Color.White, modifier = Modifier.size(38.dp))
        }
        Text("JEMBEE PLAY", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Black, modifier = Modifier.weight(1f), maxLines = 1)
        IconButton(onClick = onCast) { Icon(Icons.Filled.Cast, contentDescription = "Cast", tint = Color.White, modifier = Modifier.size(28.dp)) }
        IconButton(onClick = onNotifications) { Icon(Icons.Filled.Notifications, contentDescription = "Notifications", tint = Color.White, modifier = Modifier.size(27.dp)) }
        IconButton(onClick = onSearch) { Icon(Icons.Filled.Search, contentDescription = "Search", tint = Color.White, modifier = Modifier.size(28.dp)) }
        IconButton(onClick = onProfile, modifier = Modifier.size(48.dp).background(Color(0xFF211F2B), CircleShape)) {
            Icon(Icons.Filled.Person, contentDescription = "Profile", tint = Color.White, modifier = Modifier.size(27.dp))
        }
    }
}

@Composable
private fun JembeeBottomBar(selected: String, onSelect: (String) -> Unit) {
    Row(
        Modifier.fillMaxWidth().background(Color(0xFF32132C)).padding(horizontal = 5.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically
    ) {
        val items = listOf(
            Triple("Home", Icons.Filled.Home, "Home"),
            Triple("Shorts", Icons.Filled.PlayArrow, "Shorts"),
            Triple("Learn", Icons.Filled.MenuBook, "Learning"),
            Triple("Earn", Icons.Filled.AccountBalanceWallet, "Earn"),
            Triple("Library", Icons.Filled.VideoLibrary, "Library")
        )
        items.forEach { (key, icon, label) ->
            Column(
                Modifier.weight(1f).clickable { onSelect(key) }.padding(vertical = 3.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                Box(
                    Modifier.width(82.dp).height(38.dp)
                        .background(if (selected == key) Color(0xFF59435F) else Color.Transparent, RoundedCornerShape(24.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = label, tint = if (selected == key) Color.White else Color(0xFFD8C6D6), modifier = Modifier.size(25.dp))
                }
                Text(label, color = if (selected == key) Color.White else Color(0xFFD8C6D6), fontSize = 11.sp, fontWeight = if (selected == key) FontWeight.Bold else FontWeight.Medium)
            }
        }
    }
}

@Composable
private fun ActionTile(label: String, background: Color, iconColor: Color, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Column(Modifier.width(76.dp).height(102.dp).background(background, RoundedCornerShape(17.dp)).clickable(onClick = onClick).padding(7.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Icon(icon, contentDescription = null, tint = iconColor, modifier = Modifier.size(29.dp))
        Spacer(Modifier.height(6.dp))
        Text(label, color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, lineHeight = 12.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
    }
}

@Composable
private fun VideoShelf(
    title: String,
    subtitle: String,
    videos: List<JembeeVideo>,
    loading: Boolean,
    error: String,
    onVideo: (JembeeVideo) -> Unit,
    onSeeAll: () -> Unit
) {
    Row(
        Modifier.fillMaxWidth().padding(start = 18.dp, end = 14.dp, top = 25.dp, bottom = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, color = Color(0xFFF0EDF5), fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Text(subtitle, color = Color(0xFF92909E), fontSize = 11.sp)
        }
        TextButton(onClick = onSeeAll) { Text("See All  ›", color = Color.White, fontSize = 12.sp) }
    }
    when {
        loading -> CircularProgressIndicator(Modifier.padding(20.dp), color = Color(0xFFFF2385))
        videos.isEmpty() -> Text(error, Modifier.padding(horizontal = 18.dp, vertical = 12.dp), color = Color(0xFF92909E), fontSize = 12.sp)
        else -> Row(
            Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(start = 16.dp, end = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            videos.take(12).forEachIndexed { index, video ->
                Column(Modifier.width(145.dp).clickable { onVideo(video) }) {
                    Box(Modifier.fillMaxWidth().height(118.dp).background(Color(0xFF172033), RoundedCornerShape(16.dp)), contentAlignment = Alignment.Center) {
                        AsyncImage(model = video.thumbnailUrl, contentDescription = video.caption, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                        Box(Modifier.size(48.dp).background(Color.Black.copy(alpha = .72f), CircleShape), contentAlignment = Alignment.Center) {
                            Icon(Icons.Filled.PlayArrow, contentDescription = "Play video", tint = Color.White, modifier = Modifier.size(30.dp))
                        }
                        Text("JEMBEE PLAY", Modifier.align(Alignment.BottomEnd).padding(7.dp).background(Color.Black.copy(alpha = .78f), RoundedCornerShape(6.dp)).padding(horizontal = 6.dp, vertical = 4.dp), color = Color.White, fontSize = 9.sp)
                    }
                    Text(video.caption.ifBlank { "Untitled video" }, color = Color(0xFFE8E3EC), fontSize = 12.sp, fontWeight = FontWeight.Bold, maxLines = 1, modifier = Modifier.padding(top = 7.dp))
                    Text("\${video.creatorName} · \${video.views}", color = Color(0xFF92909E), fontSize = 10.sp, maxLines = 1, modifier = Modifier.padding(top = 4.dp))
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(title: String, subtitle: String, onClick: (() -> Unit)? = null) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 18.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Column {
            Text(title, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text(subtitle, color = JembeeMuted, fontSize = 10.sp)
        }
        if (onClick != null) {
            TextButton(onClick = onClick) { Text("See all  →", color = JembeeAccent, fontSize = 11.sp) }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ShortsScreen(onBack: () -> Unit, onOpenWatch: (JembeeVideo) -> Unit, onOpenWeb: (String, String) -> Unit) {
    val context = LocalContext.current
    var videos by remember { mutableStateOf<List<JembeeVideo>>(emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }
    var loading by remember { mutableStateOf(true) }
    var muted by remember { mutableStateOf(false) }
    var liked by remember { mutableStateOf<Set<String>>(emptySet()) }
    var likeCounts by remember { mutableStateOf<Map<String, Int>>(emptyMap()) }
    var authToken by remember { mutableStateOf<String?>(null) }
    var likeBusy by remember { mutableStateOf<Set<String>>(emptySet()) }
    var following by remember { mutableStateOf<Set<String>>(emptySet()) }
    var followBusy by remember { mutableStateOf<Set<String>>(emptySet()) }
    var playingById by remember { mutableStateOf<Map<String, Boolean>>(emptyMap()) }

    AndroidView(
        modifier = Modifier.size(1.dp),
        factory = { viewContext ->
            WebView(viewContext).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                addJavascriptInterface(object {
                    @android.webkit.JavascriptInterface
                    fun onToken(token: String) {
                        android.os.Handler(android.os.Looper.getMainLooper()).post {
                            authToken = token.takeIf { it.isNotBlank() }
                        }
                    }
                    @android.webkit.JavascriptInterface
                    fun onSignedOut() {
                        android.os.Handler(android.os.Looper.getMainLooper()).post { authToken = null }
                    }
                }, "JembeeNativeAuth")
                webViewClient = WebViewClient()
                loadUrl("https://jembeeplay.in/native-auth-bridge")
            }
        },
        update = {}
    )

    fun submitLike(video: JembeeVideo, currentlyLiked: Boolean) {
        val token = authToken
        if (token.isNullOrBlank()) {
            Toast.makeText(context, "Like karne ke liye pehle login karein", Toast.LENGTH_SHORT).show()
            return
        }
        if (video.id in likeBusy) return
        likeBusy = likeBusy + video.id
        Thread {
            val result = runCatching {
                val connection = (URL("https://jembeeplay.in/api/shorts/video-like").openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 10000
                    readTimeout = 15000
                    doOutput = true
                    setRequestProperty("Content-Type", "application/json")
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    val payload = JSONObject().put("videoId", video.id)
                        .put("action", if (currentlyLiked) "unlike" else "like")
                        .put("token", token).toString()
                    connection.outputStream.use { it.write(payload.toByteArray(Charsets.UTF_8)) }
                    val status = connection.responseCode
                    val stream = if (status in 200..299) connection.inputStream else connection.errorStream
                    val body = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
                    val json = JSONObject(body.ifBlank { "{}" })
                    Triple(status, json.optBoolean("success"), json.optString("message"))
                } finally { connection.disconnect() }
            }
            android.os.Handler(android.os.Looper.getMainLooper()).post {
                likeBusy = likeBusy - video.id
                val (status, success, message) = result.getOrElse { Triple(0, false, it.message ?: "Network error") }
                val alreadyInTargetState = (currentlyLiked && status == 409 && message == "Not liked") ||
                    (!currentlyLiked && status == 409 && message == "Already liked")
                if (success || alreadyInTargetState) {
                    liked = if (currentlyLiked) liked - video.id else liked + video.id
                    if (success) {
                        val current = likeCounts[video.id] ?: video.likes
                        likeCounts = likeCounts + (video.id to (current + if (currentlyLiked) -1 else 1).coerceAtLeast(0))
                    }
                } else {
                    Toast.makeText(context, if (status == 401 || status == 403) "Session expire hai, dobara login karein" else message.ifBlank { "Like update nahi hua" }, Toast.LENGTH_SHORT).show()
                }
            }
        }.start()
    }

    fun toggleFollow(video: JembeeVideo) {
        val token = authToken
        if (token.isNullOrBlank()) {
            Toast.makeText(context, "Follow karne ke liye pehle login karein", Toast.LENGTH_SHORT).show()
            return
        }
        if (video.creatorId.isBlank() || video.creatorId in followBusy) {
            if (video.creatorId.isBlank()) Toast.makeText(context, "Creator profile unavailable", Toast.LENGTH_SHORT).show()
            return
        }
        val isFollowing = video.creatorId in following
        followBusy = followBusy + video.creatorId
        Thread {
            val result = runCatching {
                val connection = (URL("https://jembeeplay.in/api/app/follow").openConnection() as HttpURLConnection).apply {
                    requestMethod = "POST"
                    connectTimeout = 10000
                    readTimeout = 15000
                    doOutput = true
                    setRequestProperty("Authorization", "Bearer $token")
                    setRequestProperty("Content-Type", "application/json")
                    setRequestProperty("Accept", "application/json")
                }
                try {
                    val payload = JSONObject().put("creatorId", video.creatorId)
                        .put("action", if (isFollowing) "unfollow" else "follow").toString()
                    connection.outputStream.use { it.write(payload.toByteArray(Charsets.UTF_8)) }
                    val status = connection.responseCode
                    val body = (if (status in 200..299) connection.inputStream else connection.errorStream)
                        ?.bufferedReader()?.use { it.readText() }.orEmpty()
                    val json = JSONObject(body.ifBlank { "{}" })
                    Triple(status, json.optBoolean("success"), json.optString("message"))
                } finally { connection.disconnect() }
            }
            android.os.Handler(android.os.Looper.getMainLooper()).post {
                followBusy = followBusy - video.creatorId
                val (status, success, message) = result.getOrElse { Triple(0, false, it.message ?: "Network error") }
                if (success) {
                    following = if (isFollowing) following - video.creatorId else following + video.creatorId
                    Toast.makeText(context, if (isFollowing) "Unfollowed" else "Following creator", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(context, if (status == 401 || status == 403) "Session expire hai, dobara login karein" else message.ifBlank { "Follow update nahi hua" }, Toast.LENGTH_SHORT).show()
                }
            }
        }.start()
    }

    LaunchedEffect(Unit) {
        VideoCatalogClient.fetch("short") { items, message ->
            videos = items
            error = message
            loading = false
        }
    }
    val pagerState = rememberPagerState(pageCount = { videos.size })
    Box(Modifier.fillMaxSize().background(Color.Black)) {
        when {
            loading -> CircularProgressIndicator(Modifier.align(Alignment.Center), color = JembeeAccent)
            videos.isEmpty() -> Column(Modifier.align(Alignment.Center).padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Jembee Shorts", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Text(error ?: "Approved Shorts yahan dikhengi.", color = JembeeMuted, modifier = Modifier.padding(12.dp))
                TextButton(onClick = onBack) { Text("Back") }
            }
            else -> VerticalPager(state = pagerState, modifier = Modifier.fillMaxSize(), beyondViewportPageCount = 1) { page ->
                val video = videos[page]
                val isLiked = video.id in liked
                Box(Modifier.fillMaxSize().background(Color.Black)) {
                    val isPlaying = playingById[video.id] ?: (pagerState.currentPage == page)
                    RealVideoPlayer(video.streamUrl, Modifier.fillMaxSize(), autoplay = pagerState.currentPage == page && isPlaying, isMuted = muted, showController = false, fillVideo = true)
                    Surface(onClick = { playingById = playingById + (video.id to !isPlaying) }, color = Color(0x66000000), shape = CircleShape, modifier = Modifier.align(Alignment.Center).size(66.dp)) {
                        Box(contentAlignment = Alignment.Center) { Icon(if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow, contentDescription = if (isPlaying) "Pause video" else "Play video", tint = Color.White, modifier = Modifier.size(38.dp)) }
                    }
                    Box(Modifier.fillMaxWidth().height(210.dp).align(Alignment.TopCenter).background(Brush.verticalGradient(listOf(Color(0x9906060B), Color.Transparent))))
                    Box(Modifier.fillMaxWidth().height(310.dp).align(Alignment.BottomCenter).background(Brush.verticalGradient(listOf(Color.Transparent, Color(0xAA050509), Color(0xDD050509)))))
                    Row(Modifier.align(Alignment.TopEnd).padding(top = 18.dp, end = 16.dp), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                        ShortsHeaderButton("⌕", "Search") { onOpenWeb("/search", "Search JEMBEE PLAY") }
                        ShortsHeaderButton("♙+", "Find creators") { onOpenWeb("/followers", "Find Creators") }
                        ShortsHeaderButton("♧", "Notifications") { onOpenWeb("/videos/notifications", "Notifications") }
                    }
                    Column(Modifier.align(Alignment.CenterEnd).padding(end = 12.dp, top = 74.dp, bottom = 112.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(13.dp)) {
                        ShortsRailAction(if (isLiked) "♥" else "♡", compactCount(likeCounts[video.id] ?: video.likes)) {
                            submitLike(video, isLiked)
                        }
                        ShortsRailAction("▤", "Comment") { onOpenWeb("/shorts?v=${Uri.encode(video.id)}&nativeAction=comment", "JEMBEE PLAY · Comments") }
                        ShortsRailAction("🎁", "Support") { onOpenWeb("/login?redirect=%2Fvideos%2Freward-center", "Creator Support") }
                        ShortsRailAction("↗", "Share") {
                            val send = Intent(Intent.ACTION_SEND).apply {
                                type = "text/plain"
                                putExtra(Intent.EXTRA_TEXT, "https://jembeeplay.in/shorts?v=" + Uri.encode(video.id))
                            }
                            runCatching { context.startActivity(Intent.createChooser(send, "Share Jembee Short")) }
                                .onFailure { Toast.makeText(context, "Share unavailable on this device", Toast.LENGTH_SHORT).show() }
                            val token = authToken
                            if (!token.isNullOrBlank()) {
                                Thread {
                                    runCatching {
                                        val connection = (URL("https://jembeeplay.in/api/shorts/video-share").openConnection() as HttpURLConnection).apply {
                                            requestMethod = "POST"
                                            connectTimeout = 8000
                                            readTimeout = 10000
                                            doOutput = true
                                            setRequestProperty("Authorization", "Bearer $token")
                                            setRequestProperty("Content-Type", "application/json")
                                            setRequestProperty("Accept", "application/json")
                                        }
                                        try {
                                            val payload = JSONObject().put("videoId", video.id).toString()
                                            connection.outputStream.use { it.write(payload.toByteArray(Charsets.UTF_8)) }
                                            require(connection.responseCode in 200..299) { "Share count could not be updated" }
                                        } finally { connection.disconnect() }
                                    }
                                }.start()
                            }
                        }
                        ShortsRailAction("⋮", "More") { onOpenWeb("/shorts?v=${Uri.encode(video.id)}&nativeAction=more", "JEMBEE PLAY · Options") }
                        ShortsRailAction(if (muted) "◖" else "◖))", "Sound") { muted = !muted }
                    }
                    Column(Modifier.align(Alignment.BottomStart).fillMaxWidth().padding(start = 22.dp, end = 104.dp, bottom = 30.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Surface(
                                onClick = { onOpenWeb("/videos/profile", "JEMBEE PLAY · Profile") },
                                color = Color(0xFF30253B),
                                shape = CircleShape,
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = .35f)),
                                modifier = Modifier.size(48.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    if (video.photoUrl.isNotBlank()) {
                                        AsyncImage(model = video.photoUrl, contentDescription = "Creator profile photo", contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                                    } else {
                                        Icon(Icons.Filled.Person, contentDescription = "Upload profile photo", tint = Color.White, modifier = Modifier.size(27.dp))
                                    }
                                }
                            }
                            Column(Modifier.weight(1f).clickable { onOpenWeb("/videos/profile", "JEMBEE PLAY · Profile") }) {
                                Text(video.creatorName.ifBlank { video.username.substringBefore("@").ifBlank { "JEMBEE PLAY Creator" } }, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                            }
                            TextButton(onClick = { toggleFollow(video) }, enabled = video.creatorId.isNotBlank() && video.creatorId !in followBusy, colors = ButtonDefaults.textButtonColors(contentColor = Color.White), modifier = Modifier.background(Color(0xFF8D25C8), RoundedCornerShape(24.dp))) {
                                Text(if (video.creatorId in following) "Following" else "Follow", fontWeight = FontWeight.Bold)
                            }
                        }
                        Text(video.caption.ifBlank { "Watch more on JEMBEE PLAY" }, color = Color.White, fontSize = 15.sp, lineHeight = 21.sp, maxLines = 3)
                        Text("${compactCount(video.views)} views  •  ${page + 1}/${videos.size}", color = Color.White.copy(alpha = .7f), fontSize = 11.sp)
                    }
                }
            }
        }
    }


}

@Composable
private fun ShortsHeaderButton(symbol: String, description: String, onClick: () -> Unit) {
    Surface(onClick = onClick, color = Color(0x990B0C16), shape = CircleShape, border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = .16f)), modifier = Modifier.size(48.dp)) {
        Box(contentAlignment = Alignment.Center) { Text(symbol, color = Color.White, fontSize = 25.sp, fontWeight = FontWeight.Medium) }
    }
}

@Composable
private fun ShortsRailAction(symbol: String, label: String, onClick: () -> Unit) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(3.dp)) {
        Surface(onClick = onClick, color = Color(0x990A0B12), shape = CircleShape, border = androidx.compose.foundation.BorderStroke(1.dp, Color.White.copy(alpha = .18f)), modifier = Modifier.size(52.dp)) {
            Box(contentAlignment = Alignment.Center) { Text(symbol, color = Color.White, fontSize = 27.sp, fontWeight = FontWeight.Medium) }
        }
        Text(label, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Medium, maxLines = 1)
    }
}

private fun compactCount(value: Int): String = when {
    value >= 1_000_000 -> String.format("%.1fM", value / 1_000_000f)
    value >= 1_000 -> String.format("%.1fK", value / 1_000f)
    else -> value.toString()
}

@Composable
private fun WatchScreen(video: JembeeVideo?, onBack: () -> Unit) {
    var videoAdConfig by remember(video?.streamUrl) { mutableStateOf(NativeVideoAdConfig()) }
    LaunchedEffect(video?.streamUrl) {
        videoAdConfig = NativeVideoAdConfig()
        if (video != null) VideoAdsConfigClient.fetch { videoAdConfig = it }
    }
    Column(Modifier.fillMaxSize().background(JembeeBackground)) {
        if (video == null) {
            Text("Home se koi video select karein.", color = Color.White, modifier = Modifier.padding(24.dp))
        } else {
            RealVideoPlayer(
                video.streamUrl,
                Modifier.fillMaxWidth().aspectRatio(16f / 9f),
                adTagUrl = videoAdConfig.longVideoPreRollUrl
            )
            Column(Modifier.padding(18.dp)) {
                Text(video.caption.ifBlank { "JEMBEE PLAY video" }, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("${video.creatorName}  •  ${video.views} views", color = JembeeMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 6.dp))
                Text("${video.likes} likes", color = JembeeMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 8.dp))
            }
        }
        TextButton(onClick = onBack) { Text("‹ Back", color = JembeeAccent) }
    }
}

@Composable
private fun LearnScreen() {
    var nodes by remember { mutableStateOf<List<SchoolLearningNode>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var stage by remember { mutableIntStateOf(0) }
    var selected by remember { mutableStateOf<List<SchoolLearningNode>>(emptyList()) }
    var answers by remember { mutableStateOf<List<SchoolAnswerVideo>>(emptyList()) }
    var answersLoading by remember { mutableStateOf(false) }
    var activeAnswer by remember { mutableStateOf<SchoolAnswerVideo?>(null) }
    LaunchedEffect(Unit) { SchoolCatalogClient.fetch { items, message -> nodes = items; error = message; loading = false } }
    val types = listOf("board", "school", "class", "subject", "chapter", "question")
    val titles = listOf("Choose Board", "Choose School", "Choose Class", "Choose Subject", "Choose Chapter", "Choose Question", "Video Answers")
    val parent = selected.lastOrNull()?.id
    val currentType = types.getOrNull(stage)
    val entries = remember(nodes, stage, parent) {
        if (currentType == null) emptyList()
        else nodes.filter { node -> node.type == currentType && node.parentId == if (stage == 0) null else parent }.sortedBy { it.name.lowercase() }
    }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(18.dp)) {
        Text("Learn with JEMBEE", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Black)
        Text("Board  •  School  •  Class  •  Subject  •  Chapter  •  Question", color = JembeeMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 5.dp, bottom = 14.dp))
        if (activeAnswer != null) {
            TextButton(onClick = { activeAnswer = null }) { Text("‹ Back to answers", color = JembeeAccent) }
            RealVideoPlayer(activeAnswer!!.streamUrl, Modifier.fillMaxWidth().aspectRatio(16f / 9f))
            Text(activeAnswer!!.caption.ifBlank { "Video answer" }, color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 12.dp))
            Text(activeAnswer!!.creator, color = JembeeMuted, fontSize = 11.sp)
        } else {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                if (stage > 0) TextButton(onClick = { stage--; selected = selected.dropLast(1); answers = emptyList(); activeAnswer = null; error = null }) { Text("‹ Back", color = JembeeAccent) }
                Text(titles[stage], color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Spacer(Modifier.weight(1f))
                if (stage > 0) TextButton(onClick = { stage = 0; selected = emptyList(); answers = emptyList() }) { Text("Reset", color = JembeeMuted) }
            }
            selected.forEach { node -> Text("${node.type.uppercase()}: ${node.name}", color = JembeeMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp)) }
            when {
                loading -> CircularProgressIndicator(Modifier.padding(20.dp), color = JembeeAccent)
                error != null && nodes.isEmpty() -> Text(error ?: "Learning catalogue unavailable", color = JembeeMuted, modifier = Modifier.padding(vertical = 16.dp))
                stage < 6 && entries.isEmpty() -> Text(if (stage == 0) "Abhi koi published Board available nahi hai." else "Is level ke liye abhi published entry nahi hai.", color = JembeeMuted, modifier = Modifier.padding(vertical = 18.dp))
                stage < 6 -> entries.forEach { node ->
                    Row(
                        Modifier.fillMaxWidth().padding(vertical = 5.dp).background(JembeeSurface, RoundedCornerShape(12.dp))
                            .clickable {
                                selected = selected.take(stage) + node
                                stage++
                                error = null
                                if (stage == 6) {
                                    answersLoading = true
                                    SchoolAnswerClient.fetch(node.id) { found, message -> answers = found; error = message; answersLoading = false }
                                }
                            }.padding(15.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(node.name, color = Color.White, fontWeight = FontWeight.Bold)
                            Text(node.type.replaceFirstChar { it.uppercase() }, color = JembeeMuted, fontSize = 10.sp)
                        }
                        Text("›", color = JembeeAccent, fontSize = 22.sp)
                    }
                }
                answersLoading -> CircularProgressIndicator(Modifier.padding(20.dp), color = JembeeAccent)
                answers.isNotEmpty() -> answers.forEach { video ->
                    Row(Modifier.fillMaxWidth().padding(vertical = 5.dp).background(JembeeSurface, RoundedCornerShape(12.dp)).clickable { activeAnswer = video }.padding(15.dp), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(video.caption.ifBlank { "Video answer" }, color = Color.White, fontWeight = FontWeight.Bold)
                            Text(video.creator, color = JembeeMuted, fontSize = 10.sp)
                        }
                        Text("▶ Play", color = JembeeAccent, fontWeight = FontWeight.Bold)
                    }
                }
                else -> Text(error ?: "Is question ke liye abhi koi approved free video answer nahi hai.", color = JembeeMuted, modifier = Modifier.padding(vertical = 18.dp))
            }
        }
    }
}

@Composable
private fun SimpleScreen(title: String, subtitle: String) {
    Column(Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text(title, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text(subtitle, color = JembeeMuted, fontSize = 12.sp, modifier = Modifier.padding(12.dp))
    }
}

 
@Composable
private fun JembeeWebScreen(path: String, title: String, onClose: () -> Unit) {
    val context = LocalContext.current
    val startUrl = remember(path) { "https://jembeeplay.in" + path }
    val webView = remember { WebView(context).apply {
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.loadsImagesAutomatically = true
        settings.javaScriptCanOpenWindowsAutomatically = false
        settings.setSupportMultipleWindows(false)
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(this, true)
        webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                return when (uri.scheme?.lowercase()) {
                    "https", "http" -> false
                    "mailto", "tel" -> { runCatching { context.startActivity(Intent(Intent.ACTION_VIEW, uri)) }; true }
                    else -> true
                }
            }
        }
        webChromeClient = WebChromeClient()
    } }
    DisposableEffect(webView) { onDispose { webView.stopLoading(); webView.destroy() } }
    Column(Modifier.fillMaxSize().background(JembeeBackground)) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = onClose) { Text("‹ Back", color = JembeeAccent) }
            Text(title, color = Color.White, fontWeight = FontWeight.Bold)
        }
        AndroidView(modifier = Modifier.fillMaxSize(), factory = { webView.apply { if (url == null) loadUrl(startUrl) } }, update = { })
    }
}
@Composable
private fun LiveScreen(onBack: () -> Unit) {
    var streams by remember { mutableStateOf<List<LiveStreamItem>>(emptyList()) }
    var selectedStream by remember { mutableStateOf<LiveStreamItem?>(null) }
    var loading by remember { mutableStateOf(true) }
    var failed by remember { mutableStateOf(false) }
    var refresh by remember { mutableIntStateOf(0) }
    LaunchedEffect(refresh) {
        loading = true
        LiveStreamClient.fetch { result ->
            result.onSuccess { streams = it; failed = false }
                .onFailure { failed = true }
            loading = false
        }
    }
    Column(Modifier.fillMaxSize().padding(18.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text(if (selectedStream == null) "JEMBEE PLAY Live" else selectedStream!!.title, color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Black)
            TextButton(onClick = { if (selectedStream != null) selectedStream = null else onBack() }) { Text(if (selectedStream != null) "Back to Live" else "Back", color = JembeeAccent) }
        }
        if (selectedStream != null) {
            RealVideoPlayer(selectedStream!!.playbackUrl, Modifier.fillMaxWidth().aspectRatio(16f / 9f))
            Text(selectedStream!!.title, color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 12.dp))
            Text("By " + selectedStream!!.streamer + " · " + selectedStream!!.startTime, color = JembeeMuted, fontSize = 11.sp)
        } else when {
            loading -> CircularProgressIndicator(color = JembeeAccent)
            failed -> Column {
                Text("Live catalogue abhi available nahi hai.", color = JembeeMuted)
                TextButton(onClick = { refresh++ }) { Text("Retry", color = JembeeAccent) }
            }
            streams.isEmpty() -> Text("Abhi koi published live stream available nahi hai. Admin ke live_streams catalogue mein valid HTTPS HLS/DASH stream publish hone par yahan dikhegi.", color = JembeeMuted)
            else -> streams.forEach { stream ->
                Surface(
                    onClick = { selectedStream = stream },
                    color = JembeeSurface,
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 5.dp)
                ) {
                    Column(Modifier.padding(14.dp)) {
                        Text("● LIVE / SCHEDULED", color = Color(0xFFFF397F), fontWeight = FontWeight.Bold, fontSize = 10.sp)
                        Text(stream.title, color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("By ${stream.streamer} · ${stream.startTime}", color = JembeeMuted, fontSize = 11.sp)
                        Text("Tap to watch", color = JembeeAccent, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}
