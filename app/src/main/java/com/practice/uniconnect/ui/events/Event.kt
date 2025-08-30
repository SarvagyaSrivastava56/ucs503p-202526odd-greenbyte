// ui/events/Event.kt
package com.practice.uniconnect.ui.events

data class Event(
    val title: String,
    val organizer: String,
    val date: String,
    val time: String,
    val location: String,
    val category: String,
    val imageRes: Int
)
