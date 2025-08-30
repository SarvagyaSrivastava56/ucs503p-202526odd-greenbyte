// MainActivity.kt
package com.practice.uniconnect

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import com.practice.uniconnect.ui.events.EventsScreen
import com.practice.uniconnect.ui.theme.CampusEventsTheme


class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CampusEventsTheme(darkTheme = true) {   // 👈 Force dark mode
                Surface(
                    modifier = androidx.compose.ui.Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background  // 👈 Dark background from theme
                ) {
                    EventsScreen()
                }
            }
        }
    }
}
